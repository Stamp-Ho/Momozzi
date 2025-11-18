// app/restaurants/MenuCard.tsx
"use client";

import type { Menu } from "@/types/db";

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
                  bg-white shadow-sm shadow-[#00cccc33] border-[#00eeee44] border border-1.5"
      onClick={handleClick}
    >
      <div className="space-y-1">
        <div className="font-semibold">{menu.name}</div>
        <div className="text-xs text-gray-700">
          {[
            `${menu.price != null ? menu.price.toLocaleString() : 0}원`,
            menu.cuisine_style,
            menu.meal_type,
            menu.main_ingredient,
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>
      {onToggleBookmark && (
        <button onClick={handleToggle} className="text-xl shrink-0">
          {menu.bookmark ? "⭐" : "☆"}
        </button>
      )}
    </div>
  );
}
