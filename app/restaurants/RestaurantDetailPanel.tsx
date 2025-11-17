// app/restaurants/RestaurantDetailPanel.tsx
"use client";

import { useEffect, useState } from "react";
import type { Restaurant, Menu } from "@/types/db";
import { fetchMenusForRestaurant } from "@/api/menu/relations";
import { MenuCard } from "./MenuCard";

type Props = {
  restaurant: Restaurant;
  onClose: () => void;
  onSelectMenu?: (menu: Menu) => void;
};

export function RestaurantDetailPanel({
  restaurant,
  onClose,
  onSelectMenu,
}: Props) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchMenusForRestaurant(restaurant.id);
        setMenus(data);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [restaurant.id]);

  const handleOpenMap = () => {
    if (!restaurant.outerMapUrl) return;
    window.open(restaurant.outerMapUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
      <div className="w-full max-w-md h-full bg-white shadow-xl flex flex-col">
        {/* 헤더 */}
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">식당 상세</div>
            <div className="text-lg font-semibold">{restaurant.name}</div>
          </div>
          <div className="flex gap-2">
            {restaurant.outerMapUrl && (
              <button
                onClick={handleOpenMap}
                className="text-xs px-2 py-1 border rounded"
              >
                지도
              </button>
            )}
            <button
              onClick={onClose}
              className="text-sm px-2 py-1 border rounded"
            >
              닫기
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-4 space-y-4 overflow-auto text-sm">
          <div className="space-y-1">
            <div className="text-xs text-gray-500">기본 정보</div>
            <div className="border rounded p-2 space-y-1">
              <div>주소: {restaurant.address}</div>
              <div>
                시간: {restaurant.openTime ?? "??"} ~{" "}
                {restaurant.closeTime ?? "??"}
              </div>
              <div>북마크: {restaurant.bookmark ? "⭐" : "없음"}</div>
              <div className="text-[10px] text-gray-400">
                생성일: {new Date(restaurant.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              이 식당에서 먹을 수 있는 메뉴
            </div>
            {loading && <div className="text-xs">불러오는 중...</div>}
            {!loading && menus.length === 0 && (
              <div className="text-xs text-gray-500">
                아직 이 식당과 연결된 메뉴가 없어요.
              </div>
            )}
            <div className="space-y-2">
              {menus.map((m) => (
                <MenuCard key={m.id} menu={m} onSelect={onSelectMenu} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
