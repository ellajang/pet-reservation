import Sidebar from "@/components/layout/Sidebar";
import NotificationBell from "@/components/layout/NotificationBell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <header className="flex items-center justify-end px-8 py-4 border-b border-border bg-white">
          <NotificationBell />
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
