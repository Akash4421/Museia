import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket as TicketIcon } from "lucide-react";
import { setSEO } from "@/lib/seo";

const Dashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSEO("My tickets | Museia", "Your past and upcoming museum bookings.");
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }
    fetch("https://museia.onrender.com/api/bookings/my-bookings", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const formattedData = Array.isArray(data) ? data.map((b: any) => ({
          id: b._id,
          museums: { name: b.museumName || "Museum", city: "", image_url: "" },
          shows: b.showName !== "General Admission" ? { title: b.showName } : null,
          visit_date: b.date,
          total_amount: b.totalAmount,
          status: b.status
        })) : [];
        setBookings(formattedData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.visit_date >= today);
  const past = bookings.filter((b) => b.visit_date < today);

  const renderBooking = (b: any) => (
    <Link key={b.id} to={`/ticket/${b.id}`}>
      <Card className="p-4 flex gap-4 hover-lift">
        {b.museums?.image_url && (
          <img src={b.museums.image_url} alt={b.museums.name} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold truncate">{b.museums?.name}</h3>
          {b.shows && <p className="text-sm text-muted-foreground truncate">{b.shows.title}</p>}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(b.visit_date).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{b.museums?.city}</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end justify-between">
          <span className="font-medium">₹{Number(b.total_amount).toFixed(2)}</span>
          <span className="text-xs text-accent capitalize">{b.status}</span>
        </div>
      </Card>
    </Link>
  );

  return (
    <Layout>
      <div className="container-narrow py-12">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-8">My tickets</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <TicketIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h2 className="font-display text-xl font-semibold mb-2">No bookings yet</h2>
            <p className="text-muted-foreground mb-6">Start exploring to book your first ticket.</p>
            <Button asChild><Link to="/museums">Browse museums</Link></Button>
          </Card>
        ) : (
          <div className="space-y-10">
            {upcoming.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">Upcoming</h2>
                <div className="space-y-3">{upcoming.map(renderBooking)}</div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">Past visits</h2>
                <div className="space-y-3">{past.map(renderBooking)}</div>
              </section>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
