--- START OF FILE college-closet-deal-main/src/routes/index.tsx ---
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Heart,
  Laptop,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Sofa,
  Sparkles,
  Ticket,
  Zap,
  Globe,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UniTrade — The student-only marketplace" },
      { name: "description", content: "Buy and sell with verified university students. Textbooks, electronics, furniture, tickets, and more — campus to campus." },
      { property: "og:title", content: "UniTrade — The student-only marketplace" },
      { property: "og:description", content: "Verified-student marketplace. Buy and sell across campuses worldwide." },
    ],
  }),
  component: Landing,
});

const categories = [
  { icon: BookOpen, label: "Textbooks", color: "from-blue-500/10 to-indigo-500/10 text-indigo-500" },
  { icon: Laptop, label: "Electronics", color: "from-purple-500/10 to-pink-500/10 text-purple-500" },
  { icon: Sofa, label: "Furniture", color: "from-emerald-500/10 to-teal-500/10 text-emerald-500" },
  { icon: Ticket, label: "Tickets", color: "from-rose-500/10 to-red-500/10 text-rose-500" },
];

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/browse", replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24 lg:pt-28 lg:pb-32">
        <div className="absolute top-1/4 -left-32 w-[35rem] h-[35rem] bg-primary/5 rounded-full blur-[140px] -z-10" />
        <div className="absolute top-1/3 -right-32 w-[35rem] h-[35rem] bg-primary-glow/5 rounded-full blur-[140px] -z-10" />

        <div className="text-center max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 bg-muted border border-border px-4 py-1.5 rounded-full"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground tracking-wide">The Premium Student Marketplace</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            Your Campus. <br />
            <span className="text-gradient-hero">Trade Redefined.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            UniTrade is an elegant, secure marketplace built exclusively for verified university students. Exchange textbooks, gear, and student life essentials directly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-4 flex flex-wrap justify-center gap-4"
          >
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-hero hover:opacity-95 shadow-glow gap-2 h-12 px-8 text-sm font-medium">
                Verify & Join with .edu <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-medium border border-border">
                Explore Campus Deals
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-12 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto text-xs font-medium tracking-wide text-muted-foreground border-t border-border/40"
          >
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>VERIFIED .EDU ACCOUNTS ONLY</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>INSTANT MESSAGING & NEGOTIATION</span>
            </div>
            <div className="flex items-center justify-center gap-2 col-span-2 md:col-span-1">
              <Globe className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>GLOBAL & LOCAL SEARCH</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Curated Essentials</h2>
          <p className="text-sm text-muted-foreground">Everyday necessities tailored specifically for student success.</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-card border border-border/80 rounded-xl p-6 shadow-soft hover:shadow-glow hover:border-primary/20 transition-all cursor-pointer group"
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                <c.icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-base">{c.label}</p>
              <p className="text-xs text-muted-foreground mt-1">Direct exchange on campus</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/40 border-y border-border/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-xl mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Pure Peer-to-Peer</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Exchange textbooks, furniture, and tickets safely without third-party fees.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: GraduationCap, title: "1. Academic Verification", desc: "Unlock entry securely using your verified email address. No strangers, just peer students." },
              { icon: ShoppingBag, title: "2. List Instantly", desc: "Showcase items in minutes with clear fields for conditions, images, and pickup preferences." },
              { icon: MessageCircle, title: "3. Direct Negotiation", desc: "Chat securely. Set coordinates, negotiate price points, and finalize handoffs seamlessly." },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-3"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border text-primary shadow-soft">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-2xl bg-card border border-border p-12 md:p-16 text-center overflow-hidden shadow-soft"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
          <Heart className="h-8 w-8 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Upgrade Your Student Experience.</h2>
          <p className="text-base text-muted-foreground mt-3 mb-8 max-w-lg mx-auto">Instant verification gets you trading with trusted peers right away.</p>
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-hero hover:opacity-95 shadow-glow">
              Get Started Free
            </Button>
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground tracking-wide">
        &copy; {new Date().getFullYear()} UniTrade. Built cleanly for university communities.
      </footer>
    </div>
  );
}
