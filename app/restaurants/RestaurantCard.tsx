// app/restaurants/RestaurantCard.tsx
"use client";

import type { Restaurant } from "@/types/db";
import { Bookmark, BookmarkCheck, Star, StarHalf } from "lucide-react";

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

  const addressParts = restaurant.address.split(" ");
  return (
    <div
      className="rounded-xl px-4 py-3 flex justify-between items-center gap-3 cursor-pointer hover:bg-gray-50
                  bg-white shadow-sm shadow-[#00cccc33] border-[#00eeee44] border border-1.5"
      onClick={handleClick}
    >
      <div className="space-y-1">
        <div className="font-semibold text-black">{restaurant.name}</div>
        <div className="text-xs text-gray-700"></div>
        {(restaurant.openTime || restaurant.closeTime) && (
          <div className="text-xs text-gray-400">
            {restaurant.openTime?.slice(0, 5) ?? ""} ~{" "}
            {restaurant.closeTime?.slice(0, 5) ?? ""}
            {" | "}
            {addressParts[0] + " " + addressParts[1]}
          </div>
        )}
        {restaurant.rating != null && (
          <div className="flex flex-row gap-0.5">
            {[...Array(Math.floor(restaurant.rating))].map((_, i) => (
              <Star key={i} size={16} strokeWidth={3} color="#ff853eff" />
            ))}
            {restaurant.rating % 1 >= 0.5 && (
              <StarHalf size={16} strokeWidth={3} color="#ff853eff" />
            )}
          </div>
        )}
      </div>
      <div className="flex flex-row items-end gap-3 shrink-0 ">
        {restaurant.outerMapUrl && onToggleBookmark && (
          <button
            onClick={handleOpenMap}
            className="text-sm px-3 py-2 rounded-lg bg-[#00efef] text-white whitespace-nowrap font-bold"
          >
            지도
          </button>
        )}
        {onToggleBookmark && (
          <button onClick={handleToggle} className="mb-auto mt-auto">
            {restaurant.bookmark ? (
              <BookmarkCheck strokeWidth={2.5} color="#ff853eff" />
            ) : (
              <Bookmark strokeWidth={2} strokeOpacity={0.25} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
