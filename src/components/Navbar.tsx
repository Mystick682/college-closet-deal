import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Plus, ShoppingBag, User, LogOut, Menu } from "lucide-react";
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
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="h-9 w-9 rounded-xl bg-gradient-hero shadow-glow flex items-center justify-center"
          >
            <ShoppingBag className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <span className="text-xl font-bold tracking-tight">
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
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith(l.to)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                  {pathname.startsWith(l.to) && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-px h-0.5 bg-gradient-hero rounded-full"
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link to="/sell">
                <Button size="sm" className="bg-gradient-hero hover:opacity-90 shadow-soft gap-1.5">
                  <Plus className="h-4 w-4" /> Sell
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
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
                  <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
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
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/auth"><Button size="sm" className="bg-gradient-hero">Get started</Button></Link>
          </div>
        )}
      </div>
    </motion.header>
  );
}