import { supabase } from './supabase';

export interface ISAContribution {
  id: string;
  isaType: 'cash' | 'stocks_shares' | 'lifetime' | 'innovative_finance';
  provider: string;
  amount: number;
  date: string;
  withdrawn?: boolean;
}

export interface SaveContributionResult {
  contribution: ISAContribution | null;
  error: string | null;
}

/**
 * Load all contributions for the current user
 */
export async function loadContributions(): Promise<ISAContribution[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('No user logged in');
      return [];
    }

    const { data, error } = await supabase
      .from('contributions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;

    // Map database format to app format
    return (data || []).map(item => ({
      id: item.id,
      isaType: item.isa_type as any,
      provider: item.provider,
      amount: Number(item.amount),
      date: item.date,
      withdrawn: item.withdrawn,
    }));
  } catch (error) {
    console.error('Error loading contributions:', error);
    return [];
  }
}

/**
 * Save a new contribution via the Edge Function.
 * The function validates ISA allowance limits server-side before inserting.
 */
export async function saveContribution(
  contribution: Omit<ISAContribution, 'id'>,
): Promise<SaveContributionResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.error('No user logged in');
      return { contribution: null, error: 'You must be logged in to save a contribution.' };
    }

    const { data, error } = await supabase.functions.invoke('add-contribution', {
      body: {
        isa_type: contribution.isaType,
        provider: contribution.provider,
        amount: contribution.amount,
        date: contribution.date,
        withdrawn: contribution.withdrawn || false,
      },
    });

    if (error) {
      // For non-2xx responses the SDK sets data=null and puts the Response on
      // error.context. Parse the body to surface the validation message.
      let message: string = error.message ?? 'Failed to save contribution.';
      try {
        const body = await (error as any).context?.json?.();
        if (body?.error) message = body.error;
      } catch {
        // fall through to default message
      }
      console.error('Edge function error:', message);
      return { contribution: null, error: message };
    }

    if (!data?.data) {
      return { contribution: null, error: 'Unexpected response from server.' };
    }

    const row = data.data;
    return {
      contribution: {
        id: row.id,
        isaType: row.isa_type as ISAContribution['isaType'],
        provider: row.provider,
        amount: Number(row.amount),
        date: row.date,
        withdrawn: row.withdrawn,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('Error saving contribution:', err);
    return { contribution: null, error: err?.message ?? 'An unexpected error occurred.' };
  }
}

/**
 * Update an existing contribution
 */
export async function updateContribution(id: string, updates: Partial<ISAContribution>): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('No user logged in');
      return false;
    }

    const updateData: any = {};
    if (updates.isaType) updateData.isa_type = updates.isaType;
    if (updates.provider) updateData.provider = updates.provider;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.date) updateData.date = updates.date;
    if (updates.withdrawn !== undefined) updateData.withdrawn = updates.withdrawn;

    const { error } = await supabase
      .from('contributions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating contribution:', error);
    return false;
  }
}

/**
 * Delete a contribution
 */
export async function deleteContribution(id: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('No user logged in');
      return false;
    }

    const { error } = await supabase
      .from('contributions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting contribution:', error);
    return false;
  }
}
