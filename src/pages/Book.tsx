import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { setSEO } from "@/lib/seo";
import { CreditCard, ShieldCheck, Loader2 } from "lucide-react";

const Book = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const museumId = params.get("museum");
  const showId = params.get("show");

  const [user, setUser] = useState<User | null>(null);
  const [museum, setMuseum] = useState<any>(null);
  const [show, setShow] = useState<any>(null);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [adult, setAdult] = useState(1);
  const [child, setChild] = useState(0);
  const [senior, setSenior] = useState(0);
  const [step, setStep] = useState<"form" | "pay">("form");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    setSEO("Book tickets | Museia", "Book your museum tickets in seconds.");
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) {
      toast.error("Please sign in to book");
      navigate(`/auth`);
    } else {
      setUser(JSON.parse(userStr));
    }
  }, [navigate]);

  useEffect(() => {
    if (!museumId) return;
    supabase.from("museums").select("*").eq("id", museumId).maybeSingle().then(({ data }) => setMuseum(data));
    if (showId) supabase.from("shows").select("*").eq("id", showId).maybeSingle().then(({ data }) => setShow(data));
  }, [museumId, showId]);

  if (!museum) return <Layout><div className="container-narrow py-20 text-center">Loading…</div></Layout>;

  const total =
    adult * Number(museum.base_price_adult) +
    child * Number(museum.base_price_child) +
    senior * Number(museum.base_price_senior) +
    (show ? (adult + child + senior) * Number(show.price) : 0);

  const ticketCount = adult + child + senior;

  const confirmPayment = async () => {
    const token = localStorage.getItem("token");
    if (!user || !token) return;
    setPaying(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          showId: show?.id || "N/A",
          showName: show?.title || "General Admission",
          museumName: museum.name,
          date: visitDate,
          timeSlot: "10:00 AM",
          adultCount: adult,
          childCount: child,
          seniorCount: senior,
          totalAmount: total
        })
      });

      const data = await response.json();
      setPaying(false);

      if (!response.ok) {
        toast.error(data.message || "Booking failed. Please try again.");
        return;
      }

      toast.success("Payment successful! Your ticket is ready.");
      navigate(`/ticket/${data._id}`);
    } catch (err) {
      setPaying(false);
      toast.error("Booking failed. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="container-narrow py-12 max-w-3xl">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-2">Book tickets</h1>
        <p className="text-muted-foreground mb-8">{museum.name}{show ? ` — ${show.title}` : ""}</p>

        {step === "form" && (
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="date">Visit date</Label>
                <Input
                  id="date"
                  type="date"
                  value={visitDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setVisitDate(e.target.value)}
                />
              </div>

              <div>
                <h3 className="font-medium mb-3">Tickets</h3>
                <div className="space-y-3">
                  {[
                    { label: "Adult", price: Number(museum.base_price_adult), val: adult, set: setAdult, sub: "Ages 13+" },
                    { label: "Child", price: Number(museum.base_price_child), val: child, set: setChild, sub: "Ages 3–12" },
                    { label: "Senior", price: Number(museum.base_price_senior), val: senior, set: setSenior, sub: "Ages 60+" },
                  ].map((t) => (
                    <div key={t.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.sub} · {t.price === 0 ? "Free" : `₹${t.price}`}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="icon" onClick={() => t.set(Math.max(0, t.val - 1))}>−</Button>
                        <span className="w-8 text-center font-medium">{t.val}</span>
                        <Button type="button" variant="outline" size="icon" onClick={() => t.set(t.val + 1)}>+</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {show && (
                <div className="text-sm bg-secondary p-3 rounded-md">
                  <p className="font-medium">{show.title}</p>
                  <p className="text-xs text-muted-foreground">+ ₹{show.price} per person · {ticketCount} ticket(s)</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="font-medium">Total</span>
                <span className="font-display text-2xl font-semibold">₹{total.toFixed(2)}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={ticketCount === 0}
                onClick={() => setStep("pay")}
              >
                Continue to payment
              </Button>
            </div>
          </Card>
        )}

        {step === "pay" && (
          <Card className="p-6">
            <div className="text-center mb-6">
              <ShieldCheck className="w-12 h-12 text-accent mx-auto mb-3" />
              <h3 className="font-display text-2xl font-semibold mb-1">Secure payment</h3>
              <p className="text-sm text-muted-foreground">This is a demo payment. No real charge will be made.</p>
            </div>

            <div className="bg-secondary rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Card details</span>
              </div>
              <div className="space-y-3">
                <Input placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" readOnly />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="MM/YY" defaultValue="12/29" readOnly />
                  <Input placeholder="CVC" defaultValue="123" readOnly />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6 text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold text-lg">₹{total.toFixed(2)}</span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("form")} disabled={paying}>Back</Button>
              <Button className="flex-1" onClick={confirmPayment} disabled={paying}>
                {paying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : `Pay ₹${total.toFixed(2)}`}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Book;
