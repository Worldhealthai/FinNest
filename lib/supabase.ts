import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from './database.types';

// Get these from your Supabase project settings
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase credentials are available
export const hasSupabaseCredentials = !!(supabaseUrl && supabaseAnonKey &&
  supabaseUrl !== 'your-project-url-here' &&
  supabaseAnonKey !== 'your-anon-key-here');

if (!hasSupabaseCredentials) {
  console.warn('Supabase credentials not configured. App will run in offline/guest mode only.');
}

// Create client with safe fallback values to prevent crashes
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
