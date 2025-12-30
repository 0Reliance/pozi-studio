import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  FolderOpen,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  Settings,
  Video,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/creator",
    icon: Home,
  },
  {
    title: "Learning Paths",
    href: "/creator/paths",
    icon: FolderOpen,
  },
  {
    title: "Media Library",
    href: "/creator/media",
    icon: Image,
  },
  {
    title: "Video Intelligence",
    href: "/creator/video-intelligence",
    icon: Video,
  },
  {
    title: "Analytics",
    href: "/creator/analytics",
    icon: LayoutDashboard,
  },
  {
    title: "Settings",
    href: "/creator/settings",
    icon: Settings,
  },
];

export default function CreatorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [location] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/creator">
            <div className="flex items-center gap-2 cursor-pointer">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">POZI STUDIO</h1>
                <p className="text-xs text-muted-foreground">Creator Portal</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || location.startsWith(item.href + "/");
              
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.title}
                  </a>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Menu */}
        <div className="p-4 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 h-auto"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl || undefined} />
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || ""}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/creator/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
