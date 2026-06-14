import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UniversityPicker } from "@/components/UniversityPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const [universityId, setUniversityId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!universityId) { toast.error("Pick your university"); return; }
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const updates: any = { university_id: universityId };
    if (name.trim()) updates.display_name = name.trim();
    if (bio.trim()) updates.bio = bio.trim();
    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("You're all set!");
    navigate({ to: "/browse" });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="h-16 w-16 mx-auto rounded-2xl bg-gradient-hero shadow-glow flex items-center justify-center mb-4"
          >
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold">Welcome to UniTrade</h1>
          <p className="text-muted-foreground mt-2">Let's set up your campus profile</p>
        </div>

        <div className="space-y-4 bg-card p-6 rounded-2xl border shadow-card">
          <div>
            <Label>Your university *</Label>
            <div className="mt-1.5">
              <UniversityPicker value={universityId} onChange={setUniversityId} />
            </div>
          </div>
          <div>
            <Label htmlFor="dn">Display name</Label>
            <Input id="dn" value={name} onChange={(e) => setName(e.target.value)} placeholder="How others will see you" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="bio">Short bio (optional)</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Major, year, what you sell..." className="mt-1.5" />
          </div>
          <Button onClick={save} disabled={busy} className="w-full bg-gradient-hero h-11">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue to UniTrade"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}