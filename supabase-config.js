// js/supabase-config.js
const SUPABASE_URL = 'https://lpuvhisdsdcetctyuevv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nxFnlwP4XHIwG-sb_publishable_nxFnlwP4XHIwG-gPtJvkuQ_AOXLGTaa';

// Inisialisasi Supabase
window.supabase = window.supabase || {};
try {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase initialized');
} catch (e) {
    console.error('❌ Supabase init failed:', e);
}

