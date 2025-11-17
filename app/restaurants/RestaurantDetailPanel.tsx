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
import { updateRestaurant } from "@/api/menu/restaurants";
import { MenuCard } from "./MenuCard";

type Props = {
  restaurant: Restaurant;
  onClose: () => void;
  onSelectMenu?: (menu: Menu) => void;
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
}: Props) {
  const [currentRestaurant, setCurrentRestaurant] =
    useState<Restaurant>(restaurant);

  const [menuRelations, setMenuRelations] = useState<MenuWithRelation[]>([]);
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [loadingAllMenus, setLoadingAllMenus] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [savingRestaurant, setSavingRestaurant] = useState(false);

  const [restaurantForm, setRestaurantForm] = useState({
    name: restaurant.name,
    address: restaurant.address,
    openTime: restaurant.openTime ?? "",
    closeTime: restaurant.closeTime ?? "",
    outerMapUrl: restaurant.outerMapUrl ?? "",
    bookmark: !!restaurant.bookmark,
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

      setMenuRelations(merged);
    } finally {
      setLoadingRelations(false);
    }
  };
  useEffect(() => {
    void load();
  }, [restaurant.id]);

  useEffect(() => {
    if (!isEditing) return;
    const loadAllMenus = async () => {
      setLoadingAllMenus(true);
      try {
        const data = await fetchAllMenus();
        setAllMenus(data);
      } finally {
        setLoadingAllMenus(false);
      }
    };
    void loadAllMenus();
  }, [isEditing]);

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
      });
      setCurrentRestaurant(updated);
      setIsEditing(false);
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

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
      <div className="w-full max-w-md h-full bg-white shadow-xl flex flex-col">
        {/* 헤더 */}
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">식당 상세</div>
            <div className="text-lg font-semibold">
              {currentRestaurant.name}
            </div>
          </div>
          <div className="flex gap-2">
            {currentRestaurant.outerMapUrl && (
              <button
                onClick={handleOpenMap}
                className="text-xs px-2 py-1 border rounded"
              >
                지도
              </button>
            )}
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
          {/* 기본 정보 (읽기 전용) */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">기본 정보</div>
            <div className="border rounded p-2 space-y-1">
              <div>이름: {currentRestaurant.name}</div>
              <div>주소: {currentRestaurant.address}</div>
              <div>
                시간: {currentRestaurant.openTime?.slice(0, 5) ?? "??"} ~{" "}
                {currentRestaurant.closeTime?.slice(0, 5) ?? "??"}
              </div>
              <div>북마크: {currentRestaurant.bookmark ? "⭐" : "없음"}</div>
              <div className="text-[10px] text-gray-400">
                생성일:{" "}
                {new Date(currentRestaurant.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          {/* 수정 모드: 식당 정보 수정 (기존 코드 유지) */}
          {isEditing && (
            <div className="space-y-2 border rounded p-3">
              <div className="text-xs text-gray-500 mb-1">식당 정보 수정</div>
              <div className="flex flex-col gap-2 text-xs">
                <input
                  className="border rounded px-2 py-1"
                  placeholder="식당 이름"
                  value={restaurantForm.name}
                  onChange={(e) =>
                    setRestaurantForm((s) => ({
                      ...s,
                      name: e.target.value,
                    }))
                  }
                />
                <input
                  className="border rounded px-2 py-1"
                  placeholder="주소"
                  value={restaurantForm.address}
                  onChange={(e) =>
                    setRestaurantForm((s) => ({
                      ...s,
                      address: e.target.value,
                    }))
                  }
                />
                <div className="flex gap-2">
                  <input
                    className="border rounded px-2 py-1 flex-1"
                    placeholder="오픈 시간 (예: 11:00)"
                    value={restaurantForm.openTime}
                    onChange={(e) =>
                      setRestaurantForm((s) => ({
                        ...s,
                        openTime: e.target.value,
                      }))
                    }
                  />
                  <input
                    className="border rounded px-2 py-1 flex-1"
                    placeholder="마감 시간 (예: 22:00)"
                    value={restaurantForm.closeTime}
                    onChange={(e) =>
                      setRestaurantForm((s) => ({
                        ...s,
                        closeTime: e.target.value,
                      }))
                    }
                  />
                </div>
                <input
                  className="border rounded px-2 py-1"
                  placeholder="지도 링크 (outerMapUrl)"
                  value={restaurantForm.outerMapUrl}
                  onChange={(e) =>
                    setRestaurantForm((s) => ({
                      ...s,
                      outerMapUrl: e.target.value,
                    }))
                  }
                />
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={restaurantForm.bookmark}
                    onChange={(e) =>
                      setRestaurantForm((s) => ({
                        ...s,
                        bookmark: e.target.checked,
                      }))
                    }
                  />
                  <span>북마크</span>
                </label>

                <button
                  onClick={handleSaveRestaurant}
                  className="self-end px-3 py-1 rounded bg-black text-white"
                  disabled={savingRestaurant}
                >
                  {savingRestaurant ? "저장 중..." : "식당 정보 저장"}
                </button>
              </div>
            </div>
          )}

          {/* ✅ 이 식당에서 먹을 수 있는 메뉴 (관계 기반 price / 무한리필 표시) */}
          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              이 식당에서 먹을 수 있는 메뉴
            </div>
            {loadingRelations && <div className="text-xs">불러오는 중...</div>}
            {!loadingRelations && menuRelations.length === 0 && (
              <div className="text-xs text-gray-500">
                아직 이 식당과 연결된 메뉴가 없어요.
              </div>
            )}
            <div className="space-y-2">
              {menuRelations.map(({ menu, relation }) => (
                <div
                  key={relation.id}
                  className="border rounded p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    onSelectMenu && !isEditing && onSelectMenu(menu)
                  }
                >
                  <div className="flex justify-between items-center gap-3">
                    <div className="space-y-1 flex flex-row flex-1 ">
                      <div>
                        <div className="font-semibold text-sm">
                          {menu.name}
                          {relation.isInfinit ? " · 무한리필" : ""}
                        </div>
                        {relation.note && (
                          <div className="text-[11px] text-gray-500">
                            메모: {relation.note}
                          </div>
                        )}
                      </div>
                      <div className="text-[15px] text-gray-700 ml-auto">
                        {relation.price != null
                          ? `${relation.price.toLocaleString()}원`
                          : "기록 없음"}
                      </div>
                      {isEditing && (
                        <button
                          className="text-xs text-red-500 ml-2"
                          onClick={async () =>
                            await deleteRelation(relation.id).then(() => load())
                          }
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 수정 모드: relation 추가 */}
          {isEditing && (
            <div className="space-y-2 border rounded p-3">
              <div className="text-xs text-gray-500 mb-1">
                이 식당에서 먹을 수 있는 메뉴 추가
              </div>
              {loadingAllMenus && (
                <div className="text-xs">메뉴 목록 불러오는 중...</div>
              )}
              {!loadingAllMenus && (
                <div className="flex flex-col gap-2 text-xs">
                  <select
                    className="border rounded px-2 py-1"
                    value={relationForm.menuId ?? ""}
                    onChange={(e) =>
                      setRelationForm((s) => ({
                        ...s,
                        menuId: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                  >
                    <option value="">메뉴 선택</option>
                    {allMenus.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
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
                    {savingRelation ? "추가 중..." : "메뉴 관계 추가"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
