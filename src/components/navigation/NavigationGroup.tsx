import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { NavigationMenu } from "./NavigationMenu";
import { LucideIcon } from "lucide-react";

interface NavigationItem {
  title: string;
  icon: LucideIcon;
  path: string;
}

interface NavigationGroupProps {
  label: string;
  items: NavigationItem[];
}

export function NavigationGroup({ label, items }: NavigationGroupProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <NavigationMenu items={items} />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}