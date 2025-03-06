// src/supabaseClient.js
// Using Supabase from CDN (will be loaded in index.html)
// This assumes the global supabase object is available

// Supabase URL and anon key
const supabaseUrl = 'https://askzekzhuefoixgonuzy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFza3pla3podWVmb2l4Z29udXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNzY2OTMsImV4cCI6MjA1Njg1MjY5M30.r1gi-KH0xrHl013B_4kUmnPOtMfEqN8qYkAgaaB_388';

// Create Supabase client
export const createSupabaseClient = () => {
  // Check if supabase is available globally
  if (typeof window !== 'undefined' && window.supabase) {
    return window.supabase.createClient(supabaseUrl, supabaseAnonKey);
  }
  
  console.error('Supabase client not available. Make sure to include the Supabase CDN script in index.html');
  // Return a mock client to prevent errors
  return {
    from: () => ({
      insert: async () => ({ error: new Error('Supabase client not available') })
    })
  };
};

export const supabase = createSupabaseClient(); 