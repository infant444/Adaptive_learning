import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Supabase not configured');
  throw new Error('Supabase environment variables are not set.');
}

console.log('🔧 Supabase URL:', supabaseUrl);

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      fetch: fetch,
    }
  }
);

export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (err: any) {
    console.log('❌ Supabase connection error:', err.message);
    return false;
  }
};