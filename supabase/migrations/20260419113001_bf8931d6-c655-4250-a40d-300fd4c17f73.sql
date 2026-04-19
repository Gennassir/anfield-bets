-- 1. Add phone to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- 2. Update handle_new_user to capture phone from raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, balance, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
    0,
    NEW.raw_user_meta_data->>'phone'
  );
  INSERT INTO public.loyalty_points (user_id, points, tier) VALUES (NEW.id, 0, 'Bronze');
  RETURN NEW;
END;
$function$;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Champion picks table
CREATE TABLE IF NOT EXISTS public.champion_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  team text NOT NULL,
  stake numeric NOT NULL,
  potential_payout numeric NOT NULL,
  odds numeric NOT NULL,
  bet_id uuid,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.champion_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "champion own select" ON public.champion_picks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "champion own insert" ON public.champion_picks
  FOR INSERT WITH CHECK (auth.uid() = user_id);