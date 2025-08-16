import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { User as UserType } from "@shared/types";
import { 
  LayoutDashboard, 
  Users, 
  Bed, 
  Bell, 
  BarChart3, 
  FileText, 
  Hotel, 
  LogOut,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  hotelName?: string;
  pendingRequestsCount?: number;
}

export default function Sidebar({ hotelName = "Hotel", pendingRequestsCount = 0 }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth() as { user: UserType | undefined, isLoading: boolean, isAuthenticated: boolean };

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Rooms", href: "/rooms", icon: Bed },
    { name: "Service Requests", href: "/service-requests", icon: Bell, badge: pendingRequestsCount },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  return (
    <div className="bg-white w-64 min-h-screen shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Hotel className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">HotelAdmin</h1>
            <p className="text-sm text-gray-500" data-testid="text-hotel-name">{hotelName}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                      isActive
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                    {item.badge && item.badge > 0 && (
                      <span 
                        className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full"
                        data-testid={`badge-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback>
              <User className="w-5 h-5 text-gray-600" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900" data-testid="text-user-name">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.email || 'Hotel Owner'}
            </p>
            <p className="text-xs text-gray-500">Hotel Owner</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.location.href = '/logout.html';
            }}
            className="text-gray-400 hover:text-gray-600"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
