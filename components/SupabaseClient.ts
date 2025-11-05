import { createClient } from '@supabase/supabase-js';

// IMPORTANT: These are placeholder credentials. In a real production environment,
// these should be stored securely as environment variables and not hardcoded.
// For example: process.env.REACT_APP_SUPABASE_URL
const supabaseUrl = process.env.SUPABASE_URL || 'https://ixkgnkvnlvjcxchzsqtd.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2dua3ZubHZqY3hjaHpzcXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0MzU4NzEsImV4cCI6MjA0NTAxMTg3MX0.97D5WJBI0i37fW132sVqzB27Y4a22Z9iG5uCh2c2MRA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);