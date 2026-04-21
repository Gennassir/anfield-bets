import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { AuthModal } from "@/components/AuthModal";
import { TeamCard } from "@/components/TeamCard";
import { WalletModal } from "@/components/WalletModal";
import { ChampionPredictionModal } from "@/components/ChampionPredictionModal";
import { teams } from "@/lib/teams";
import { Button } from "@/components/ui/button";
import { LogOut, Wallet, Radio, Receipt, Gift, ArrowDownToLine, ArrowUpFromLine, Phone } from "lucide-react";
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
  const [phone, setPhone] = useState("");
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletMode, setWalletMode] = useState<"deposit" | "withdraw">("deposit");
  const [showAuthModal, setShowAuthModal] = useState(false);

  const openWallet = (m: "deposit" | "withdraw") => {
    if (!session) { setShowAuthModal(true); return; }
    setWalletMode(m);
    setWalletOpen(true);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s); setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => { setSession(s); setUser(s?.user ?? null); });
    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("balance, username, phone").eq("user_id", user.id).maybeSingle();
    if (data) {
      setBalance(Number(data.balance));
      setUsername(data.username ?? "");
      setPhone(data.phone ?? "");
    }
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

      <div className="sticky top-16 z-40 border-b border-glass-border bg-background/40 backdrop-blur-md">
        <div className="container flex h-auto min-h-14 flex-wrap items-center justify-end gap-2 px-3 py-2 sm:px-4">
          {session && phone && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
              <Phone className="h-3 w-3 text-accent" /> {phone}
            </span>
          )}
          <button
            onClick={() => requireAuth(() => { setWalletMode("deposit"); setWalletOpen(true); })}
            className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold transition hover:border-primary/50"
          >
            <Wallet className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">KSH</span>
            <span>{balance.toLocaleString()}</span>
          </button>
          <Button size="sm" variant="hero" onClick={() => openWallet("deposit")} className="h-9 px-3">
            <ArrowDownToLine className="h-4 w-4 mr-1.5" />Deposit
          </Button>
          <Button size="sm" variant="outline" onClick={() => openWallet("withdraw")} className="h-9 px-3">
            <ArrowUpFromLine className="h-4 w-4 mr-1.5" />Withdraw
          </Button>
          {session && (
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()} className="h-9 px-2">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <main className="container py-8">
        <section className="mb-8 animate-float-up">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Premier League · Live</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
            EPL <span className="text-accent">BETS</span>
          </h1>
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

      {user && <WalletModal open={walletOpen} onOpenChange={setWalletOpen} userId={user.id} balance={balance} onUpdated={refreshProfile} initialMode={walletMode} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      <ChampionPredictionModal
        userId={user?.id ?? null}
        balance={balance}
        onPlaced={refreshProfile}
        onRequireAuth={() => setShowAuthModal(true)}
      />
    </div>
  );
};

export default Index;
