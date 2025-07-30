import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Helper to set Auth0 ID for RLS
export const setSupabaseAuth0Id = (auth0Id: string) => {
  // Set the Auth0 ID in local storage for RLS policies
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth0_id', auth0Id);
  }
  return auth0Id;
};

// Helper to get Auth0 ID
export const getSupabaseAuth0Id = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth0_id');
  }
  return null;
};