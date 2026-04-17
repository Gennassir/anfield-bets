import { useEffect, useState } from "react";
import { Receipt, ArrowLeft, Check, Clock, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { AuthModal } from "@/components/AuthModal";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BetRow {
  id: string;
  stake: number;
  odds: number | null;
  total_odds: number | null;
  potential_payout: number;
  status: string;
  bet_type: string;
  created_at: string;
  settled_at: string | null;
  bet_selections: Array<{
    market: string; pick: string; odds: number; status: string;
    matches: { home_team: string; away_team: string; home_score: number | null; away_score: number | null; status: string } | null;
  }>;
}

const MyBets = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [bets, setBets] = useState<BetRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("bets")
        .select("id, stake, odds, total_odds, potential_payout, status, bet_type, created_at, settled_at, bet_selections(market, pick, odds, status, matches(home_team, away_team, home_score, away_score, status))")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      setBets((data as any) || []);
      setLoading(false);
    };
    load();
    const ch = supabase.channel("bets-mine")
      .on("postgres_changes", { event: "*", schema: "public", table: "bets", filter: `user_id=eq.${session.user.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Sign in to see your bets</h2>
            <button onClick={() => setShowAuthModal(true)} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg">
              Sign In / Sign Up
            </button>
          </div>
        </div>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  const filtered = (status: string) => status === "all" ? bets : bets.filter((b) => b.status === status);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <header className="sticky top-16 z-30 border-b border-glass-border bg-background/40 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-3">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)]">
              <Receipt className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="text-base font-bold">My Bets</div>
          </div>
        </div>
      </header>

      <div className="pt-16">
        <main className="container py-8">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({bets.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({filtered("pending").length})</TabsTrigger>
              <TabsTrigger value="won">Won ({filtered("won").length})</TabsTrigger>
              <TabsTrigger value="lost">Lost ({filtered("lost").length})</TabsTrigger>
            </TabsList>
            {["all", "pending", "won", "lost"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-4 space-y-3">
                {loading && <div className="text-center text-muted-foreground py-12">Loading…</div>}
                {!loading && filtered(tab).length === 0 && (
                  <div className="glass rounded-xl p-8 text-center text-sm text-muted-foreground">No bets here yet.</div>
                )}
                {filtered(tab).map((b) => <BetCard key={b.id} bet={b} />)}
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>
    </div>
  );
};

const BetCard = ({ bet }: { bet: BetRow }) => {
  const statusColor = bet.status === "won" ? "text-green-500 bg-green-500/10"
    : bet.status === "lost" ? "text-destructive bg-destructive/10"
    : "text-yellow-500 bg-yellow-500/10";
  const Icon = bet.status === "won" ? Check : bet.status === "lost" ? XIcon : Clock;

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded flex items-center gap-1 ${statusColor}`}>
            <Icon className="h-3 w-3" />{bet.status}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {bet.bet_type === "multi" ? `${bet.bet_selections.length}-leg multibet` : "Single"}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">{new Date(bet.created_at).toLocaleString()}</span>
      </div>

      <div className="space-y-1.5 mb-3">
        {bet.bet_selections.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                s.status === "won" ? "bg-green-500" : s.status === "lost" ? "bg-destructive" : "bg-yellow-500"
              }`} />
              <span className="truncate">
                {s.matches?.home_team} vs {s.matches?.away_team}
                {s.matches?.home_score != null && ` (${s.matches.home_score}-${s.matches.away_score})`}
              </span>
            </div>
            <span className="text-muted-foreground shrink-0 ml-2">{s.market} · {s.pick} @ {Number(s.odds).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-glass-border text-xs">
        <div>
          <div className="text-muted-foreground">Stake</div>
          <div className="font-semibold">KSH {Number(bet.stake).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Total odds</div>
          <div className="font-semibold">{Number(bet.total_odds || bet.odds || 0).toFixed(2)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">{bet.status === "won" ? "Paid out" : "Potential"}</div>
          <div className="font-bold text-accent">KSH {Number(bet.potential_payout).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
      </div>
    </div>
  );
};

export default MyBets;
