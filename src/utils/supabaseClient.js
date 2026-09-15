import { createClient } from '@supabase/supabase-js';

// Usamos las claves directas pa' evitar rollos con el .env y Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xmhgruhiyzoqqfpdgzhk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtaGdydWhpeXpvcXFmcGRnemhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MzkwODgsImV4cCI6MjEwNTAxNTA4OH0.oEcggng7Mbd-a79r9AZlF1H88DKSOUPp8XhuC25-Sys';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
