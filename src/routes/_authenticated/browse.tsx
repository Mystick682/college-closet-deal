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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Filters bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl shadow-card p-4 mb-6"
        >
          <div className="grid md:grid-cols-[1fr_280px] gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search textbooks, laptops, tickets..."
                className="pl-9 h-11"
              />
            </div>
            <UniversityPicker value={universityId} onChange={setUniversityId} placeholder="All universities" className="h-11" />
          </div>

          {/* Category chips */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 -mx-1 px-1">
            <Button
              size="sm"
              variant={categoryId === null ? "default" : "outline"}
              onClick={() => setCategoryId(null)}
              className={categoryId === null ? "bg-gradient-hero shrink-0" : "shrink-0"}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> All
            </Button>
            {categories.map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant={categoryId === c.id ? "default" : "outline"}
                onClick={() => setCategoryId(c.id)}
                className={categoryId === c.id ? "bg-gradient-hero shrink-0" : "shrink-0"}
              >
                {c.name}
              </Button>
            ))}
          </div>

          {(universityId || categoryId) && (
            <div className="flex items-center gap-2 mt-3 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Filtering:</span>
              {activeUni && <Badge variant="secondary" className="gap-1"><Globe2 className="h-3 w-3" />{activeUni.short_name || activeUni.name}</Badge>}
              {categoryId && <Badge variant="secondary">{categories.find(c => c.id === categoryId)?.name}</Badge>}
              <button onClick={() => { setUniversityId(null); setCategoryId(null); }} className="text-primary hover:underline ml-1">Clear</button>
            </div>
          )}
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="h-20 w-20 mx-auto rounded-3xl bg-gradient-warm flex items-center justify-center mb-4 opacity-60">
              <Search className="h-9 w-9 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No listings found</h3>
            <p className="text-muted-foreground">Try a different category or be the first to sell something!</p>
            <Button onClick={() => navigate({ to: "/sell" })} className="mt-4 bg-gradient-hero">
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