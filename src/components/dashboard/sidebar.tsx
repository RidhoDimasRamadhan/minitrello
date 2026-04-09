"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Star,
  Search,
  LayoutTemplate,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Cari", href: "/search", icon: Search },
  { label: "Starred", href: "/dashboard?filter=starred", icon: Star },
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-full bg-white dark:bg-gray-950 border-r flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 border-b flex items-center px-4 gap-2">
        <div className="bg-blue-600 text-white p-1.5 rounded-lg flex-shrink-0">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold truncate">MiniTrello</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                )}
              >
                <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Tutup</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
