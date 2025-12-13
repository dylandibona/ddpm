"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/tax-prep",
      label: "Tax Prep",
      icon: FileText,
    },
  ];

  return (
    <nav className="flex gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-blue-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            )}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

