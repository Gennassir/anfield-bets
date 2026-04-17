import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { AuthModal } from "@/components/AuthModal";
import { TeamCard } from "@/components/TeamCard";
import { WalletModal } from "@/components/WalletModal";
import { teams } from "@/lib/teams";
import { Button } from "@/components/ui/button";
import { LogOut, Wallet, Radio, Receipt, Gift } from "lucide-react";
import stadium from "@/assets/stadium-hero.jpg";
import { Footer } from "@/components/Footer";
import { LiveData } from "@/components/LiveData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);
  const [username, setUsername] = useState("");
  const [walletOpen, setWalletOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s); setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => { setSession(s); setUser(s?.user ?? null); });
    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("balance, username").eq("user_id", user.id).maybeSingle();
    if (data) { setBalance(Number(data.balance)); setUsername(data.username ?? ""); }
  };

  useEffect(() => { if (user) refreshProfile(); }, [user]);

  const requireAuth = (cb?: () => void) => {
    if (!session) { setShowAuthModal(true); return false; }
    if (cb) cb();
    return true;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <img src={stadium} alt="" className="h-full w-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
        <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
      </div>

      <Navigation />

      <div className="sticky top-16 z-40 border-b border-glass-border bg-background/40 backdrop-blur-xl">
        <div className="container flex h-12 items-center justify-end gap-2 px-4">
          <button
            onClick={() => requireAuth(() => setWalletOpen(true))}
            className="glass flex items-center gap-2 rounded-full px-4 py-1 text-sm font-semibold transition hover:border-primary/50"
          >
            <Wallet className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">KSH</span>
            <span>{balance.toLocaleString()}</span>
          </button>
          {session && (
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <main className="container py-8">
        <section className="mb-8 animate-float-up">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Premier League · Live</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
            Hey {username || "there"} — <span className="text-accent">place real bets.</span>
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Real EPL fixtures, real odds, real payouts. Welcome bonus KSH 500 already in your wallet.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/live-betting"><Button variant="hero"><Radio className="h-4 w-4 mr-2" />Bet Live</Button></Link>
            <Link to="/my-bets"><Button variant="outline"><Receipt className="h-4 w-4 mr-2" />My Bets</Button></Link>
            <Link to="/bonuses"><Button variant="outline"><Gift className="h-4 w-4 mr-2" />Bonuses</Button></Link>
          </div>
        </section>

        <section>
          <Tabs defaultValue="live">
            <TabsList className="mb-4">
              <TabsTrigger value="live">Live · Fixtures & Table</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>
            <TabsContent value="live"><LiveData /></TabsContent>
            <TabsContent value="teams">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {teams.map((t) => <TeamCard key={t.id} team={t} selected={false} onClick={() => {}} />)}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <Footer />

      {user && <WalletModal open={walletOpen} onOpenChange={setWalletOpen} userId={user.id} balance={balance} onUpdated={refreshProfile} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default Index;
