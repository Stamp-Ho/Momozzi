// app/restaurants/page.tsx
"use client";

import { useState } from "react";
import type { MenuFilter, Menu, Restaurant } from "@/types/db";
import { MenuRecommendTab } from "./MenuRecommendTab";
import { BookmarkTab } from "./BookmarkTab";
import { ManageTab } from "./ManageTab";
import { MenuDetailPanel } from "./MenuDetailPanel";
import { RestaurantDetailPanel } from "./RestaurantDetailPanel";

type TabKey = "recommend" | "bookmark" | "manage";

const defaultFilter: MenuFilter = {
  cuisine_style: null,
  meal_type: null,
  priceMin: null,
  priceMax: null,
};

export default function RestaurantsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("recommend");
  const [filter, setFilter] = useState<MenuFilter>(defaultFilter);

  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  const handleSelectMenu = (menu: Menu) => {
    setSelectedRestaurant(null); // 한 번에 하나만
    setSelectedMenu(menu);
  };

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedMenu(null);
    setSelectedRestaurant(restaurant);
  };

  return (
    <>
      <main className="p-4 max-w-3xl mx-auto space-y-4">
        <h1 className="text-xl font-bold mb-1">우리 둘만의 맛집/메뉴 관리</h1>

        {/* 탭 바 */}
        <div className="flex gap-2 border-b pb-2">
          {[
            { key: "recommend", label: "메뉴 추천" },
            { key: "bookmark", label: "북마크 모아보기" },
            { key: "manage", label: "관리" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`px-3 py-1 rounded-t-md text-sm ${
                activeTab === tab.key
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 내용 */}
        {activeTab === "recommend" && (
          <MenuRecommendTab
            filter={filter}
            onChangeFilter={setFilter}
            onSelectMenu={handleSelectMenu}
          />
        )}
        {activeTab === "bookmark" && (
          <BookmarkTab
            filter={filter}
            onChangeFilter={setFilter}
            onSelectMenu={handleSelectMenu}
            onSelectRestaurant={handleSelectRestaurant}
          />
        )}
        {activeTab === "manage" && (
          <ManageTab
            onSelectMenu={handleSelectMenu}
            onSelectRestaurant={handleSelectRestaurant}
          />
        )}
      </main>

      {/* 상세 패널 */}
      {selectedMenu && (
        <MenuDetailPanel
          menu={selectedMenu}
          onClose={() => setSelectedMenu(null)}
          onSelectRestaurant={handleSelectRestaurant}
        />
      )}
      {selectedRestaurant && (
        <RestaurantDetailPanel
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          onSelectMenu={handleSelectMenu}
        />
      )}
    </>
  );
}
