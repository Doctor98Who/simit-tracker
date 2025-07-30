import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to set Auth0 ID for RLS
export const setSupabaseAuth0Id = (auth0Id: string) => {
  // We'll implement a different RLS strategy
  // For now, this is a placeholder
  return auth0Id;
};