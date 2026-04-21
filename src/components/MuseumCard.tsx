import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import fallbackImg from "@/assets/museum-placeholder.png";

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

export const MuseumCard = ({ museum }: { museum: Museum }) => (
  <Link to={`/museums/${museum.id}`} className="group block hover-lift rounded-lg overflow-hidden bg-card shadow-[var(--shadow-card)]">
    <div className="aspect-[4/3] overflow-hidden bg-secondary">
      <img
        src={museum.image_url || fallbackImg}
        alt={museum.name}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = fallbackImg;
        }}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
    <div className="p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {museum.city}
        </span>
        {museum.avg_rating !== undefined && museum.review_count! > 0 && (
          <span className="text-xs flex items-center gap-1">
            <Star className="w-3 h-3 fill-accent text-accent" />
            {museum.avg_rating.toFixed(1)} ({museum.review_count})
          </span>
        )}
      </div>
      <h3 className="font-display text-xl font-semibold mb-1 group-hover:text-accent transition-colors">
        {museum.name}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{museum.description}</p>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">From</span>
        <span className="font-medium">
          {museum.base_price_adult === 0 ? "Free" : `₹${museum.base_price_adult}`}
        </span>
      </div>
    </div>
  </Link>
);
