import { Gift, Clock, TrendingUp, ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { AuthModal } from "@/components/AuthModal";
import Navigation from "@/components/Navigation";

const Bonuses = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [claimedBonuses, setClaimedBonuses] = useState<string[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(350);

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
            <h2 className="text-2xl font-bold mb-4">Sign in for bonuses</h2>
            <p className="text-muted-foreground mb-6">Please sign in or create an account to access bonus offers</p>
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

  const handleClaimBonus = (code: string, title: string) => {
    if (claimedBonuses.includes(code)) {
      toast.error("You've already claimed this bonus");
      return;
    }

    setClaimedBonuses(prev => [...prev, code]);
    toast.success(`${title} claimed successfully! Check your account.`);
    
    // Add loyalty points for claiming bonus
    setLoyaltyPoints(prev => prev + 50);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Bonus code copied to clipboard!");
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
              <Gift className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="text-base font-bold leading-none">Bonus Offers & Rewards</div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                Daily boosts, free bets and weekly cashback
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-16">
        {/* Main Content */}
        <main className="container py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Unlock Exclusive Rewards</h1>
          <p className="text-muted-foreground max-w-2xl">
            Get more value from every bet with our comprehensive bonus program designed for Kenyan punters.
          </p>
        </section>

        {/* Active Bonuses */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Bonuses</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <BonusCard
              title="Welcome Bonus"
              description="Get 100% bonus on your first deposit up to KSH 10,000"
              code="WELCOME100"
              valid="New users only"
              expiry="30 days"
              featured
              onClaim={handleClaimBonus}
              onCopyCode={handleCopyCode}
              isClaimed={claimedBonuses.includes("WELCOME100")}
            />
            <BonusCard
              title="Daily Boost"
              description="Enhanced odds on selected matches every day"
              code="DAILY50"
              valid="Once per day"
              expiry="24 hours"
              onClaim={handleClaimBonus}
              onCopyCode={handleCopyCode}
              isClaimed={claimedBonuses.includes("DAILY50")}
            />
            <BonusCard
              title="Weekly Cashback"
              description="10% cashback on net losses every week"
              code="CASHBACK10"
              valid="Every Monday"
              expiry="7 days"
              onClaim={handleClaimBonus}
              onCopyCode={handleCopyCode}
              isClaimed={claimedBonuses.includes("CASHBACK10")}
            />
            <BonusCard
              title="Acca Insurance"
              description="Get your stake back if one leg lets you down"
              code="ACCA SAFE"
              valid="Min 5 selections"
              expiry="14 days"
              onClaim={handleClaimBonus}
              onCopyCode={handleCopyCode}
              isClaimed={claimedBonuses.includes("ACCA SAFE")}
            />
          </div>
        </section>

        {/* Loyalty Program */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Loyalty Program</h2>
          <div className="glass rounded-xl p-6">
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <LoyaltyTier
                tier="Bronze"
                benefits="5% cashback"
                requirement="KSH 0"
                current
              />
              <LoyaltyTier
                tier="Silver"
                benefits="10% cashback"
                requirement="KSH 1,000"
              />
              <LoyaltyTier
                tier="Gold"
                benefits="15% cashback"
                requirement="KSH 5,000"
              />
              <LoyaltyTier
                tier="Platinum"
                benefits="20% cashback"
                requirement="KSH 10,000"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Your Progress</span>
                <span className="text-accent">{loyaltyPoints} Points</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div className="bg-[image:var(--gradient-primary)] h-3 rounded-full" style={{ width: `${Math.min((loyaltyPoints / 1000) * 100, 100)}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{Math.max(0, 1000 - loyaltyPoints)} more points to Silver level</p>
            </div>
          </div>
        </section>

        {/* Bonus Terms */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Terms & Conditions</h2>
          <div className="glass rounded-xl p-6">
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Wagering Requirements</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Bonus amount must be wagered 5x before withdrawal</li>
                  <li>Minimum odds of 1.80 apply to bonus bets</li>
                  <li>Different bonuses have different wagering requirements</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">General Rules</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>One bonus per user/household/IP address</li>
                  <li>Bonuses expire within the stated time period</li>
                  <li>RedZone Bets reserves the right to modify or cancel promotions</li>
                </ul>
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
const BonusCard = ({ 
  title, 
  description, 
  code, 
  valid, 
  expiry, 
  featured = false,
  onClaim,
  onCopyCode,
  isClaimed
}: {
  title: string;
  description: string;
  code: string;
  valid: string;
  expiry: string;
  featured?: boolean;
  onClaim: (code: string, title: string) => void;
  onCopyCode: (code: string) => void;
  isClaimed: boolean;
}) => (
  <div className={`glass rounded-xl p-6 ${featured ? 'ring-2 ring-accent' : ''} ${isClaimed ? 'opacity-75' : ''}`}>
    {featured && (
      <div className="inline-block px-2 py-1 bg-accent text-accent-foreground text-xs font-bold rounded mb-3">
        FEATURED
      </div>
    )}
    {isClaimed && (
      <div className="inline-block px-2 py-1 bg-green-500 text-white text-xs font-bold rounded mb-3 ml-2">
        <Check className="inline h-3 w-3 mr-1" />
        CLAIMED
      </div>
    )}
    <div className="flex justify-between items-start mb-3">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="flex items-center gap-2">
        <code className="text-sm bg-accent/20 px-3 py-1 rounded">{code}</code>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onCopyCode(code)}
        >
          Copy
        </Button>
      </div>
    </div>
    <p className="text-muted-foreground mb-4">{description}</p>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Valid:</span>
        <span>{valid}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Expires:</span>
        <span>{expiry}</span>
      </div>
    </div>
    <Button 
      className="w-full mt-4" 
      disabled={isClaimed}
      onClick={() => onClaim(code, title)}
    >
      {isClaimed ? "Already Claimed" : "Claim Bonus"}
    </Button>
  </div>
);

const LoyaltyTier = ({ 
  tier, 
  benefits, 
  requirement, 
  current = false 
}: {
  tier: string;
  benefits: string;
  requirement: string;
  current?: boolean;
}) => (
  <div className={`text-center p-4 rounded-xl ${
    current ? 'bg-accent/20 ring-2 ring-accent' : 'glass'
  }`}>
    <div className="text-2xl font-bold mb-2">{tier}</div>
    <div className="text-sm text-muted-foreground mb-2">{benefits}</div>
    <div className="text-xs font-semibold">{requirement}</div>
    {current && (
      <div className="text-xs text-accent mt-2">Current Level</div>
    )}
  </div>
);

export default Bonuses;
