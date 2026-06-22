
-- 1. CLEANUP (Optional: Only run if you want to reset tables)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP TABLE IF EXISTS public.deposits;
-- DROP TABLE IF EXISTS public.withdrawals;
-- DROP TABLE IF EXISTS public.settlement_configs;
-- DROP TABLE IF EXISTS public.wallets;
-- DROP TABLE IF EXISTS public.profiles;
-- DROP TABLE IF EXISTS public.settings;

-- 2. PROFILES TABLE (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'user',
  level TEXT DEFAULT 'Gold VIP',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WALLETS TABLE
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  balance_usdt DECIMAL DEFAULT 0,
  total_deposit DECIMAL DEFAULT 0,
  total_withdraw DECIMAL DEFAULT 0,
  holdings JSONB DEFAULT '{}'::jsonb
);

-- 4. SETTLEMENT CONFIGS (For Bank/UPI/Crypto details)
CREATE TABLE IF NOT EXISTS public.settlement_configs (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  bank_name TEXT,
  account_number TEXT,
  ifsc TEXT,
  upi_id TEXT,
  usdt_address TEXT
);

-- 5. DEPOSITS TABLE
CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uid UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL,
  method TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uid UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL,
  method TEXT,
  status TEXT DEFAULT 'pending',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. GLOBAL ADMIN SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  id SERIAL PRIMARY KEY,
  upi_id TEXT,
  usdt_address TEXT,
  db_sync_delay INTEGER DEFAULT 250
);

-- 8. INITIAL SYSTEM SETTINGS
INSERT INTO public.settings (id, upi_id, usdt_address, db_sync_delay) 
VALUES (1, 'zmex.terminal@okaxis', 'TYk8X1n2M9j3PqL5r7sWv4B6zX8yT2cV1b', 250)
ON CONFLICT (id) DO NOTHING;

-- 9. TRIGGER FUNCTION: AUTOMATICALLY CREATE PROFILE & WALLET
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create the profile
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'Trader'),
    CASE WHEN new.email LIKE '%admin%' THEN 'admin' ELSE 'user' END
  );
  
  -- Create the initial wallet
  INSERT INTO public.wallets (user_id, balance_usdt)
  VALUES (new.id, 0);
  
  -- Create empty settlement config
  INSERT INTO public.settlement_configs (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. ATTACH TRIGGER TO AUTH.USERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. ENABLE REALTIME FOR UPDATES
-- Enable realtime for the tables we want to watch
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawals;

-- 12. ROW LEVEL SECURITY (RLS) - Basic Public Access for development
-- Note: In production, you should tighten these policies.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own config" ON public.settlement_configs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own deposits" ON public.deposits FOR SELECT USING (auth.uid() = uid);
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = uid);

-- Allow all authenticated users to read settings
CREATE POLICY "Authenticated users can read settings" ON public.settings FOR SELECT TO authenticated USING (true);

-- Allow admins full access (Assumes role check)
CREATE POLICY "Admins full access profiles" ON public.profiles FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins full access wallets" ON public.wallets FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins full access deposits" ON public.deposits FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins full access withdrawals" ON public.withdrawals FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
