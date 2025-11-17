"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<null | boolean>(null);

  useEffect(() => {
    const isAuthed = localStorage.getItem("couple-app-auth") === "1";

    if (!isAuthed) {
      router.replace("/login");
    } else {
      setAuthed(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("couple-app-auth");
    router.replace("/login");
  };

  // 로그인 여부 확인 전
  if (authed === null) {
    return null;
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">메인 페이지</h1>
        <button
          onClick={handleLogout}
          className="px-3 py-1 rounded bg-red-500 text-white"
        >
          로그아웃
        </button>
      </div>

      <p>여긴 로그인된 사람만 볼 수 있어요.</p>

      <a href="/restaurants" className="text-blue-500 underline">
        음식점 목록 보러 가기
      </a>
    </main>
  );
}
