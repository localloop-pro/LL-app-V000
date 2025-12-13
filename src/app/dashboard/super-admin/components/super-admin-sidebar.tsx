"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  {
    href: "/dashboard/super-admin",
    label: "Geo-Management",
    icon: "map",
  },
  { href: "#", label: "Users", icon: "group" },
  { href: "#", label: "Reports", icon: "description" },
  { href: "#", label: "System Config", icon: "settings" },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 transition-colors duration-200 z-20 h-screen">
      {/* Profile Section */}
      <div className="p-4 border-b border-border">
        <div className="flex gap-3 items-center">
          <Avatar className="h-10 w-10 shrink-0 border border-border">
            <AvatarImage
              src={session?.user?.image || ""}
              alt="Avatar of the Super Admin user"
            />
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-sm font-semibold leading-tight truncate text-foreground">
              {session?.user?.name || "Super Admin"}
            </h1>
            <p className="text-xs font-normal leading-tight truncate text-muted-foreground">
              Global Controller
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

