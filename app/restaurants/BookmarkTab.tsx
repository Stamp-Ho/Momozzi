// app/restaurants/BookmarkTab.tsx
"use client";

import { useEffect, useState } from "react";
import type { Menu, MenuFilter, Restaurant } from "@/types/db";
import { CUISINE_STYLES, MEAL_TYPES } from "@/types/enums";
import { fetchMenusByFilter, updateMenuBookmark } from "@/api/menu/menus";
import {
  fetchAllRestaurants,
  updateRestaurantBookmark,
} from "@/api/menu/restaurants";
import { MenuCard } from "./MenuCard";
import { RestaurantCard } from "./RestaurantCard";

type Props = {
  filter: MenuFilter;
  onChangeFilter: (next: MenuFilter) => void;
  onSelectMenu?: (menu: Menu) => void;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
};

type ViewMode = "menu" | "restaurant";

export function BookmarkTab({
  filter,
  onChangeFilter,
  onSelectMenu,
  onSelectRestaurant,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  const handleFilterChange = (patch: Partial<MenuFilter>) => {
    onChangeFilter({ ...filter, ...patch });
  };

  // 메뉴 북마크 목록
  const loadMenus = async () => {
    setLoadingMenus(true);
    try {
      const data = await fetchMenusByFilter(filter, {
        onlyBookmarked: true,
      });
      setMenus(data);
    } finally {
      setLoadingMenus(false);
    }
  };

  // 식당 북마크 목록 (필터는 일단 무시하고 전체 북마크 기준으로)
  const loadRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const data = await fetchAllRestaurants({ onlyBookmarked: true });
      setRestaurants(data);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  useEffect(() => {
    if (viewMode === "menu") {
      void loadMenus();
    } else {
      void loadRestaurants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // 필터 바뀔 때 메뉴 모드일 땐 다시 로드
  useEffect(() => {
    if (viewMode === "menu") {
      void loadMenus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleToggleMenuBookmark = async (id: number) => {
    setMenus((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, bookmark: !(m.bookmark ?? false) } : m
      )
    );
    const target = menus.find((m) => m.id === id);
    const current = target?.bookmark ?? false;

    try {
      await updateMenuBookmark(id, !current);
    } catch {
      setMenus((prev) =>
        prev.map((m) => (m.id === id ? { ...m, bookmark: current } : m))
      );
    }
  };

  const handleToggleRestaurantBookmark = async (id: number) => {
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, bookmark: !(r.bookmark ?? false) } : r
      )
    );
    const target = restaurants.find((r) => r.id === id);
    const current = target?.bookmark ?? false;

    try {
      await updateRestaurantBookmark(id, !current);
    } catch {
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, bookmark: current } : r))
      );
    }
  };

  return (
    <section className="space-y-4">
      {/* 필터 + 모드 전환 */}
      <div className="border rounded p-3 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">북마크 필터</span>
          <div className="flex gap-1 text-xs">
            <button
              onClick={() => setViewMode("menu")}
              className={`px-2 py-1 rounded ${
                viewMode === "menu"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              메뉴 보기
            </button>
            <button
              onClick={() => setViewMode("restaurant")}
              className={`px-2 py-1 rounded ${
                viewMode === "restaurant"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              식당 보기
            </button>
          </div>
        </div>

        {/* 필터 (메뉴 기준) */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs mb-1">음식 종류</label>
            <select
              className="border rounded px-2 py-1 w-full text-sm"
              value={filter.cuisine_style ?? ""}
              onChange={(e) =>
                handleFilterChange({
                  cuisine_style: (e.target.value || null) as any,
                })
              }
            >
              <option value="">전체</option>
              {CUISINE_STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs mb-1">식사 타입</label>
            <select
              className="border rounded px-2 py-1 w-full text-sm"
              value={filter.meal_type ?? ""}
              onChange={(e) =>
                handleFilterChange({
                  meal_type: (e.target.value || null) as any,
                })
              }
            >
              <option value="">전체</option>
              {MEAL_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs mb-1">최소 가격</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full text-sm"
              value={filter.priceMin ?? ""}
              onChange={(e) =>
                handleFilterChange({
                  priceMin: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs mb-1">최대 가격</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full text-sm"
              value={filter.priceMax ?? ""}
              onChange={(e) =>
                handleFilterChange({
                  priceMax: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      {viewMode === "menu" && (
        <div className="space-y-2">
          {loadingMenus && <div className="text-xs">불러오는 중...</div>}
          {!loadingMenus && menus.length === 0 && (
            <div className="text-xs text-gray-500">
              북마크된 메뉴가 없거나 필터에 해당하는 메뉴가 없어요.
            </div>
          )}
          <div className="space-y-2">
            {menus.map((m) => (
              <MenuCard
                key={m.id}
                menu={m}
                onToggleBookmark={handleToggleMenuBookmark}
                onSelect={onSelectMenu}
              />
            ))}
          </div>
        </div>
      )}

      {viewMode === "restaurant" && (
        <div className="space-y-2">
          {loadingRestaurants && <div className="text-xs">불러오는 중...</div>}
          {!loadingRestaurants && restaurants.length === 0 && (
            <div className="text-xs text-gray-500">북마크된 식당이 없어요.</div>
          )}
          <div className="space-y-2">
            {restaurants.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                onToggleBookmark={handleToggleRestaurantBookmark}
                onSelect={onSelectRestaurant}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
