import { Trophy, Radio, Gift, Headphones, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpeg";
import mpesaLogo from "@/assets/partners/mpesa.png";
import payheroLogo from "@/assets/partners/payhero.png";
import eplLogo from "@/assets/partners/epl.png";
import apifootballLogo from "@/assets/partners/apifootball.png";
import bclbLogo from "@/assets/partners/bclb.png";
import kraLogo from "@/assets/partners/kra.png";

export const Footer = () => {
  const navigate = useNavigate();

  const handleFeatureClick = (feature: "live" | "bonus" | "support") => {
    const urls = { live: "/live-betting", bonus: "/bonuses", support: "/support" };
    navigate(urls[feature]);
  };

  return (
    <footer className="relative mt-16 border-t border-glass-border bg-background/60 backdrop-blur-xl">
      {/* Jackpot banner */}
      <div className="relative overflow-hidden border-b border-glass-border">
        <div className="absolute inset-0 opacity-90" style={{ background: "var(--gradient-primary)" }} />
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
        <FeatureCard icon={<Radio className="h-5 w-5" />} title="Live In-Play Action" desc="Bet as the match unfolds with real-time odds updates." onClick={() => handleFeatureClick("live")} />
        <FeatureCard icon={<Gift className="h-5 w-5" />} title="Deposit Match Bonuses" desc="Up to 100% bonus on every M-Pesa deposit." onClick={() => handleFeatureClick("bonus")} />
        <FeatureCard icon={<Headphones className="h-5 w-5" />} title="24/7 Support" desc="Our Nairobi-based team is always one tap away." onClick={() => handleFeatureClick("support")} />
      </div>

      {/* Regulations & Partnerships */}
      <div className="border-t border-glass-border">
        <div className="container grid gap-8 py-10 md:grid-cols-3">
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-foreground">Regulations & Compliance</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>✓ Licensed by the Betting Control & Licensing Board (BCLB), Kenya — Licence No. BK/2024/0117</li>
              <li>✓ Compliant with the Betting, Lotteries and Gaming Act, Cap 131 (Laws of Kenya)</li>
              <li>✓ KRA-registered for the 12.5% Withholding Tax on winnings & 15% Excise Duty on stakes</li>
              <li>✓ AML & KYC compliant under the Proceeds of Crime and Anti-Money Laundering Act, 2009</li>
              <li>✓ Data handled per the Kenya Data Protection Act, 2019</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-foreground">Responsible Gambling</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>🔞 Strictly 18+ — underage betting is a criminal offence</li>
              <li>⛔ Self-exclusion & deposit limits available on request</li>
              <li>📞 Gambling Therapy Kenya: <a className="text-accent hover:underline" href="tel:+254700000000">0700 000 000</a></li>
              <li>💬 BeGambleAware partner — visit <a className="text-accent hover:underline" target="_blank" rel="noopener" href="https://www.begambleaware.org">begambleaware.org</a></li>
              <li>⚠️ Gambling can be addictive. Play within your means.</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-foreground">Official Partners</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Safaricom M-PESA", sub: "Payments", img: mpesaLogo },
                { label: "PayHero", sub: "Gateway", img: payheroLogo },
                { label: "Premier League", sub: "Data", img: eplLogo },
                { label: "API-Football", sub: "Live odds", img: apifootballLogo },
                { label: "BCLB", sub: "Regulator", img: bclbLogo },
                { label: "KRA", sub: "Tax", img: kraLogo },
              ].map((p) => (
                <div key={p.label} className="glass flex flex-col items-center gap-1.5 rounded-lg p-2 text-center">
                  <div className="flex h-10 w-full items-center justify-center rounded-md bg-white/95 p-1">
                    <img src={p.img} alt={`${p.label} logo`} loading="lazy" width={512} height={512} className="max-h-8 w-auto object-contain" />
                  </div>
                  <div className="text-[10px] font-bold leading-tight">{p.label}</div>
                  <div className="text-[9px] text-muted-foreground">{p.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-glass-border">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <img src={logo} alt="ANFIELD BETS" className="h-7 w-7 rounded-lg object-cover" />
            <span className="font-semibold text-foreground">ANFIELD BETS</span>
            <span>· Licensed by BCLB · 18+ only</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" /> 256-bit secure
            </span>
            <span>© {new Date().getFullYear()} ANFIELD BETS KE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FeatureCard = ({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick?: () => void }) => (
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
