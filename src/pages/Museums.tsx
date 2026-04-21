import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { MuseumCard } from "@/components/MuseumCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { setSEO } from "@/lib/seo";

type Museum = {
  id: string;
  name: string;
  city: string;
  description: string;
  image_url: string | null;
  base_price_adult: number;
  avg_rating?: number;
  review_count?: number;
};

const Museums = () => {
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    setSEO("Museums | Museia", "Browse famous museums worldwide and book tickets instantly.");
    (async () => {
      const { data: ms } = await supabase
        .from("museums")
        .select("id,name,city,description,image_url,base_price_adult")
        .order("name");
      const { data: rs } = await supabase.from("reviews").select("museum_id,rating");
      const ratingMap: Record<string, { sum: number; count: number }> = {};
      (rs ?? []).forEach((r: any) => {
        ratingMap[r.museum_id] ||= { sum: 0, count: 0 };
        ratingMap[r.museum_id].sum += r.rating;
        ratingMap[r.museum_id].count += 1;
      });
      setMuseums(
        (ms ?? []).map((m: any) => {
          const r = ratingMap[m.id];
          return r ? { ...m, avg_rating: r.sum / r.count, review_count: r.count } : { ...m, avg_rating: 0, review_count: 0 };
        })
      );
    })();
  }, []);

  const filtered = museums.filter(
    (m) => m.name.toLowerCase().includes(q.toLowerCase()) || m.city.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Layout>
      <div className="container-narrow py-12 sm:py-16">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-3">Museums</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Explore world-class collections. Click any museum to see prices, upcoming shows and exhibitions.
        </p>
        <div className="relative max-w-md mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or city..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => <MuseumCard key={m.id} museum={m} />)}
        </div>
        {filtered.length === 0 && <p className="text-muted-foreground text-center py-12">No museums match your search.</p>}
      </div>
    </Layout>
  );
};

export default Museums;
