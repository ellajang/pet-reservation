"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import NotificationBell from "@/components/NotificationBell";
import { LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/check")
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
        } else {
          router.push("/login");
        }
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <header className="flex items-center justify-end gap-3 px-8 py-4 border-b border-border bg-white">
          <NotificationBell />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground p-2 hover:bg-gray-100 rounded-lg"
            title="로그아웃"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
