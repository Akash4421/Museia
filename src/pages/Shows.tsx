import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { setSEO } from "@/lib/seo";
import fallbackImg from "@/assets/museum-placeholder.png";

const Shows = () => {
  const [shows, setShows] = useState<any[]>([]);

  useEffect(() => {
    setSEO("Shows | Museia", "Browse upcoming museum shows and book tickets instantly.");
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("shows")
      .select("*, museums(id,name,city,image_url)")
      .gte("show_date", today)
      .order("show_date")
      .then(({ data }) => setShows(data ?? []));
  }, []);

  return (
    <Layout>
      <div className="container-narrow py-12 sm:py-16">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-3">Upcoming shows</h1>
        <p className="text-muted-foreground mb-10 max-w-2xl">Curator-led tours, live talks and after-hours experiences.</p>
        <div className="grid sm:grid-cols-2 gap-6">
          {shows.map((s) => (
            <Card key={s.id} className="overflow-hidden hover-lift">
              <img 
                src={s.image_url || fallbackImg} 
                alt={s.title} 
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackImg;
                }}
              />
              <div className="p-5">
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3" /> {s.museums?.name} · {s.museums?.city}
                </p>
                <h3 className="font-display text-xl font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{s.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(s.show_date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.start_time?.slice(0, 5)}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="font-medium">₹{s.price}</span>
                  <Button asChild size="sm">
                    <Link to={`/book?museum=${s.museum_id}&show=${s.id}`}>Book</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Shows;
