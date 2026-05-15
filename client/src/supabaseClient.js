import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xfqcjxhrpvkjqfviwxfh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmcWNqeGhycHZranFmdml3eGZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTU3MjgsImV4cCI6MjA5NDMzMTcyOH0.JZlQX7-PBIZ6BZi_r-n7jCRaOWYXNoU0RZAbtIUTFM4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
