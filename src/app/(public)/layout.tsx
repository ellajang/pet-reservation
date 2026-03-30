"use client";

import { useEffect, useState } from "react";
import { Scissors } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [shopName, setShopName] = useState("펫살롱");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.shop_name) setShopName(data.shop_name);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">{shopName}</span>
        </div>
      </header>
      <main className="max-w-lg mx-auto p-4">{children}</main>
    </div>
  );
}
