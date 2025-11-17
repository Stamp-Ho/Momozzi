// api/relations.ts

import { supabase } from "@/lib/supabaseClient";
import type { Restaurant_Menu_relation, Restaurant, Menu } from "@/types/db";

export async function createRelations(
  relations: Array<{
    restaurant_id: number;
    menu_id: number;
    price: number | null;
    isInfinit: boolean | null;
    note: string | null;
  }>
) {
  if (relations.length === 0) return;

  const { error } = await supabase
    .from("restaurant_menu") // 실제 테이블명 확인
    .insert(relations);

  if (error) {
    console.error("createRelations error:", error);
    throw error;
  }
}

export async function deleteRelation(id: number) {
  if (!id) return;
  const { error } = await supabase
    .from("restaurant_menu")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteRelation error:", error);
    throw error;
  }
}

export async function fetchRelationsByRestaurant(
  restaurantId: number
): Promise<Restaurant_Menu_relation[]> {
  const { data, error } = await supabase
    .from("restaurant_menu")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchRelationsByRestaurant error:", error);
    throw error;
  }
  return (data ?? []) as Restaurant_Menu_relation[];
}

/** ✅ 이 메뉴를 제공하는 식당 리스트 */
export async function fetchRestaurantsForMenu(
  menuId: number
): Promise<Restaurant[]> {
  const { data: relations, error } = await supabase
    .from("restaurant_menu")
    .select("restaurant_id")
    .eq("menu_id", menuId);

  if (error) {
    console.error("fetchRestaurantsForMenu relations error:", error);
    throw error;
  }

  const ids = [...new Set((relations ?? []).map((r) => r.restaurant_id))];
  if (ids.length === 0) return [];

  const { data: restaurants, error: rError } = await supabase
    .from("restaurant")
    .select("*")
    .in("id", ids);

  if (rError) {
    console.error("fetchRestaurantsForMenu restaurants error:", rError);
    throw rError;
  }

  return (restaurants ?? []) as Restaurant[];
}

/** ✅ 이 식당에서 먹을 수 있는 메뉴 리스트 */
export async function fetchMenusForRestaurant(
  restaurantId: number
): Promise<Menu[]> {
  const { data: relations, error } = await supabase
    .from("restaurant_menu")
    .select("menu_id")
    .eq("restaurant_id", restaurantId);

  if (error) {
    console.error("fetchMenusForRestaurant relations error:", error);
    throw error;
  }

  const ids = [...new Set((relations ?? []).map((r) => r.menu_id))];
  if (ids.length === 0) return [];

  const { data: menus, error: mError } = await supabase
    .from("menu")
    .select("*")
    .in("id", ids);

  if (mError) {
    console.error("fetchMenusForRestaurant menus error:", mError);
    throw mError;
  }

  return (menus ?? []) as Menu[];
}
