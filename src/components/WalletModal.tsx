import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Smartphone, ArrowDownToLine, ArrowUpFromLine, Loader2, Lock } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  userId: string;
  balance: number;
  onUpdated: () => void;
  initialMode?: "deposit" | "withdraw";
}

const MIN_DEPOSIT = 100;
const MIN_WITHDRAW_BALANCE = 1000;

export const WalletModal = ({ open, onOpenChange, userId, balance, onUpdated, initialMode = "deposit" }: Props) => {
  const [mode, setMode] = useState<"deposit" | "withdraw">(initialMode);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingStkId, setPendingStkId] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [profilePhone, setProfilePhone] = useState<string>("");

  // Load profile phone for autofill
  useEffect(() => {
    if (!open || !userId) return;
    supabase.from("profiles").select("phone").eq("user_id", userId).maybeSingle()
      .then(({ data }) => {
        if (data?.phone) {
          setProfilePhone(data.phone);
          setPhone(data.phone);
        }
      });
  }, [open, userId]);

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  // Poll for completion when an STK is pending
  useEffect(() => {
    if (!pendingStkId) return;
    setWaiting(true);
    let cancelled = false;

    const interval = setInterval(async () => {
      if (cancelled) return;
      const { data } = await supabase
        .from("stk_requests")
        .select("status, result_desc, mpesa_receipt")
        .eq("id", pendingStkId)
        .maybeSingle();
      if (!data) return;

      if (data.status === "success") {
        clearInterval(interval);
        clearTimeout(timeout);
        cancelled = true;
        setWaiting(false);
        setPendingStkId(null);
        toast.success(
          `${mode === "deposit" ? "Deposit" : "Withdrawal"} confirmed${data.mpesa_receipt ? ` · ${data.mpesa_receipt}` : ""}`
        );
        setAmount("");
        onUpdated();
        onOpenChange(false);
      } else if (data.status === "failed" || data.status === "cancelled") {
        clearInterval(interval);
        clearTimeout(timeout);
        cancelled = true;
        setWaiting(false);
        setPendingStkId(null);
        toast.error(data.result_desc || "Payment failed or cancelled — no funds were debited.");
      }
    }, 3000);

    // Hard timeout at 90s — STK push expires after ~60s
    const timeout = setTimeout(() => {
      if (cancelled) return;
      cancelled = true;
      clearInterval(interval);
      setWaiting(false);
      setPendingStkId(null);
      toast.error("Timed out waiting for M-Pesa confirmation. If you completed the payment, your balance will update shortly.");
      onUpdated();
    }, 90000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pendingStkId, mode, onOpenChange, onUpdated]);

  const submit = async () => {
    const amt = Number(amount);
    if (mode === "deposit" && (!amt || amt < MIN_DEPOSIT)) {
      return toast.error(`Minimum deposit is KSH ${MIN_DEPOSIT}`);
    }
    if (mode === "withdraw") {
      if (balance < MIN_WITHDRAW_BALANCE) {
        return toast.error(`Withdrawals are locked until your balance reaches KSH ${MIN_WITHDRAW_BALANCE}`);
      }
      if (!amt || amt < 50) return toast.error("Minimum withdrawal is KSH 50");
      if (amt > balance) return toast.error("Insufficient balance");
    }
    if (!/^(?:\+?254|0)?7\d{8}$/.test(phone)) return toast.error("Phone must be 07XXXXXXXX or 2547XXXXXXXX");

    setLoading(true);
    const { data, error } = await supabase.functions.invoke("payhero-stk", {
      body: { phone, amount: amt, type: mode },
    });
    setLoading(false);

    if (error || data?.error) {
      return toast.error(data?.error || error?.message || "Failed to initiate payment");
    }

    toast.success(data.message || "STK push sent — check your phone");
    if (data.stk_id) setPendingStkId(data.stk_id);
  };

  const withdrawLocked = mode === "withdraw" && balance < MIN_WITHDRAW_BALANCE;

  return (
    <Dialog open={open} onOpenChange={(o) => !waiting && onOpenChange(o)}>
      <DialogContent className="glass-strong border-glass-border w-[calc(100vw-1rem)] max-w-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pr-8">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl">
            <Smartphone className="h-5 w-5 text-accent shrink-0" /> <span className="truncate">M-Pesa · ANFIELD BETS</span>
          </DialogTitle>
        </DialogHeader>

        {waiting ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <div>
              <p className="font-semibold">Waiting for M-Pesa confirmation…</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {mode === "deposit"
                  ? "Enter your M-Pesa PIN on your phone. We'll only credit your wallet once Safaricom confirms."
                  : "Withdrawal is being processed by Safaricom."}
              </p>
              <p className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                Times out in 90 seconds
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-1">
              <button
                onClick={() => setMode("deposit")}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${mode === "deposit" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                <ArrowDownToLine className="h-4 w-4" /> Deposit
              </button>
              <button
                onClick={() => setMode("withdraw")}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${mode === "withdraw" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                <ArrowUpFromLine className="h-4 w-4" /> Withdraw
              </button>
            </div>

            {withdrawLocked && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs">
                <Lock className="h-4 w-4 shrink-0 text-destructive" />
                <div>
                  <div className="font-semibold text-destructive">Withdrawals locked</div>
                  <div className="text-muted-foreground">
                    Your balance must reach KSH {MIN_WITHDRAW_BALANCE.toLocaleString()} before you can withdraw.
                    Current: KSH {balance.toLocaleString()}.
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
                  M-Pesa number {profilePhone && <span className="text-accent normal-case tracking-normal">· autofilled</span>}
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  maxLength={13}
                  className="glass h-12"
                  readOnly={!!profilePhone}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
                  Amount (KSH) · min {mode === "deposit" ? MIN_DEPOSIT : 50}
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={mode === "deposit" ? "100" : "500"}
                  className="glass h-12"
                />
              </div>
              <Button
                onClick={submit}
                variant="hero"
                size="lg"
                className="w-full"
                disabled={loading || withdrawLocked}
              >
                {loading ? "Sending STK push…" : `Confirm ${mode}`}
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                You'll receive an M-Pesa prompt as <strong>ANFIELD BETS</strong>
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
