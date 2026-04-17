import { Radio, Clock, TrendingUp, ShieldCheck, ArrowLeft, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { AuthModal } from "@/components/AuthModal";
import Navigation from "@/components/Navigation";

const LiveBetting = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Sign in for live betting</h2>
            <p className="text-muted-foreground mb-6">Please sign in or create an account to access live in-play betting</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign In / Sign Up
            </button>
          </div>
        </div>
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </div>
    );
  }
  const [liveMatches, setLiveMatches] = useState([
    {
      id: 1,
      homeTeam: "Arsenal",
      awayTeam: "Manchester City",
      score: "2 - 1",
      minute: 67,
      status: "LIVE",
      odds: 1.85,
      homeOdds: 2.10,
      drawOdds: 3.40,
      awayOdds: 3.80
    },
    {
      id: 2,
      homeTeam: "Liverpool",
      awayTeam: "Chelsea",
      score: "1 - 1",
      minute: 45,
      status: "HT",
      odds: 2.10,
      homeOdds: 2.50,
      drawOdds: 3.20,
      awayOdds: 2.80
    }
  ]);

  const [selectedBets, setSelectedBets] = useState<{[key: number]: string}>({});

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setLiveMatches(prev => prev.map(match => {
        if (match.status === "LIVE") {
          const newMinute = Math.min(match.minute + 1, 90);
          const oddsChange = (Math.random() - 0.5) * 0.1;
          return {
            ...match,
            minute: newMinute,
            homeOdds: Math.max(1.1, match.homeOdds + oddsChange),
            drawOdds: Math.max(1.1, match.drawOdds + oddsChange),
            awayOdds: Math.max(1.1, match.awayOdds - oddsChange)
          };
        }
        return match;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleBet = (matchId: number, betType: string, odds: number) => {
    setSelectedBets(prev => ({ ...prev, [matchId]: betType }));
    toast.success(`Bet placed on ${betType} at odds ${odds.toFixed(2)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <header className="sticky top-16 z-30 border-b border-glass-border bg-background/40 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
              <Radio className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="text-base font-bold leading-none">Live In-Play Action</div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="live-dot" /> Real-time Betting
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-16">
        {/* Main Content */}
        <main className="container py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Bet as the match unfolds</h1>
          <p className="text-muted-foreground max-w-2xl">
            Experience the thrill of live betting with real-time odds that update instantly as the action happens on the pitch.
          </p>
        </section>

        {/* Features Grid */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Live Betting Features</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              icon={<Clock className="h-6 w-6" />}
              title="Real-Time Betting"
              description="Place bets while the match is in progress. Odds update instantly based on game events."
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Dynamic Odds"
              description="Watch odds change live as goals are scored, cards are given, and momentum shifts."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Cash Out Anytime"
              description="Secure your winnings or cut losses early with our partial cash-out feature."
            />
          </div>
        </section>

        {/* Live Matches */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Live Matches Now</h2>
          <div className="space-y-4">
            {liveMatches.map(match => (
              <LiveMatchCard
                key={match.id}
                match={match}
                onBet={handleBet}
                selectedBet={selectedBets[match.id]}
              />
            ))}
          </div>
        </section>

        {/* Upcoming Live Events */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Upcoming Live Events</h2>
          <div className="glass rounded-xl p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div>
                  <div className="font-semibold">Man United vs Newcastle</div>
                  <div className="text-sm text-muted-foreground">Premier League</div>
                </div>
                <div className="text-right">
                  <div className="text-accent font-semibold">Today, 8:00 PM</div>
                  <div className="text-xs text-muted-foreground">Live betting available</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div>
                  <div className="font-semibold">Tottenham vs Aston Villa</div>
                  <div className="text-sm text-muted-foreground">Premier League</div>
                </div>
                <div className="text-right">
                  <div className="text-accent font-semibold">Tomorrow, 6:30 PM</div>
                  <div className="text-xs text-muted-foreground">Live betting available</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        </main>
      </div>
    </div>
  );
};

// Helper Components
const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => (
  <div className="glass rounded-xl p-6">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground mb-4">
      {icon}
    </div>
    <h3 className="font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

const LiveMatchCard = ({ 
  match, 
  onBet,
  selectedBet
}: {
  match: any;
  onBet: (matchId: number, betType: string, odds: number) => void;
  selectedBet?: string;
}) => (
  <div className="glass rounded-xl p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${
          match.status === "LIVE" ? "bg-red-500 text-white" : "bg-yellow-500 text-black"
        }`}>
          {match.status === "LIVE" && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
          {match.status === "LIVE" ? "LIVE" : "HT"}
        </div>
        <span className="text-sm text-muted-foreground">{match.minute}'</span>
      </div>
      <div className="text-2xl font-bold">{match.score}</div>
    </div>
    
    <div className="space-y-3">
      {/* Home Team */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{match.homeTeam}</span>
        <Button 
          size="sm"
          variant={selectedBet === "home" ? "default" : "outline"}
          onClick={() => onBet(match.id, "home", match.homeOdds)}
          className="min-w-[80px]"
        >
          {match.homeOdds.toFixed(2)}
        </Button>
      </div>
      
      {/* Draw */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Draw</span>
        <Button 
          size="sm"
          variant={selectedBet === "draw" ? "default" : "outline"}
          onClick={() => onBet(match.id, "draw", match.drawOdds)}
          className="min-w-[80px]"
        >
          {match.drawOdds.toFixed(2)}
        </Button>
      </div>
      
      {/* Away Team */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{match.awayTeam}</span>
        <Button 
          size="sm"
          variant={selectedBet === "away" ? "default" : "outline"}
          onClick={() => onBet(match.id, "away", match.awayOdds)}
          className="min-w-[80px]"
        >
          {match.awayOdds.toFixed(2)}
        </Button>
      </div>
    </div>
    
    {selectedBet && (
      <div className="mt-3 p-2 bg-accent/20 rounded text-center text-sm">
        Bet placed on {selectedBet}
      </div>
    )}
  </div>
);

export default LiveBetting;
