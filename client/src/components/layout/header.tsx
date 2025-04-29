import { Bell, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface HeaderProps {
  notifications?: number;
}

export function Header({ notifications = 0 }: HeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // logout function in useAuth now redirects to /auth
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Get user data from auth context
  const userName = user?.name || "User";
  const userInitials = userName
    .split(" ")
    .map(name => name[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                <path d="M7 12h2v5H7zm4-7h2v12h-2zm4 4h2v8h-2z"/>
              </svg>
              <span className="ml-2 text-xl font-semibold">DocTrack</span>
            </div>
            
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link href="/" className="border-b-2 border-primary text-primary px-1 pt-1 font-medium text-sm">
                Dashboard
              </Link>
              <Link href="/documents" className="border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 px-1 pt-1 font-medium text-sm">
                Documents
              </Link>
              <Link href="/departments" className="border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 px-1 pt-1 font-medium text-sm">
                Departments
              </Link>
              <Link href="/analytics" className="border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 px-1 pt-1 font-medium text-sm">
                Analytics
              </Link>
              <Link href="/settings" className="border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 px-1 pt-1 font-medium text-sm">
                Settings
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center">
            <Dialog open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 relative">
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-xs text-white flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Notifications</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  {notifications > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-2 rounded-md hover:bg-slate-50">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                          <Bell size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Document requires your review</p>
                          <p className="text-xs text-muted-foreground">Lab Results - Patient #4285</p>
                          <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-2 rounded-md hover:bg-slate-50">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                          <Bell size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Document workflow completed</p>
                          <p className="text-xs text-muted-foreground">Medication Order Form</p>
                          <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">No new notifications</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="ml-3 flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                      <span>{userInitials}</span>
                    </div>
                    <span className="ml-2 text-sm font-medium text-neutral-700 hidden md:block">
                      {userName}
                    </span>
                    <ChevronDown className="ml-1 h-4 w-4 text-neutral-400 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
