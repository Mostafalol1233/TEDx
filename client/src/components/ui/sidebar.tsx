import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import {
  TicketIcon,
  ShirtIcon,
  UsersIcon,
  BarChart3Icon,
  SettingsIcon,
  LayoutDashboardIcon,
  MenuIcon,
  XIcon,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    title: string;
    href: string;
    icon: React.ReactNode;
  }[];
}

export function Sidebar({ className, items, ...props }: SidebarProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 right-4 bg-gray-200 p-2 rounded-md z-50"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "w-64 bg-sidebar text-sidebar-foreground min-h-screen flex-shrink-0",
          "fixed md:static top-0 right-0 z-40 transition-transform duration-300 md:transform-none",
          mobileOpen ? "transform-none" : "translate-x-full md:translate-x-0",
          className
        )}
        {...props}
      >
        <div className="p-6">
          <div className="flex items-center gap-2">
            <TicketIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">لوحة الإدارة</h2>
          </div>
        </div>
        <nav className="mt-4">
          {items.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center px-6 py-3 hover:bg-sidebar-accent border-r-4 border-transparent",
                location === item.href && "bg-sidebar-accent border-primary"
              )}
            >
              <div className="ml-2">{item.icon}</div>
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

export const adminSidebarItems = [
  {
    title: "لوحة التحكم",
    href: "/admin",
    icon: <LayoutDashboardIcon className="h-5 w-5" />,
  },
  {
    title: "المنتجات",
    href: "/admin/products",
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    title: "المستخدمون",
    href: "/admin/users",
    icon: <UsersIcon className="h-5 w-5" />,
  },
  {
    title: "التقارير",
    href: "/admin/reports",
    icon: <BarChart3Icon className="h-5 w-5" />,
  },
  {
    title: "الإعدادات",
    href: "/admin/settings",
    icon: <SettingsIcon className="h-5 w-5" />,
  },
];
