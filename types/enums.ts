export const CUISINE_STYLES_DICT = {
  한식: { emoji: "🍚" },
  중식: { emoji: "🥢" },
  일식: { emoji: "🍣" },
  양식: { emoji: "🍽️" },
  분식: { emoji: "🍢" },
  아시안: { emoji: "🍜" },
  디저트: { emoji: "🍰" },
  패스트푸드: { emoji: "🍔" },
  샐러드: { emoji: "🥗" },
  샌드위치: { emoji: "🥪" },
  베이커리: { emoji: "🥐" },
  퓨전: { emoji: "🍱" },
  기타: { emoji: "" },
} as const;

// key 배열 자동 생성
export const CUISINE_STYLES = Object.keys(
  CUISINE_STYLES_DICT
) as (keyof typeof CUISINE_STYLES_DICT)[];

// 타입 자동 생성
export type CuisineStyle = keyof typeof CUISINE_STYLES_DICT;
export function isCuisineStyle(value: any): value is CuisineStyle {
  return value in CUISINE_STYLES_DICT;
}

// 1) Dictionary 정의
export const MAIN_INGREDIENTS_DICT = {
  돼지: { emoji: "🐖", image: "/img/pork.png" },
  소: { emoji: "🐄", image: "/img/beef.png" },
  양: { emoji: "🐑", image: "/img/lamb.png" },
  닭: { emoji: "🐓", image: "/img/chicken.png" },
  오리: { emoji: "🦆", image: "/img/duck.png" },
  육류: { emoji: "🍖", image: "/img/meat.png" },
  생선: { emoji: "🐟", image: "/img/fish.png" },
  해산물: { emoji: "🦐", image: "/img/seafood.png" },
  밥: { emoji: "🍚", image: "/img/rice.png" },
  빵: { emoji: "🍞", image: "/img/bread.png" },
  면: { emoji: "🍜", image: "/img/noodle.png" },
  채소: { emoji: "🥦", image: "/img/vegetable.png" },
  버섯: { emoji: "🍄", image: "/img/mushroom.png" },
  과일: { emoji: "🍎", image: "/img/fruit.png" },
  "두부/콩": { emoji: "🫘", image: "/img/bean.png" },
  계란: { emoji: "🥚", image: "/img/egg.png" },
  유제품: { emoji: "🧀", image: "/img/dairy.png" },
  기타: { emoji: "", image: "/img/etc.png" },
} as const;

// 2) keys 배열 자동 생성
export const MAIN_INGREDIENTS = Object.keys(
  MAIN_INGREDIENTS_DICT
) as (keyof typeof MAIN_INGREDIENTS_DICT)[];

// 3) 타입 정의 (자동 생성됨)
export type MainIngredient = keyof typeof MAIN_INGREDIENTS_DICT;
export function isMainIngredient(value: any): value is MainIngredient {
  return value in MAIN_INGREDIENTS_DICT;
}

export const MEAL_TYPES = ["메인", "사이드", "디저트"] as const;

export type MealType = (typeof MEAL_TYPES)[number];
