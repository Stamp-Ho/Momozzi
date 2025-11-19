// src/types/db.ts
export type Restaurant = {
  id: number;
  created_at: string;
  name: string;
  address: string;
  openTime: string | null;
  closeTime: string | null;
  bookmark: boolean | null;
  outerMapUrl: string | null;
  rating: number | null;
};

export type Restaurant_Menu_relation = {
  id: number;
  created_at: string;
  name: string;
  restaurant_id: number;
  menu_id: number;
  price: number | null;
  isInfinit: boolean | null;
  note: string | null;
  bookmark: boolean | null;
};

export type Menu = {
  id: number;
  created_at: string;
  name: string;
  cuisine_style: string | null; // enum
  main_ingredient: string | null; // enum
  meal_type: string | null; // enum
  price: number | null;
  bookmark: boolean | null;
};

// 필터 타입 (Menu / Bookmark 탭에서 공유)
export type MenuFilter = {
  cuisine_style: string | null; // null이면 전체
  meal_type: string | null; // null이면 전체
  priceMin: number | null;
  priceMax: number | null;
};
