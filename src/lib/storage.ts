import { supabase } from "@/integrations/supabase/client";

export async function getSignedUrl(bucket: string, path: string, expiresIn = 60 * 60) {
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}

export async function getSignedUrls(bucket: string, paths: string[], expiresIn = 60 * 60) {
  if (paths.length === 0) return [];
  const { data } = await supabase.storage.from(bucket).createSignedUrls(paths, expiresIn);
  return data?.map((d) => d.signedUrl ?? null) ?? [];
}