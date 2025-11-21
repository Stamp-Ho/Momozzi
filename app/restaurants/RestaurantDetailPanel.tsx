// app/restaurants/RestaurantDetailPanel.tsx
"use client";

import { useEffect, useState } from "react";
import type { Restaurant, Menu, Restaurant_Menu_relation } from "@/types/db";
import {
  fetchRelationsByRestaurant,
  createRelations,
  deleteRelation,
} from "@/api/menu/relations";
import { fetchMenusByIds, fetchAllMenus } from "@/api/menu/menus";
import {
  updateRestaurant,
  updateRestaurantBookmark,
} from "@/api/menu/restaurants";
import {
  Bookmark,
  BookmarkCheck,
  Save,
  PencilOff,
  Pencil,
  CirclePlus,
  Trash,
} from "lucide-react";
import { MEAL_TYPES } from "@/types/enums";
import { StarRatingSlider } from "./StarRatingSlider";

type Props = {
  restaurant: Restaurant;
  onClose: () => void;
  onSelectMenu?: (menu: Menu) => void;
  setEdited: (next: boolean) => void;
};

type RelationForm = {
  menuId: number | null;
  price: string;
  isInfinit: boolean;
  note: string;
};

type MenuWithRelation = {
  menu: Menu;
  relation: Pick<
    Restaurant_Menu_relation,
    "id" | "price" | "isInfinit" | "note"
  >;
};

