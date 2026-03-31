"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BarChart3 } from "lucide-react";

const tabs = [
  { href: "/customers", label: "고객 목록", icon: Users, exact: true },
  { href: "/customers/analytics", label: "고객 분석", icon: BarChart3 },
];

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div>
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
