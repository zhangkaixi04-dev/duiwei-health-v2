import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseHepai = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'hepai-auth-token',
    persistSession: true,
    detectSessionInUrl: true
  }
});

export const supabaseCangzhen = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'cangzhen-auth-token',
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper to get correct client
const getClient = (appName) => {
    if (appName === 'cangzhen') return supabaseCangzhen;
    return supabaseHepai; // Default to Hepai if not specified, or throw error
};

export const authService = {
  // Sign Up
  signUp: async (email, password, appName = 'hepai') => {
    const client = getClient(appName);
    const { data, error } = await client.auth.signUp({
      email,
      password,
      // By default, Supabase requires email confirmation.
      // If you haven't set up SMTP, this will fail or not send email.
      // For development, you can disable "Confirm email" in Supabase Auth Settings.
    });
    return { data, error };
  },

  // Sign In
  signIn: async (email, password, appName = 'hepai') => {
    const client = getClient(appName);
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign Out
  signOut: async (appName = 'hepai') => {
    const client = getClient(appName);
    const { error } = await client.auth.signOut();
    return { error };
  },

  // Get Current User
  getCurrentUser: async (appName = 'hepai') => {
    const client = getClient(appName);
    const { data: { user } } = await client.auth.getUser();
    return user;
  },

  // Listen for Auth Changes
  onAuthStateChange: (callback, appName = 'hepai') => {
    const client = getClient(appName);
    return client.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
  
  // Expose clients for other services
  clients: {
      hepai: supabaseHepai,
      cangzhen: supabaseCangzhen
  }
};
