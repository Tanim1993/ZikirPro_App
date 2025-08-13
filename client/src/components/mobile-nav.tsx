import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "../lib/utils";
import CreateRoomModal from "./create-room-modal";

export default function MobileNav() {
  const [location] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navItems = [
    {
      href: "/dashboard",
      emoji: "🏠",
      label: "Home",
      active: location === "/dashboard" || location === "/"
    },
    {
      href: "/rooms",
      emoji: "🕌",
      label: "Rooms", 
      active: location === "/rooms" || location?.startsWith("/room/")
    },
    {
      href: "#create",
      emoji: "➕",
      label: "Create",
      active: false,
      onClick: () => setShowCreateModal(true)
    },
    {
      href: "/stats",
      emoji: "📊",
      label: "Stats",
      active: location === "/stats"
    },
    {
      href: "#logout",
      emoji: "🚪", 
      label: "Logout",
      active: false,
      onClick: () => window.location.href = '/api/logout'
    }
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
        <div className="flex justify-around items-center py-3 px-2">
          {navItems.map((item) => {
            if (item.onClick) {
              return (
                <button
                  key={item.href}
                  onClick={item.onClick}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[60px]",
                    item.active
                      ? "text-green-600 bg-green-50"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <span className="text-lg mb-1">{item.emoji}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            }
            
            return (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[60px] no-underline",
                  item.active
                    ? "text-green-600 bg-green-50"
                    : "text-gray-500 hover:text-gray-700"
                )}>
                  <span className="text-lg mb-1">{item.emoji}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Create Room Modal */}
      <CreateRoomModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </>
  );
}