import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Search, User, Phone, Mail, Bed, Calendar, MoreHorizontal, LogOut } from "lucide-react";
import { Customer } from "@shared/schema";
import { formatDistanceToNow, format } from "date-fns";
import AddCustomerModal from "@/components/add-customer-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Customers() {
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const checkoutMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const response = await apiRequest("PUT", `/api/customers/${customerId}`, {
        isActive: false,
        checkoutTime: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer checked out successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check out customer",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const activeCustomers = filteredCustomers.filter(customer => customer.isActive);
  const checkedOutCustomers = filteredCustomers.filter(customer => !customer.isActive);

  const calculateStayDuration = (checkinTime: string, checkoutTime?: string) => {
    const checkin = new Date(checkinTime);
    const checkout = checkoutTime ? new Date(checkoutTime) : new Date();
    const diffInMs = checkout.getTime() - checkin.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ${diffInHours}h`;
    }
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
            <p className="text-sm text-gray-500">Manage guest check-ins, check-outs, and stay information</p>
          </div>
          <Button 
            onClick={() => setShowAddCustomerModal(true)}
            className="flex items-center space-x-2"
            data-testid="button-add-customer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search customers by name, room, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-customers"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" data-testid="badge-total-customers">
                  Total: {customers.length}
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800" data-testid="badge-active-customers">
                  Active: {activeCustomers.length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Customers */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Active Guests</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {activeCustomers.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading customers...</div>
            ) : activeCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active customers found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Expected Stay</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeCustomers.map((customer) => (
                      <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                <User className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium" data-testid={`text-name-${customer.id}`}>
                                {customer.name}
                              </p>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Phone className="w-3 h-3" />
                                <span data-testid={`text-phone-${customer.id}`}>{customer.phone}</span>
                                {customer.email && (
                                  <>
                                    <Mail className="w-3 h-3 ml-2" />
                                    <span data-testid={`text-email-${customer.id}`}>{customer.email}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Bed className="w-4 h-4 text-gray-400" />
                            <span data-testid={`text-room-${customer.id}`}>{customer.roomNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm" data-testid={`text-checkin-date-${customer.id}`}>
                                {format(new Date(customer.checkinTime), "MMM dd, yyyy")}
                              </p>
                              <p className="text-xs text-gray-500" data-testid={`text-checkin-time-${customer.id}`}>
                                {format(new Date(customer.checkinTime), "h:mm a")}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-duration-${customer.id}`}>
                          {calculateStayDuration(customer.checkinTime)}
                        </TableCell>
                        <TableCell data-testid={`text-expected-stay-${customer.id}`}>
                          {customer.expectedStayDays ? `${customer.expectedStayDays} days` : "Not specified"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => checkoutMutation.mutate(customer.id)}
                            disabled={checkoutMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-checkout-${customer.id}`}
                          >
                            <LogOut className="w-4 h-4 mr-1" />
                            Check Out
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Check-outs */}
        {checkedOutCustomers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LogOut className="w-5 h-5" />
                <span>Recent Check-outs</span>
                <Badge variant="secondary">
                  {checkedOutCustomers.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Total Stay</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkedOutCustomers.slice(0, 10).map((customer) => (
                      <TableRow key={customer.id} data-testid={`row-checkout-${customer.id}`}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                <User className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-gray-500">{customer.phone}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{customer.roomNumber}</TableCell>
                        <TableCell>
                          {format(new Date(customer.checkinTime), "MMM dd, h:mm a")}
                        </TableCell>
                        <TableCell>
                          {customer.checkoutTime && format(new Date(customer.checkoutTime), "MMM dd, h:mm a")}
                        </TableCell>
                        <TableCell>
                          {calculateStayDuration(customer.checkinTime, customer.checkoutTime || undefined)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Add Customer Modal */}
      <AddCustomerModal 
        open={showAddCustomerModal} 
        onOpenChange={setShowAddCustomerModal} 
      />
    </div>
  );
}
