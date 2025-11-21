// app/restaurants/BookmarkTab.tsx
"use client";

import React, { useEffect, useState } from "react";
import type {
  Menu,
  MenuFilter,
  Restaurant,
  RestaurantFilter,
} from "@/types/db";
import { CUISINE_STYLES, MAIN_INGREDIENTS, MEAL_TYPES } from "@/types/enums";
import { fetchMenusByFilter, updateMenuBookmark } from "@/api/menu/menus";
import {
  updateRestaurantBookmark,
  fetchRestaurantsByFilter,
  fetchAllSecondAddress,
} from "@/api/menu/restaurants";
import { MenuCard } from "./MenuCard";
import { RestaurantCard } from "./RestaurantCard";
import { StarRatingSlider } from "./StarRatingSlider";
import { Bookmark, BookmarkCheck } from "lucide-react";

const PRICE_MIN = 4000;
const PRICE_MAX = 50000;
const PRICE_STEP = 2000;

type Props = {
  menuFilter: MenuFilter;
  onChangeMenuFilter: (next: MenuFilter) => void;
  restaurantFilter: RestaurantFilter;
  onChangeRestaurantFilter: (next: RestaurantFilter) => void;
  onSelectMenu?: (menu: Menu) => void;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
};

type ViewMode = "menu" | "restaurant";

