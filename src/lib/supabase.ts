import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY!;

// Add these console logs to debug
console.log('Supabase Service Key exists:', !!supabaseServiceKey);
console.log('Service key first 10 chars:', supabaseServiceKey?.substring(0, 10));

// Public client for non-authenticated operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
});

// Service client for authenticated operations (bypasses RLS)
export const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Set custom JWT for Auth0 user
export const setSupabaseAuth0Session = async (auth0Id: string, auth0Token?: string) => {
  // Store Auth0 ID for reference
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth0_id', auth0Id);
  }

  // Set a custom session that Supabase can use
  if (auth0Token) {
    const { data, error } = await supabase.auth.setSession({
      access_token: auth0Token,
      refresh_token: auth0Token,
    });
    
    if (error) {
      console.error('Error setting Supabase session:', error);
    } else {
      console.log('Supabase session set with Auth0 token');
    }
  }
  
  return auth0Id;
};

// Keep the old name for compatibility
export const setSupabaseAuth0Id = setSupabaseAuth0Session;

export const getSupabaseAuth0Id = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth0_id');
  }
  return null;
};