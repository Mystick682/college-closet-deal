import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UniversityPicker } from "@/components/UniversityPicker";
import { fetchCategories } from "@/lib/listings";

export const Route = createFileRoute("/_authenticated/sell")({
  head: () => ({ meta: [{ title: "Sell something — UniTrade" }] }),
  component: SellPage,
});

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

function SellPage() {
  const navigate = useNavigate();
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [condition, setCondition] = useState("good");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [universityId, setUniversityId] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  // Default university to user's
  useQuery({
    queryKey: ["profile-default-uni"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("university_id").eq("id", user.id).maybeSingle();
      if (data?.university_id && !universityId) setUniversityId(data.university_id);
      return data;
    },
  });

  function addFiles(list: FileList | null) {
    if (!list) return;
    const arr = Array.from(list).slice(0, 6 - files.length);
    setFiles((f) => [...f, ...arr]);
    setPreviews((p) => [...p, ...arr.map((f) => URL.createObjectURL(f))]);
  }
  function removeFile(i: number) {
    setFiles((f) => f.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!universityId) { toast.error("Pick a university"); return; }
    if (files.length === 0) { toast.error("Add at least one photo"); return; }
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const { data: listing, error: lErr } = await supabase
        .from("listings")
        .insert({
          seller_id: user.id,
          university_id: universityId,
          category_id: categoryId,
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          currency,
          condition: condition as any,
          location: location.trim() || null,
        })
        .select("id")
        .single();
      if (lErr || !listing) throw lErr;

      // Upload images
      const imageRows: { listing_id: string; url: string; sort_order: number }[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const ext = f.name.split(".").pop() || "jpg";
        const path = `${user.id}/${listing.id}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage.from("listing-images").upload(path, f);
        if (upErr) throw upErr;
        imageRows.push({ listing_id: listing.id, url: path, sort_order: i });
      }
      if (imageRows.length) {
        const { error: imgErr } = await supabase.from("listing_images").insert(imageRows);
        if (imgErr) throw imgErr;
      }

      toast.success("Listing published! 🚀");
      navigate({ to: "/listing/$id", params: { id: listing.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2"
        >
          List something <span className="text-gradient-hero">awesome</span>
        </motion.h1>
        <p className="text-muted-foreground mb-8">Add clear photos and a price. You can edit anytime.</p>

        <form onSubmit={submit} className="space-y-6 bg-card border rounded-2xl p-6 shadow-card">
          {/* Photos */}
          <div>
            <Label>Photos (up to 6)</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-2">
              {previews.map((src, i) => (
                <motion.div
                  key={src}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative aspect-square rounded-xl overflow-hidden border"
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeFile(i)} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/90 flex items-center justify-center">
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
              {files.length < 6 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-accent/50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Add</span>
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />
                </label>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Calculus textbook (8th edition)" className="mt-1.5 h-11" />
          </div>

          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Condition, what's included, pickup/meetup details..." className="mt-1.5 min-h-[120px]" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <div className="flex gap-2 mt-1.5">
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-24 h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["USD","EUR","GBP","CAD","NGN","ZAR","AUD","SGD","INR"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input id="price" type="number" min="0" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="h-11" />
              </div>
            </div>
            <div>
              <Label>Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={categoryId ?? ""} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Pick a category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>University *</Label>
              <div className="mt-1.5">
                <UniversityPicker value={universityId} onChange={setUniversityId} className="h-11" />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="loc">Meetup location (optional)</Label>
            <Input id="loc" maxLength={100} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Student Union, North Campus" className="mt-1.5 h-11" />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/browse" })} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={busy} className="flex-1 bg-gradient-hero">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish listing"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}