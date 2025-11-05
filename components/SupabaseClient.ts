import { createClient } from '@supabase/supabase-js';

// IMPORTANT: These are placeholder credentials. In a real production environment,
// these should be stored securely as environment variables and not hardcoded.
// For example: process.env.REACT_APP_SUPABASE_URL
const supabaseUrl = process.env.SUPABASE_URL || 'https://bdfhuudcdhvngvpqxfhj.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkZmh1dWRjZGh2bmd2cHF4ZmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg2ODQ0MDAsImV4cCI6MTk4NjY0MjQwMH0.Soo_G1sY26TGo242a5cr543m_xc22t22_4f_2Y26TGo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);