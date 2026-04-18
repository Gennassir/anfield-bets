import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Smartphone, ArrowDownToLine, ArrowUpFromLine, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  userId: string;
  balance: number;
  onUpdated: () => void;
  initialMode?: "deposit" | "withdraw";
}

export const WalletModal = ({ open, onOpenChange, userId, balance, onUpdated, initialMode = "deposit" }: Props) => {
  const [mode, setMode] = useState<"deposit" | "withdraw">(initialMode);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingStkId, setPendingStkId] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);

  // Sync mode when reopened with a different initialMode
  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  // Poll for completion when an STK is pending
  useEffect(() => {
    if (!pendingStkId) return;
    setWaiting(true);
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("stk_requests")
        .select("status, result_desc, mpesa_receipt")
        .eq("id", pendingStkId)
        .maybeSingle();
      if (!data) return;
      if (data.status === "success") {
        clearInterval(interval);
        setWaiting(false);
        setPendingStkId(null);
        toast.success(`${mode === "deposit" ? "Deposit" : "Withdrawal"} successful${data.mpesa_receipt ? ` · ${data.mpesa_receipt}` : ""}`);
        setAmount(""); setPhone("");
        onUpdated();
        onOpenChange(false);
      } else if (data.status === "failed" || data.status === "cancelled") {
        clearInterval(interval);
        setWaiting(false);
        setPendingStkId(null);
        toast.error(data.result_desc || "Transaction failed or cancelled");
      }
    }, 3000);
    // Timeout after 2 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setWaiting(false);
      setPendingStkId(null);
      toast.error("Timed out waiting for M-Pesa confirmation. Check your transaction history.");
    }, 120000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [pendingStkId, mode, onOpenChange, onUpdated]);

  const submit = async () => {
    const amt = Number(amount);
    if (!amt || amt < 10) return toast.error("Minimum amount is KSH 10");
    if (!/^(?:\+?254|0)?7\d{8}$/.test(phone)) return toast.error("Phone must be 07XXXXXXXX or 2547XXXXXXXX");
    if (mode === "withdraw" && amt > balance) return toast.error("Insufficient balance");

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

  return (
    <Dialog open={open} onOpenChange={(o) => !waiting && onOpenChange(o)}>
      <DialogContent className="glass-strong border-glass-border max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Smartphone className="h-5 w-5 text-accent" /> M-Pesa · ANFIELD BETS
          </DialogTitle>
        </DialogHeader>

        {waiting ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <div>
              <p className="font-semibold">Waiting for M-Pesa confirmation…</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {mode === "deposit"
                  ? "Enter your M-Pesa PIN on your phone to complete the deposit."
                  : "Withdrawal is being processed by Safaricom."}
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

            <div className="space-y-3 pt-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">M-Pesa number</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" maxLength={13} className="glass h-12" />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Amount (KSH)</label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500" className="glass h-12" />
              </div>
              <Button onClick={submit} variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading ? "Sending STK push…" : `Confirm ${mode}`}
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                Powered by PayHero · You'll receive an M-Pesa prompt as <strong>ANFIELD BETS</strong>
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
