import { supabase } from './supabase';

export interface ISAContribution {
  id: string;
  isaType: 'cash' | 'stocks_shares' | 'lifetime' | 'innovative_finance';
  provider: string;
  amount: number;
  date: string;
  withdrawn?: boolean;
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
 * Save a new contribution
 */
export async function saveContribution(contribution: Omit<ISAContribution, 'id'>): Promise<ISAContribution | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('No user logged in');
      return null;
    }

    const { data, error } = await supabase
      .from('contributions')
      .insert({
        user_id: user.id,
        isa_type: contribution.isaType,
        provider: contribution.provider,
        amount: contribution.amount,
        date: contribution.date,
        withdrawn: contribution.withdrawn || false,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      isaType: data.isa_type as any,
      provider: data.provider,
      amount: Number(data.amount),
      date: data.date,
      withdrawn: data.withdrawn,
    };
  } catch (error) {
    console.error('Error saving contribution:', error);
    return null;
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
