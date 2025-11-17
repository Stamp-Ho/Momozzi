// app/restaurants/RestaurantDetailPanel.tsx
"use client";

import { useEffect, useState } from "react";
import type { Restaurant, Menu } from "@/types/db";
import { fetchMenusForRestaurant, createRelations } from "@/api/menu/relations";
import { fetchAllMenus } from "@/api/menu/menus";
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

export function RestaurantDetailPanel({
  restaurant,
  onClose,
  onSelectMenu,
}: Props) {
  const [currentRestaurant, setCurrentRestaurant] =
    useState<Restaurant>(restaurant);

  const [menus, setMenus] = useState<Menu[]>([]);
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
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

  useEffect(() => {
    const loadMenus = async () => {
      setLoadingMenus(true);
      try {
        const data = await fetchMenusForRestaurant(restaurant.id);
        setMenus(data);
      } finally {
        setLoadingMenus(false);
      }
    };
    void loadMenus();
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
          name: "",
          restaurant_id: currentRestaurant.id,
          menu_id: relationForm.menuId,
          price: relationForm.price ? Number(relationForm.price) : null,
          isInfinit: relationForm.isInfinit,
          note: relationForm.note || null,
        },
      ]);

      const data = await fetchMenusForRestaurant(currentRestaurant.id);
      setMenus(data);

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
                시간: {currentRestaurant.openTime ?? "??"} ~{" "}
                {currentRestaurant.closeTime ?? "??"}
              </div>
              <div>북마크: {currentRestaurant.bookmark ? "⭐" : "없음"}</div>
              <div className="text-[10px] text-gray-400">
                생성일:{" "}
                {new Date(currentRestaurant.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          {/* 수정 모드: 식당 정보 수정 */}
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

          {/* 이 식당에서 먹을 수 있는 메뉴들 */}
          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              이 식당에서 먹을 수 있는 메뉴
            </div>
            {loadingMenus && <div className="text-xs">불러오는 중...</div>}
            {!loadingMenus && menus.length === 0 && (
              <div className="text-xs text-gray-500">
                아직 이 식당과 연결된 메뉴가 없어요.
              </div>
            )}
            <div className="space-y-2">
              {menus.map((m) => (
                <MenuCard key={m.id} menu={m} onSelect={onSelectMenu} />
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
