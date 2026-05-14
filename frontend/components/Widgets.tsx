"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Bell, Cloud, Download, FileText, Filter, HardDrive, MessageSquare, Search, Send, Share2, UploadCloud, Users } from "lucide-react";
import { api, readLocalDraft, saveLocalDraft } from "@/lib/api";
import { getSocket } from "@/lib/socket";

const chart = [
  { name: "Mon", files: 18, messages: 44 },
  { name: "Tue", files: 28, messages: 67 },
  { name: "Wed", files: 21, messages: 72 },
  { name: "Thu", files: 36, messages: 81 },
  { name: "Fri", files: 42, messages: 96 },
  { name: "Sat", files: 23, messages: 58 },
  { name: "Sun", files: 31, messages: 64 }
];

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  files: "File Manager",
  upload: "Upload Center",
  chat: "Team Chat",
  departments: "Department Workspace",
  admin: "Admin Panel",
  profile: "User Profile",
  settings: "Settings",
  notifications: "Notification Center",
  activity: "Activity Logs",
  analytics: "Analytics Dashboard"
};

export function PageView({ type }: { type: keyof typeof pageTitles }) {
  if (type === "files") return <FilesView />;
  if (type === "upload") return <UploadView />;
  if (type === "chat") return <ChatView />;
  if (type === "departments") return <DepartmentView />;
  if (type === "admin") return <AdminView />;
  if (type === "notifications") return <NotificationView />;
  if (type === "activity") return <ActivityView />;
  if (type === "profile" || type === "settings") return <FormView type={type} />;
  return <DashboardView title={pageTitles[type]} analytics={type === "analytics"} />;
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`glass rounded-[24px] p-5 shadow-sm ${className}`}>{children}</motion.section>;
}

function DashboardView({ title, analytics = false }: { title: string; analytics?: boolean }) {
  const [data, setData] = useState<any>({ stats: { files: 0, users: 0, messages: 0, storageGb: 0 }, activities: [], notifications: [] });
  useEffect(() => { api<any>("/dashboard").then(setData).catch(() => null); }, []);
  const cards = [
    ["Files", data.stats.files, FileText, "bg-blue-600"],
    ["Users", data.stats.users, Users, "bg-indigo-600"],
    ["Messages", data.stats.messages, MessageSquare, "bg-cyan-600"],
    ["Storage GB", data.stats.storageGb, HardDrive, "bg-slate-800"]
  ] as const;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, color]) => (
          <Panel key={label}>
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>
              <span className={`grid size-12 place-items-center rounded-2xl text-white ${color}`}><Icon /></span>
            </div>
          </Panel>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_.9fr]">
        <Panel>
          <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Analytics</h2><Cloud className="text-cyan-500" /></div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}><defs><linearGradient id="blue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.5}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" opacity={0.2}/><XAxis dataKey="name"/><Tooltip/><Area dataKey={analytics ? "messages" : "files"} stroke="#2563eb" fill="url(#blue)" strokeWidth={3}/></AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <h2 className="mb-4 font-semibold">Recent Activity</h2>
          <div className="space-y-3">{(data.activities.length ? data.activities : [{ action: "SYNC_READY", entity: "System" }, { action: "AUTO_SAVE", entity: "Draft" }]).map((item: any, index: number) => <div key={index} className="rounded-2xl bg-slate-100/80 p-3 text-sm dark:bg-slate-800/70"><b>{item.action}</b><p className="text-slate-500">{item.entity}</p></div>)}</div>
        </Panel>
      </div>
    </div>
  );
}

function FilesView() {
  const [files, setFiles] = useState<any[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => { api<any>(`/files?q=${encodeURIComponent(q)}`).then((data) => setFiles(data.files)).catch(() => setFiles([])); }, [q]);
  return (
    <div className="space-y-4">
      <Toolbar q={q} setQ={setQ} />
      <Panel><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{files.map((file) => <FileCard file={file} key={file.id} />)}{files.length === 0 && <Empty label="ยังไม่มีไฟล์หรือ API ยังไม่ได้ seed ข้อมูล" />}</div></Panel>
    </div>
  );
}

function UploadView() {
  const [progress, setProgress] = useState("");
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;
    const form = new FormData();
    Array.from(files).forEach((file) => form.append("files", file));
    form.append("category", "Shared");
    setProgress("Uploading...");
    await api("/files", { method: "POST", body: form }).then(() => getSocket().emit("file:changed", { at: Date.now() }));
    setProgress("Upload complete");
  }
  return (
    <Panel className="min-h-[520px]">
      <label className="flex min-h-[420px] cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-blue-300 bg-blue-50/60 text-center transition hover:bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <UploadCloud className="mb-4 size-14 text-blue-600" />
        <span className="text-xl font-semibold">Drag & Drop หรือเลือกไฟล์</span>
        <span className="mt-2 text-sm text-slate-500">PDF, DOCX, XLSX, PPTX, ZIP, Image, MP4, TXT</span>
        <input multiple type="file" onChange={upload} className="sr-only" />
      </label>
      {progress && <p className="mt-4 rounded-2xl bg-cyan-50 p-3 text-cyan-700 dark:bg-cyan-950/30">{progress}</p>}
    </Panel>
  );
}

