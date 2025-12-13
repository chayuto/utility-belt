import * as LucideIcons from "lucide-react";
import { type LucideIcon, HelpCircle } from "lucide-react";

export function getIcon(iconName: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[iconName] || HelpCircle;
}
