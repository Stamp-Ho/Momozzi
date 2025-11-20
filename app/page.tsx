"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import whatToEat from "../public/뭐먹지.png";

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
    <main className="p-6 max-w-3xl mx-auto space-y-4 bg-gradient-to-b from-[#Bfffff] to-[#FaFFFF] min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">별이노 4차원 주머니</h1>
        <button
          onClick={handleLogout}
          className="px-3 py-1 rounded-md bg-red-400 text-white"
        >
          로그아웃
        </button>
      </div>

      <div className="grid grid-cols-2 p-3 gap-8">
        <a
          href="/restaurants"
          className="text-black p-2 pb-1 inline-block bg-white shadow-lg shadow-[#00cccc33] border-[#00eeee44] border border-2 rounded-xl text-center font-bold "
        >
          <Image
            className="mb-1"
            src={whatToEat} // 임포트된 이미지 객체 사용
            alt="나의 로컬 이미지"
            width={120} // 필수: 원본 이미지의 너비
            height={120} // 필수: 원본 이미지의 높이
            priority // (선택 사항) 페이지 로드 시 먼저 로드되도록 설정
          />
          메뉴 추천
        </a>
      </div>
    </main>
  );
}
