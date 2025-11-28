"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const APP_PASSWORD = "정별뚜"; // 진짜 비번으로 바꿔서 사용!

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 이미 로그인된 상태면 바로 /restaurants로
  useEffect(() => {
    if (typeof window === "undefined") return;
    const authed = localStorage.getItem("couple-app-auth") === "1";
    if (authed) {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === APP_PASSWORD) {
      localStorage.setItem("couple-app-auth", "1");
      router.replace("/"); // 원하는 기본 페이지로
    } else {
      setError("비밀번호가 틀렸어요 🥲");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 text-black">
      <div className="bg-white rounded-3xl shadow-md p-6 w-full max-w-xs space-y-4">
        <h1 className="text-xl font-bold text-center">이건 우리만 쓸거야</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              className="border rounded-xl w-full px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀 키워드 입력"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 text-md font-semibold rounded-xl bg-black text-white"
          >
            입장하기
          </button>
        </form>
      </div>
    </main>
  );
}
