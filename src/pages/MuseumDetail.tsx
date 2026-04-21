import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Star, Clock } from "lucide-react";
import { setSEO } from "@/lib/seo";
import { ReviewSection } from "@/components/ReviewSection";

const MuseumDetail = () => {
  const { id } = useParams();
  const [museum, setMuseum] = useState<any>(null);
  const [shows, setShows] = useState<any[]>([]);
  const [exhibitions, setExhibitions] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: m } = await supabase.from("museums").select("*").eq("id", id).maybeSingle();
      setMuseum(m);
      if (m) setSEO(`${m.name} | Museia`, m.description.slice(0, 160));
      const today = new Date().toISOString().slice(0, 10);
      const { data: s } = await supabase
        .from("shows")
        .select("*")
        .eq("museum_id", id)
        .gte("show_date", today)
        .order("show_date");
      setShows(s ?? []);
      const { data: e } = await supabase
        .from("exhibitions")
        .select("*")
        .eq("museum_id", id)
        .gte("end_date", today)
        .order("start_date");
      setExhibitions(e ?? []);
    })();
  }, [id]);

  if (!museum) {
    return <Layout><div className="container-narrow py-20 text-center text-muted-foreground">Loading…</div></Layout>;
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px]">
        <img src={museum.hero_image_url || museum.image_url} alt={museum.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="container-narrow relative h-full flex flex-col justify-end pb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4" /> {museum.city}
            {museum.established_year && <span>· Est. {museum.established_year}</span>}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-balance">{museum.name}</h1>
        </div>
      </section>

      <div className="container-narrow py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">About</h2>
            <p className="text-muted-foreground leading-relaxed">{museum.description}</p>
            {museum.theme_tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {museum.theme_tags.map((t: string) => <Badge key={t} variant="secondary">{t}</Badge>)}
              </div>
            )}
          </section>

          {shows.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Upcoming shows</h2>
              <div className="space-y-3">
                {shows.map((s) => (
                  <Card key={s.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {s.image_url && <img src={s.image_url} alt={s.title} className="w-full sm:w-32 h-24 object-cover rounded-md" />}
                    <div className="flex-1">
                      <h3 className="font-medium">{s.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(s.show_date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.start_time?.slice(0, 5)} · {s.duration_minutes} min</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                      <span className="font-medium">₹{s.price}</span>
                      <Button asChild size="sm">
                        <Link to={`/book?museum=${museum.id}&show=${s.id}`}>Book</Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {exhibitions.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Exhibitions</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {exhibitions.map((e) => (
                  <Card key={e.id} className="overflow-hidden">
                    {e.image_url && <img src={e.image_url} alt={e.title} className="w-full h-40 object-cover" />}
                    <div className="p-4">
                      <h3 className="font-medium mb-1">{e.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{e.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(e.start_date).toLocaleDateString()} – {new Date(e.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <ReviewSection museumId={museum.id} />
        </div>

        {/* Booking sidebar */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <Card className="p-6 shadow-[var(--shadow-card)]">
            <h3 className="font-display text-xl font-semibold mb-4">Book entry tickets</h3>
            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between"><span className="text-muted-foreground">Adult</span><span className="font-medium">{museum.base_price_adult === 0 ? "Free" : `₹${museum.base_price_adult}`}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Child (3–12)</span><span className="font-medium">{museum.base_price_child === 0 ? "Free" : `₹${museum.base_price_child}`}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Senior (60+)</span><span className="font-medium">{museum.base_price_senior === 0 ? "Free" : `₹${museum.base_price_senior}`}</span></div>
            </div>
            <Button asChild className="w-full">
              <Link to={`/book?museum=${museum.id}`}>Book tickets</Link>
            </Button>
          </Card>
        </aside>
      </div>
    </Layout>
  );
};

export default MuseumDetail;
