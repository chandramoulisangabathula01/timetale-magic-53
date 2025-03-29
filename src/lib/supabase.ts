
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Replace these with your actual Supabase URL and anon key
const supabaseUrl = 'https://kbwapovwdgynydabiuot.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtid2Fwb3Z3ZGd5bnlkYWJpdW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEzMDQ4NzAsImV4cCI6MjAyNjg4MDg3MH0.hfDn1JEt26zQ56YUxbSGb4O3jxeRFhq9yyY5u1HyThc';

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// For debugging purposes
console.log('Supabase initialized with URL:', supabaseUrl);
