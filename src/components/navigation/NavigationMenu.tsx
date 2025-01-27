import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavigationItem {
  title: string;
  icon: LucideIcon;
  path: string;
}

interface NavigationMenuProps {
  items: NavigationItem[];
}

export function NavigationMenu({ items }: NavigationMenuProps) {
  const location = useLocation();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = 
          location.pathname === item.path || 
          (location.pathname === "/" && item.path === "/") ||
          (location.pathname === "/dashboard" && item.path === "/");
        
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
            >
              <Link 
                to={item.path} 
                className={cn(
                  "flex items-center rounded-md transition-colors",
                  isActive 
                    ? "bg-[#1A1F2C] text-white font-medium" 
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 mr-2",
                  isActive ? "text-white" : "text-sidebar-foreground"
                )} />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}