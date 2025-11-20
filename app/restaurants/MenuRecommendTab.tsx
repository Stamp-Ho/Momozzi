// app/restaurants/MenuRecommendTab.tsx
"use client";

import { useEffect, useState } from "react";
import type { Menu, MenuFilter } from "@/types/db";
import { CUISINE_STYLES, MEAL_TYPES } from "@/types/enums";
import { fetchMenusByFilter, updateMenuBookmark } from "@/api/menu/menus";
import { MenuCard } from "./MenuCard";

const PRICE_MIN = 4000;
const PRICE_MAX = 50000;
const PRICE_STEP = 2000;

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

  useEffect(() => {
    handleRecommend();
  }, []);

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
  // 🔽 가격 슬라이더용 핸들러 추가
  const handlePriceMinChange = (value: number) => {
    const currentMax = filter.priceMax ?? PRICE_MAX;
    const nextMin = Math.min(value, currentMax - 5000);
    handleFilterChange({
      priceMin: nextMin,
    });
  };

  const handlePriceMaxChange = (value: number) => {
    const currentMin = filter.priceMin ?? PRICE_MIN;
    const nextMax = Math.max(value, currentMin + 5000);
    handleFilterChange({
      priceMax: nextMax,
    });
  };

  const effectiveMin = filter.priceMin ?? PRICE_MIN;
  const effectiveMax = filter.priceMax ?? PRICE_MAX;
  return (
    <section className="space-y-4">
      {/* 필터 영역 */}
      <div className="rounded-xl p-3 space-y-3 bg-white shadow-md shadow-[#00cccc33] border-[#00eeee44] border border-1.5">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-black mb-1 font-bold">
              음식 종류
            </label>
            <select
              className="rounded px-2 font-bold py-2 w-full text-sm text-black border border-gray-400"
              value={filter.cuisine_style ?? ""}
              onChange={(e) =>
                handleFilterChange({
                  cuisine_style: (e.target.value || null) as any,
                })
              }
            >
              <option className="font-bold bg-white" value="">
                전체
              </option>
              {CUISINE_STYLES.map((s) => (
                <option className="font-bold bg-white" key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs text-black mb-1 font-bold">
              식사 타입
            </label>
            <select
              className="rounded px-2 font-bold py-2 w-full text-sm text-black border border-gray-400"
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
            <label className="block text-xs mb-2 font-bold text-black">
              가격 범위
            </label>

            <div className="px-1">
              {/* 슬라이더 트랙 */}
              <div className="relative h-1 bg-gray-200 rounded">
                {/* 선택된 범위를 보여주는 하이라이트 바 */}
                <div
                  className="absolute h-1 bg-black rounded"
                  style={{
                    left: `${
                      ((effectiveMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) *
                      100
                    }%`,
                    right: `${
                      100 -
                      ((effectiveMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) *
                        100
                    }%`,
                  }}
                />

                {/* 최소값 핸들 */}
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={effectiveMin}
                  onChange={(e) => handlePriceMinChange(Number(e.target.value))}
                  className="
                    absolute -top-1.5 w-full appearance-none pointer-events-none
                    touch-none
                    [&::-webkit-slider-thumb]:pointer-events-auto
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-black
                    [&::-moz-range-thumb]:pointer-events-auto
                    [&::-moz-range-thumb]:appearance-none
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-red
                  "
                />

                {/* 최대값 핸들 */}
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={effectiveMax}
                  onChange={(e) => handlePriceMaxChange(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="
                    absolute -top-1.5 w-full appearance-none pointer-events-none
                    touch-none
                    [&::-webkit-slider-thumb]:pointer-events-auto
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-black
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-black
                  "
                />
              </div>

              {/* 선택 범위 숫자 표시 */}
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{effectiveMin.toLocaleString()}원</span>
                <span>{effectiveMax.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRecommend}
            className="w-30 px-3 py-2.5 text-md rounded bg-[#00efef] text-white whitespace-nowrap font-bold"
          >
            {loading ? "추천 중..." : "추천 받기"}
          </button>
        </div>
      </div>

      {/* 추천 하나 */}
      {selected && (
        <div>
          <h2 className="text-sm font-semibold mb-2 text-black">
            오늘의 추천 메뉴 ★
          </h2>
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
          <div className="space-y-2 max-h-97 overflow-auto pb-18">
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
        <p className="text-xs text-gray-500 text-center">
          아직 추천 메뉴가 없어요. 메뉴를 추가하거나 필터를 조정해보세요.
        </p>
      )}
    </section>
  );
}
