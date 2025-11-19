// app/restaurants/ManageTab.tsx
"use client";

import { useEffect, useState } from "react";
import type { Restaurant, Menu } from "@/types/db";
import { CUISINE_STYLES, MAIN_INGREDIENTS, MEAL_TYPES } from "@/types/enums";
import { createRestaurant, fetchAllRestaurants } from "@/api/menu/restaurants";
import { createMenu, fetchAllMenus } from "@/api/menu/menus";
import {
  createRelations,
  fetchRelationsByRestaurant,
} from "@/api/menu/relations";
import { RestaurantCard } from "./RestaurantCard";
import { MenuCard } from "./MenuCard";

type NewRelationRow = {
  menuId: number | null;
  price: number | null;
  isInfinit: boolean | null;
  note: string;
};

type ManageTabProps = {
  onSelectMenu?: (menu: Menu) => void;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
};

export function ManageTab({
  onSelectMenu,
  onSelectRestaurant,
}: ManageTabProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    number | null
  >(null);

  const [relationRows, setRelationRows] = useState<NewRelationRow[]>([
    { menuId: null, price: null, isInfinit: null, note: "" },
  ]);

  const [loading, setLoading] = useState(true);

  const [addingIndex, setAddingIndex] = useState<number | null>(0);
  const onIndexClick = (index: number) => {
    if (addingIndex === index) setAddingIndex(0);
    else setAddingIndex(index);
  };
  // 새 식당
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    address: "",
    openTime: "",
    closeTime: "",
    outerMapUrl: "",
  });

  // 새 메뉴
  const [newMenu, setNewMenu] = useState({
    name: "",
    cuisine_style: "",
    main_ingredient: "",
    meal_type: "",
    price: "",
  });

  const [relationsPreview, setRelationsPreview] = useState<string[]>([]);

  const loadInitial = async () => {
    setLoading(true);
    try {
      const [rs, ms] = await Promise.all([
        fetchAllRestaurants(),
        fetchAllMenus(),
      ]);
      setRestaurants(rs);
      setMenus(ms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInitial();
  }, []);

  // 선택한 식당의 관계 프리뷰 (간단히 텍스트만)
  useEffect(() => {
    const loadRelations = async () => {
      if (!selectedRestaurantId) {
        setRelationsPreview([]);
        return;
      }
      const rels = await fetchRelationsByRestaurant(selectedRestaurantId);
      const preview = rels.map((r) => {
        const menu = menus.find((m) => m.id === r.menu_id);
        return `${menu?.name ?? "(알 수 없음)"} - ${
          r.price != null ? `${r.price.toLocaleString()}원` : "가격 미지정"
        }${r.isInfinit ? " (무한리필)" : ""}`;
      });
      setRelationsPreview(preview);
    };
    void loadRelations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurantId, menus]);

  const handleCreateRestaurant = async () => {
    if (!newRestaurant.name.trim() || !newRestaurant.address.trim()) return;

    const created = await createRestaurant({
      name: newRestaurant.name.trim(),
      address: newRestaurant.address.trim(),
      openTime: newRestaurant.openTime || null,
      closeTime: newRestaurant.closeTime || null,
      outerMapUrl: newRestaurant.outerMapUrl || null,
    });

    setRestaurants((prev) => [created, ...prev]);
    setNewRestaurant({
      name: "",
      address: "",
      openTime: "",
      closeTime: "",
      outerMapUrl: "",
    });
  };

  const handleCreateMenu = async () => {
    if (!newMenu.name.trim()) return;

    const created = await createMenu({
      name: newMenu.name.trim(),
      cuisine_style: newMenu.cuisine_style || null,
      main_ingredient: newMenu.main_ingredient || null,
      meal_type: newMenu.meal_type || null,
      price: newMenu.price ? Number(newMenu.price) : null,
    });

    setMenus((prev) => [created, ...prev]);
    setNewMenu({
      name: "",
      cuisine_style: "",
      main_ingredient: "",
      meal_type: "",
      price: "",
    });
  };

  const handleRelationRowChange = (
    idx: number,
    patch: Partial<NewRelationRow>
  ) => {
    setRelationRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, ...patch } : row))
    );
  };

  const handleAddRelationRow = () => {
    setRelationRows((prev) => [
      ...prev,
      { menuId: null, price: null, isInfinit: null, note: "" },
    ]);
  };

  const handleRemoveRelationRow = (idx: number) => {
    setRelationRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveRelations = async () => {
    if (!selectedRestaurantId) return;

    const payload = relationRows
      .filter((row) => row.menuId != null)
      .map((row) => ({
        restaurant_id: selectedRestaurantId,
        menu_id: row.menuId as number,
        price: row.price,
        isInfinit: row.isInfinit,
        note: row.note || null,
      }));

    if (payload.length === 0) return;

    await createRelations(payload);
    setRelationRows([{ menuId: null, price: null, isInfinit: null, note: "" }]);
    // 관계 프리뷰 갱신
    if (selectedRestaurantId) {
      const rels = await fetchRelationsByRestaurant(selectedRestaurantId);
      const preview = rels.map((r) => {
        const menu = menus.find((m) => m.id === r.menu_id);
        return `${menu?.name ?? "(알 수 없음)"} - ${
          r.price != null ? `${r.price.toLocaleString()}원` : "가격 미지정"
        }${r.isInfinit ? " (무한리필)" : ""}`;
      });
      setRelationsPreview(preview);
    }
  };

  if (loading) {
    return <div className="text-xs p-3">불러오는 중...</div>;
  }

  return (
    <section className="space-y-6">
      <div className="flex gap-3">
        <button
          className="border rounded p-3 flex-1 text-black"
          onClick={() => onIndexClick(1)}
        >
          식당 추가
        </button>
        <button
          className="border rounded p-3 flex-1 text-black"
          onClick={() => onIndexClick(2)}
        >
          메뉴 추가
        </button>
        <button
          className="border text-black rounded p-3 flex-1"
          onClick={() => onIndexClick(3)}
        >
          관계 추가
        </button>
      </div>
      {/* 식당 추가 */}
      {addingIndex === 1 && (
        <div className="border rounded p-3 space-y-3">
          <h2 className="text-sm font-semibold">식당 추가</h2>
          <div className="flex flex-col gap-2 text-sm">
            <input
              className="border rounded px-2 py-1"
              placeholder="식당 이름"
              value={newRestaurant.name}
              onChange={(e) =>
                setNewRestaurant((s) => ({ ...s, name: e.target.value }))
              }
            />
            <input
              className="border rounded px-2 py-1"
              placeholder="주소"
              value={newRestaurant.address}
              onChange={(e) =>
                setNewRestaurant((s) => ({ ...s, address: e.target.value }))
              }
            />
            <div className="flex gap-2">
              <input
                className="border rounded px-2 pr-0 py-1 flex-1"
                placeholder="오픈 시간 (예: 11:00)"
                value={newRestaurant.openTime}
                onChange={(e) =>
                  setNewRestaurant((s) => ({ ...s, openTime: e.target.value }))
                }
              />
              <input
                className="border rounded px-2 pr-0 py-1 flex-1"
                placeholder="마감 시간 (예: 22:00)"
                value={newRestaurant.closeTime}
                onChange={(e) =>
                  setNewRestaurant((s) => ({ ...s, closeTime: e.target.value }))
                }
              />
            </div>
            <input
              className="border rounded px-2 py-1"
              placeholder="지도 링크 (outerMapUrl)"
              value={newRestaurant.outerMapUrl}
              onChange={(e) =>
                setNewRestaurant((s) => ({ ...s, outerMapUrl: e.target.value }))
              }
            />
            <button
              onClick={handleCreateRestaurant}
              className="self-end px-3 py-1 text-xs rounded bg-black text-white"
            >
              식당 추가
            </button>
          </div>
        </div>
      )}

      {/* 메뉴 추가 */}
      {addingIndex === 2 && (
        <div className="border text-black rounded p-3 space-y-3">
          <h2 className="text-sm font-semibold">메뉴 추가</h2>
          <div className="flex flex-col gap-2 text-sm">
            <input
              className="border rounded px-2 py-1"
              placeholder="메뉴 이름"
              value={newMenu.name}
              onChange={(e) =>
                setNewMenu((s) => ({ ...s, name: e.target.value }))
              }
            />

            <div className="flex gap-2">
              <select
                className="border rounded px-2 py-1 flex-1"
                value={newMenu.cuisine_style}
                onChange={(e) =>
                  setNewMenu((s) => ({ ...s, cuisine_style: e.target.value }))
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
                value={newMenu.main_ingredient}
                onChange={(e) =>
                  setNewMenu((s) => ({
                    ...s,
                    main_ingredient: e.target.value,
                  }))
                }
              >
                <option value="">주요 재료</option>
                {MAIN_INGREDIENTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                className="border rounded px-2 py-1 flex-1"
                value={newMenu.meal_type}
                onChange={(e) =>
                  setNewMenu((s) => ({ ...s, meal_type: e.target.value }))
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

            <input
              type="number"
              className="border rounded px-2 py-1"
              placeholder="대략 가격 (선택)"
              value={newMenu.price}
              onChange={(e) =>
                setNewMenu((s) => ({ ...s, price: e.target.value }))
              }
            />

            <button
              onClick={handleCreateMenu}
              className="self-end px-3 py-1 text-xs rounded bg-black text-white"
            >
              메뉴 추가
            </button>
          </div>
        </div>
      )}
      {/* 식당 선택 + 메뉴-관계 등록 */}
      {addingIndex === 3 && (
        <div className="border rounded p-3 space-y-3">
          <h2 className="text-sm font-semibold">
            식당에 메뉴 관계 추가 (여러 개 한 번에)
          </h2>

          <div className="flex flex-col gap-2 text-sm">
            <select
              className="border rounded px-2 py-1"
              value={selectedRestaurantId ?? ""}
              onChange={(e) =>
                setSelectedRestaurantId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="">식당 선택</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {selectedRestaurantId && (
              <>
                <div className="space-y-2 border rounded p-2 max-h-48 overflow-auto">
                  <div className="text-xs text-gray-500 mb-1">
                    선택된 식당의 기존 메뉴
                  </div>
                  {relationsPreview.length === 0 && (
                    <div className="text-xs text-gray-400">
                      아직 등록된 메뉴가 없습니다.
                    </div>
                  )}
                  {relationsPreview.map((txt, i) => (
                    <div key={i} className="text-xs">
                      • {txt}
                    </div>
                  ))}
                </div>

                {/* 여러 개 관계 입력 행 */}
                <div className="space-y-2">
                  {relationRows.map((row, idx) => (
                    <div key={idx} className="flex gap-2 items-center text-xs">
                      <div className="flex gap-2 flex-col">
                        <div className="flex gap-2 flex-row">
                          <select
                            className="border rounded px-2 py-1 flex-[2]"
                            value={row.menuId ?? ""}
                            onChange={(e) =>
                              handleRelationRowChange(idx, {
                                menuId: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              })
                            }
                          >
                            <option value="">메뉴 선택</option>
                            {menus.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            className="border rounded px-2 py-1 flex-1"
                            placeholder="가격"
                            value={row.price ?? ""}
                            onChange={(e) =>
                              handleRelationRowChange(idx, {
                                price: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              })
                            }
                          />
                        </div>
                        <div className="flex gap-2 flex-row">
                          <label className="flex items-center gap-1 flex-1 ml-8">
                            <input
                              type="checkbox"
                              checked={!!row.isInfinit}
                              onChange={(e) =>
                                handleRelationRowChange(idx, {
                                  isInfinit: e.target.checked,
                                })
                              }
                            />
                            <span>무한리필</span>
                          </label>
                          <input
                            className="border rounded px-2 py-1 flex-[2]"
                            placeholder="메모 (선택)"
                            value={row.note}
                            onChange={(e) =>
                              handleRelationRowChange(idx, {
                                note: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="px-2 py-1 border rounded ml-auto"
                        onClick={() => handleRemoveRelationRow(idx)}
                        disabled={relationRows.length === 1}
                      >
                        -
                      </button>
                    </div>
                  ))}

                  <div className="flex justify-between items-center mt-2">
                    <button
                      type="button"
                      className="px-2 py-1 border rounded text-md"
                      onClick={handleAddRelationRow}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-black text-white text-xs"
                      onClick={handleSaveRelations}
                    >
                      관계 저장
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 하단에 전체 리스트 간단 프리뷰 */}
      <div className="flex grid-cols-2 gap-3">
        <div className="space-y-2 flex-3">
          <div className="text-xs font-semibold">전체 식당</div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {restaurants.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                onSelect={onSelectRestaurant}
              />
            ))}
          </div>
        </div>
        <div className="space-y-2 flex-2">
          <div className="text-xs font-semibold">전체 메뉴</div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {menus.map((m) => (
              <MenuCard key={m.id} menu={m} onSelect={onSelectMenu} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
