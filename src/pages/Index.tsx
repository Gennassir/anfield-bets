import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { AuthModal } from "@/components/AuthModal";
import { TeamCard } from "@/components/TeamCard";
import { BetSlip, BetItem } from "@/components/BetSlip";
import { WalletModal } from "@/components/WalletModal";
import { teams } from "@/lib/teams";
import { Button } from "@/components/ui/button";
import { LogOut, Wallet, Trophy } from "lucide-react";
import { toast } from "sonner";
import stadium from "@/assets/stadium-hero.jpg";
import { Footer } from "@/components/Footer";
import { LiveData } from "@/components/LiveData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);
  const [username, setUsername] = useState("");
  const [items, setItems] = useState<BetItem[]>([]);
  const [walletOpen, setWalletOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("balance, username")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setBalance(Number(data.balance));
      setUsername(data.username ?? "");
    }
  };

  useEffect(() => {
    if (user) refreshProfile();
  }, [user]);

  const toggleTeam = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId)!;
    setItems((prev) =>
      prev.find((i) => i.team.id === teamId)
        ? prev.filter((i) => i.team.id !== teamId)
        : [...prev, { team, predictedPoints: 75, stake: 100 }]
    );
  };

  const updateItem = (id: string, patch: Partial<BetItem>) =>
    setItems((prev) => prev.map((i) => (i.team.id === id ? { ...i, ...patch } : i)));

  const placeBet = async () => {
    if (!user) return;
    const totalStake = items.reduce((s, i) => s + i.stake, 0);
    if (totalStake > balance) return toast.error("Insufficient wallet balance");
    if (items.some((i) => i.stake < 100)) return toast.error("Each stake must be at least KSH 100");

    setPlacing(true);
    const { error: betsErr } = await supabase.from("bets").insert(
      items.map((i) => ({
        user_id: user.id,
        team: i.team.name,
        predicted_points: i.predictedPoints,
        stake: i.stake,
        odds: i.team.odds,
        potential_payout: i.stake * i.team.odds,
      }))
    );
    if (betsErr) { setPlacing(false); return toast.error(betsErr.message); }

    await supabase.from("wallet_transactions").insert({
      user_id: user.id, type: "bet", amount: -totalStake, description: `${items.length} selection(s)`,
    });
    await supabase.from("profiles").update({ balance: balance - totalStake }).eq("user_id", user.id);

    toast.success(`Bet placed! KSH ${totalStake.toLocaleString()} staked.`);
    setItems([]);
    refreshProfile();
    setPlacing(false);
  };

  const selectedIds = new Set(items.map((i) => i.team.id));

  if (!session) return <AuthModal />;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <img src={stadium} alt="" className="h-full w-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
        <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-glass-border bg-background/40 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
              <Trophy className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="text-base font-bold leading-none">RedZone Bets</div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="live-dot" /> Premier League · Live
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setWalletOpen(true)}
              className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:border-primary/50"
            >
              <Wallet className="h-4 w-4 text-accent" />
              <span className="text-muted-foreground">KSH</span>
              <span>{balance.toLocaleString()}</span>
            </button>
            <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container py-8">
        <section className="mb-8 animate-float-up">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Matchday 32</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
            Hey {username || "there"} — <span className="text-accent">pick your champions.</span>
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Predict the season's top points totals. Stake from KSH 100. Cash out via M-Pesa anytime.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section>
            <Tabs defaultValue="teams">
              <TabsList className="mb-4">
                <TabsTrigger value="teams">Teams</TabsTrigger>
                <TabsTrigger value="live">Live · Fixtures & Table</TabsTrigger>
              </TabsList>
              <TabsContent value="teams">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Premier League Teams</h2>
                  <span className="text-xs text-muted-foreground">{items.length} selected</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {teams.map((t) => (
                    <TeamCard key={t.id} team={t} selected={selectedIds.has(t.id)} onClick={() => toggleTeam(t.id)} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="live">
                <LiveData />
              </TabsContent>
            </Tabs>
          </section>

          <BetSlip
            items={items}
            onRemove={(id) => setItems((p) => p.filter((i) => i.team.id !== id))}
            onUpdate={updateItem}
            onPlace={placeBet}
            placing={placing}
          />
        </div>
      </main>
      <Footer />

      {user && (
        <WalletModal
          open={walletOpen}
          onOpenChange={setWalletOpen}
          userId={user.id}
          balance={balance}
          onUpdated={refreshProfile}
        />
      )}
    </div>
  );
};

export default Index;
