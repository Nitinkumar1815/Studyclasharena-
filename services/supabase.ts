
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqagwntzlkhrekhonarz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxYWd3bnR6bGtocmVraG9uYXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODAyMzUsImV4cCI6MjA4MTQ1NjIzNX0.0Co7aYK7lP_LSOv2Lu8rMmjTUEw2CrPYx5WAd7YuWYk';

export const supabase = createClient(supabaseUrl, supabaseKey);
