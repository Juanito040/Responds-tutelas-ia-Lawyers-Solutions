"use client";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

const TITLES = {
  "/dashboard":  "Dashboard",
  "/casos":      "Mis tutelas",
  "/casos/nuevo":"Nueva tutela",
};

export default function Header({ user }) {
  const pathname = usePathname();

  const title = Object.entries(TITLES).find(([path]) =>
    pathname === path || (path !== "/dashboard" && pathname.startsWith(path))
  )?.[1] ?? "TutelaIA";

  return (
    <header className="bg-white border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
      <h1 className="text-lg font-semibold text-primary-500">{title}</h1>
      <div className="flex items-center gap-3">
        <button
          aria-label="Notificaciones"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-4 h-4 text-muted" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
