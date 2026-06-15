--- START OF FILE college-closet-deal-main/src/components/ListingCard.tsx ---
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ListingCardData {
  id: string;
  title: string;
  price: number;
  currency: string;
  condition: string;
  image_url: string | null;
  university_name: string | null;
}

export function ListingCard({
  listing,
  index = 0,
  isFavorited,
  onToggleFavorite,
}: {
  listing: ListingCardData;
  index?: number;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3), ease: "easeOut" }}
      className="group"
    >
      <Link to="/listing/$id" params={{ id: listing.id }} className="block">
        <div className="relative overflow-hidden rounded-xl bg-card transition-all duration-300 border border-border/80 group-hover:border-primary/30 group-hover:shadow-soft">
          <div className="aspect-[4/3] sm:aspect-square overflow-hidden bg-muted relative">
            {listing.image_url ? (
              <motion.img
                src={listing.image_url}
                alt={listing.title}
                loading="lazy"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-warm opacity-40 flex items-center justify-center text-primary-foreground font-semibold text-xl">
                {listing.title.slice(0, 2).toUpperCase()}
              </div>
            )}
            {onToggleFavorite && (
              <Button
                size="icon"
                variant="secondary"
                onClick={(e) => { e.preventDefault(); onToggleFavorite(); }}
                className={cn(
                  "absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-background/80 backdrop-blur shadow-soft hover:scale-105 transition-transform border border-border/10",
                  isFavorited && "text-primary"
                )}
              >
                <Heart className={cn("h-3.5 w-3.5", isFavorited && "fill-current")} />
              </Button>
            )}
            <Badge className="absolute top-2.5 left-2.5 bg-background/90 text-foreground border border-border/20 backdrop-blur font-medium text-[10px] tracking-wide rounded-md capitalize shadow-soft">
              {listing.condition.replace("_", " ")}
            </Badge>
          </div>
          <div className="p-3.5 space-y-1">
            <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="text-sm font-bold text-foreground">
                {listing.currency} {Number(listing.price).toLocaleString()}
              </span>
              {listing.university_name && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0 font-medium">
                  <MapPin className="h-3 w-3 text-muted-foreground/80 shrink-0" /> 
                  {listing.university_name}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
