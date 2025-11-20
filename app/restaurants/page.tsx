// app/restaurants/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { MenuFilter, Menu, Restaurant } from "@/types/db";
import { MenuRecommendTab } from "./MenuRecommendTab";
import { BookmarkTab } from "./BookmarkTab";
import { ManageTab } from "./ManageTab";
import { MenuDetailPanel } from "./MenuDetailPanel";
import { RestaurantDetailPanel } from "./RestaurantDetailPanel";

import { Utensils, Star, Settings } from "lucide-react";

type TabKey = "recommend" | "bookmark" | "manage";

const defaultFilter: MenuFilter = {
  cuisine_style: null,
  meal_type: null,
  priceMin: null,
  priceMax: null,
};

export default function RestaurantsPage() {
  const router = useRouter();
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

  const [authed, setAuthed] = useState<null | boolean>(null);

  useEffect(() => {
    const isAuthed = localStorage.getItem("couple-app-auth") === "1";

    if (!isAuthed) {
      router.replace("/login");
    } else {
      setAuthed(true);
    }
  }, [router]);

  if (authed === null) {
    return null; // 체크 중엔 아무것도 안 보여줌
  }
  return (
    <>
      <main className="p-4 max-w-3xl mx-auto space-y-4 bg-gradient-to-b from-[#Bfffff] to-[#FaFFFF] min-h-screen">
        <h1 className="text-xl text-black font-bold mb-3">모모찌~</h1>

        {/* 탭 내용 */}
        <div className="h-[90vh]">
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
        </div>
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
      {/* 탭 바 */}
      <div className="fixed bottom-0 left-0 w-full flex gap-2 bg-white shadow-[0_-1px_6px_rgba(0,0,0,0.1)] px-6 py-2">
        {[
          { key: "recommend", label: "메뉴 추천", icon: Utensils },
          { key: "bookmark", label: "북마크", icon: Star },
          { key: "manage", label: "관리", icon: Settings },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={`px-3 py-1 text-sm flex-1 flex flex-col items-center justify-center font-bold`}
            style={{ color: activeTab === tab.key ? "#00e0e0" : "#b4b4b4ff" }}
          >
            <tab.icon
              color={`${activeTab === tab.key ? "#00e0e0" : "#b4b4b4ff"}`}
              size={26}
            />
            {tab.label}
          </button>
        ))}
      </div>
    </>
  );
}
