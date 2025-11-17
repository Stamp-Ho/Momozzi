// app/restaurants/RestaurantCard.tsx
"use client";

import type { Restaurant } from "@/types/db";

type Props = {
  restaurant: Restaurant;
  onToggleBookmark?: (id: number) => void;
  onSelect?: (restaurant: Restaurant) => void;
};

export function RestaurantCard({
  restaurant,
  onToggleBookmark,
  onSelect,
}: Props) {
  const handleClick = () => {
    if (onSelect) onSelect(restaurant);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleBookmark) onToggleBookmark(restaurant.id);
  };

  const handleOpenMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!restaurant.outerMapUrl) return;
    window.open(restaurant.outerMapUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="border rounded p-3 flex justify-between items-center gap-3 cursor-pointer hover:bg-gray-50"
      onClick={handleClick}
    >
      <div className="space-y-1">
        <div className="font-semibold">{restaurant.name}</div>
        <div className="text-xs text-gray-500">
          {restaurant.address.split(" ")[1]}
        </div>
        {(restaurant.openTime || restaurant.closeTime) && (
          <div className="text-xs text-gray-400">
            {restaurant.openTime?.slice(0, 5) ?? ""} ~{" "}
            {restaurant.closeTime?.slice(0, 5) ?? ""}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        {restaurant.outerMapUrl && onToggleBookmark && (
          <button
            onClick={handleOpenMap}
            className="text-xs px-2 py-1 border rounded"
          >
            지도 열기
          </button>
        )}
        {onToggleBookmark && (
          <button onClick={handleToggle} className="text-xl">
            {restaurant.bookmark ? "⭐" : "☆"}
          </button>
        )}
      </div>
    </div>
  );
}
