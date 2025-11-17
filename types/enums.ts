export const CUISINE_STYLES = [
  "한식",
  "중식",
  "일식",
  "양식",
  "분식",
  "고기",
  "디저트",
  "기타",
] as const;

export type CuisineStyle = (typeof CUISINE_STYLES)[number];

export const MAIN_INGREDIENTS = [
  "돼지",
  "닭",
  "소",
  "양",
  "비건",
  "해산물",
  "기타",
] as const;

export type MainIngredient = (typeof MAIN_INGREDIENTS)[number];

export const MEAL_TYPES = ["아침", "점심", "저녁", "야식", "간식"] as const;

export type MealType = (typeof MEAL_TYPES)[number];
