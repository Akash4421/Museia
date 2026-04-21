import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type Review = {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export const ReviewSection = ({ museumId }: { museumId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("museum_id", museumId)
      .order("created_at", { ascending: false });
    setReviews(data ?? []);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    load();
  }, [museumId]);

  const submit = async () => {
    if (!user) return toast.error("Please sign in to review");
    if (!rating) return toast.error("Please select a rating");
    const { error } = await supabase
      .from("reviews")
      .upsert({ user_id: user.id, museum_id: museumId, rating, comment }, { onConflict: "user_id,museum_id" });
    if (error) toast.error(error.message);
    else {
      toast.success("Review posted");
      setComment("");
      setRating(0);
      load();
    }
  };

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-semibold">Reviews</h2>
        {reviews.length > 0 && (
          <span className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-medium">{avg.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviews.length})</span>
          </span>
        )}
      </div>

      {user ? (
        <Card className="p-4 mb-6">
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <Star className={`w-6 h-6 ${n <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            className="mb-3"
          />
          <Button onClick={submit} size="sm">Post review</Button>
        </Card>
      ) : (
        <Card className="p-4 mb-6 text-sm text-muted-foreground">
          <Link to="/auth" className="text-accent underline">Sign in</Link> to leave a review.
        </Card>
      )}

      <div className="space-y-3">
        {reviews.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`w-3 h-3 ${n <= r.rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
              ))}
              <span className="text-xs text-muted-foreground ml-2">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            {r.comment && <p className="text-sm">{r.comment}</p>}
          </Card>
        ))}
        {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>}
      </div>
    </section>
  );
};
