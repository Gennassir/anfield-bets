import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Smartphone, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  userId: string;
  balance: number;
  onUpdated: () => void;
}

export const WalletModal = ({ open, onOpenChange, userId, balance, onUpdated }: Props) => {
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const amt = Number(amount);
    if (!amt || amt < 10) return toast.error("Minimum amount is KSH 10");
    if (!/^07\d{8}$/.test(phone)) return toast.error("Phone must be in 07XXXXXXXX format");
    if (mode === "withdraw" && amt > balance) return toast.error("Insufficient balance");

    setLoading(true);
    const delta = mode === "deposit" ? amt : -amt;
    const { error: txErr } = await supabase.from("wallet_transactions").insert({
      user_id: userId,
      type: mode,
      amount: delta,
      description: `M-Pesa ${mode} · ${phone}`,
    });
    if (txErr) { setLoading(false); return toast.error(txErr.message); }

    const { error: pErr } = await supabase
      .from("profiles")
      .update({ balance: balance + delta })
      .eq("user_id", userId);
    setLoading(false);
    if (pErr) return toast.error(pErr.message);

    toast.success(`${mode === "deposit" ? "Deposited" : "Withdrew"} KSH ${amt.toLocaleString()}`);
    setAmount(""); setPhone("");
    onUpdated();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-glass-border max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Smartphone className="h-5 w-5 text-accent" /> M-Pesa
          </DialogTitle>
        </DialogHeader>

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
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" maxLength={10} className="glass h-12" />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Amount (KSH)</label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500" className="glass h-12" />
          </div>
          <Button onClick={submit} variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading ? "Processing..." : `Confirm ${mode}`}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">Simulated M-Pesa flow · No real money is moved</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
