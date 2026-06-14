import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/messages/$id")({
  component: ConversationPage,
});

function ConversationPage() {
  const { id } = useParams({ from: "/_authenticated/messages/$id" });
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: async () => (await supabase.auth.getUser()).data.user });

  const { data: conv } = useQuery({
    queryKey: ["conv", id],
    queryFn: async () => {
      const { data } = await supabase.from("conversations")
        .select("*, listing:listings(id, title, price, currency), buyer:profiles!conversations_buyer_id_fkey(id, display_name), seller:profiles!conversations_seller_id_fkey(id, display_name)")
        .eq("id", id).single();
      return data;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", id],
    queryFn: async () => {
      const { data } = await supabase.from("messages").select("*").eq("conversation_id", id).order("created_at");
      return data ?? [];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` }, () => {
        qc.invalidateQueries({ queryKey: ["messages", id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, qc]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !me) return;
    const body = text.trim();
    setText("");
    await supabase.from("messages").insert({ conversation_id: id, sender_id: me.id, body });
    qc.invalidateQueries({ queryKey: ["messages", id] });
    qc.invalidateQueries({ queryKey: ["conversations"] });
  }

  const other = me && conv ? (conv.buyer_id === me.id ? conv.seller : conv.buyer) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col min-h-0">
        <Link to="/messages" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-4 w-4" /> All messages
        </Link>

        {/* Conversation header card */}
        {conv && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-2xl p-4 mb-3 flex items-center gap-3">
            <Avatar><AvatarFallback className="bg-gradient-hero text-primary-foreground">{other?.display_name?.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{other?.display_name}</p>
              {conv.listing && (
                <Link to="/listing/$id" params={{ id: conv.listing.id }} className="text-xs text-primary hover:underline truncate block">
                  {conv.listing.title} · {conv.listing.currency} {Number(conv.listing.price).toLocaleString()}
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          <AnimatePresence initial={false}>
            {messages.map((m: any) => {
              const mine = m.sender_id === me?.id;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn("flex", mine ? "justify-end" : "justify-start")}
                >
                  <div className={cn(
                    "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-soft",
                    mine ? "bg-gradient-hero text-primary-foreground rounded-br-md" : "bg-card border rounded-bl-md"
                  )}>
                    {m.body}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <form onSubmit={send} className="flex gap-2 pt-3 border-t border-border">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." className="h-11" />
          <Button type="submit" disabled={!text.trim()} className="bg-gradient-hero h-11 gap-1.5"><Send className="h-4 w-4" /> Send</Button>
        </form>
      </div>
    </div>
  );
}