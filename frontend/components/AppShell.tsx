"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, BarChart3, Bell, Building2, Files, Home, LogOut, MessageSquare, Moon, Settings, Shield, Upload, User, Users } from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";

const nav = [
  ["/dashboard", Home, "Dashboard"],
  ["/files", Files, "Files"],
  ["/upload", Upload, "Upload"],
  ["/chat", MessageSquare, "Chat"],
  ["/departments", Building2, "Departments"],
  ["/analytics", BarChart3, "Analytics"],
  ["/notifications", Bell, "Notifications"],
  ["/activity", Activity, "Activity"],
  ["/admin", Shield, "Admin"],
  ["/profile", User, "Profile"],
  ["/settings", Settings, "Settings"]
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") ?? "null");
    getSocket().emit("presence:online", { userId: user?.id });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => null);
    localStorage.clear();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_12%,rgba(59,130,246,.18),transparent_27%),radial-gradient(circle_at_85%_18%,rgba(6,182,212,.15),transparent_24%)]" />
      <aside className="fixed inset-y-4 left-4 z-20 hidden w-72 rounded-[28px] border border-white/50 bg-white/78 p-4 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/78 lg:block">
        <div className="mb-7 flex items-center gap-3 px-2">
          <span className="grid size-11 place-items-center rounded-2xl bg-blue-600 text-white"><Users size={22} /></span>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Enterprise</p>
            <h1 className="font-semibold">Collab Suite</h1>
          </div>
        </div>
        <nav className="space-y-1">
          {nav.map(([href, Icon, label]) => (
            <Link href={href} key={href} className={clsx("flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition", pathname === href ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}>
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="min-h-screen p-4 lg:pl-80">
        <header className="glass sticky top-4 z-10 mb-4 flex items-center justify-between rounded-[24px] px-5 py-4 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">Live Workspace</p>
            <h2 className="text-lg font-semibold">ระบบทำงานร่วมกันภายในองค์กร</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDark((value) => !value)} className="grid size-10 place-items-center rounded-2xl bg-slate-100 dark:bg-slate-800" title="Toggle dark mode"><Moon size={18} /></button>
            <button onClick={logout} className="grid size-10 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40" title="Logout"><LogOut size={18} /></button>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
