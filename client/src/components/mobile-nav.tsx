import { Link, useLocation } from "wouter";
import { Home, Trophy, User, Plus, BarChart3 } from "lucide-react";
import { cn } from "../lib/utils";

export default function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    {
      href: "/",
      emoji: "🏠",
      label: "Home",
      active: location === "/" || location === "/dashboard"
    },
    {
      href: "/rooms",
      emoji: "🏆",
      label: "Rooms",
      active: location?.startsWith("/rooms")
    },
    {
      href: "/create",
      emoji: "➕",
      label: "Create",
      active: location === "/create"
    },
    {
      href: "/stats",
      emoji: "📊",
      label: "Stats",
      active: location === "/stats"
    },
    {
      href: "/profile",
      emoji: "👤",
      label: "Profile",
      active: location === "/profile"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[60px]",
                item.active
                  ? "text-green-600 bg-green-50"
                  : "text-gray-500 hover:text-gray-700"
              )}>
                <span className="text-xl mb-1">{item.emoji}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}