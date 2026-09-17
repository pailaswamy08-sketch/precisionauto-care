import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oxruphitgwdifksqbvbh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94cnVwaGl0Z3dkaWZrc3FidmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NjgzODIsImV4cCI6MjEwNTI0NDM4Mn0.4fGw5V-sj1QR6Jw8k7Fmn4ADToGhLHz_6mc0qVoeNPc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabase;
