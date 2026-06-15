--- START OF FILE college-closet-deal-main/src/routes/_authenticated/browse.tsx ---
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Sparkles, Globe2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ListingCard } from "@/components/ListingCard";
import { UniversityPicker, useUniversities } from "@/components/UniversityPicker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchListings, fetchCategories } from "@/lib/listings";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/browse")({
  head: () => ({ meta: [{ title: "Browse — UniTrade" }] }),
  component: BrowsePage,
});

function BrowsePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [universityId, setUniversityId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const { data: unis = [] } = useUniversities();

  // Profile to default to user's university
  const { data: profile } = useQuery({
    queryKey: ["profile-me"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (profile && !profile.university_id) {
      toast.info("Set your university to personalize your feed");
      navigate({ to: "/onboarding" });
    }
  }, [profile, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["listings", universityId, categoryId, debounced],
    queryFn: () => fetchListings({ universityId, categoryId, search: debounced }),
  });

  const { data: favoriteIds = new Set<string>() } = useQuery({
    queryKey: ["favorites-ids"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return new Set<string>();
      const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", user.id);
      return new Set((data ?? []).map((r) => r.listing_id));
    },
  });

  async function toggleFav(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const has = favoriteIds.has(id);
    if (has) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", id);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, listing_id: id });
    }
    qc.invalidateQueries({ queryKey: ["favorites-ids"] });
    qc.invalidateQueries({ queryKey: ["favorites-list"] });
  }

  const activeUni = unis.find((u) => u.id === universityId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Sleek Search & Filters layout */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/80 rounded-xl shadow-soft p-4.5 mb-8 space-y-4"
        >
          <div className="grid md:grid-cols-[1fr_300px] gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search textbooks, devices, dorm essentials..."
                className="pl-10 h-11 border-border/80 focus-visible:ring-1 bg-background/50 placeholder:text-muted-foreground/60"
              />
            </div>
            <UniversityPicker value={universityId} onChange={setUniversityId} placeholder="Global (All Universities)" className="h-11 border-border/80" />
          </div>

          {/* Editorial category scroller */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-none">
            <Button
              size="sm"
              variant={categoryId === null ? "default" : "outline"}
              onClick={() => setCategoryId(null)}
              className={categoryId === null ? "bg-gradient-hero text-primary-foreground border-transparent h-8 rounded-md px-3.5 text-xs font-semibold" : "h-8 border-border text-xs rounded-md px-3.5 font-medium"}
            >
              <Sparkles className="h-3 w-3 mr-1.5" /> All items
            </Button>
            {categories.map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant={categoryId === c.id ? "default" : "outline"}
                onClick={() => setCategoryId(c.id)}
                className={categoryId === c.id ? "bg-gradient-hero text-primary-foreground border-transparent h-8 rounded-md px-3.5 text-xs font-semibold" : "h-8 border-border text-xs rounded-md px-3.5 font-medium"}
              >
                {c.name}
              </Button>
            ))}
          </div>

          {(universityId || categoryId) && (
            <div className="flex items-center gap-2 pt-1 border-t border-border/40 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Active Filter:</span>
              {activeUni && <Badge variant="secondary" className="gap-1 rounded-md text-[11px] py-0.5"><Globe2 className="h-3 w-3" />{activeUni.short_name || activeUni.name}</Badge>}
              {categoryId && <Badge variant="secondary" className="rounded-md text-[11px] py-0.5">{categories.find(c => c.id === categoryId)?.name}</Badge>}
              <button onClick={() => { setUniversityId(null); setCategoryId(null); }} className="text-primary hover:underline ml-1 font-medium">Reset filters</button>
            </div>
          )}
        </motion.div>

        {/* Listings Display */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-card border border-border/80 rounded-xl max-w-xl mx-auto shadow-soft"
          >
            <div className="h-14 w-14 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-1">No items found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">Try clearing search phrases or listing restrictions. Be the first to create one!</p>
            <Button onClick={() => navigate({ to: "/sell" })} className="mt-5 bg-gradient-hero text-xs font-semibold shadow-soft h-9 px-5">
              Create a listing
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {listings.map((l, i) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  index={i}
                  isFavorited={favoriteIds.has(l.id)}
                  onToggleFavorite={() => toggleFav(l.id)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
