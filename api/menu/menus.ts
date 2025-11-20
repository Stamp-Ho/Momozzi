// api/menus.ts

import { supabase } from "@/lib/supabaseClient";
import type { Menu, MenuFilter } from "@/types/db";

export async function fetchMenusByFilter(
  filter: MenuFilter,
  options?: { onlyBookmarked?: boolean }
): Promise<Menu[]> {
  let query = supabase.from("menu").select("*");

  if (filter.cuisine_style) {
    query = query.eq("cuisine_style", filter.cuisine_style);
  }
  if (filter.meal_type) {
    query = query.eq("meal_type", filter.meal_type);
  }
  if (filter.priceMin != null) {
    query = query.gte("price", filter.priceMin);
  }
  if (filter.priceMax != null) {
    query = query.lte("price", filter.priceMax);
  }
  if (options?.onlyBookmarked) {
    query = query.eq("bookmark", true);
  }

  const { data, error } = await query.order("name", {
    ascending: true,
  });

  if (error) {
    console.error("fetchMenusByFilter error:", error);
    throw error;
  }

  return (data ?? []) as Menu[];
}

export async function updateMenuBookmark(id: number, nextValue: boolean) {
  const { error } = await supabase
    .from("menu")
    .update({ bookmark: nextValue })
    .eq("id", id);

  if (error) {
    console.error("updateMenuBookmark error:", error);
    throw error;
  }
}

export async function createMenu(partial: {
  name: string;
  cuisine_style: string | null;
  main_ingredient: string | null;
  meal_type: string | null;
  price: number | null;
}) {
  const { data, error } = await supabase
    .from("menu")
    .insert({
      ...partial,
      bookmark: false,
    })
    .select()
    .single();

  if (error) {
    console.error("createMenu error:", error);
    throw error;
  }
  return data as Menu;
}

export async function fetchAllMenus(): Promise<Menu[]> {
  const { data, error } = await supabase
    .from("menu")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("fetchAllMenus error:", error);
    throw error;
  }
  return (data ?? []) as Menu[];
}

export async function updateMenu(
  id: number,
  patch: {
    name?: string;
    cuisine_style?: string | null;
    main_ingredient?: string | null;
    meal_type?: string | null;
    price?: number | null;
    bookmark?: boolean | null;
  }
): Promise<Menu> {
  const { data, error } = await supabase
    .from("menu")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateMenu error:", error);
    throw error;
  }

  return data as Menu;
}
// ✅ id 배열로 메뉴 여러 개 가져오기
export async function fetchMenusByIds(ids: number[]): Promise<Menu[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase.from("menu").select("*").in("id", ids);

  if (error) {
    console.error("fetchMenusByIds error:", error);
    throw error;
  }

  return (data ?? []) as Menu[];
}
