
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hvjeriwfpnagwesepmbs.supabase.co';
const supabaseKey = 'sb_publishable_K3-_j8AtIZB6aP8VUdGPew_RpQGL1Wd';

export const supabase = createClient(supabaseUrl, supabaseKey);
