import { createClient } from '@supabase/supabase-js';

const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};

export const SUPABASE_URL: string =
  metaEnv.VITE_SUPABASE_URL || 'https://hzkllfhfkviacvjgcivm.supabase.co';

export const SUPABASE_ANON_KEY: string =
  metaEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ZIIecuMPE-E9zb052MNQrQ_E4qNPXvt';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 15
    }
  }
});
