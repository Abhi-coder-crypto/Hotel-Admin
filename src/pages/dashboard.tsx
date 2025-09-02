import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Bell, CalendarCheck, ThumbsUp, Clock, User } from "lucide-react";
import StatsCards from "@/components/stats-cards";
import AddCustomerModal from "@/components/add-customer-modal";
import ServiceRequestCard from "@/components/service-request-card";
import { Customer, ServiceRequest, Hotel } from "@shared/types";
import { formatDistanceToNow } from "date-fns";

interface HotelStats {
  totalCustomers: number;
  activeCustomers: number;
  pendingRequests: number;
  occupancyRate: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [, setLocation] = useLocation();

  // Fetch data
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: serviceRequests = [] } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/service-requests"],
  });

  const { data: stats } = useQuery<HotelStats>({
    queryKey: ["/api/analytics/stats"],
  });

  const { data: hotel } = useQuery<Hotel>({
    queryKey: ["/api/hotel"],
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (hotel?.id) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'join_hotel', hotelId: hotel.id }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Handle real-time updates here
        // For now, we'll just log them
        console.log('Real-time update:', data);
      };

      setSocket(ws);

      return () => {
        ws.close();
      };
    }
  }, [hotel?.id]);

  const recentCustomers = customers.filter(customer => customer.isActive).slice(0, 3);
  const pendingRequests = serviceRequests.filter(req => req.status === "pending").slice(0, 3);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-white to-blue-50/50 shadow-sm border-b border-gray-100 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">Welcome back! Here's what's happening at your hotel today</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="text-xl" />
              {(stats?.pendingRequests || 0) > 0 && (
                <span 
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                  data-testid="badge-notifications"
                >
                  {stats?.pendingRequests || 0}
                </span>
              )}
            </Button>
            
            {/* Add Customer Button */}
            <Button 
              onClick={() => setShowAddCustomerModal(true)}
              className="flex items-center space-x-2"
              data-testid="button-add-customer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50/30 to-blue-50/20">
        {/* Stats Cards */}
        {stats && (
          <div className="mb-8">
            <StatsCards 
              stats={stats} 
              totalRooms={hotel?.totalRooms || 20} 
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Customers */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span>Recent Check-ins</span>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => setLocation("/customers")}
                data-testid="button-view-all-customers"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCustomers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent check-ins</p>
                ) : (
                  recentCustomers.map((customer) => (
                    <div 
                      key={customer.id} 
                      className="flex items-center space-x-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/50 hover:bg-white/80 hover:shadow-md transition-all duration-200 cursor-pointer"
                      data-testid={`customer-row-${customer.id}`}
                    >
                      <Avatar>
                        <AvatarFallback>
                          <User className="w-5 h-5 text-gray-600" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p 
                              className="font-medium text-gray-900"
                              data-testid={`text-customer-name-${customer.id}`}
                            >
                              {customer.name}
                            </p>
                            <p 
                              className="text-sm text-gray-500"
                              data-testid={`text-customer-phone-${customer.id}`}
                            >
                              {customer.phone}
                            </p>
                          </div>
                          <div className="text-right">
                            <p 
                              className="text-sm font-medium"
                              data-testid={`text-room-${customer.id}`}
                            >
                              Room {customer.roomNumber}
                            </p>
                            <p 
                              className="text-xs text-gray-500"
                              data-testid={`text-checkin-time-${customer.id}`}
                            >
                              {formatDistanceToNow(new Date(customer.checkinTime), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
                        Active
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Requests */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/30 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <span>Pending Service Requests</span>
              </CardTitle>
              <Badge 
                className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm"
                data-testid="badge-pending-count"
              >
                {stats?.pendingRequests || 0} Pending
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {pendingRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending requests</p>
                ) : (
                  pendingRequests.map((request) => (
                    <ServiceRequestCard key={request.id} request={request} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>


      </main>

      {/* Add Customer Modal */}
      <AddCustomerModal 
        open={showAddCustomerModal} 
        onOpenChange={setShowAddCustomerModal} 
      />
    </div>
  );
}
