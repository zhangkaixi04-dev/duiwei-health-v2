import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const authService = {
  // Sign Up
  signUp: async (email, password) => {
    // Check if user already exists first? No, Supabase handles it.
    // However, for better UX in dev/test, we might want to disable email confirmation requirement in Supabase dashboard
    // or handle the 'User already registered' error gracefully.
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // By default, Supabase requires email confirmation.
      // If you haven't set up SMTP, this will fail or not send email.
      // For development, you can disable "Confirm email" in Supabase Auth Settings.
    });
    return { data, error };
  },

  // Sign In
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign Out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get Current User
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Listen for Auth Changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};
