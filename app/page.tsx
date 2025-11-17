"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 1) SSR 단계에서는 window가 없으므로 여기 실행 안 됨
    if (typeof window === "undefined") return;

    // 2) 클라이언트에서만 실행됨
    const authed = localStorage.getItem("couple-app-auth") === "1";

    if (!authed) {
      router.replace("/login");
    }
  }, [router]);

  // 3) auth 체크 전에는 잠깐 비워두기 (깜빡임 방지)
  if (typeof window !== "undefined") {
    const authed = localStorage.getItem("couple-app-auth") === "1";
    if (!authed) {
      return null; // login으로 이동 중
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">메인 페이지</h1>
      <p>여긴 로그인된 사람만 볼 수 있어요.</p>
      <a href="/restaurants" className="text-blue-500 underline">
        음식점 목록 보러 가기
      </a>
    </main>
  );
}
