// app/restaurants/MenuDetailPanel.tsx
"use client";

import { useEffect, useState } from "react";
import type { Menu, Restaurant } from "@/types/db";
import { fetchRestaurantsForMenu, createRelations } from "@/api/menu/relations";
import {
  fetchAllRestaurants,
  updateRestaurantBookmark,
} from "@/api/menu/restaurants";
import { updateMenu } from "@/api/menu/menus";
import { CUISINE_STYLES, MAIN_INGREDIENTS, MEAL_TYPES } from "@/types/enums";
import { RestaurantCard } from "./RestaurantCard";

type Props = {
  menu: Menu;
  onClose: () => void;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
};

type RelationForm = {
  restaurantId: number | null;
  price: string;
  isInfinit: boolean;
  note: string;
};

export function MenuDetailPanel({ menu, onClose, onSelectRestaurant }: Props) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [loadingAllRestaurants, setLoadingAllRestaurants] = useState(false);

  const [currentMenu, setCurrentMenu] = useState<Menu>(menu);
  const [isEditing, setIsEditing] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);

  const [menuForm, setMenuForm] = useState({
    name: menu.name,
    cuisine_style: menu.cuisine_style ?? "",
    main_ingredient: menu.main_ingredient ?? "",
    meal_type: menu.meal_type ?? "",
    price: menu.price != null ? String(menu.price) : "",
    bookmark: !!menu.bookmark,
  });

  const [relationForm, setRelationForm] = useState<RelationForm>({
    restaurantId: null,
    price: "",
    isInfinit: false,
    note: "",
  });
  const [savingRelation, setSavingRelation] = useState(false);

  useEffect(() => {
    const loadRelations = async () => {
      setLoadingRelations(true);
      try {
        const data = await fetchRestaurantsForMenu(menu.id);
        setRestaurants(data);
      } finally {
        setLoadingRelations(false);
      }
    };
    void loadRelations();
  }, [menu.id]);

  useEffect(() => {
    if (!isEditing) return;
    const loadAllRestaurants = async () => {
      setLoadingAllRestaurants(true);
      try {
        const data = await fetchAllRestaurants();
        setAllRestaurants(data);
      } finally {
        setLoadingAllRestaurants(false);
      }
    };
    void loadAllRestaurants();
  }, [isEditing]);

  const handleSaveMenu = async () => {
    setSavingMenu(true);
    try {
      const updated = await updateMenu(currentMenu.id, {
        name: menuForm.name.trim(),
        cuisine_style: menuForm.cuisine_style || null,
        main_ingredient: menuForm.main_ingredient || null,
        meal_type: menuForm.meal_type || null,
        price: menuForm.price ? Number(menuForm.price) : null,
        bookmark: menuForm.bookmark,
      });
      setCurrentMenu(updated);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      // TODO: 토스트나 alert로 알려도 좋음
    } finally {
      setSavingMenu(false);
    }
  };

  const handleAddRelation = async () => {
    if (!relationForm.restaurantId) return;
    setSavingRelation(true);
    try {
      await createRelations([
        {
          restaurant_id: relationForm.restaurantId,
          menu_id: currentMenu.id,
          price: relationForm.price ? Number(relationForm.price) : null,
          isInfinit: relationForm.isInfinit,
          note: relationForm.note || null,
        },
      ]);

      // relation 목록 다시 불러오기
      const data = await fetchRestaurantsForMenu(currentMenu.id);
      setRestaurants(data);

      // 폼 초기화
      setRelationForm({
        restaurantId: null,
        price: "",
        isInfinit: false,
        note: "",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSavingRelation(false);
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

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
      <div className="w-full max-w-md h-full bg-gradient-to-b from-[#Bfffff] to-[#FaFFFF] shadow-xl flex flex-col">
        {/* 헤더 */}
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">메뉴 상세</div>
            <div className="text-lg font-semibold">{currentMenu.name}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing((prev) => !prev)}
              className="text-xs px-2 py-1 border rounded"
            >
              {isEditing ? "수정 닫기" : "수정하기"}
            </button>
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
          {/* 기본 정보 (읽기 전용 뷰) */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">기본 정보</div>
            <div className="border rounded p-2 space-y-1">
              <div>이름: {currentMenu.name}</div>
              <div>
                종류: {currentMenu.cuisine_style ?? "기록 없음"} / 식사:{" "}
                {currentMenu.meal_type ?? "기록 없음"}
              </div>
              <div>주 재료: {currentMenu.main_ingredient ?? "기록 없음"}</div>
              <div>
                기준 가격:{" "}
                {currentMenu.price != null
                  ? `${currentMenu.price.toLocaleString()}원`
                  : "기록 없음"}
              </div>
              <div>북마크: {currentMenu.bookmark ? "⭐" : "없음"}</div>
              <div className="text-[10px] text-gray-400">
                생성일: {new Date(currentMenu.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          {/* 수정 모드: 메뉴 정보 수정 */}
          {isEditing && (
            <div className="space-y-2 border rounded p-3">
              <div className="text-xs text-gray-500 mb-1">메뉴 정보 수정</div>
              <div className="flex flex-col gap-2 text-xs">
                <input
                  className="border rounded px-2 py-1"
                  placeholder="메뉴 이름"
                  value={menuForm.name}
                  onChange={(e) =>
                    setMenuForm((s) => ({ ...s, name: e.target.value }))
                  }
                />
                <div className="flex gap-2">
                  <select
                    className="border rounded px-2 py-1 flex-1"
                    value={menuForm.cuisine_style}
                    onChange={(e) =>
                      setMenuForm((s) => ({
                        ...s,
                        cuisine_style: e.target.value,
                      }))
                    }
                  >
                    <option value="">음식 종류</option>
                    {CUISINE_STYLES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <select
                    className="border rounded px-2 py-1 flex-1"
                    value={menuForm.main_ingredient}
                    onChange={(e) =>
                      setMenuForm((s) => ({
                        ...s,
                        main_ingredient: e.target.value,
                      }))
                    }
                  >
                    <option value="">주 재료</option>
                    {MAIN_INGREDIENTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <select
                    className="border rounded px-2 py-1 flex-1"
                    value={menuForm.meal_type}
                    onChange={(e) =>
                      setMenuForm((s) => ({
                        ...s,
                        meal_type: e.target.value,
                      }))
                    }
                  >
                    <option value="">식사 타입</option>
                    {MEAL_TYPES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 flex-1"
                    placeholder="기준 가격"
                    value={menuForm.price}
                    onChange={(e) =>
                      setMenuForm((s) => ({
                        ...s,
                        price: e.target.value,
                      }))
                    }
                  />
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={menuForm.bookmark}
                      onChange={(e) =>
                        setMenuForm((s) => ({
                          ...s,
                          bookmark: e.target.checked,
                        }))
                      }
                    />
                    <span>북마크</span>
                  </label>
                </div>

                <button
                  onClick={handleSaveMenu}
                  className="self-end px-3 py-1 rounded bg-black text-white"
                  disabled={savingMenu}
                >
                  {savingMenu ? "저장 중..." : "메뉴 정보 저장"}
                </button>
              </div>
            </div>
          )}

          {/* 이 메뉴를 먹을 수 있는 식당들 */}
          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              이 메뉴를 먹을 수 있는 식당
            </div>
            {loadingRelations && <div className="text-xs">불러오는 중...</div>}
            {!loadingRelations && restaurants.length === 0 && (
              <div className="text-xs text-gray-500">
                아직 이 메뉴와 연결된 식당이 없어요.
              </div>
            )}
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
          </div>

          {/* 수정 모드: relation 추가 */}
          {isEditing && (
            <div className="space-y-2 border rounded p-3">
              <div className="text-xs text-gray-500 mb-1">
                이 메뉴를 제공하는 식당 추가
              </div>
              {loadingAllRestaurants && (
                <div className="text-xs">식당 목록 불러오는 중...</div>
              )}
              {!loadingAllRestaurants && (
                <div className="flex flex-col gap-2 text-xs">
                  <select
                    className="border rounded px-2 py-1"
                    value={relationForm.restaurantId ?? ""}
                    onChange={(e) =>
                      setRelationForm((s) => ({
                        ...s,
                        restaurantId: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                  >
                    <option value="">식당 선택</option>
                    {allRestaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      className="border rounded px-2 py-1 flex-1"
                      placeholder="가격 (선택)"
                      value={relationForm.price}
                      onChange={(e) =>
                        setRelationForm((s) => ({
                          ...s,
                          price: e.target.value,
                        }))
                      }
                    />
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={relationForm.isInfinit}
                        onChange={(e) =>
                          setRelationForm((s) => ({
                            ...s,
                            isInfinit: e.target.checked,
                          }))
                        }
                      />
                      <span>무한리필</span>
                    </label>
                  </div>
                  <input
                    className="border rounded px-2 py-1"
                    placeholder="메모 (선택)"
                    value={relationForm.note}
                    onChange={(e) =>
                      setRelationForm((s) => ({
                        ...s,
                        note: e.target.value,
                      }))
                    }
                  />
                  <button
                    onClick={handleAddRelation}
                    className="self-end px-3 py-1 rounded bg-black text-white"
                    disabled={savingRelation}
                  >
                    {savingRelation ? "추가 중..." : "식당 관계 추가"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
              <div className="fixed bottom-0 left-0 w-full flex gap-2 px-6 py-2">
        <button
              onClick={onClose}
              className="text-md text-white font-semibold w-full px-4 py-2 bg-[#ff853eff]  rounded-xl shadow-lg shadow-[#ff853e53]"
            >
              닫기
            </button>
              </div>
      </div>
    </div>
  );
}
