-- 1. STK push tracking table
CREATE TABLE public.stk_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phone TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL DEFAULT 'deposit', -- deposit | withdraw
  status TEXT NOT NULL DEFAULT 'pending', -- pending | success | failed | cancelled
  external_reference TEXT NOT NULL,
  payhero_reference TEXT,
  checkout_request_id TEXT,
  mpesa_receipt TEXT,
  result_desc TEXT,
  raw_callback JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stk_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stk own select" ON public.stk_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "stk own insert" ON public.stk_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_stk_external_ref ON public.stk_requests(external_reference);
CREATE INDEX idx_stk_checkout_id ON public.stk_requests(checkout_request_id);

CREATE TRIGGER update_stk_requests_updated_at
  BEFORE UPDATE ON public.stk_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Add min_deposit to bonuses
ALTER TABLE public.bonuses ADD COLUMN IF NOT EXISTS min_deposit NUMERIC NOT NULL DEFAULT 0;

-- 3. Remove all no-deposit / free_bet bonuses
DELETE FROM public.user_bonuses
  WHERE bonus_id IN (SELECT id FROM public.bonuses WHERE bonus_type IN ('free_bet','no_deposit'));
DELETE FROM public.bonuses WHERE bonus_type IN ('free_bet','no_deposit');

-- 4. Seed deposit-match bonuses (idempotent)
INSERT INTO public.bonuses (code, title, description, bonus_type, percentage, amount, min_deposit, max_claims_per_user, active)
VALUES
  ('WELCOME100', 'Welcome Deposit Match 100%',
   'Get 100% bonus on your first deposit. Min deposit KSH 100, max bonus KSH 5,000.',
   'deposit_match', 100, 5000, 100, 1, true),
  ('RELOAD50', 'Weekly Reload 50%',
   'Get 50% bonus on any deposit, up to KSH 2,000. Claim once per week.',
   'deposit_match', 50, 2000, 200, 4, true)
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  bonus_type = EXCLUDED.bonus_type,
  percentage = EXCLUDED.percentage,
  amount = EXCLUDED.amount,
  min_deposit = EXCLUDED.min_deposit,
  max_claims_per_user = EXCLUDED.max_claims_per_user,
  active = true;

-- ensure unique code constraint exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bonuses_code_key') THEN
    ALTER TABLE public.bonuses ADD CONSTRAINT bonuses_code_key UNIQUE (code);
  END IF;
END $$;

-- 5. Update handle_new_user — no more free signup credit
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, balance)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)), 0);
  INSERT INTO public.loyalty_points (user_id, points, tier) VALUES (NEW.id, 0, 'Bronze');
  RETURN NEW;
END;
$function$;