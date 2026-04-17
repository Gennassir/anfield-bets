
-- Matches cache
CREATE TABLE public.matches (
  id BIGINT PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_crest TEXT,
  away_crest TEXT,
  kickoff TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'SCHEDULED',
  home_score INT,
  away_score INT,
  odds_home NUMERIC NOT NULL DEFAULT 2.0,
  odds_draw NUMERIC NOT NULL DEFAULT 3.2,
  odds_away NUMERIC NOT NULL DEFAULT 3.5,
  odds_over25 NUMERIC NOT NULL DEFAULT 1.85,
  odds_under25 NUMERIC NOT NULL DEFAULT 1.85,
  odds_btts_yes NUMERIC NOT NULL DEFAULT 1.8,
  odds_btts_no NUMERIC NOT NULL DEFAULT 1.9,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches public read" ON public.matches FOR SELECT USING (true);

-- Augment bets table for accumulators
ALTER TABLE public.bets
  ADD COLUMN IF NOT EXISTS bet_type TEXT NOT NULL DEFAULT 'single',
  ADD COLUMN IF NOT EXISTS total_odds NUMERIC,
  ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ;

-- Make legacy single-bet columns optional
ALTER TABLE public.bets ALTER COLUMN team DROP NOT NULL;
ALTER TABLE public.bets ALTER COLUMN predicted_points DROP NOT NULL;
ALTER TABLE public.bets ALTER COLUMN odds DROP NOT NULL;

-- Allow users to update their own bets (for cashout) and the system to settle
CREATE POLICY "own bets update" ON public.bets FOR UPDATE USING (auth.uid() = user_id);

-- Bet selections (legs)
CREATE TABLE public.bet_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id UUID NOT NULL REFERENCES public.bets(id) ON DELETE CASCADE,
  match_id BIGINT NOT NULL REFERENCES public.matches(id),
  market TEXT NOT NULL,         -- '1X2' | 'OU25' | 'BTTS'
  pick TEXT NOT NULL,           -- 'HOME'|'DRAW'|'AWAY'|'OVER'|'UNDER'|'YES'|'NO'
  odds NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending|won|lost|void
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bet_selections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "selections own select" ON public.bet_selections FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.bets b WHERE b.id = bet_id AND b.user_id = auth.uid()));
CREATE POLICY "selections own insert" ON public.bet_selections FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.bets b WHERE b.id = bet_id AND b.user_id = auth.uid()));

-- Bonuses catalog
CREATE TABLE public.bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  bonus_type TEXT NOT NULL,     -- 'deposit_match'|'free_bet'|'cashback'|'loyalty'
  amount NUMERIC NOT NULL DEFAULT 0,
  percentage INT,
  max_claims_per_user INT NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bonuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bonuses public read" ON public.bonuses FOR SELECT USING (active = true);

-- Claimed bonuses
CREATE TABLE public.user_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bonus_id UUID NOT NULL REFERENCES public.bonuses(id),
  amount_credited NUMERIC NOT NULL DEFAULT 0,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_bonuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ub own select" ON public.user_bonuses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ub own insert" ON public.user_bonuses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Loyalty
CREATE TABLE public.loyalty_points (
  user_id UUID PRIMARY KEY,
  points INT NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'Bronze',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loyalty own select" ON public.loyalty_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "loyalty own insert" ON public.loyalty_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "loyalty own update" ON public.loyalty_points FOR UPDATE USING (auth.uid() = user_id);

-- Jackpot tickets
CREATE TABLE public.jackpot_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ticket_number TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'bet',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jackpot_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jp own select" ON public.jackpot_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "jp own insert" ON public.jackpot_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update handle_new_user to also create loyalty record + welcome bonus eligibility
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, balance)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)), 500);
  INSERT INTO public.loyalty_points (user_id, points, tier) VALUES (NEW.id, 0, 'Bronze');
  INSERT INTO public.wallet_transactions (user_id, type, amount, description)
  VALUES (NEW.id, 'signup_bonus', 500, 'Welcome bonus - KSH 500 free credit');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed bonuses
INSERT INTO public.bonuses (code, title, description, bonus_type, amount, percentage, max_claims_per_user) VALUES
  ('WELCOME100', 'Welcome Bonus', '100% match on first deposit up to KSH 10,000', 'deposit_match', 10000, 100, 1),
  ('DAILY50', 'Daily Boost', 'KSH 50 free bet, claimable once per day', 'free_bet', 50, NULL, 365),
  ('CASHBACK10', 'Weekly Cashback', '10% cashback on net losses', 'cashback', 0, 10, 52),
  ('ACCASAFE', 'Acca Insurance', 'Stake refunded if one leg of a 5+ multibet loses', 'free_bet', 0, NULL, 10);

-- Indexes
CREATE INDEX idx_matches_kickoff ON public.matches(kickoff);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_bet_selections_match ON public.bet_selections(match_id);
CREATE INDEX idx_bets_user_status ON public.bets(user_id, status);
