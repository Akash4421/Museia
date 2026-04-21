import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { setSEO } from "@/lib/seo";
import fallbackImg from "@/assets/museum-placeholder.png";

const Exhibitions = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    setSEO("Exhibitions | Museia", "Discover ongoing and upcoming museum exhibitions.");
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("exhibitions")
      .select("*, museums(id,name,city)")
      .gte("end_date", today)
      .order("start_date")
      .then(({ data }) => setItems(data ?? []));
  }, []);

  return (
    <Layout>
      <div className="container-narrow py-12 sm:py-16">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-3">Exhibitions</h1>
        <p className="text-muted-foreground mb-10 max-w-2xl">Limited-time collections you don't want to miss.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((e) => (
            <Link key={e.id} to={`/museums/${e.museum_id}`}>
              <Card className="overflow-hidden hover-lift h-full">
                <img 
                  src={e.image_url || fallbackImg} 
                  alt={e.title} 
                  className="w-full h-48 object-cover"
                  onError={(ev) => {
                    (ev.target as HTMLImageElement).src = fallbackImg;
                  }}
                />
                <div className="p-5">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" /> {e.museums?.name}
                  </p>
                  <h3 className="font-display text-lg font-semibold mb-2">{e.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{e.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.start_date).toLocaleDateString()} – {new Date(e.end_date).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Exhibitions;
