"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Users,
  BarChart3,
  Settings,
  Scissors,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/reservations", label: "예약 관리", icon: Calendar },
  { href: "/customers", label: "고객 관리", icon: Users },
  { href: "/sales", label: "매출 통계", icon: BarChart3 },
  { href: "/settings", label: "설정", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Scissors className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">펫살롱</h1>
        </div>
        <p className="text-sm text-muted mt-1">예약 관리 시스템</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-foreground hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted text-center">v1.0.0</p>
      </div>
    </aside>
  );
}
