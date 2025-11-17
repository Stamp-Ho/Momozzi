// app/restaurants/MenuRecommendTab.tsx
"use client";

import { useState } from "react";
import type { Menu, MenuFilter } from "@/types/db";
import { CUISINE_STYLES, MEAL_TYPES } from "@/types/enums";
import { fetchMenusByFilter, updateMenuBookmark } from "@/api/menu/menus";
import { MenuCard } from "./MenuCard";

type Props = {
  filter: MenuFilter;
  onChangeFilter: (next: MenuFilter) => void;
  onSelectMenu?: (menu: Menu) => void;
};

export function MenuRecommendTab({
  filter,
  onChangeFilter,
  onSelectMenu,
}: Props) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selected, setSelected] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFilterChange = (patch: Partial<MenuFilter>) => {
    onChangeFilter({ ...filter, ...patch });
  };

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const data = await fetchMenusByFilter(filter);
      setMenus(data);
      if (data.length > 0) {
        const idx = Math.floor(Math.random() * data.length);
        setSelected(data[idx]);
      } else {
        setSelected(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (id: number) => {
    setMenus((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, bookmark: !(m.bookmark ?? false) } : m
      )
    );
    if (selected?.id === id) {
      setSelected({
        ...selected,
        bookmark: !(selected.bookmark ?? false),
      });
    }

    const target = menus.find((m) => m.id === id);
    const current = target?.bookmark ?? false;
    try {
      await updateMenuBookmark(id, !current);
    } catch {
      // 실패 시 롤백
      setMenus((prev) =>
        prev.map((m) => (m.id === id ? { ...m, bookmark: current } : m))
      );
      if (selected?.id === id) {
        setSelected({
          ...selected,
          bookmark: current,
        });
      }
    }
  };

  return (
    <section className="space-y-4">
      {/* 필터 영역 */}
      <div className="border rounded p-3 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs mb-1">
              음식 종류 (cuisine_style)
            </label>
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
            <label className="block text-xs mb-1">식사 타입 (meal_type)</label>
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

        <div className="flex gap-2 items-end">
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
          <button
            onClick={handleRecommend}
            className="px-3 py-2 text-sm rounded bg-black text-white"
          >
            {loading ? "추천 중..." : "추천 받기"}
          </button>
        </div>
      </div>

      {/* 추천 하나 */}
      {selected && (
        <div>
          <h2 className="text-sm font-semibold mb-2">오늘의 추천 메뉴</h2>
          <MenuCard
            menu={selected}
            onToggleBookmark={handleToggleBookmark}
            onSelect={onSelectMenu}
          />
        </div>
      )}

      {/* 후보 리스트 */}
      {menus.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs text-gray-500">
            필터에 해당하는 메뉴 목록 ({menus.length}개)
          </h3>
          <div className="space-y-2 max-h-80 overflow-auto">
            {menus.map((m) => (
              <MenuCard
                key={m.id}
                menu={m}
                onToggleBookmark={handleToggleBookmark}
                onSelect={onSelectMenu}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && menus.length === 0 && (
        <p className="text-xs text-gray-500">
          아직 필터로 찾은 메뉴가 없어요. 메뉴를 추가하거나 필터를 조정해보세요.
        </p>
      )}
    </section>
  );
}
