import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://hdrmqjqdkdjjxuxvitpj.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkcm1xanFka2Rqanh1eHZpdHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMjMyMzMsImV4cCI6MjA3OTU5OTIzM30.67uwa90rAHPZDtG9JSYUCasJjvtW3chy-cMp00Ocyms';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Key is missing.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);