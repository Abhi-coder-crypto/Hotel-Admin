import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  Bed, 
  Users, 
  Clock, 
  TrendingUp, 
  Award, 
  Activity,
  DollarSign,
  BarChart3
} from "lucide-react";

export default function Reports() {
  // Fetch analytics data
  const { data: roomAnalytics, isLoading: roomLoading } = useQuery({
    queryKey: ["/api/analytics/rooms"],
  });

  const { data: serviceAnalytics, isLoading: serviceLoading } = useQuery({
    queryKey: ["/api/analytics/services"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (roomLoading || serviceLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-white to-blue-50/50 shadow-sm border-b border-gray-100 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Reports & Analytics
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive insights into your hotel operations
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
              Live Data
            </Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50/30 to-blue-50/20">
        <Tabs defaultValue="rooms" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg border-0 h-14">
            <TabsTrigger value="rooms" className="flex items-center space-x-2">
              <Bed className="w-4 h-4" />
              <span>Room Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Service Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
          </TabsList>

          {/* Room Analytics Tab */}
          <TabsContent value="rooms" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Most Booked Room Types */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span>Most Booked Room Types</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={roomAnalytics?.mostBookedRoomTypes || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="roomType" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Room Occupancy Rates */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bed className="w-5 h-5 text-green-600" />
                    <span>Room Occupancy Rates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roomAnalytics?.occupancyByRoomType?.map((room, index) => (
                      <div key={room.roomType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{room.roomType}</p>
                          <p className="text-sm text-gray-600">
                            {room.occupiedRooms}/{room.totalRooms} rooms occupied
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={room.occupancyRate > 75 ? "default" : room.occupancyRate > 50 ? "secondary" : "outline"}
                          >
                            {room.occupancyRate}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue by Room Type */}
              <Card className="border-0 shadow-lg lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                    <span>Revenue by Room Type</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={roomAnalytics?.revenueByRoomType || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="roomType" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Service Analytics Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular Services */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <span>Popular Services</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={serviceAnalytics?.popularServices || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ serviceType, count }) => `${serviceType}: ${count}`}
                      >
                        {serviceAnalytics?.popularServices?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Staff Performance */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-orange-600" />
                    <span>Staff Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serviceAnalytics?.staffPerformance?.map((staff, index) => (
                      <div key={staff.staffMember} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{staff.staffMember}</p>
                          <p className="text-sm text-gray-600">
                            {staff.completedRequests}/{staff.assignedRequests} completed
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            {staff.avgTimeFrame}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Service Status Breakdown */}
              <Card className="border-0 shadow-lg lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <span>Service Request Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {serviceAnalytics?.serviceStatusBreakdown?.map((status, index) => (
                      <div key={status.status} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                        <p className="text-sm font-medium capitalize">{status.status}</p>
                        <p className="text-xs text-gray-500">{status.percentage}%</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Key Metrics */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.totalCustomers || 0}</p>
                      <p className="text-sm text-gray-500 mt-2">All time</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Occupancy Rate</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.occupancyRate || 0}%</p>
                      <p className="text-sm text-gray-500 mt-2">Current</p>
                    </div>
                    <Bed className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">₹{stats?.totalRevenue?.toLocaleString() || 0}</p>
                      <p className="text-sm text-gray-500 mt-2">All bookings</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.pendingRequests || 0}</p>
                      <p className="text-sm text-gray-500 mt-2">Need attention</p>
                    </div>
                    <Clock className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue and Booking Trends */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Top Performing Room Types</h4>
                    <div className="space-y-3">
                      {roomAnalytics?.mostBookedRoomTypes?.slice(0, 3).map((room, index) => (
                        <div key={room.roomType} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <span className="font-medium">{room.roomType}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{room.bookings} bookings</p>
                            <p className="text-sm text-gray-600">₹{room.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Service Request Summary</h4>
                    <div className="space-y-3">
                      {serviceAnalytics?.popularServices?.slice(0, 3).map((service, index) => (
                        <div key={service.serviceType} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <span className="font-medium capitalize">{service.serviceType.replace('_', ' ')}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{service.count} requests</p>
                            <p className="text-sm text-gray-600">{service.completionRate}% completed</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}