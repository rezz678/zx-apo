// js/supabase-config.js
const SUPABASE_URL = 'https://vdcsnfjxjfhcgoeivxrc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkY3NuZmp4amZoY2dvZWl2eHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNTQ3MzMsImV4cCI6MjA4NjkzMDczM30.XWGIHJMIoyy73xWmmPYqDcfj3FFDg3_UezAcbAbevZU';

// Inisialisasi Supabase
window.supabase = window.supabase || {};
try {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase initialized');
} catch (e) {
    console.error('❌ Supabase init failed:', e);
}

