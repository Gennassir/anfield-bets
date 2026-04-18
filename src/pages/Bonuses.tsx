import { useEffect, useState } from "react";
import { Gift, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { AuthModal } from "@/components/AuthModal";
import Navigation from "@/components/Navigation";

interface Bonus {
  id: string;
  code: string;
  title: string;
  description: string | null;
  bonus_type: string;
  amount: number;
  percentage: number | null;
  max_claims_per_user: number;
  min_deposit: number;
}

const Bonuses = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [loyalty, setLoyalty] = useState<{ points: number; tier: string }>({ points: 0, tier: "Bronze" });
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    supabase.from("bonuses").select("*").eq("active", true).then(({ data }) => setBonuses((data as Bonus[]) || []));
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    supabase.from("user_bonuses").select("bonus_id").eq("user_id", session.user.id)
      .then(({ data }) => setClaimedIds(new Set((data || []).map((r) => r.bonus_id))));
    supabase.from("loyalty_points").select("points, tier").eq("user_id", session.user.id).maybeSingle()
      .then(({ data }) => data && setLoyalty(data));
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Sign in for bonuses</h2>
            <button onClick={() => setShowAuthModal(true)} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg">
              Sign In / Sign Up
            </button>
          </div>
        </div>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  const handleClaim = async (b: Bonus) => {
    if (claimedIds.has(b.id)) return toast.error("Already claimed");
    setClaiming(b.id);

    // Find the user's most recent successful deposit not yet used for a bonus
    const { data: deposits } = await supabase
      .from("stk_requests")
      .select("id, amount, created_at")
      .eq("user_id", session.user.id)
      .eq("type", "deposit")
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(5);

    const lastDeposit = deposits?.[0];
    if (!lastDeposit || Number(lastDeposit.amount) < Number(b.min_deposit)) {
      setClaiming(null);
      return toast.error(`Make a deposit of at least KSH ${b.min_deposit} first`);
    }

    const pct = Number(b.percentage ?? 0);
    const cap = Number(b.amount ?? 0);
    const credit = Math.min(Math.round((Number(lastDeposit.amount) * pct) / 100), cap);

    const { error } = await supabase.from("user_bonuses").insert({
      user_id: session.user.id, bonus_id: b.id, amount_credited: credit,
    });
    if (error) { setClaiming(null); return toast.error(error.message); }

    if (credit > 0) {
      const { data: prof } = await supabase.from("profiles").select("balance").eq("user_id", session.user.id).maybeSingle();
      if (prof) {
        await supabase.from("profiles").update({ balance: Number(prof.balance) + credit }).eq("user_id", session.user.id);
        await supabase.from("wallet_transactions").insert({
          user_id: session.user.id, type: "bonus", amount: credit, description: `${b.title} on KSH ${lastDeposit.amount} deposit`,
        });
      }
    }
    setClaimedIds((prev) => new Set(prev).add(b.id));
    setClaiming(null);
    toast.success(`${b.title} claimed — KSH ${credit.toLocaleString()} credited!`);
  };

  const tiers = [
    { name: "Bronze", min: 0, perk: "5% cashback" },
    { name: "Silver", min: 1000, perk: "10% cashback" },
    { name: "Gold", min: 5000, perk: "15% cashback" },
    { name: "Platinum", min: 10000, perk: "20% cashback" },
  ];
  const nextTier = tiers.find((t) => t.min > loyalty.points);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <header className="sticky top-16 z-30 border-b border-glass-border bg-background/40 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-3">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)]">
              <Gift className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="text-base font-bold">Bonuses & Rewards</div>
          </div>
        </div>
      </header>

      <div className="pt-16">
        <main className="container py-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Available Bonuses</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {bonuses.map((b) => {
                const isClaimed = claimedIds.has(b.id);
                return (
                  <div key={b.id} className={`glass rounded-xl p-6 ${isClaimed ? "opacity-75" : ""}`}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{b.title}</h3>
                      <code className="text-sm bg-accent/20 px-3 py-1 rounded">{b.code}</code>
                    </div>
                    <p className="text-muted-foreground mb-4 text-sm">{b.description}</p>
                    <Button className="w-full" disabled={isClaimed || claiming === b.id} onClick={() => handleClaim(b)}>
                      {isClaimed ? <><Check className="h-4 w-4 mr-2" />Claimed</> : claiming === b.id ? "Claiming…" : "Claim Bonus"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Loyalty Program — {loyalty.tier}</h2>
            <div className="glass rounded-xl p-6">
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                {tiers.map((t) => (
                  <div key={t.name} className={`text-center p-4 rounded-xl ${loyalty.tier === t.name ? "bg-accent/20 ring-2 ring-accent" : "glass"}`}>
                    <div className="text-2xl font-bold mb-1">{t.name}</div>
                    <div className="text-xs text-muted-foreground mb-1">{t.perk}</div>
                    <div className="text-[10px] font-semibold">{t.min.toLocaleString()}+ pts</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Your points</span>
                  <span className="text-accent font-bold">{loyalty.points.toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div className="bg-[image:var(--gradient-primary)] h-3 rounded-full" style={{ width: `${nextTier ? Math.min((loyalty.points / nextTier.min) * 100, 100) : 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {nextTier ? `${(nextTier.min - loyalty.points).toLocaleString()} more points to ${nextTier.name}` : "Max tier reached!"}
                </p>
                <p className="text-[11px] text-muted-foreground pt-2 border-t border-glass-border">
                  Earn 1 point per KSH 100 staked. Multibet wins earn 2x points.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Bonuses;
