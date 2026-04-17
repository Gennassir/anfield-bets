import { Headphones, Phone, MessageCircle, Mail, Clock, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const Support = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContact = (method: string, contact: string) => {
    switch (method) {
      case "phone":
        window.open(`tel:${contact}`, "_blank");
        break;
      case "whatsapp":
        window.open(`https://wa.me/${contact.replace(/\D/g, "")}`, "_blank");
        break;
      case "email":
        window.open(`mailto:${contact}`, "_blank");
        break;
      case "chat":
        toast.info("Live chat opening... Support team will respond within 2 minutes");
        break;
      default:
        break;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success("Support request submitted! We'll respond within 1 hour.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-glass-border bg-background/40 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
              <Headphones className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="text-base font-bold leading-none">24/7 Support</div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                <Clock className="h-3 w-3" /> Always here to help
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-4">We're here to help</h1>
          <p className="text-muted-foreground max-w-2xl">
            Our Nairobi-based support team is available 24/7 to assist you with any questions or issues.
          </p>
        </section>

        {/* Contact Options */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <ContactCard
              icon={<Phone className="h-6 w-6" />}
              title="Phone Support"
              description="Call us anytime for immediate assistance"
              contact="+254 712 345678"
              action="Call Now"
              primary
              onContact={handleContact}
            />
            <ContactCard
              icon={<MessageCircle className="h-6 w-6" />}
              title="WhatsApp Support"
              description="Fast response via WhatsApp messaging"
              contact="+254 712 345678"
              action="Chat on WhatsApp"
              primary
              onContact={handleContact}
            />
            <ContactCard
              icon={<Mail className="h-6 w-6" />}
              title="Email Support"
              description="Send us detailed queries via email"
              contact="support@redzonebets.co.ke"
              action="Send Email"
              onContact={handleContact}
            />
            <ContactCard
              icon={<Headphones className="h-6 w-6" />}
              title="Live Chat"
              description="Chat with our support team instantly"
              contact="Available on website"
              action="Start Chat"
              onContact={handleContact}
            />
          </div>
        </section>

        {/* Support Hours */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Support Hours</h2>
          <div className="glass rounded-xl p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-3">Phone & WhatsApp</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="text-accent">24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday - Sunday</span>
                    <span className="text-accent">24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Holidays</span>
                    <span className="text-accent">24/7</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Email & Live Chat</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Response Time</span>
                    <span className="text-accent">2 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email Response</span>
                    <span className="text-accent">Within 1 hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Complex Issues</span>
                    <span className="text-accent">Within 24 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FAQCard
              question="How do I deposit funds?"
              answer="You can deposit via M-Pesa, bank transfer, or card payment. M-Pesa deposits are instant. Go to Wallet > Deposit and follow the instructions."
            />
            <FAQCard
              question="What's the minimum bet amount?"
              answer="Minimum bet is KSH 100 per selection. You can combine multiple selections in one bet slip to increase your potential winnings."
            />
            <FAQCard
              question="How fast are withdrawals?"
              answer="M-Pesa withdrawals are processed within 5 minutes. Bank transfers take 1-2 business days. Go to Wallet > Withdraw to cash out your winnings."
            />
            <FAQCard
              question="Is my data secure?"
              answer="Yes, we use 256-bit SSL encryption to protect your data and transactions. We're also licensed by the Betting Control and Licensing Board (BCLB)."
            />
            <FAQCard
              question="Can I cancel a bet?"
              answer="Once a bet is placed and confirmed, it cannot be cancelled. However, our cash-out feature allows you to secure winnings or minimize losses on certain bets."
            />
          </div>
        </section>

        {/* Contact Form */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Send us a Message</h2>
          <div className="glass rounded-xl p-6">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-glass-border focus:border-accent focus:outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-glass-border focus:border-accent focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-glass-border focus:border-accent focus:outline-none"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-glass-border focus:border-accent focus:outline-none resize-none"
                  placeholder="Describe your issue or question..."
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>
        </section>

        {/* Emergency Contact */}
        <section>
          <div className="glass rounded-xl p-6 border-l-4 border-red-500">
            <h3 className="font-semibold mb-2 text-red-500">Responsible Gaming Support</h3>
            <p className="text-sm text-muted-foreground mb-3">
              If you're concerned about your gambling behavior, we're here to help.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => toast.info("Setting limits helps you stay in control")}>
                Set Limits
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info("Self-exclusion options available")}>
                Self-Exclude
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleContact("phone", "+254 799 999 999")}>
                Get Help
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// Helper Components
const ContactCard = ({ 
  icon, 
  title, 
  description, 
  contact, 
  action, 
  primary = false,
  onContact
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  contact: string;
  action: string;
  primary?: boolean;
  onContact: (method: string, contact: string) => void;
}) => {
  const getContactMethod = () => {
    if (title.includes("Phone")) return "phone";
    if (title.includes("WhatsApp")) return "whatsapp";
    if (title.includes("Email")) return "email";
    if (title.includes("Chat")) return "chat";
    return "";
  };

  return (
    <div className={`glass rounded-xl p-6 ${primary ? 'ring-2 ring-accent' : ''}`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
          primary ? 'bg-[image:var(--gradient-primary)] text-primary-foreground' : 'bg-accent/20 text-accent'
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <p className="text-sm font-mono mb-4">{contact}</p>
          <Button 
            className="w-full" 
            variant={primary ? "default" : "outline"}
            onClick={() => onContact(getContactMethod(), contact)}
          >
            {action}
          </Button>
        </div>
      </div>
    </div>
  );
};

const FAQCard = ({ question, answer }: { question: string; answer: string }) => (
  <div className="glass rounded-xl p-6">
    <h3 className="font-semibold mb-3">{question}</h3>
    <p className="text-sm text-muted-foreground">{answer}</p>
  </div>
);

export default Support;
