import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Users, Crown, Home } from "lucide-react";
import { RoomType } from "@shared/types";

export default function Rooms() {
  const { data: roomTypes = [] } = useQuery<RoomType[]>({
    queryKey: ["/api/room-types"],
  });

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Room Management</h1>
        <p className="text-muted-foreground">
          Monitor room availability and types across your hotel
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roomTypes.map((roomType) => (
          <Card key={roomType.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getRoomIcon(roomType.type)}
                  <CardTitle className="text-lg">{roomType.name}</CardTitle>
                </div>
                <Badge className={getCategoryColor(roomType.category)}>
                  {roomType.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">₹{roomType.price.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">per night</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Availability</span>
                  <Badge className={getAvailabilityColor(roomType.availableRooms, roomType.totalRooms)}>
                    {roomType.availableRooms}/{roomType.totalRooms} available
                  </Badge>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
      </div>

      {roomTypes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Home className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Room Types Found</h3>
            <p className="text-muted-foreground text-center">
              Room types will be automatically created when you set up your hotel.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}