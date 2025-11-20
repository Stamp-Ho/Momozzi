// api/restaurants.ts

import { supabase } from "@/lib/supabaseClient";
import type { Restaurant } from "@/types/db";

export async function fetchAllRestaurants(options?: {
  onlyBookmarked?: boolean;
}): Promise<Restaurant[]> {
  let query = supabase.from("restaurant").select("*");

  if (options?.onlyBookmarked) {
    query = query.eq("bookmark", true);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("fetchAllRestaurants error:", error);
    throw error;
  }

  return (data ?? []) as Restaurant[];
}

export async function updateRestaurantBookmark(id: number, nextValue: boolean) {
  const { error } = await supabase
    .from("restaurant")
    .update({ bookmark: nextValue })
    .eq("id", id);

  if (error) {
    console.error("updateRestaurantBookmark error:", error);
    throw error;
  }
}

export async function createRestaurant(partial: {
  name: string;
  address: string;
  openTime: string | null;
  closeTime: string | null;
  outerMapUrl: string | null;
}) {
  const { data, error } = await supabase
    .from("restaurant")
    .insert({
      ...partial,
      bookmark: false,
    })
    .select()
    .single();

  if (error) {
    console.error("createRestaurant error:", error);
    throw error;
  }
  return data as Restaurant;
}

export async function updateRestaurant(
  id: number,
  patch: {
    name?: string;
    address?: string;
    openTime?: string | null;
    closeTime?: string | null;
    outerMapUrl?: string | null;
    bookmark?: boolean | null;
    rating?: number | null;
  }
): Promise<Restaurant> {
  const { data, error } = await supabase
    .from("restaurant")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateRestaurant error:", error);
    throw error;
  }

  return data as Restaurant;
}
