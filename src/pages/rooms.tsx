import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bed, Users, Crown, Home, RefreshCw, QrCode } from "lucide-react";
import { RoomType } from "@shared/types";
import { useToast } from "@/hooks/use-toast";
import RoomManagementModal from "@/components/room-management-modal";
import RoomQRDisplay from "@/components/room-qr-display";
import { useAuth } from "@/hooks/useAuth";

export default function Rooms() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: roomTypes = [], isLoading, isFetching } = useQuery<RoomType[]>({
    queryKey: ["/api/room-types"],
  });

  const { data: hotel } = useQuery<{ id: string }>({
    queryKey: ["/api/hotel"],
    enabled: !!user,
  });

  const handleRefresh = async () => {
    try {
      // First recalculate room availability based on actual active customers
      const response = await fetch('/api/recalculate-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to recalculate room availability');
      }

      // Then invalidate all room-related queries to fetch fresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/room-types"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/available-rooms"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      
      toast({
        title: "Refreshed",
        description: "Room availability updated from database",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh room data",
        variant: "destructive",
      });
    }
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'single':
        return <Bed className="h-5 w-5" />;
      case 'double':
      case 'twin':
      case 'triple':
        return <Users className="h-5 w-5" />;
      case 'junior_suite':
      case 'executive_suite':
      case 'presidential_suite':
        return <Crown className="h-5 w-5" />;
      default:
        return <Home className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      case 'deluxe':
        return 'bg-purple-100 text-purple-800';
      case 'suite':
        return 'bg-gold-100 text-gold-800';
      case 'studio':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage === 0) return 'bg-red-100 text-red-800';
    if (percentage <= 20) return 'bg-orange-100 text-orange-800';
    if (percentage <= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-white to-purple-50/50 shadow-sm border-b border-gray-100 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Room Management</h2>
            <p className="text-sm text-gray-600 mt-1">Monitor room availability and types across your hotel</p>
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center space-x-2"
            data-testid="button-refresh-rooms"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50/30 to-purple-50/20">
        <Tabs defaultValue="room-types" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="room-types">Room Types</TabsTrigger>
              <TabsTrigger value="qr-codes">QR Codes</TabsTrigger>
            </TabsList>
            <RoomManagementModal />
          </div>

          <TabsContent value="room-types">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {roomTypes.map((roomType) => (
          <Card key={roomType.id} className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    {getRoomIcon(roomType.type)}
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-800">{roomType.name}</CardTitle>
                </div>
                <Badge className={getCategoryColor(roomType.category)}>
                  {roomType.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">₹{roomType.price.toLocaleString()}</span>
                <span className="text-sm font-medium text-gray-600">per night</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Availability</span>
                  <Badge className={`shadow-sm ${getAvailabilityColor(roomType.availableRooms, roomType.totalRooms)}`}>
                    {roomType.availableRooms}/{roomType.totalRooms} available
                  </Badge>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ 
                      width: `${(roomType.availableRooms / roomType.totalRooms) * 100}%` 
                    }}
                  />
                </div>
              </div>

              {roomType.amenities && roomType.amenities.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Amenities:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {roomType.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {roomType.description && (
                <p className="text-sm text-muted-foreground">
                  {roomType.description}
                </p>
              )}

              <div className="pt-2 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium capitalize">
                      {roomType.type.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className={`font-medium ${roomType.availableRooms > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {roomType.availableRooms > 0 ? 'Available' : 'Fully Booked'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
              ))}
              
              {roomTypes.length === 0 && (
                <div className="col-span-full">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                        <Home className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-800">No Room Types Found</h3>
                      <p className="text-gray-600 text-center max-w-md">
                        Room types will be automatically created when you set up your hotel.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="qr-codes">
            <RoomQRDisplay hotelId={hotel?.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}