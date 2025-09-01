import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import Rooms from "@/pages/rooms";
import ServiceRequests from "@/pages/service-requests";
import Reports from "@/pages/reports";
import HotelSetup from "@/pages/hotel-setup";
import Sidebar from "@/components/sidebar";
import NotFound from "@/pages/not-found";
import { useQuery } from "@tanstack/react-query";
import { Hotel } from "@shared/types";

interface HotelStats {
  totalCustomers: number;
  activeCustomers: number;
  pendingRequests: number;
  occupancyRate: number;
  totalRevenue: number;
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  const { data: hotel } = useQuery<Hotel>({
    queryKey: ["/api/hotel"],
    enabled: isAuthenticated,
  });

  const { data: stats } = useQuery<HotelStats>({
    queryKey: ["/api/analytics/stats"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  // Show hotel setup if user doesn't have a hotel yet
  if (isAuthenticated && hotel === null) {
    return <HotelSetup />;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar 
        hotelName={hotel?.name || "Hotel"} 
        pendingRequestsCount={stats?.pendingRequests || 0}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/customers" component={Customers} />
          <Route path="/service-requests" component={ServiceRequests} />
          <Route path="/rooms" component={Rooms} />
          <Route path="/reports" component={Reports} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
