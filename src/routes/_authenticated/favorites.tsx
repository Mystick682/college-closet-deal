import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ListingCard } from "@/components/ListingCard";
import { getSignedUrls } from "@/lib/storage";

export const Route = createFileRoute("/_authenticated/favorites")({
  head: () => ({ meta: [{ title: "Saved items — UniTrade" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const qc = useQueryClient();
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["favorites-list"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("listing:listings(id, title, price, currency, condition, university:universities(short_name, name), images:listing_images(url, sort_order))")
        .eq("user_id", user.id);
      if (error) throw error;
      const items = (data ?? []).map((r: any) => r.listing).filter(Boolean);
      const paths = items.map((it: any) => {
        const imgs = (it.images ?? []).slice().sort((a: any, b: any) => a.sort_order - b.sort_order);
        return imgs[0]?.url ?? null;
      });
      const valid = paths.filter((p: string | null): p is string => !!p);
      const signed = await getSignedUrls("listing-images", valid);
      const map = new Map(valid.map((p, i) => [p, signed[i]]));
      return items.map((it: any, i: number) => ({
        id: it.id, title: it.title, price: it.price, currency: it.currency, condition: it.condition,
        image_url: paths[i] ? map.get(paths[i] as string) ?? null : null,
        university_name: it.university?.short_name ?? it.university?.name ?? null,
      }));
    },
  });

  async function unfav(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", id);
    qc.invalidateQueries({ queryKey: ["favorites-list"] });
    qc.invalidateQueries({ queryKey: ["favorites-ids"] });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary fill-primary" /> Saved items
        </motion.h1>
        <p className="text-muted-foreground mb-8">Listings you've bookmarked for later.</p>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Nothing saved yet. Tap the heart on listings you like.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {listings.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} isFavorited onToggleFavorite={() => unfav(l.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}