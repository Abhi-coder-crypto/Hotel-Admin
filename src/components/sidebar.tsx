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
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  return (
    <div className="bg-gradient-to-b from-white to-gray-50/50 w-64 min-h-screen shadow-xl border-r border-gray-100 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Hotel className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">HotelAdmin</h1>
            <p className="text-sm text-gray-600" data-testid="text-hotel-name">{hotelName}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:shadow-md"
                    )}
                    data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                    {item.badge && item.badge > 0 && (
                      <span 
                        className="ml-auto bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-full shadow-sm animate-pulse"
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
      <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/50 hover:bg-white/80 transition-all duration-200">
          <Avatar className="w-11 h-11 shadow-md">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900" data-testid="text-user-name">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.email || 'Hotel Owner'}
            </p>
            <p className="text-xs text-gray-600">Hotel Owner</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.location.href = '/logout.html';
            }}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
