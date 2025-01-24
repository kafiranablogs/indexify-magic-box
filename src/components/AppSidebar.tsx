import { BarChart, Link, Upload, Settings, User, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import { NavigationGroup } from "./navigation/NavigationGroup";

const menuItems = [
  { title: "Dashboard", icon: BarChart, path: "/" },
  { title: "Single URL", icon: Link, path: "/single-url" },
  { title: "Bulk Upload", icon: Upload, path: "/bulk-upload" },
  { title: "Google Config", icon: Settings, path: "/google-config" },
  { title: "Teams", icon: Users, path: "/teams" },
  { title: "Profile", icon: User, path: "/profile" },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <NavigationGroup label="Menu" items={menuItems} />
      </SidebarContent>
    </Sidebar>
  );
}