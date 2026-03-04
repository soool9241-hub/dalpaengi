"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CalendarDays, Users, BarChart3, Settings, ExternalLink, LogOut, X, Menu } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "대시보드", href: "/admin", icon: LayoutDashboard },
  { label: "예약 관리", href: "/admin/reservations", icon: CalendarDays },
  { label: "고객 관리", href: "/admin/customers", icon: Users },
  { label: "매출/지표", href: "/admin/analytics", icon: BarChart3 },
  { label: "설정", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const navContent = (
    <>
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-bold text-text-dark flex items-center gap-2">
          <span>🐌</span> 관리자
        </h2>
        <p className="text-xs text-text-light mt-1">달팽이아지트</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-text-mid hover:bg-sage/50 hover:text-text-dark"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-text-mid hover:bg-sage/50 transition-all"
        >
          <ExternalLink size={18} />
          사이트 보기
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all w-full"
        >
          <LogOut size={18} />
          로그아웃
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-md border border-border"
      >
        <Menu size={20} className="text-text-dark" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1 text-text-light hover:text-text-dark"
            >
              <X size={18} />
            </button>
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 bg-white border-r border-border flex-col h-screen sticky top-0">
        {navContent}
      </aside>
    </>
  );
}
