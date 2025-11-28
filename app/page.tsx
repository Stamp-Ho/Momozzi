"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import dizzy from "../public/귀차너.png";
import romantic from "../public/낭만뚜.png";
import dust from "../public/먼지뚜.png";
import island from "../public/무인도.png";
import whatToEat from "../public/뭐먹지.png";
import standingNight from "../public/밤샘뚜.png";
import tongtong from "../public/배통통.png";
import holdBreath from "../public/숨참아.png";
import disappointed from "../public/실망.png";
import abandoned from "../public/쓸쓸뚜.png";
import errorTtu from "../public/에러뚜.png";
import chairTtu from "../public/의자뚜.png";
import nightTtu from "../public/철야뚜.png";
import hehe from "../public/헤헤.png";
import { Bookmark, HouseHeart, Settings, Star } from "lucide-react";

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
    <main className="p-6 max-w-md mx-auto space-y-4 bg-gradient-to-b from-[#Bfffff] to-[#FaFFFF] min-h-screen text-black">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">별이노 4차원 주머니</h1>
        <button
          onClick={handleLogout}
          className="px-3.5 py-1 rounded-md font-semibold bg-[#ff853eff] text-white"
        >
          로그아웃
        </button>
      </div>

      <div className="grid grid-cols-2 p-3 gap-8 h-168 pb-18 overflow-y-auto">
        {[
          {
            src: whatToEat,
            href: "/restaurants",
            label: "메뉴 추천",
            bm: true,
          },
          { src: disappointed, href: "/", label: "아직 없어요", bm: false },
          { src: errorTtu, href: "/", label: "아직 없어요", bm: false },
          { src: nightTtu, href: "/", label: "아직 없어요", bm: false },
          { src: standingNight, href: "/", label: "아직 없어요", bm: false },
          { src: dust, href: "/", label: "아직 없어요", bm: false },
          { src: holdBreath, href: "/", label: "아직 없어요", bm: false },
          { src: tongtong, href: "/", label: "아직 없어요", bm: false },
          { src: dizzy, href: "/", label: "아직 없어요", bm: false },
          { src: romantic, href: "/", label: "아직 없어요", bm: false },
          { src: island, href: "/", label: "아직 없어요", bm: false },
          { src: abandoned, href: "/", label: "아직 없어요", bm: false },
          { src: chairTtu, href: "/", label: "아직 없어요", bm: false },
          { src: hehe, href: "/", label: "아직 없어요", bm: false },
        ].map((item, index) => (
          <a
            key={index}
            href={item.href}
            className={`text-black p-2 pb-1 inline-block bg-white shadow-lg border border-2 rounded-xl text-center font-bold relative
            ${
              item.href !== "/"
                ? "shadow-[#00cccc33] border-[#00eeee70] text-black"
                : "shadow-[#ff853e50] border-[#ff853e70] text-gray-500"
            }`}
          >
            <button
              className={"absolute right-0 -top-1 px-1.5 pb-1.5"}
              onClick={() => {}}
            >
              <Bookmark
                size={28}
                strokeWidth={2.5}
                color={item.bm ? "#ff853e" : "#7c7c7cff"}
              />
            </button>
            <Image
              className="mb-1"
              src={item.src}
              alt="나의 로컬 이미지"
              width={135}
              height={135}
              priority // (선택 사항) 페이지 로드 시 먼저 로드되도록 설정
            />
            {item.label}
          </a>
        ))}
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-md flex gap-2 bg-white shadow-[0_-1px_6px_rgba(0,0,0,0.1)] px-6 py-2">
        <button
          onClick={() => router.replace("/")}
          className={`px-3 py-1 text-sm flex-1 flex flex-col items-center justify-center font-bold text-[#ff80ceff]`}
        >
          <HouseHeart color="#ff80ceff" size={26} />
          메인 화면
        </button>
        {[
          { key: "bookmark", label: "즐겨찾기", icon: Star },
          { key: "manage", label: "설정", icon: Settings },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {}}
            className={`px-3 py-1 text-sm flex-1 flex flex-col items-center justify-center font-bold`}
            style={{ color: false ? "#00e0e0" : "#b4b4b4ff" }}
          >
            <tab.icon color={`${false ? "#00e0e0" : "#b4b4b4ff"}`} size={26} />
            {tab.label}
          </button>
        ))}
      </div>
    </main>
  );
}
