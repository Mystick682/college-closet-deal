--- START OF FILE college-closet-deal-main/src/components/Navbar.tsx ---
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Plus, ShoppingBag, User, LogOut, Menu, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const preferDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (preferDark ? "dark" : "light");
    
    setTheme(initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </Button>
  );
}

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const qc = useQueryClient();

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="h-8 w-8 rounded-lg bg-gradient-hero shadow-glow flex items-center justify-center"
          >
            <ShoppingBag className="h-4.5 w-4.5 text-primary-foreground" />
          </motion.div>
          <span className="text-lg font-bold tracking-tight">
            Uni<span className="text-gradient-hero">Trade</span>
          </span>
        </Link>

        {user ? (
          <>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { to: "/browse", label: "Browse" },
                { to: "/favorites", label: "Saved" },
                { to: "/messages", label: "Messages" },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.startsWith(l.to)
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                  {pathname.startsWith(l.to) && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-px h-[2px] bg-gradient-hero rounded-full"
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/sell">
                <Button size="sm" className="bg-gradient-hero hover:opacity-95 shadow-soft gap-1.5 font-medium text-xs">
                  <Plus className="h-3.5 w-3.5" /> Sell
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                    <User className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                    <User className="h-4 w-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/favorites" })}>
                    <Heart className="h-4 w-4 mr-2" /> Saved items
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/messages" })}>
                    <MessageCircle className="h-4 w-4 mr-2" /> Messages
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="h-9 w-9"><Menu className="h-5 w-5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate({ to: "/browse" })}>Browse</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/favorites" })}>Saved</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/messages" })}>Messages</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/auth"><Button variant="ghost" size="sm" className="text-sm">Sign in</Button></Link>
            <Link to="/auth"><Button size="sm" className="bg-gradient-hero text-sm shadow-soft">Get started</Button></Link>
          </div>
        )}
      </div>
    </motion.header>
  );
}
