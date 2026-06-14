import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Loader2, MapPin, MessageCircle, Star, Trash2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getSignedUrls } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/listing/$id")({
  component: ListingDetail,
});

function ListingDetail() {
  const { id } = useParams({ from: "/_authenticated/listing/$id" });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeImg, setActiveImg] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*, university:universities(name, short_name, country, city), category:categories(name), seller:profiles!listings_seller_profile_fk(id, display_name, avatar_url, bio), images:listing_images(url, sort_order)")
        .eq("id", id)
        .single();
      if (error) throw error;
      const imgs = (data.images ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);
      const paths = imgs.map((i: any) => i.url);
      const signed = await getSignedUrls("listing-images", paths);
      return { ...data, image_urls: signed.filter(Boolean) as string[] };
    },
  });

  const sellerId = data?.seller_id;
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", sellerId],
    enabled: !!sellerId,
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*, reviewer:profiles!reviews_reviewer_profile_fk(display_name, avatar_url)")
        .eq("seller_id", sellerId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: isFav } = useQuery({
    queryKey: ["fav", id],
    enabled: !!me,
    queryFn: async () => {
      if (!me) return false;
      const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", me.id).eq("listing_id", id).maybeSingle();
      return !!data;
    },
  });

  useEffect(() => {
    if (data) {
      supabase.from("listings").update({ views_count: (data.views_count ?? 0) + 1 }).eq("id", id).then(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function toggleFav() {
    if (!me) return;
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", me.id).eq("listing_id", id);
    } else {
      await supabase.from("favorites").insert({ user_id: me.id, listing_id: id });
    }
    qc.invalidateQueries({ queryKey: ["fav", id] });
    qc.invalidateQueries({ queryKey: ["favorites-ids"] });
  }

  async function startConversation() {
    if (!me || !data) return;
    if (me.id === data.seller_id) { toast.info("That's your listing!"); return; }
    // Find or create
    const { data: existing } = await supabase.from("conversations").select("id").eq("listing_id", id).eq("buyer_id", me.id).maybeSingle();
    let convId = existing?.id;
    if (!convId) {
      const { data: created, error } = await supabase.from("conversations").insert({
        listing_id: id, buyer_id: me.id, seller_id: data.seller_id,
      }).select("id").single();
      if (error) { toast.error(error.message); return; }
      convId = created.id;
    }
    navigate({ to: "/messages/$id", params: { id: convId! } });
  }

  async function deleteListing() {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Listing deleted");
    navigate({ to: "/browse" });
  }

  async function submitReview() {
    if (!me || !data) return;
    const { error } = await supabase.from("reviews").insert({
      seller_id: data.seller_id,
      reviewer_id: me.id,
      listing_id: id,
      rating, comment: comment.trim() || null,
    });
    if (error) { toast.error(error.message); return; }
    setReviewOpen(false); setComment(""); setRating(5);
    toast.success("Review posted!");
    qc.invalidateQueries({ queryKey: ["reviews", data.seller_id] });
  }

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
  const isOwner = me && data && me.id === data.seller_id;

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => navigate({ to: "/browse" })} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to browse
        </button>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted relative shadow-card">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={data.image_urls[activeImg]}
                  alt={data.title}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </div>
            {data.image_urls.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {data.image_urls.map((u, i) => (
                  <button key={u} onClick={() => setActiveImg(i)}
                    className={cn("h-20 w-20 rounded-xl overflow-hidden shrink-0 transition-all", activeImg === i ? "ring-2 ring-primary scale-105" : "opacity-70 hover:opacity-100")}>
                    <img src={u} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
                <Button variant="ghost" size="icon" onClick={toggleFav} className={cn("rounded-full shrink-0", isFav && "text-primary")}>
                  <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
                </Button>
              </div>
              <p className="text-4xl font-bold text-gradient-hero mt-2">
                {data.currency} {Number(data.price).toLocaleString()}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className="capitalize">{data.condition.replace("_", " ")}</Badge>
                {data.category && <Badge variant="outline">{data.category.name}</Badge>}
                <Badge variant="outline" className="gap-1"><GraduationCap className="h-3 w-3" />{data.university?.short_name || data.university?.name}</Badge>
              </div>
            </div>

            {data.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="h-4 w-4" />{data.location}</p>
            )}

            <div className="bg-card border rounded-2xl p-4">
              <p className="text-sm font-semibold mb-2">Description</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{data.description || "No description provided."}</p>
            </div>

            {/* Seller card */}
            <div className="bg-card border rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-hero text-primary-foreground font-bold">
                    {data.seller?.display_name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{data.seller?.display_name}</p>
                  {avgRating !== null ? (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {avgRating.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">No reviews yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {isOwner ? (
                <Button variant="destructive" onClick={deleteListing} className="flex-1 gap-2">
                  <Trash2 className="h-4 w-4" /> Delete listing
                </Button>
              ) : (
                <>
                  <Button onClick={startConversation} className="flex-1 bg-gradient-hero h-12 gap-2 shadow-glow">
                    <MessageCircle className="h-4 w-4" /> Message seller
                  </Button>
                  <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-12 gap-2"><Star className="h-4 w-4" /> Review</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Review {data.seller?.display_name}</DialogTitle></DialogHeader>
                      <div className="flex gap-1 justify-center py-2">
                        {[1,2,3,4,5].map(n => (
                          <button key={n} onClick={() => setRating(n)} className="p-1">
                            <Star className={cn("h-8 w-8 transition-colors", n <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                          </button>
                        ))}
                      </div>
                      <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was your experience?" />
                      <Button onClick={submitReview} className="bg-gradient-hero">Post review</Button>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Reviews list */}
        {reviews.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12">
            <h2 className="text-xl font-bold mb-4">Reviews of {data.seller?.display_name}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {reviews.map((r: any) => (
                <div key={r.id} className="bg-card border rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">{r.reviewer?.display_name?.slice(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{r.reviewer?.display_name}</p>
                      <div className="flex">
                        {[1,2,3,4,5].map(n => <Star key={n} className={cn("h-3 w-3", n <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted")} />)}
                      </div>
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}