import { Trophy, Radio, Gift, Headphones, ShieldCheck } from "lucide-react";

export const Footer = () => {
  const handleFeatureClick = (feature: "live" | "bonus" | "support") => {
    const urls = {
      live: "/live-betting",
      bonus: "/bonuses", 
      support: "/support"
    };
    
    // Open in new tab with full URL
    const fullUrl = window.location.origin + urls[feature];
    window.open(fullUrl, '_blank', 'noopener,noreferrer,width=1200,height=800');
  };

  return (
    <footer className="relative mt-16 border-t border-glass-border bg-background/60 backdrop-blur-xl">
      {/* Jackpot banner */}
      <div className="relative overflow-hidden border-b border-glass-border">
        <div
          className="absolute inset-0 opacity-90"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
        <div className="container relative flex flex-col items-center gap-2 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <Trophy className="h-10 w-10 text-primary-foreground drop-shadow" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-foreground/80">
                Grand Prize · Matchday Finale
              </div>
              <div className="text-2xl font-extrabold leading-tight text-primary-foreground sm:text-3xl">
                Winner gets <span className="text-accent">KSH 100,000</span>
              </div>
            </div>
          </div>
          <div className="rounded-full border border-primary-foreground/30 bg-background/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground backdrop-blur">
            🇰🇪 25 May · Last Day of Premier League
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div className="container grid grid-cols-1 gap-4 py-8 sm:grid-cols-3">
        <FeatureCard
          icon={<Radio className="h-5 w-5" />}
          title="Live In-Play Action"
          desc="Bet as the match unfolds with real-time odds updates."
          onClick={() => handleFeatureClick("live")}
        />
        <FeatureCard
          icon={<Gift className="h-5 w-5" />}
          title="Bonus Offers & Rewards"
          desc="Daily boosts, free bets and weekly cashback for loyal punters."
          onClick={() => handleFeatureClick("bonus")}
        />
        <FeatureCard
          icon={<Headphones className="h-5 w-5" />}
          title="24/7 Support"
          desc="Our Nairobi-based team is always one tap away."
          onClick={() => handleFeatureClick("support")}
        />
      </div>

      {/* Bottom bar */}
      <div className="border-t border-glass-border">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)]">
              <Trophy className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">RedZone Bets</span>
            <span>· Licensed by BCLB · 18+ only</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" /> 256-bit secure
            </span>
            <span>© {new Date().getFullYear()} RedZone Bets KE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FeatureCard = ({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick?: () => void;
}) => (
  <div 
    className="glass flex items-start gap-3 rounded-2xl p-4 transition hover:border-primary/40 cursor-pointer hover:scale-[1.02]"
    onClick={onClick}
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]">
      {icon}
    </div>
    <div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
  </div>
);
