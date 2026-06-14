import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, GraduationCap, Loader2, Mail, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { useUniversities, UniversityPicker } from "@/components/UniversityPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — UniTrade" },
      { name: "description", content: "Sign in or create a UniTrade account with your university email." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [universityId, setUniversityId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { data: unis = [] } = useUniversities();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/browse", replace: true });
  }, [user, loading, navigate]);

  function validateEdu(email: string): string | null {
    const e = email.trim().toLowerCase();
    const okEdu = /\.edu(\.[a-z]{2,3})?$/.test(e);
    const okAc = /\.ac\.[a-z]{2,3}$/.test(e);
    if (!okEdu && !okAc) return "Use a university email (.edu, .edu.xx, or .ac.xx)";
    return null;
  }

  function matchUniversityByDomain(email: string): string | null {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) return null;
    const match = unis.find((u) => u.email_domains.some((d) => domain.endsWith(d.toLowerCase())));
    return match?.id ?? null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const eduErr = validateEdu(email);
        if (eduErr) { toast.error(eduErr); return; }
        if (!universityId) { toast.error("Please select your university"); return; }
        const selectedUni = unis.find((u) => u.id === universityId);
        const domain = email.split("@")[1]?.toLowerCase() ?? "";
        const domainMatches = selectedUni?.email_domains.some((d) => domain.endsWith(d.toLowerCase()));
        if (!domainMatches) {
          toast.error(`Your email must match a domain for ${selectedUni?.short_name || selectedUni?.name}`);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/browse`,
            data: { display_name: displayName },
          },
        });
        if (error) throw error;
        if (data.user) {
          // Set university on profile (created by trigger)
          await supabase.from("profiles").update({
            university_id: universityId,
            display_name: displayName,
          }).eq("id", data.user.id);
        }
        toast.success("Welcome to UniTrade! 🎉");
        navigate({ to: "/browse" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: "/browse" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Google sign-in failed");
      setBusy(false);
    }
    if (!result.redirected && !result.error) navigate({ to: "/browse" });
  }

  // Auto-suggest university from email in signup
  useEffect(() => {
    if (mode === "signup" && email.includes("@") && !universityId) {
      const match = matchUniversityByDomain(email);
      if (match) setUniversityId(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, mode, unis.length]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left brand panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden lg:flex flex-col justify-between bg-gradient-hero text-primary-foreground p-12 lg:w-1/2 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold">UniTrade</span>
        </Link>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 max-w-md"
        >
          <GraduationCap className="h-12 w-12 mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-4 leading-tight">Your campus marketplace, verified.</h2>
          <p className="text-lg opacity-90">Only verified university students can join. Buy and sell with confidence.</p>
        </motion.div>
        <p className="relative z-10 text-sm opacity-80">© {new Date().getFullYear()} UniTrade</p>
      </motion.div>

      {/* Right form */}
      <div className="flex-1 flex flex-col p-6 sm:p-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <h1 className="text-3xl font-bold mb-2">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
            <p className="text-muted-foreground mb-8">
              {mode === "signin" ? "Sign in to continue trading on campus." : "Use your university email to get verified instantly."}
            </p>

            <Button onClick={handleGoogle} disabled={busy} variant="outline" className="w-full h-11 mb-4 gap-2">
              <svg className="h-4 w-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.3 29.3 4.5 24 4.5A19.5 19.5 0 1 0 43.5 24c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.3 29.3 4.5 24 4.5 16.3 4.5 9.7 8.6 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.2-7.2 2.2-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.7 39.4 16.3 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C42 35.5 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
              Continue with Google
            </Button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">or email</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {mode === "signup" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full name</Label>
                        <Input id="name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Alex Student" className="mt-1.5 h-11" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <Label htmlFor="email">University email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" className="pl-9 h-11" />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="mt-1.5 h-11" />
              </div>

              <AnimatePresence>
                {mode === "signup" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div>
                      <Label>Your university</Label>
                      <div className="mt-1.5">
                        <UniversityPicker value={universityId} onChange={setUniversityId} placeholder="Pick your university" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" disabled={busy} className="w-full h-11 bg-gradient-hero hover:opacity-90">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {mode === "signin" ? "New to UniTrade? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="font-semibold text-primary hover:underline"
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}