import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  FileText, 
  Home, 
  PlusCircle, 
  Building2, 
  Settings,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      name: "My Documents",
      href: "/documents",
      icon: FileText,
    },
    {
      name: "Create Document",
      href: "/create-document",
      icon: PlusCircle,
    },
    {
      name: "Departments",
      href: "/departments",
      icon: Building2,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className={cn("hidden lg:flex lg:flex-col lg:w-64 border-r border-neutral-200 bg-white", className)}>
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="px-4">
          <h2 className="text-lg font-medium text-neutral-900">Main Menu</h2>
        </div>
        <nav className="mt-4 flex-1 px-2 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive(item.href)
                  ? "bg-primary-50 text-primary-700"
                  : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5",
                  isActive(item.href) ? "text-primary-500" : "text-neutral-400 group-hover:text-neutral-500"
                )}
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-neutral-200">
        <div className="bg-neutral-50 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-neutral-700">Need Help?</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Contact support for assistance with document tracking.
          </p>
          <Button className="mt-2 w-full" size="sm">
            <HelpCircle className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>
    </aside>
  );
}