function ChatView() {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState(readLocalDraft<string>("chat") ?? "");
  const socket = useMemo(getSocket, []);
  useEffect(() => {
    api<any>("/messages?room=general").then((data) => setMessages(data.messages)).catch(() => null);
    socket.emit("room:join", "general");
    socket.on("message:new", (message) => setMessages((items) => [...items, message]));
    return () => { socket.off("message:new"); };
  }, [socket]);
  useEffect(() => { saveLocalDraft("chat", text); api("/autosave/chat", { method: "PUT", body: JSON.stringify({ text }) }).catch(() => null); }, [text]);
  function send() {
    const user = JSON.parse(localStorage.getItem("user") ?? "{}");
    if (!text.trim()) return;
    socket.emit("message:send", { content: text, room: "general", senderId: user.id, departmentId: user.departmentId });
    setText("");
  }
  return (
    <Panel className="grid min-h-[620px] grid-rows-[1fr_auto]">
      <div className="space-y-3 overflow-auto pr-2">{messages.map((message, index) => <div key={message.id ?? index} className="max-w-xl rounded-[22px] bg-slate-100 p-4 dark:bg-slate-800"><p className="text-xs text-slate-500">{message.sender?.name ?? "Team Member"}</p><p>{message.content}</p></div>)}</div>
      <div className="mt-4 flex gap-2"><input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 rounded-2xl border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-900/60" placeholder="พิมพ์ข้อความ..." /><button onClick={send} className="grid size-12 place-items-center rounded-2xl bg-blue-600 text-white"><Send size={18} /></button></div>
    </Panel>
  );
}

function DepartmentView() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { api<any>("/departments").then((data) => setItems(data.departments)).catch(() => null); }, []);
  return <Panel><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{items.map((dept) => <div key={dept.id} className="rounded-[22px] bg-white/75 p-4 shadow-sm dark:bg-slate-800/70"><BuildingIcon /><h3 className="mt-4 font-semibold">{dept.name}</h3><p className="mt-1 text-sm text-slate-500">{dept.description}</p><p className="mt-4 text-sm">{dept._count?.users ?? 0} members · {dept._count?.files ?? 0} files</p></div>)}</div></Panel>;
}

function AdminView() {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => { api<any>("/users").then((data) => setUsers(data.users)).catch(() => null); }, []);
  return <Panel><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="text-slate-500"><th className="p-3">User</th><th>Role</th><th>Department</th><th>Status</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t border-slate-200/70 dark:border-slate-800"><td className="p-3 font-medium">{user.name}<p className="text-xs text-slate-500">{user.email}</p></td><td>{user.role}</td><td>{user.department?.name ?? "-"}</td><td><span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{user.online ? "Online" : "Offline"}</span></td></tr>)}</tbody></table></div></Panel>;
}

function NotificationView() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { api<any>("/notifications").then((data) => setItems(data.notifications)).catch(() => null); }, []);
  return <Panel><div className="space-y-3">{(items.length ? items : [{ title: "Realtime ready", body: "Socket.io notification channel active" }]).map((item, index) => <div key={index} className="flex gap-3 rounded-2xl bg-white/75 p-4 dark:bg-slate-800/70"><Bell className="text-cyan-500" /><div><h3 className="font-semibold">{item.title}</h3><p className="text-sm text-slate-500">{item.body}</p></div></div>)}</div></Panel>;
}

function ActivityView() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { api<any>("/activity").then((data) => setItems(data.logs)).catch(() => null); }, []);
  return <Panel><div className="space-y-3">{items.map((item) => <div key={item.id} className="rounded-2xl bg-white/75 p-4 dark:bg-slate-800/70"><b>{item.action}</b><p className="text-sm text-slate-500">{item.entity} · {item.user?.name ?? "System"}</p></div>)}{items.length === 0 && <Empty label="ยังไม่มี activity หรือ role ไม่มีสิทธิ์เรียกดู" />}</div></Panel>;
}

function FormView({ type }: { type: string }) {
  const [value, setValue] = useState(() => readLocalDraft<any>(type) ?? { name: "", note: "" });
  useEffect(() => { saveLocalDraft(type, value); api(`/autosave/${type}`, { method: "PUT", body: JSON.stringify(value) }).catch(() => null); }, [type, value]);
  return <Panel><div className="grid gap-4 md:grid-cols-2"><input value={value.name} onChange={(e) => setValue({ ...value, name: e.target.value })} className="rounded-2xl border-slate-200 dark:border-slate-700 dark:bg-slate-900/60" placeholder="ชื่อ" /><textarea value={value.note} onChange={(e) => setValue({ ...value, note: e.target.value })} className="min-h-48 rounded-2xl border-slate-200 dark:border-slate-700 dark:bg-slate-900/60 md:col-span-2" placeholder="บันทึกข้อมูล ระบบจะ auto save" /></div></Panel>;
}

function Toolbar({ q, setQ }: { q: string; setQ: (value: string) => void }) {
  return <Panel><div className="flex flex-col gap-3 md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} className="w-full rounded-2xl border-slate-200 bg-white/80 pl-10 dark:border-slate-700 dark:bg-slate-900/60" placeholder="Search files..." /></div><button className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-white dark:bg-white dark:text-slate-900"><Filter size={18} /> Filter</button></div></Panel>;
}

function FileCard({ file }: { file: any }) {
  return <div className="rounded-[22px] bg-white/75 p-4 shadow-sm dark:bg-slate-800/70"><FileText className="text-blue-600" /><h3 className="mt-3 truncate font-semibold">{file.originalName ?? file.name}</h3><p className="text-sm text-slate-500">{file.category} · {Math.round((file.size ?? 0) / 1024)} KB</p><div className="mt-4 flex gap-2"><a href={file.url} className="grid size-10 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Download size={17} /></a><button className="grid size-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-600"><Share2 size={17} /></button></div></div>;
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-2xl bg-slate-100 p-5 text-sm text-slate-500 dark:bg-slate-800">{label}</div>;
}

function BuildingIcon() {
  return <div className="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50"><Users /></div>;
}
