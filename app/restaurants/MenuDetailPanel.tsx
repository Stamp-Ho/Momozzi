// app/restaurants/MenuDetailPanel.tsx
"use client";

import { useEffect, useState } from "react";
import type { Menu, Restaurant } from "@/types/db";
import { fetchRestaurantsForMenu } from "@/api/menu/relations";
import { RestaurantCard } from "./RestaurantCard";

type Props = {
  menu: Menu;
  onClose: () => void;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
};

export function MenuDetailPanel({ menu, onClose, onSelectRestaurant }: Props) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchRestaurantsForMenu(menu.id);
        setRestaurants(data);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [menu.id]);

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
      <div className="w-full max-w-md h-full bg-white shadow-xl flex flex-col">
        {/* 헤더 */}
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">메뉴 상세</div>
            <div className="text-lg font-semibold">{menu.name}</div>
          </div>
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 border rounded"
          >
            닫기
          </button>
        </div>

        {/* 본문 */}
        <div className="p-4 space-y-4 overflow-auto text-sm">
          <div className="space-y-1">
            <div className="text-xs text-gray-500">기본 정보</div>
            <div className="border rounded p-2 space-y-1">
              <div>
                종류: {menu.cuisine_style ?? "기록 없음"} / 식사:{" "}
                {menu.meal_type ?? "기록 없음"}
              </div>
              <div>주 재료: {menu.main_ingredient ?? "기록 없음"}</div>
              <div>
                기준 가격:{" "}
                {menu.price != null
                  ? `${menu.price.toLocaleString()}원`
                  : "기록 없음"}
              </div>
              <div>북마크: {menu.bookmark ? "⭐" : "없음"}</div>
              <div className="text-[10px] text-gray-400">
                생성일: {new Date(menu.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              이 메뉴를 먹을 수 있는 식당
            </div>
            {loading && <div className="text-xs">불러오는 중...</div>}
            {!loading && restaurants.length === 0 && (
              <div className="text-xs text-gray-500">
                아직 이 메뉴와 연결된 식당이 없어요.
              </div>
            )}
            <div className="space-y-2">
              {restaurants.map((r) => (
                <RestaurantCard
                  key={r.id}
                  restaurant={r}
                  onSelect={onSelectRestaurant}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
