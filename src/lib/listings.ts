import { supabase } from "@/integrations/supabase/client";
import { getSignedUrls } from "@/lib/storage";
import type { ListingCardData } from "@/components/ListingCard";

export interface ListingsFilter {
  universityId?: string | null;
  categoryId?: string | null;
  search?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function fetchListings(filter: ListingsFilter = {}): Promise<ListingCardData[]> {
  let q = supabase
    .from("listings")
    .select("id, title, price, currency, condition, university:universities(short_name, name), images:listing_images(url, sort_order)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(60);

  if (filter.universityId) q = q.eq("university_id", filter.universityId);
  if (filter.categoryId) q = q.eq("category_id", filter.categoryId);
  if (filter.sellerId) q = q.eq("seller_id", filter.sellerId);
  if (filter.search) q = q.ilike("title", `%${filter.search}%`);
  if (filter.minPrice != null) q = q.gte("price", filter.minPrice);
  if (filter.maxPrice != null) q = q.lte("price", filter.maxPrice);

  const { data, error } = await q;
  if (error) throw error;

  const rows = (data ?? []) as any[];
  // Collect first image path per listing
  const paths = rows.map((r) => {
    const imgs = (r.images ?? []).slice().sort((a: any, b: any) => a.sort_order - b.sort_order);
    return imgs[0]?.url ?? null;
  });
  const validPaths = paths.filter((p): p is string => !!p);
  const signed = await getSignedUrls("listing-images", validPaths);
  const sigMap = new Map(validPaths.map((p, i) => [p, signed[i]]));

  return rows.map((r, i) => ({
    id: r.id,
    title: r.title,
    price: r.price,
    currency: r.currency,
    condition: r.condition,
    image_url: paths[i] ? sigMap.get(paths[i] as string) ?? null : null,
    university_name: r.university?.short_name ?? r.university?.name ?? null,
  }));
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, icon, sort_order")
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}