export function RestaurantDetailPanel({
  restaurant,
  onClose,
  onSelectMenu,
  setEdited,
}: Props) {
  const [currentRestaurant, setCurrentRestaurant] =
    useState<Restaurant>(restaurant);

  const [menuRelations, setMenuRelations] = useState<MenuWithRelation[]>([]);
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [loadingAllMenus, setLoadingAllMenus] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingRelation, setIsAddingRelation] = useState(false);
  const [savingRestaurant, setSavingRestaurant] = useState(false);

  const [restaurantForm, setRestaurantForm] = useState({
    name: restaurant.name,
    address: restaurant.address,
    openTime: restaurant.openTime ?? "",
    closeTime: restaurant.closeTime ?? "",
    outerMapUrl: restaurant.outerMapUrl ?? "",
    bookmark: !!restaurant.bookmark,
    rating: restaurant.rating ?? 0,
  });

  const [relationForm, setRelationForm] = useState<RelationForm>({
    menuId: null,
    price: "",
    isInfinit: false,
    note: "",
  });
  const [savingRelation, setSavingRelation] = useState(false);

  // ✅ 이 식당의 relation + menu 조합 가져오기
  const load = async () => {
    setLoadingRelations(true);
    try {
      const relations = await fetchRelationsByRestaurant(restaurant.id);
      if (relations.length === 0) {
        setMenuRelations([]);
        return;
      }

      const menuIds = Array.from(new Set(relations.map((r) => r.menu_id)));
      const menus = await fetchMenusByIds(menuIds);

      const merged: MenuWithRelation[] = relations
        .map((rel) => {
          const menu = menus.find((m) => m.id === rel.menu_id);
          if (!menu) return null;
          return {
            menu,
            relation: {
              id: rel.id,
              price: rel.price,
              isInfinit: rel.isInfinit,
              note: rel.note,
            },
          };
        })
        .filter((x): x is MenuWithRelation => x !== null);

      merged.sort((a, b) => {
        const orderA = MEAL_TYPES.indexOf(a.menu.meal_type as any);
        const orderB = MEAL_TYPES.indexOf(b.menu.meal_type as any);

        // 미정의 타입은 뒤로 보냄
        const safeA = orderA === -1 ? 999 : orderA;
        const safeB = orderB === -1 ? 999 : orderB;

        if (safeA !== safeB) return safeA - safeB;

        return a.menu.name.localeCompare(b.menu.name);
      });

      setMenuRelations(merged);
    } finally {
      setLoadingRelations(false);
    }
  };
  useEffect(() => {
    void load();
  }, [restaurant.id]);

  useEffect(() => {
    if (!isAddingRelation) {
      setLoadingAllMenus(true);
      return;
    }
    const loadAllMenus = async () => {
      try {
        const data = await fetchAllMenus();
        setAllMenus(data);
      } finally {
        setLoadingAllMenus(false);
      }
    };
    void loadAllMenus();
  }, [isAddingRelation]);

  const handleOpenMap = () => {
    if (!currentRestaurant.outerMapUrl) return;
    window.open(currentRestaurant.outerMapUrl, "_blank", "noopener,noreferrer");
  };

  const handleSaveRestaurant = async () => {
    setSavingRestaurant(true);
    try {
      const updated = await updateRestaurant(currentRestaurant.id, {
        name: restaurantForm.name.trim(),
        address: restaurantForm.address.trim(),
        openTime: restaurantForm.openTime || null,
        closeTime: restaurantForm.closeTime || null,
        outerMapUrl: restaurantForm.outerMapUrl || null,
        bookmark: restaurantForm.bookmark,
        rating: restaurantForm.rating,
      });
      setCurrentRestaurant(updated);
      setIsEditing(false);
      setEdited(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingRestaurant(false);
    }
  };

  const handleAddRelation = async () => {
    if (!relationForm.menuId) return;
    setSavingRelation(true);
    try {
      await createRelations([
        {
          restaurant_id: currentRestaurant.id,
          menu_id: relationForm.menuId,
          price: relationForm.price ? Number(relationForm.price) : null,
          isInfinit: relationForm.isInfinit,
          note: relationForm.note || null,
        },
      ]);

      load(); // 새로고침

      setRelationForm({
        menuId: null,
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

  const handleToggleRestaurantBookmark = async () => {
    const current = restaurantForm.bookmark ?? false;
    setRestaurantForm((prev) => ({ ...prev, bookmark: !current }));
    setCurrentRestaurant((prev) => ({ ...prev, bookmark: !current }));
    try {
      await updateRestaurantBookmark(restaurant.id, !current);
    } catch {
      setRestaurantForm((prev) => ({ ...prev, bookmark: current }));
      setCurrentRestaurant((prev) => ({ ...prev, bookmark: current }));
    }
  };
  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50 text-black">
      <div className="w-full max-w-md h-full bg-gradient-to-b from-[#Bfffff] to-[#FaFFFF] shadow-xl flex flex-col">
        {/* 헤더 */}
        <div className="px-4 py-3 border-b-2 border-[#707070] flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">식당 상세</div>
            <div className="text-lg font-semibold">
              {currentRestaurant.name}
            </div>
          </div>
          <div className="flex gap-4 mr-2">
            {restaurant.outerMapUrl && (
              <button
                onClick={handleOpenMap}
                className="text-md px-3.25 py-1.75 rounded-lg shadow-lg shadow-[#00efef33]  bg-[#00efef] text-white  whitespace-nowrap font-semibold"
              >
                지도
              </button>
            )}
            <button
              onClick={handleToggleRestaurantBookmark}
              className="text-xl shrink-0"
            >
              {currentRestaurant.bookmark ? (
                <BookmarkCheck strokeWidth={2.5} color="#ff853eff" size={32} />
              ) : (
                <Bookmark strokeWidth={2} strokeOpacity={0.4} size={32} />
              )}
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-4 space-y-4 overflow-auto text-sm">
          {/* 기본 정보 (읽기 전용) */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500 ml-2">
              {isEditing ? "정보 수정" : "기본 정보"}
            </div>
            <div className="border rounded-lg p-2 pl-3 space-y-1  bg-white shadow-md shadow-[#00cccc33] border-[#00eeee44] border border-1.5">
              <div className="flex flex-row">
                <div className="flex flex-col space-y-1">
                  <div className="font-semibold">
                    이름:{" "}
                    {isEditing ? (
                      <input
                        className="border rounded px-2 py-0.75 border-gray-300 w-67"
                        placeholder="식당 이름"
                        value={restaurantForm.name}
                        onChange={(e) =>
                          setRestaurantForm((s) => ({
                            ...s,
                            name: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      currentRestaurant.name
                    )}
                  </div>
                  <div>
                    주소:{" "}
                    {isEditing ? (
                      <input
                        className="border rounded px-2 py-0.75 border-gray-300 w-67"
                        placeholder="식당 주소"
                        value={restaurantForm.address}
                        onChange={(e) =>
                          setRestaurantForm((s) => ({
                            ...s,
                            address: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      currentRestaurant.address
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
                    <Pencil strokeWidth={2} strokeOpacity={0.7} size={24} />
                  )}
                </button>
              </div>
              {isEditing && (
                <div className="flex flex-row gap-0.5 items-center">
                  {"URL: "}
                  <input
                    className="border rounded px-2 py-0.75 w-67 border-gray-300"
                    placeholder="지도 URL"
                    value={restaurantForm.outerMapUrl}
                    onChange={(e) =>
                      setRestaurantForm((s) => ({
                        ...s,
                        outerMapUrl: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
              <div className="flex flex-row">
                <div className="flex flex-col space-y-1">
                  <div>
                    시간:{" "}
                    {isEditing ? (
                      <input
                        className="border rounded px-2 py-0.75 w-13 border-gray-300"
                        placeholder="식당 주소"
                        value={currentRestaurant.openTime?.slice(0, 5) ?? ""}
                        onChange={(e) =>
                          setRestaurantForm((s) => ({
                            ...s,
                            openTime: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      currentRestaurant.openTime?.slice(0, 5) ?? "오픈 시간"
                    )}
                    {" ~ "}
                    {isEditing ? (
                      <input
                        className="border rounded px-2 py-0.75 w-13 border-gray-300"
                        placeholder="식당 주소"
                        value={currentRestaurant.closeTime?.slice(0, 5) ?? ""}
                        onChange={(e) =>
                          setRestaurantForm((s) => ({
                            ...s,
                            closeTime: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      currentRestaurant.closeTime?.slice(0, 5) ?? "마감 시간"
                    )}
                  </div>
                  <div className="flex flex-row gap-1 items-center relative">
                    평점:
                    <StarRatingSlider
                      size={16}
                      value={
                        isEditing
                          ? restaurantForm.rating
                          : currentRestaurant.rating
                      }
                      onChange={
                        isEditing
                          ? (value: number) =>
                              setRestaurantForm({
                                ...restaurantForm,
                                rating: value,
                              })
                          : () => {}
                      }
                    />
                    <label className="ml-0.5">
                      {isEditing
                        ? restaurantForm.rating
                        : currentRestaurant.rating}
                    </label>
                  </div>
                </div>
                {isEditing && (
                  <button
                    className="ml-auto px-2 mt-5"
                    onClick={handleSaveRestaurant}
                    disabled={savingRestaurant}
                  >
                    <Save strokeWidth={2} color="#00efef" size={24} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ✅ 이 식당에서 먹을 수 있는 메뉴 (관계 기반 price / 무한리필 표시) */}
          <div className="space-y-2">
            <div className="text-xs text-gray-500 ml-2">식당 메뉴</div>
            {isAddingRelation || (
              <button
                className="flex flex-row gap-2 w-full justify-center py-2 rounded-lg font-bold bg-white shadow-sm shadow-[#00cccc33] border-[#00eeee44] border border-1.5"
                onClick={() => setIsAddingRelation(true)}
              >
                <CirclePlus color="#00efef" size={20} />
                메뉴 수정
                <Trash size={20} color="#ff853e" />
              </button>
            )}
            {/* 추가 모드: relation 추가 */}
            {isAddingRelation && (
              <div className=" rounded-lg p-2 pl-3 space-y-1 h-[142px] bg-white shadow-md shadow-[#00cccc33] border-[#00eeee44] border border-1.5">
                <div className="text-xs text-gray-500 mb-1">
                  이 식당의 메뉴 추가
                </div>
                {loadingAllMenus && (
                  <div className="text-xs">메뉴 목록 불러오는 중...</div>
                )}
                {!loadingAllMenus && (
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex flex-row gap-4 items-center">
                      <select
                        className="border rounded px-1.5 py-0.75 flex-3 border-gray-300"
                        value={relationForm.menuId ?? ""}
                        onChange={(e) =>
                          setRelationForm((s) => ({
                            ...s,
                            menuId: e.target.value
                              ? Number(e.target.value)
                              : null,
                          }))
                        }
                      >
                        <option value="">메뉴 선택</option>
                        {allMenus.map((r) => (
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
            {!loadingRelations && menuRelations.length === 0 && (
              <div className="text-xs text-gray-500">
                아직 이 식당이 가진 메뉴가 없어요. 추가해 바보뚜!!!
              </div>
            )}
            <div
              className="space-y-2 overflow-y-auto pb-18"
              style={{
                height:
                  420 - (isAddingRelation ? 104 : 0) - (isEditing ? 64 : 0),
              }}
            >
              {menuRelations.map(({ menu, relation }) => (
                <div
                  key={relation.id}
                  className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 bg-white shadow-sm shadow-[#00cccc33] border-[#00eeee44] border border-1.5"
                  onClick={() =>
                    onSelectMenu && !isAddingRelation && onSelectMenu(menu)
                  }
                >
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex flex-row flex-1 ">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-sm">
                          {menu.name}
                          {relation.isInfinit ? " · 무한리필" : ""}
                        </div>
                        {relation.note && (
                          <div className="text-xs text-gray-500">
                            메모: {relation.note}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 ml-auto mt-auto mb-auto">
                        {relation.price != null
                          ? `${relation.price.toLocaleString()}원`
                          : "? 원"}
                      </div>
                      {isAddingRelation && (
                        <button
                          className="text-xs text-red-500 ml-3"
                          onClick={async () =>
                            await deleteRelation(relation.id).then(() => load())
                          }
                        >
                          <Trash size={22} color="#ff853e" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 w-full flex gap-2 px-12 py-3">
          <button
            onClick={onClose}
            className="text-md text-white font-semibold w-full px-4 py-2.5 bg-[#ff853e]  rounded-xl shadow-lg shadow-[#ff853e53]"
          >
            닫기
          </button>
          {restaurant.outerMapUrl && (
            <button
              onClick={handleOpenMap}
              className="text-md px-8 py-1.5 rounded-xl shadow-lg shadow-[#00efef33]  bg-[#00efef] text-white  whitespace-nowrap font-semibold"
            >
              지도
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
