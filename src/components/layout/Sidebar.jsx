"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, LayoutDashboard, FolderOpen, PlusCircle, LogOut, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/casos",         label: "Mis tutelas",   icon: FolderOpen },
  { href: "/casos/nuevo",   label: "Nueva tutela",  icon: PlusCircle },
];

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <aside className="w-64 bg-primary-500 flex flex-col shrink-0 hidden md:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-600">
        <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center shrink-0">
          <Scale className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">TutelaIA</p>
          <p className="text-primary-300 text-xs">Software jurídico</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Menú principal">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                active
                  ? "bg-white/15 text-white"
                  : "text-primary-200 hover:bg-white/10 hover:text-white"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Usuario + logout */}
      <div className="px-3 py-4 border-t border-primary-600">
        <div className="px-3 py-2 mb-1">
          <p className="text-white text-sm font-medium truncate">{user?.name}</p>
          <p className="text-primary-300 text-xs truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-primary-200 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loggingOut
            ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            : <LogOut className="w-4 h-4" aria-hidden />
          }
          {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}
