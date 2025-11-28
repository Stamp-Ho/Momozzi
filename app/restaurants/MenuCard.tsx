// app/restaurants/MenuCard.tsx
"use client";

import type { Menu } from "@/types/db";
import {
  CUISINE_STYLES_DICT,
  isCuisineStyle,
  isMainIngredient,
  MAIN_INGREDIENTS_DICT,
} from "@/types/enums";
import { Bookmark, BookmarkCheck } from "lucide-react";

type Props = {
  menu: Menu;
  onToggleBookmark?: (id: number) => void;
  onSelect?: (menu: Menu) => void;
};

export function MenuCard({ menu, onToggleBookmark, onSelect }: Props) {
  const handleClick = () => {
    if (onSelect) onSelect(menu);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // 상세 보기 클릭과 분리
    if (onToggleBookmark) onToggleBookmark(menu.id);
  };

  return (
    <div
      className="rounded-xl px-4 py-3 flex justify-between items-center gap-3 cursor-pointer hover:bg-gray-50
                  bg-white shadow-sm shadow-[#00cccc33] border-[#00eeee44] border border-1.5 mt-0.25"
      onClick={handleClick}
    >
      <div className="space-y-1">
        <div className="font-semibold text-black">{menu.name}</div>
        <div className="flex flex-row gap-1.5">
          <div className="text-xs text-gray-700">
            {[`${menu.price != null ? menu.price.toLocaleString() : 0}원`]
              .filter(Boolean)
              .join(" · ")}
          </div>
          <div className="text-md -mt-1.25 -mb-2 text-gray-700">
            {[
              isCuisineStyle(menu.cuisine_style) &&
                CUISINE_STYLES_DICT[menu.cuisine_style].emoji,
              isMainIngredient(menu.main_ingredient) &&
                MAIN_INGREDIENTS_DICT[menu.main_ingredient].emoji,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
      </div>
      {onToggleBookmark && (
        <button
          onClick={handleToggle}
          className="text-xl shrink-0 -mt-12 px-3 -mr-3"
        >
          {menu.bookmark ? (
            <BookmarkCheck size={28} strokeWidth={2.5} color="#ff853eff" />
          ) : (
            <Bookmark size={28} strokeWidth={2.25} strokeOpacity={0.25} />
          )}
        </button>
      )}
    </div>
  );
}
