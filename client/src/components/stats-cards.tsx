import { Card, CardContent } from "@/components/ui/card";
import { Users, Bed, Bell, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalCustomers: number;
    activeCustomers: number;
    pendingRequests: number;
    occupancyRate: number;
    totalRevenue: number;
  };
  totalRooms?: number;
}

export default function StatsCards({ stats, totalRooms = 20 }: StatsCardsProps) {
  // Only show growth indicators if we have meaningful historical data
  const showGrowthIndicators = stats.totalCustomers > 10; // Show growth only after some activity

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Customers */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Customers</p>
              <p 
                className="text-3xl font-bold text-gray-900"
                data-testid="stat-total-customers"
              >
                {stats.totalCustomers}
              </p>
              {showGrowthIndicators ? (
                <p className="text-sm text-gray-500 mt-2">
                  <span>Growth tracking available after more bookings</span>
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  <span>New hotel - building customer base</span>
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600 text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Occupied Rooms */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Occupied Rooms</p>
              <p 
                className="text-3xl font-bold text-gray-900"
                data-testid="stat-occupied-rooms"
              >
                {stats.activeCustomers}/{totalRooms}
              </p>
              <p className="text-sm text-amber-600 mt-2">
                <span data-testid="stat-occupancy-rate">{stats.occupancyRate}% occupancy rate</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Bed className="text-green-600 text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
              <p 
                className="text-3xl font-bold text-gray-900"
                data-testid="stat-pending-requests"
              >
                {stats.pendingRequests}
              </p>
              <p className="text-sm text-red-600 mt-2">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                <span>Requires attention</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Bell className="text-amber-600 text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p 
                className="text-3xl font-bold text-gray-900"
                data-testid="stat-total-revenue"
              >
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
              {showGrowthIndicators ? (
                <p className="text-sm text-gray-500 mt-2">
                  <span>Growth tracking available after more bookings</span>
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  <span>Revenue from {stats.totalCustomers} bookings</span>
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-yellow-600 text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
