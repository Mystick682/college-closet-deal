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
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
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
  { icon: BookOpen, label: "Textbooks", color: "from-orange-400 to-red-500" },
  { icon: Laptop, label: "Electronics", color: "from-amber-400 to-orange-500" },
  { icon: Sofa, label: "Furniture", color: "from-yellow-400 to-amber-500" },
  { icon: Ticket, label: "Tickets", color: "from-rose-400 to-pink-500" },
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

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-24 lg:pt-20 lg:pb-32">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-0" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-primary-glow/30 rounded-full blur-[120px] -z-0" />

        <div className="grid lg:grid-cols-2 gap-12 items-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-accent border border-primary/20 rounded-full px-4 py-1.5 mb-6"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-accent-foreground">Built for students. By students.</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              Your campus.{" "}
              <span className="text-gradient-hero">Your marketplace.</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              UniTrade is the buy & sell platform exclusively for verified university students. Trade textbooks, gadgets, dorm gear, and event tickets — within your campus or across campuses worldwide.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-hero hover:opacity-90 shadow-glow gap-2 h-12 px-6">
                  Join with university email <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="h-12 px-6 border-2">
                  Browse listings
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Verified students only</div>
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Instant messaging</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-3xl overflow-hidden shadow-glow"
            >
              <img src={heroImg} alt="Students trading" width={1536} height={1024} className="w-full h-auto" />
            </motion.div>

            {/* Floating cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -left-4 top-1/4 bg-card rounded-2xl shadow-card p-3 flex items-center gap-3 border border-border"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sold this week</p>
                <p className="font-bold text-sm">2,431 items</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -right-4 bottom-1/4 bg-card rounded-2xl shadow-card p-3 flex items-center gap-3 border border-border"
            >
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active campuses</p>
                <p className="font-bold text-sm">120+</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold mb-8"
        >
          Shop every <span className="text-gradient-hero">student essential</span>
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-glow transition-shadow cursor-pointer group"
            >
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform`}>
                <c.icon className="h-7 w-7 text-white" />
              </div>
              <p className="font-semibold">{c.label}</p>
              <p className="text-xs text-muted-foreground mt-1">Trending on campus</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary text-secondary-foreground py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold mb-12 max-w-2xl"
          >
            From dorm room to dorm room in three steps.
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: GraduationCap, title: "Verify your campus", desc: "Sign up with your .edu or .ac.* email. Your university is added to your profile automatically." },
              { icon: ShoppingBag, title: "List or browse", desc: "Snap photos, set a price, and post in minutes. Or filter by category and the campus you want to buy from." },
              { icon: MessageCircle, title: "Chat & meet up", desc: "Message the seller in-app, agree on a price and place, and exchange face to face." },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="text-7xl font-bold text-primary/20 mb-2">0{i + 1}</div>
                <s.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-secondary-foreground/70 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-gradient-hero p-12 md:p-16 text-center text-primary-foreground overflow-hidden shadow-glow"
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_50%)]" />
          <Heart className="h-10 w-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to trade with your campus?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">Join thousands of students saving money and making the most of their dorm life.</p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-semibold">
              Get started — it's free
            </Button>
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} UniTrade · Made for students
      </footer>
    </div>
  );
}