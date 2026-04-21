import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { MuseumCard } from "@/components/MuseumCard";
import { setSEO } from "@/lib/seo";
import { ArrowRight, Sparkles, Ticket, Globe2 } from "lucide-react";
import heroImg from "@/assets/hero-museum.jpg";
import heroRightImg from "@/assets/statue-hero.png";

type Museum = {
  id: string;
  name: string;
  city: string;
  description: string;
  image_url: string | null;
  base_price_adult: number;
};

const Index = () => {
  const [museums, setMuseums] = useState<Museum[]>([]);

  useEffect(() => {
    setSEO(
      "Museia — AI-powered museum ticket booking",
      "Skip the queue. Book museum entries, shows and exhibitions worldwide with our multilingual AI assistant."
    );
    supabase
      .from("museums")
      .select("id,name,city,description,image_url,base_price_adult")
      .limit(3)
      .then(({ data }) => setMuseums(data ?? []));
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="Modern museum interior" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>
        <div className="container-narrow py-24 sm:py-32 lg:py-40 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-accent font-medium mb-6">
              <Sparkles className="w-3 h-3" /> AI-powered ticketing
            </span>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] text-balance mb-6">
              Skip the queue.<br />
              <span className="italic text-accent">Step into culture.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8 text-balance">
              Book museum entries, shows and exhibitions worldwide in seconds — guided by a multilingual AI assistant that knows your taste.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/museums">Explore museums <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-background/50 backdrop-blur-sm">
                <Link to="/custom">Get personalised picks</Link>
              </Button>
            </div>
          </div>
          
          {/* Right Hero Image */}
          <div className="hidden lg:block relative" style={{ animationDelay: '0.2s' }}>
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-[var(--shadow-elevated)] animate-float">
              <img src={heroRightImg} alt="Classical marble statue in museum" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -inset-10 bg-accent/20 blur-3xl rounded-full -z-10 mix-blend-multiply dark:mix-blend-screen opacity-50"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-narrow py-16 grid sm:grid-cols-3 gap-8 border-t border-border">
        {[
          { icon: Ticket, title: "Instant tickets", desc: "QR-code tickets delivered the moment you pay." },
          { icon: Globe2, title: "Multilingual chat", desc: "Ask in any language — get answers tailored to you." },
          { icon: Sparkles, title: "Smart suggestions", desc: "Tell us your interests, we'll find your museum." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title}>
            <Icon className="w-6 h-6 text-accent mb-3" />
            <h3 className="font-display text-lg font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>

      {/* Featured museums */}
      <section className="container-narrow py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-2">Featured museums</h2>
            <p className="text-muted-foreground">Hand-picked from around the world.</p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/museums">View all <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {museums.map((m) => (
            <MuseumCard key={m.id} museum={m} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-narrow py-16">
        <div className="bg-primary text-primary-foreground rounded-2xl p-10 sm:p-16 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4 text-balance">
            Not sure where to start?
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
            Describe your interests in a sentence — our assistant will craft the perfect museum itinerary.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/custom">Try Custom suggestions</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
