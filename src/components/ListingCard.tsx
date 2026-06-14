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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4), ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link to="/listing/$id" params={{ id: listing.id }} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-card shadow-card hover:shadow-glow transition-all duration-300 border border-border">
          <div className="aspect-square overflow-hidden bg-muted relative">
            {listing.image_url ? (
              <motion.img
                src={listing.image_url}
                alt={listing.title}
                loading="lazy"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.4 }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-warm opacity-40 flex items-center justify-center text-primary-foreground font-bold text-2xl">
                {listing.title.slice(0, 2).toUpperCase()}
              </div>
            )}
            {onToggleFavorite && (
              <Button
                size="icon"
                variant="secondary"
                onClick={(e) => { e.preventDefault(); onToggleFavorite(); }}
                className={cn(
                  "absolute top-2 right-2 h-9 w-9 rounded-full bg-background/90 backdrop-blur shadow-soft hover:scale-110 transition-transform",
                  isFavorited && "text-primary"
                )}
              >
                <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
              </Button>
            )}
            <Badge className="absolute top-2 left-2 bg-secondary/90 text-secondary-foreground backdrop-blur capitalize">
              {listing.condition.replace("_", " ")}
            </Badge>
          </div>
          <div className="p-3">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
            </div>
            <p className="text-lg font-bold text-gradient-hero mt-0.5">
              {listing.currency} {Number(listing.price).toLocaleString()}
            </p>
            {listing.university_name && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 line-clamp-1">
                <MapPin className="h-3 w-3 shrink-0" /> {listing.university_name}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}