import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Bell, CalendarCheck, ThumbsUp, Clock, User } from "lucide-react";
import AddCustomerModal from "@/components/add-customer-modal";
import ServiceRequestCard from "@/components/service-request-card";
import { Customer, ServiceRequest, Hotel } from "@shared/types";
import { formatDistanceToNow } from "date-fns";

interface HotelStats {
  pendingRequests: number;
}

export default function Dashboard() {
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Fetch data
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: serviceRequests = [] } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/service-requests"],
  });

  const { data: stats } = useQuery<{ pendingRequests: number }>({
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

  const recentCustomers = customers.slice(0, 3);
  const pendingRequests = serviceRequests.filter(req => req.status === "pending").slice(0, 3);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-500">Welcome back, manage your hotel operations</p>
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
      <main className="flex-1 overflow-y-auto p-6">


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Customers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Check-ins</CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
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
                      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50"
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
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pending Service Requests</CardTitle>
              <Badge 
                variant="secondary" 
                className="bg-red-100 text-red-800"
                data-testid="badge-pending-count"
              >
                {stats?.pendingRequests || 0} Pending
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
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

        {/* Quick Analytics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CalendarCheck className="text-blue-600 text-xl" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">3.2 days</h4>
                <p className="text-sm text-gray-600">Average Stay Duration</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ThumbsUp className="text-green-600 text-xl" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">94%</h4>
                <p className="text-sm text-gray-600">Customer Satisfaction</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="text-amber-600 text-xl" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">12 min</h4>
                <p className="text-sm text-gray-600">Avg Service Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add Customer Modal */}
      <AddCustomerModal 
        open={showAddCustomerModal} 
        onOpenChange={setShowAddCustomerModal} 
      />
    </div>
  );
}
