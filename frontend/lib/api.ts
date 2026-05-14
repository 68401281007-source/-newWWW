const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  departmentId?: string;
};

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.message ?? "Request failed");
  return response.json();
}

export function saveLocalDraft(scope: string, payload: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`draft:${scope}`, JSON.stringify({ payload, savedAt: new Date().toISOString() }));
}

export function readLocalDraft<T>(scope: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`draft:${scope}`);
  return raw ? (JSON.parse(raw).payload as T) : null;
}
