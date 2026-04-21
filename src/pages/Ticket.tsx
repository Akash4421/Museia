import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, Calendar, MapPin, Download } from "lucide-react";
import { setSEO } from "@/lib/seo";

const Ticket = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    setSEO("Your ticket | Museia", "Your confirmed museum ticket.");
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`https://museia.onrender.com/api/bookings/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) return;
        setBooking({
          ...data,
          museums: { name: data.museumName || "Museum", city: "", image_url: "" },
          shows: data.showName !== "General Admission" ? { title: data.showName } : null,
          visit_date: data.date,
          total_amount: data.totalAmount,
          qr_code: data.qrCode || `MUSEIA-${data._id}`
        });
      })
      .catch(console.error);
  }, [id]);

  if (!booking) return <Layout><div className="container-narrow py-20 text-center">Loading…</div></Layout>;

  return (
    <Layout>
      <div className="container-narrow py-12 max-w-2xl">
        <div className="text-center mb-8">
          <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-3" />
          <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-2">Booking confirmed</h1>
          <p className="text-muted-foreground">Your ticket is ready. Show this QR code at the entrance.</p>
        </div>

        <Card className="overflow-hidden shadow-[var(--shadow-elevated)]">
          {booking.museums?.image_url && (
            <img src={booking.museums.image_url} alt={booking.museums.name} className="w-full h-32 object-cover" />
          )}
          <div className="p-6">
            <h2 className="font-display text-2xl font-semibold mb-1">{booking.museums?.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
              <MapPin className="w-3 h-3" /> {booking.museums?.city}
            </p>
            {booking.shows && (
              <div className="bg-secondary rounded-md p-3 mb-4 text-sm">
                <p className="font-medium">{booking.shows.title}</p>
                <p className="text-xs text-muted-foreground">{booking.shows.start_time?.slice(0, 5)}</p>
              </div>
            )}

            <div className="flex justify-center my-6 p-6 bg-white rounded-lg">
              {booking.qr_code?.startsWith("data:image") ? (
                <img src={booking.qr_code} alt="QR Code" width={200} height={200} />
              ) : (
                <QRCodeSVG value={booking.qr_code || `MUSEIA-${booking._id}`} size={200} level="H" />
              )}
            </div>

            {!booking.qr_code?.startsWith("data:image") && (
              <p className="text-center font-mono text-xs tracking-wider text-muted-foreground mb-6">{booking.qr_code}</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Visit date</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(booking.visit_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Total paid</p>
                <p className="font-medium">₹{Number(booking.total_amount).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Tickets</p>
                <p className="font-medium">
                  {booking.adult_count > 0 && `${booking.adult_count} Adult `}
                  {booking.child_count > 0 && `${booking.child_count} Child `}
                  {booking.senior_count > 0 && `${booking.senior_count} Senior`}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Status</p>
                <p className="font-medium capitalize text-accent">{booking.status}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-3 mt-6">
          <Button asChild variant="outline" className="flex-1">
            <Link to="/dashboard">My tickets</Link>
          </Button>
          <Button onClick={() => window.print()} className="flex-1">
            <Download className="w-4 h-4 mr-2" /> Print ticket
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Ticket;
