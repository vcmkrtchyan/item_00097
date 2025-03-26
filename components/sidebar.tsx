"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, DollarSign, Home, Compass } from "lucide-react"

interface SidebarProps {
  onNavItemClick?: () => void
}

export function Sidebar({ onNavItemClick }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      name: "Itinerary",
      href: "/itinerary",
      icon: Calendar,
    },
    {
      name: "Expenses",
      href: "/expenses",
      icon: DollarSign,
    },
    {
      name: "Bookmarks",
      href: "/bookmarks",
      icon: MapPin,
    },
  ]

  return (
    <div className="flex flex-col h-full w-64 border-r bg-card">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Compass className="h-6 w-6" />
          <h1 className="text-xl font-bold">Travel Planner</h1>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={onNavItemClick}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "",
                )}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

