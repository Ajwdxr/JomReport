// Supabase Configuration
// IMPORTANT: Replace these with your actual Supabase URL and Anon Key
const SUPABASE_URL = 'https://jifzunyyavvzpmcquxuh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZnp1bnl5YXZ2enBtY3F1eHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzQzNzQsImV4cCI6MjA4NTQ1MDM3NH0.zP5kigv6x91IctAU5s50D_6UPanFxWHFq1wltUh0d5k';

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