export function BookmarkTab({
  menuFilter,
  onChangeMenuFilter,
  restaurantFilter,
  onChangeRestaurantFilter,
  onSelectMenu,
  onSelectRestaurant,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("restaurant");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingMenus, setLoadingMenus] = useState<boolean>(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState<boolean>(false);

  const [loadingAddress, setLoadingAddress] = useState<boolean>(true);
  const [addressList, setAddressList] = useState<string[]>([]);

  const handleFilterChange = (patch: Partial<MenuFilter>) => {
    onChangeMenuFilter({ ...menuFilter, ...patch });
  };

  // 메뉴 북마크 목록
  const loadMenus = async () => {
    setLoadingMenus(true);
    try {
      const data = await fetchMenusByFilter(menuFilter, {
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
      const data = await fetchRestaurantsByFilter(restaurantFilter);
      setRestaurants(data);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  useEffect(() => {
    const getAddress = async () => {
      try {
        const data = await fetchAllSecondAddress();
        setAddressList(data);
      } finally {
        setLoadingAddress(false);
      }
    };
    getAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  }, [menuFilter]);

  useEffect(() => {
    if (viewMode === "restaurant") void loadRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantFilter]);

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

  // 별점 슬라이더용 핸들러
  const handleRatingStars = (value: number) => {
    onChangeRestaurantFilter({ ...restaurantFilter, rating: value });
  };

  // 🔽 가격 슬라이더용 핸들러 추가
  const handlePriceMinChange = (value: number) => {
    const currentMax = menuFilter.priceMax ?? PRICE_MAX;
    const nextMin = Math.min(value, currentMax - 5000);
    handleFilterChange({
      priceMin: nextMin,
    });
  };

  const handlePriceMaxChange = (value: number) => {
    const currentMin = menuFilter.priceMin ?? PRICE_MIN;
    const nextMax = Math.max(value, currentMin + 5000);
    handleFilterChange({
      priceMax: nextMax,
    });
  };

  const effectiveMin = menuFilter.priceMin ?? PRICE_MIN;
  const effectiveMax = menuFilter.priceMax ?? PRICE_MAX;
  return (
    <section className="space-y-4 text-black">
      {/* 필터 + 모드 전환 */}
      <div className="rounded-xl p-3 space-y-3 bg-white shadow-md shadow-[#00cccc33] border-[#00eeee44] border border-1.5">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 font-bold">
            {viewMode === "menu" ? "북마크 메뉴 필터" : "식당 조회 필터"}
          </span>
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setViewMode("menu")}
              className={`px-4 py-1.25 rounded font-bold text-sm ${
                viewMode === "menu"
                  ? "bg-[#00efef] text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              메뉴
            </button>
            <button
              onClick={() => setViewMode("restaurant")}
              className={`px-4 py-1.25 rounded font-bold text-sm ${
                viewMode === "restaurant"
                  ? "bg-[#00efef] text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              식당
            </button>
          </div>
        </div>

        {/* 필터 (메뉴 기준) */}
        {viewMode === "menu" ? (
          <React.Fragment>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-black mb-1 x-full text-center">
                  음식 종류
                </label>
                <select
                  className="rounded px-2 py-2 w-full text-sm text-black border border-gray-400"
                  value={menuFilter.cuisine_style ?? ""}
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
                <label className="block text-xs text-black mb-1 x-full text-center">
                  메인 재료
                </label>
                <select
                  className="rounded px-2 py-2 w-full text-sm text-black border border-gray-400"
                  value={menuFilter.main_ingredient ?? ""}
                  onChange={(e) =>
                    handleFilterChange({
                      main_ingredient: (e.target.value || null) as any,
                    })
                  }
                >
                  <option className="font-bold bg-white" value="">
                    전체
                  </option>
                  {MAIN_INGREDIENTS.map((s) => (
                    <option className="font-bold bg-white" key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-xs text-black mb-1 x-full text-center">
                  식사 타입
                </label>
                <select
                  className="rounded px-2 py-2 w-full text-sm text-black border border-gray-400"
                  value={menuFilter.meal_type ?? ""}
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
                <label className="block text-xs mb-2 text-black x-full text-center">
                  가격 범위
                </label>

                <div className="px-1">
                  {/* 슬라이더 트랙 */}
                  <div className="relative h-1 bg-gray-200 rounded">
                    {/* 선택된 범위를 보여주는 하이라이트 바 */}
                    <div
                      className="absolute h-1 bg-[#00efef] rounded"
                      style={{
                        left: `${
                          ((effectiveMin - PRICE_MIN) /
                            (PRICE_MAX - PRICE_MIN)) *
                          100
                        }%`,
                        right: `${
                          100 -
                          ((effectiveMax - PRICE_MIN) /
                            (PRICE_MAX - PRICE_MIN)) *
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
                      onChange={(e) =>
                        handlePriceMinChange(Number(e.target.value))
                      }
                      className="
                            absolute -top-1.5 w-full appearance-none pointer-events-none
                            touch-none
                            [&::-webkit-slider-thumb]:pointer-events-auto
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:h-4
                            [&::-webkit-slider-thumb]:w-4
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-[#00efef]
                            [&::-moz-range-thumb]:pointer-events-auto
                            [&::-moz-range-thumb]:appearance-none
                            [&::-moz-range-thumb]:h-4
                            [&::-moz-range-thumb]:w-4
                            [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:bg-[#00efef]
                          "
                    />

                    {/* 최대값 핸들 */}
                    <input
                      type="range"
                      min={PRICE_MIN}
                      max={PRICE_MAX}
                      step={PRICE_STEP}
                      value={effectiveMax}
                      onChange={(e) =>
                        handlePriceMaxChange(Number(e.target.value))
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="
                            absolute -top-1.5 w-full appearance-none pointer-events-none
                            touch-none
                            [&::-webkit-slider-thumb]:pointer-events-auto
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:h-4
                            [&::-webkit-slider-thumb]:w-4
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-[#00efef]
                            [&::-moz-range-thumb]:h-4
                            [&::-moz-range-thumb]:w-4
                            [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:bg-[#00efef]
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
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="flex flex-row gap-4">
              <div className="w-22.5">
                <label className="block text-xs text-black mb-1 x-full text-center">
                  지역
                </label>
                <select
                  className="rounded px-2 py-2 w-full text-sm text-black border border-gray-400"
                  value={restaurantFilter.address ?? ""}
                  onChange={(e) =>
                    onChangeRestaurantFilter({
                      ...restaurantFilter,
                      address: e.target.value,
                    })
                  }
                  disabled={loadingAddress}
                >
                  <option className="font-bold bg-white" value="">
                    전체
                  </option>
                  {addressList.map((s, index) => (
                    <option
                      className="font-bold bg-white"
                      key={index}
                      value={s}
                    >
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="block text-xs text-black mb-2 x-full text-center">
                  별점
                </label>
                <StarRatingSlider
                  size={28}
                  value={restaurantFilter.rating}
                  onChange={handleRatingStars}
                />
              </div>
              <div className="mr-8 ml-auto">
                <label className="block text-xs text-black mb-1">북마크</label>
                <button
                  onClick={() => {
                    onChangeRestaurantFilter({
                      ...restaurantFilter,
                      onlyBookmarked: !restaurantFilter.onlyBookmarked,
                    });
                  }}
                  className="text-xl shrink-0 ml-0.25"
                >
                  {restaurantFilter.onlyBookmarked ? (
                    <BookmarkCheck
                      strokeWidth={2.5}
                      color="#ff853eff"
                      size={32}
                    />
                  ) : (
                    <Bookmark strokeWidth={2} strokeOpacity={0.4} size={32} />
                  )}
                </button>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>

      {/* 컨텐츠 */}
      {viewMode === "menu" && (
        <div className="space-y-2 h-121 pb-18 overflow-y-auto">
          {loadingMenus ? (
            <div className="text-xs">불러오는 중...</div>
          ) : menus.length === 0 ? (
            <div className="text-xs text-gray-500">
              북마크된 메뉴가 없거나 필터에 해당하는 메뉴가 없어요.
            </div>
          ) : (
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
          )}
        </div>
      )}

      {viewMode === "restaurant" && (
        <div className="space-y-2  h-136 pb-4 overflow-y-auto pb-18">
          {loadingRestaurants ? (
            <div className="text-xs">불러오는 중...</div>
          ) : restaurants.length === 0 ? (
            <div className="text-xs text-gray-500">북마크된 식당이 없어요.</div>
          ) : (
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
          )}
        </div>
      )}
    </section>
  );
}
