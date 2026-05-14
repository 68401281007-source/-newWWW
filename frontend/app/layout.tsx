import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Enterprise Collaboration Suite",
  description: "Secure file sharing, realtime chat, and department workspaces."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="font-sans text-slate-900 antialiased dark:text-slate-100">{children}</body>
    </html>
  );
}
