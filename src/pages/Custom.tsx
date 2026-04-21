import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { MuseumCard } from "@/components/MuseumCard";
import { toast } from "sonner";
import { setSEO } from "@/lib/seo";
import { useEffect } from "react";

const examples = [
  "I love Maratha history and traditional Indian sculpture.",
  "Looking for ancient Egyptian or Mesopotamian artefacts.",
  "Modern and contemporary art, especially Picasso and Pollock.",
];

const Custom = () => {
  const [interest, setInterest] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ explanation: string; museums: any[] } | null>(null);

  useEffect(() => {
    setSEO("Custom suggestions | Museia", "Tell us your interests and get personalised museum recommendations.");
  }, []);

  const submit = async () => {
    if (!interest.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("custom-recommend", {
        body: { interest },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
      } else {
        setResult(data);
      }
    } catch (e: any) {
      toast.error("Couldn't get suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-narrow py-12 sm:py-16 max-w-4xl">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-accent font-medium mb-4">
          <Sparkles className="w-3 h-3" /> AI-powered
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-3">Custom suggestions</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Describe what you love — periods, regions, artists, themes — and our assistant will curate the perfect museums for you.
        </p>

        <Card className="p-6 mb-8">
          <Textarea
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            placeholder="e.g. I love Maratha history and traditional Indian sculpture..."
            rows={4}
            maxLength={500}
            className="mb-4"
          />
          <div className="flex flex-wrap gap-2 mb-4">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setInterest(ex)}
                className="text-xs px-3 py-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
          <Button onClick={submit} disabled={loading || !interest.trim()}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Curating...</> : <><Sparkles className="w-4 h-4 mr-2" />Get suggestions</>}
          </Button>
        </Card>

        {result && (
          <div className="animate-fade-in">
            <Card className="p-5 mb-6 bg-secondary border-none">
              <p className="text-sm leading-relaxed">{result.explanation}</p>
            </Card>
            <h2 className="font-display text-2xl font-semibold mb-4">Recommended for you</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.museums.map((m) => <MuseumCard key={m.id} museum={m} />)}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Custom;
