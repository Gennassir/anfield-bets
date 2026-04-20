import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import logo from "@/assets/logo.jpeg";

interface AuthModalProps {
  onClose?: () => void;
}

const normalizePhone = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return "254" + digits.slice(1);
  if (digits.startsWith("7") && digits.length === 9) return "254" + digits;
  return null;
};

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (password.length < 6) throw new Error("Password must be at least 6 characters");
        const normalized = normalizePhone(phone);
        if (!normalized) throw new Error("Enter a valid Kenyan phone (07XXXXXXXX or 2547XXXXXXXX)");

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { username, phone: normalized },
          },
        });
        if (error) throw error;
        await supabase.auth.signOut();
        toast.success("Registration successful! Please sign in to continue.");
        setMode("signin");
        setPassword("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        onClose?.();
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass-strong relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-8 animate-float-up">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-background/50 transition-colors"
          >
            ×
          </button>
        )}
        <div className="mb-6 text-center">
          <img src={logo} alt="ANFIELD BETS" className="mx-auto mb-3 h-16 w-16 rounded-2xl object-cover shadow-[var(--shadow-glow)]" />
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="live-dot" /> ANFIELD BETS
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to place your bets." : "Register with your M-Pesa number."}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <>
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                maxLength={30}
                className="glass border-glass-border h-12"
              />
              <Input
                type="tel"
                placeholder="M-Pesa phone (07XXXXXXXX)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                maxLength={13}
                className="glass border-glass-border h-12"
              />
            </>
          )}
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="glass h-12"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="glass h-12"
          />
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-center text-sm text-muted-foreground transition hover:text-foreground"
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>

        <p className="mt-4 text-center text-[11px] text-muted-foreground/70">
          🔒 Licensed by BCLB · 18+ only · Bet responsibly
        </p>
      </div>
    </div>
  );
};
