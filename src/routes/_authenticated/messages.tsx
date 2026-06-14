import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({ meta: [{ title: "Messages — UniTrade" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  const { data: convs = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("conversations")
        .select("*, listing:listings(title), buyer:profiles!conversations_buyer_id_fkey(id, display_name, avatar_url), seller:profiles!conversations_seller_id_fkey(id, display_name, avatar_url)")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((c: any) => {
        const other = c.buyer_id === user.id ? c.seller : c.buyer;
        return { ...c, other };
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-6 flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-primary" /> Messages
        </motion.h1>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />)}</div>
        ) : convs.length === 0 ? (
          <div className="text-center py-24">
            <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No conversations yet. Message a seller to start one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {convs.map((c: any, i: number) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to="/messages/$id" params={{ id: c.id }} className="block bg-card border border-border rounded-2xl p-4 shadow-card hover:shadow-glow hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-hero text-primary-foreground font-bold">{c.other?.display_name?.slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <p className="font-semibold truncate">{c.other?.display_name}</p>
                        <p className="text-xs text-muted-foreground shrink-0 ml-2">{formatDistanceToNow(new Date(c.last_message_at), { addSuffix: true })}</p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">re: {c.listing?.title}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}