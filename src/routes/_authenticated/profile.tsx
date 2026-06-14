import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Loader2, Pencil, Star, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ListingCard } from "@/components/ListingCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UniversityPicker } from "@/components/UniversityPicker";
import { fetchListings } from "@/lib/listings";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Your profile — UniTrade" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [uniId, setUniId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-me"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*, university:universities(name, short_name, country)").eq("id", user.id).maybeSingle();
      return data;
    },
  });

  const { data: myListings = [] } = useQuery({
    queryKey: ["my-listings", profile?.id],
    enabled: !!profile,
    queryFn: async () => profile ? fetchListings({ sellerId: profile.id }) : [],
  });

  const { data: reviewStats } = useQuery({
    queryKey: ["review-stats", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("rating").eq("seller_id", profile!.id);
      const list = data ?? [];
      const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
      return { avg, count: list.length };
    },
  });

  useEffect(() => {
    if (profile) {
      setName(profile.display_name || "");
      setBio(profile.bio || "");
      setPhone(profile.phone || "");
      setUniId(profile.university_id);
    }
  }, [profile]);

  async function save() {
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      display_name: name.trim(), bio: bio.trim() || null, phone: phone.trim() || null, university_id: uniId,
    }).eq("id", profile!.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved");
    setEditing(false);
    qc.invalidateQueries({ queryKey: ["profile-me"] });
  }

  if (isLoading || !profile) {
    return <div className="min-h-screen bg-background"><Navbar /><div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-3xl shadow-card overflow-hidden">
          <div className="h-32 bg-gradient-hero relative" />
          <div className="px-6 pb-6 -mt-12">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-glow">
                <AvatarFallback className="text-2xl bg-secondary text-secondary-foreground font-bold">
                  {profile.display_name?.slice(0,2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button onClick={() => setEditing((v) => !v)} variant={editing ? "secondary" : "outline"} className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> {editing ? "Cancel" : "Edit profile"}
              </Button>
            </div>

            {editing ? (
              <div className="space-y-4 mt-4">
                <div><Label>Display name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" /></div>
                <div><Label>Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1.5" /></div>
                <div><Label>Phone (optional)</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" /></div>
                <div><Label>University</Label><div className="mt-1.5"><UniversityPicker value={uniId} onChange={setUniId} /></div></div>
                <Button onClick={save} disabled={busy} className="bg-gradient-hero">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}</Button>
              </div>
            ) : (
              <div className="mt-4">
                <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                {profile.university && (
                  <p className="text-sm mt-2"><span className="font-medium">{profile.university.short_name || profile.university.name}</span> · {profile.university.country}</p>
                )}
                {profile.bio && <p className="mt-3 text-sm leading-relaxed">{profile.bio}</p>}
                <div className="flex gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-1.5"><ShoppingBag className="h-4 w-4 text-primary" /><span><b>{myListings.length}</b> listings</span></div>
                  {reviewStats && reviewStats.count > 0 && (
                    <div className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span><b>{reviewStats.avg.toFixed(1)}</b> ({reviewStats.count})</span></div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <h2 className="text-xl font-bold mt-10 mb-4">Your listings</h2>
        {myListings.length === 0 ? (
          <div className="text-center py-12 bg-card border rounded-2xl">
            <p className="text-muted-foreground mb-3">You haven't listed anything yet.</p>
            <Button onClick={() => navigate({ to: "/sell" })} className="bg-gradient-hero">Sell something</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {myListings.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}