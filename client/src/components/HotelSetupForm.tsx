import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface HotelSetupFormProps {
  onComplete: () => void;
}

export default function HotelSetupForm({ onComplete }: HotelSetupFormProps) {
  const [formData, setFormData] = useState({
    hotelName: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    phone: "",
    email: "",
    hotelType: "",
    totalRooms: "",
    description: "",
    amenities: [] as string[],
    checkInTime: "14:00",
    checkOutTime: "11:00",
    starRating: "",
    website: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const availableAmenities = [
    "Free WiFi", "Swimming Pool", "Gym", "Spa", "Restaurant", 
    "Room Service", "Parking", "Business Center", "Conference Rooms",
    "Airport Shuttle", "Pet Friendly", "Laundry Service", "Concierge",
    "Bar/Lounge", "Tennis Court", "Golf Course"
  ];

  const hotelTypes = [
    "Budget Hotel", "Business Hotel", "Luxury Hotel", "Resort", 
    "Boutique Hotel", "Extended Stay", "Motel", "Bed & Breakfast", "Hostel"
  ];

  const setupMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/hotel/setup', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotel"] });
      toast({
        title: "Hotel Setup Complete!",
        description: "Your hotel details have been saved successfully.",
      });
      onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "An error occurred during setup",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.hotelName || !formData.address || !formData.totalRooms) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in hotel name, address, and total rooms.",
        variant: "destructive",
      });
      return;
    }

    setupMutation.mutate(formData);
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        amenities: prev.amenities.filter(a => a !== amenity)
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Complete Your Hotel Setup</CardTitle>
          <p className="text-gray-600 mt-2">
            Please provide detailed information about your hotel to get started
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hotelName">Hotel Name *</Label>
                  <Input
                    id="hotelName"
                    value={formData.hotelName}
                    onChange={(e) => setFormData(prev => ({ ...prev, hotelName: e.target.value }))}
                    placeholder="Enter your hotel name"
                    required
                    data-testid="input-hotel-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="hotelType">Hotel Type</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, hotelType: value }))}>
                    <SelectTrigger data-testid="select-hotel-type">
                      <SelectValue placeholder="Select hotel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {hotelTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalRooms">Total Rooms *</Label>
                  <Input
                    id="totalRooms"
                    type="number"
                    min="1"
                    value={formData.totalRooms}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalRooms: e.target.value }))}
                    placeholder="Number of rooms"
                    required
                    data-testid="input-total-rooms"
                  />
                </div>
                
                <div>
                  <Label htmlFor="starRating">Star Rating</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, starRating: value }))}>
                    <SelectTrigger data-testid="select-star-rating">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Star</SelectItem>
                      <SelectItem value="2">2 Star</SelectItem>
                      <SelectItem value="3">3 Star</SelectItem>
                      <SelectItem value="4">4 Star</SelectItem>
                      <SelectItem value="5">5 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
              
              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter complete hotel address"
                  required
                  data-testid="input-address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    data-testid="input-city"
                  />
                </div>
                
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                    data-testid="input-state"
                  />
                </div>
                
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    placeholder="Pincode"
                    data-testid="input-pincode"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Hotel phone number"
                    data-testid="input-phone"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Hotel email"
                    data-testid="input-email"
                  />
                </div>
              </div>
            </div>

            {/* Hotel Policies */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Hotel Policies</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkInTime">Check-in Time</Label>
                  <Input
                    id="checkInTime"
                    type="time"
                    value={formData.checkInTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkInTime: e.target.value }))}
                    data-testid="input-checkin-time"
                  />
                </div>
                
                <div>
                  <Label htmlFor="checkOutTime">Check-out Time</Label>
                  <Input
                    id="checkOutTime"
                    type="time"
                    value={formData.checkOutTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkOutTime: e.target.value }))}
                    data-testid="input-checkout-time"
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Hotel Amenities</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableAmenities.map(amenity => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                      data-testid={`checkbox-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                    <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
              
              <div>
                <Label htmlFor="description">Hotel Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your hotel, unique features, and what makes it special..."
                  rows={3}
                  data-testid="input-description"
                />
              </div>

              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourhotel.com"
                  data-testid="input-website"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={setupMutation.isPending}
              data-testid="button-complete-setup"
            >
              {setupMutation.isPending ? "Saving Hotel Details..." : "Complete Hotel Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}