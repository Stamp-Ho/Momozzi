// app/restaurants/MenuDetailPanel.tsx
"use client";

import { useEffect, useState } from "react";
import type { Menu, Restaurant } from "@/types/db";
import { fetchRestaurantsForMenu, createRelations } from "@/api/menu/relations";
import {
  fetchAllRestaurants,
  updateRestaurantBookmark,
} from "@/api/menu/restaurants";
import { updateMenu, updateMenuBookmark } from "@/api/menu/menus";
import { CUISINE_STYLES, MAIN_INGREDIENTS, MEAL_TYPES } from "@/types/enums";
import { RestaurantCard } from "./RestaurantCard";
import {
  Bookmark,
  BookmarkCheck,
  Save,
  PencilOff,
  Pencil,
  CirclePlus,
} from "lucide-react";

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
  const [loadingAllRestaurants, setLoadingAllRestaurants] = useState(true);

  const [currentMenu, setCurrentMenu] = useState<Menu>(menu);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingRelation, setIsAddingRelation] = useState(false);
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
    if (!isAddingRelation) {
      setLoadingAllRestaurants(true);
      return;
    }
    const loadAllRestaurants = async () => {
      try {
        const data = await fetchAllRestaurants();
        setAllRestaurants(data);
      } finally {
        setLoadingAllRestaurants(false);
      }
    };
    void loadAllRestaurants();
  }, [isAddingRelation]);
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
  const handleToggleMenuBookmark = async () => {
    const current = menuForm.bookmark ?? false;
    setMenuForm((prev) => ({ ...prev, bookmark: !current }));
    setCurrentMenu((prev) => ({ ...prev, bookmark: !current }));
    try {
      await updateMenuBookmark(menu.id, !current);
    } catch {
      setMenuForm((prev) => ({ ...prev, bookmark: current }));
      setCurrentMenu((prev) => ({ ...prev, bookmark: current }));
    }
  };
  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
      <div className="w-full max-w-md h-full bg-gradient-to-b from-[#Bfffff] to-[#FaFFFF] shadow-xl flex flex-col">
        {/* 헤더 */}
        <div className="px-4 py-3 border-b-2 border-[#707070] flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">메뉴 상세</div>
            <div className="text-lg font-semibold">{currentMenu.name}</div>
          </div>
          <div className="flex mr-2">
            <button
              onClick={handleToggleMenuBookmark}
              className="text-xl shrink-0"
            >
              {currentMenu.bookmark ? (
                <BookmarkCheck strokeWidth={2.5} color="#ff853eff" size={32} />
              ) : (
                <Bookmark strokeWidth={2} strokeOpacity={0.4} size={32} />
              )}
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-4 space-y-4 overflow-auto text-sm">
          {/* 기본 정보 (읽기 전용 뷰) */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500 ml-3">
              {isEditing ? "정보 수정" : "기본 정보"}
            </div>
            <div className="border rounded-lg p-2 pl-3 space-y-1  bg-white shadow-md shadow-[#00cccc33] border-[#00eeee44] border border-1.5">
              <div className="flex flex-row">
                <div className="flex flex-col space-y-1">
                  <div>
                    이름:{" "}
                    {isEditing ? (
                      <input
                        className="border rounded px-2 py-0.75 w-48 border-gray-300"
                        placeholder="메뉴 이름"
                        value={menuForm.name}
                        onChange={(e) =>
                          setMenuForm((s) => ({ ...s, name: e.target.value }))
                        }
                      />
                    ) : (
                      currentMenu.name
                    )}
                  </div>
                  <div>
                    종류:{" "}
                    {isEditing ? (
                      <select
                        className="border rounded px-1 py-0.75 flex-1 border-gray-300"
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
                    ) : (
                      currentMenu.cuisine_style ?? "기록 없음"
                    )}
                    {" / "}
                    {isEditing ? (
                      <select
                        className="border rounded px-1 py-0.75 flex-1 border-gray-300"
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
                    ) : (
                      currentMenu.meal_type ?? "기록 없음"
                    )}
                  </div>
                </div>

                <button
                  className={`ml-auto px-2 ${isEditing ? "mb-5" : "mb-1.5"}`}
                  onClick={() => setIsEditing((prev) => !prev)}
                >
                  {isEditing ? (
                    <PencilOff strokeWidth={2} color="#ff853eff" size={24} />
                  ) : (
                    <Pencil strokeWidth={2} strokeOpacity={0.4} size={24} />
                  )}
                </button>
              </div>
              <div className="flex flex-row">
                <div className="flex flex-col space-y-1">
                  <div>
                    주 재료:{" "}
                    {isEditing ? (
                      <select
                        className="border rounded px-1 py-0.75 flex-1 border-gray-300"
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
                    ) : (
                      currentMenu.main_ingredient ?? "기록 없음"
                    )}
                  </div>
                  <div>
                    기준 가격:{" "}
                    {isEditing ? (
                      <input
                        type="number"
                        className="border rounded px-2 py-0.75 flex-1 w-17 border-gray-300"
                        placeholder="기준 가격"
                        value={menuForm.price}
                        onChange={(e) =>
                          setMenuForm((s) => ({
                            ...s,
                            price: e.target.value,
                          }))
                        }
                      />
                    ) : currentMenu.price != null ? (
                      `${currentMenu.price.toLocaleString()}원`
                    ) : (
                      "기록 없음"
                    )}
                  </div>
                </div>
                {isEditing && (
                  <button
                    className="ml-auto px-2 mt-5"
                    onClick={handleSaveMenu}
                    disabled={savingMenu}
                  >
                    <Save strokeWidth={2} color="#00efef" size={24} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 이 메뉴를 먹을 수 있는 식당들 */}
          <div className="space-y-2">
            <div className="text-xs text-gray-500 ml-3">
              이 메뉴가 있는 식당
            </div>
            {isAddingRelation || (
              <button
                className="flex flex-row gap-2 w-full justify-center py-2 rounded-lg font-bold bg-white shadow-sm shadow-[#00cccc33] border-[#00eeee44] border border-1.5"
                onClick={() => setIsAddingRelation(true)}
              >
                <CirclePlus color="#00efef" size={20} />
                식당 추가
              </button>
            )}
            {/* 추가 모드: relation 추가 */}
            {isAddingRelation && (
              <div className=" rounded-lg p-2 pl-3 h-[142px] space-y-1  bg-white shadow-md shadow-[#00cccc33] border-[#00eeee44] border border-1.5">
                <div className="text-xs text-gray-500 mb-1">
                  이 메뉴를 제공하는 식당 추가
                </div>
                {loadingAllRestaurants && (
                  <div className="text-xs">식당 목록 불러오는 중...</div>
                )}
                {!loadingAllRestaurants && (
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex flex-row gap-4 items-center">
                      <select
                        className="border rounded px-1.5 py-0.75 flex-3 border-gray-300"
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
                      <input
                        type="number"
                        className="mr-1 border rounded px-2 py-0.75 w-10 flex-1 border-gray-300"
                        placeholder="가격 (선택)"
                        value={relationForm.price}
                        onChange={(e) =>
                          setRelationForm((s) => ({
                            ...s,
                            price: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        className="border rounded px-2.5 py-0.75 flex-1 border-gray-300 mr-3.5"
                        placeholder="메모 (선택)"
                        value={relationForm.note}
                        onChange={(e) =>
                          setRelationForm((s) => ({
                            ...s,
                            note: e.target.value,
                          }))
                        }
                      />
                      <label className="flex items-center gap-1 mr-6">
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
                    <div className="flex flex-row">
                      <button
                        onClick={() => setIsAddingRelation(false)}
                        className="self-end mt-1 px-3 py-1.5 font-bold rounded-md bg-[#ff853eff] text-white whitespace-nowrap"
                      >
                        그만 추가하기
                      </button>
                      <button
                        onClick={handleAddRelation}
                        className="self-end ml-auto mt-1 px-3 py-1.5 font-bold rounded-md bg-[#00efef] text-white whitespace-nowrap"
                        disabled={savingRelation}
                      >
                        {savingRelation ? "추가 중..." : "식당에 이 메뉴 추가"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {loadingRelations && <div className="text-xs">불러오는 중...</div>}
            {!loadingRelations && restaurants.length === 0 && (
              <div className="text-xs text-gray-500 ml-3">
                아직 이 메뉴를 가진 식당이 없어요. 추가해 바보뚜!!!
              </div>
            )}
            <div
              className="space-y-2 overflow-y-auto pb-13"
              style={{
                height:
                  490 - (isAddingRelation ? 104 : 0) - (isEditing ? 28 : 0),
              }}
            >
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
        </div>
        <div className="fixed bottom-0 left-0 w-full flex gap-2 px-12 py-3">
          <button
            onClick={onClose}
            className="text-md text-white font-semibold w-full px-4 py-2.5 bg-[#ff853eff]  rounded-xl shadow-lg shadow-[#ff853e53]"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
