export const CUISINE_STYLES = [
  "한식",
  "중식",
  "일식",
  "양식",
  "분식",
  "고기",
  "아시안",
  "디저트",
  "패스트푸드",
  "샐러드",
  "샌드위치",
  "베이커리",
  "퓨전",
  "기타",
] as const;

export type CuisineStyle = (typeof CUISINE_STYLES)[number];

export const MAIN_INGREDIENTS = [
  "돼지",
  "소",
  "양",
  "닭",
  "오리",
  "육류",
  "생선",
  "해산물",
  "밥",
  "빵",
  "면",
  "채소",
  "버섯",
  "과일",
  "두부/콩",
  "계란",
  "유제품",
  "기타",
] as const;

export type MainIngredient = (typeof MAIN_INGREDIENTS)[number];

export const MEAL_TYPES = ["메인", "사이드", "디저트"] as const;

export type MealType = (typeof MEAL_TYPES)[number];
