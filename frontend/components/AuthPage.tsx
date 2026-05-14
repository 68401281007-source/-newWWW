"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

type Mode = "login" | "register" | "forgot" | "reset";

const copy = {
  login: ["เข้าสู่ระบบ", "เข้าใช้งาน workspace องค์กร", "Login"],
  register: ["สร้างบัญชี", "เริ่มใช้งานทีมของคุณ", "Register"],
  forgot: ["ลืมรหัสผ่าน", "รับลิงก์สำหรับตั้งรหัสผ่านใหม่", "Send reset link"],
  reset: ["ตั้งรหัสผ่านใหม่", "กำหนดรหัสผ่านและกู้ session", "Reset password"]
} as const;

export function AuthPage({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      if (mode === "login") {
        const data = await api<{ accessToken: string; refreshToken: string; user: unknown }>("/auth/login", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else if (mode === "register") {
        await api("/auth/register", { method: "POST", body: JSON.stringify(payload) });
        router.push("/login");
      } else {
        await api(`/auth/${mode === "forgot" ? "forgot-password" : "reset-password"}`, { method: "POST", body: JSON.stringify(payload) });
        setMessage("ดำเนินการเรียบร้อย");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ไม่สามารถดำเนินการได้");
    } finally {
      setLoading(false);
    }
  }

  const [title, subtitle, button] = copy[mode];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_28%),linear-gradient(135deg,#f8fafc,#eef2ff_48%,#ecfeff)] p-5 dark:bg-[radial-gradient(circle_at_top_left,#1e3a8a,transparent_24%),linear-gradient(135deg,#020617,#111827_55%,#083344)]">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-6xl items-center justify-center">
        <section className="glass grid w-full overflow-hidden rounded-[28px] shadow-soft md:grid-cols-[1.05fr_.95fr]">
          <div className="relative hidden min-h-[620px] p-10 md:block">
            <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(37,99,235,.92),rgba(79,70,229,.86),rgba(6,182,212,.7))]" />
            <div className="relative z-10 flex h-full flex-col justify-between text-white">
              <div className="flex items-center gap-3 text-lg font-semibold">
                <span className="grid size-11 place-items-center rounded-2xl bg-white/18"><ShieldCheck /></span>
                Enterprise Suite
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.26em] text-cyan-100">Secure Collaboration</p>
                <h1 className="mt-5 max-w-xl font-sans text-5xl font-extrabold leading-tight">Drive, Chat, Teams และ Admin ในระบบเดียว</h1>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {["Realtime Sync", "Cloud Files", "RBAC"].map((item) => (
                    <div className="rounded-2xl border border-white/18 bg-white/12 p-4 text-sm font-semibold" key={item}>{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-9">
              <h2 className="text-3xl font-bold">{title}</h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>
            <form onSubmit={submit} className="space-y-4">
              {mode === "register" && <input name="name" required className="w-full rounded-2xl border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60" placeholder="ชื่อผู้ใช้" />}
              <input name="email" type="email" required className="w-full rounded-2xl border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60" placeholder="อีเมล" />
              {mode !== "forgot" && <input name="password" type="password" required minLength={8} className="w-full rounded-2xl border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60" placeholder="รหัสผ่าน" />}
              <button disabled={loading} className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-60">{loading ? "กำลังประมวลผล..." : button}</button>
            </form>
            {message && <p className="mt-4 rounded-2xl bg-cyan-50 p-3 text-sm text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-200">{message}</p>}
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-500">
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
              <Link href="/forgot-password">Forgot Password</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
