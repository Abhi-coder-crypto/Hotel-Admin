import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { insertCustomerSchema, RoomType, Customer } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, QrCode, User, Phone, Mail, Bed, Calendar, Printer } from "lucide-react";
import { format } from "date-fns";

const formSchema = insertCustomerSchema.omit({ hotelId: true, roomTypeName: true, roomPrice: true }).extend({
  checkinTime: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddCustomerModal({ open, onOpenChange }: AddCustomerModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [successData, setSuccessData] = useState<Customer | null>(null);
  const [showSuccessPage, setShowSuccessPage] = useState(false);

  // Fetch room types
  const { data: roomTypes = [] } = useQuery<RoomType[]>({
    queryKey: ["/api/room-types"],
  });

  const { data: availableRooms = {} } = useQuery<{ [roomTypeId: string]: string[] }>({
    queryKey: ["/api/available-rooms"],
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkinTime: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)).toISOString().slice(0, 16),
      isActive: true,
      name: '',
      phone: '',
      email: '',
      roomTypeId: '',
      roomNumber: '',
      expectedStayDays: 1,
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Find the selected room type to get pricing info
      const selectedRoomType = roomTypes.find((rt: RoomType) => rt.id === data.roomTypeId);
      
      if (!selectedRoomType) {
        throw new Error("Please select a valid room type");
      }

      const customerData = {
        ...data,
        roomTypeName: selectedRoomType.name,
        roomPrice: selectedRoomType.price,
        checkinTime: data.checkinTime ? new Date(data.checkinTime) : new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)),
      };
      
      const response = await apiRequest("POST", "/api/customers", customerData);
      const result = await response.json();
      return result;
    },
    onSuccess: (data: Customer) => {
      setSuccessData(data);
      setShowSuccessPage(true);
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/room-types"] });
      queryClient.invalidateQueries({ queryKey: ["/api/available-rooms"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add customer",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // Basic validation
    if (!data.name || data.name.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Customer name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.phone || data.phone.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return;
    }

    // Enhanced phone number validation
    const phoneRegex = /^[+]?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number with country code (e.g., +91 9876543210)",
        variant: "destructive",
      });
      return;
    }

    // Email validation (if provided)
    if (data.email && data.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (!data.roomTypeId) {
      toast({
        title: "Validation Error",
        description: "Please select a room type",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.roomNumber) {
      toast({
        title: "Validation Error",
        description: "Please select a room number",
        variant: "destructive",
      });
      return;
    }
    
    createCustomerMutation.mutate(data);
  };

  const handleCloseModal = () => {
    setShowSuccessPage(false);
    setSuccessData(null);
    onOpenChange(false);
    reset();
  };

  const handlePrintQR = () => {
    if (successData?.qrCode) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - Room ${successData.roomNumber}</title>
              <style>
                body { text-align: center; font-family: Arial, sans-serif; margin: 40px; }
                .qr-container { border: 2px solid #ccc; padding: 20px; display: inline-block; }
                h2 { margin-bottom: 20px; }
                .guest-info { margin: 20px 0; }
              </style>
            </head>
            <body>
              <h2>Hotel Service QR Code</h2>
              <div class="guest-info">
                <p><strong>Guest:</strong> ${successData.name}</p>
                <p><strong>Room:</strong> ${successData.roomNumber}</p>
                <p><strong>Room Type:</strong> ${successData.roomTypeName}</p>
              </div>
              <div class="qr-container">
                <img src="${successData.qrCode}" alt="QR Code" style="max-width: 200px; height: auto;" />
              </div>
              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                Scan this QR code to access hotel services
              </p>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {showSuccessPage ? "Guest Added Successfully!" : "Add New Customer"}
          </DialogTitle>
        </DialogHeader>
        
        {showSuccessPage && successData ? (
          <div className="space-y-6 p-1">
            {/* Success Header */}
            <div className="flex items-center justify-center space-x-3 py-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-700">Guest Added Successfully!</h3>
                <p className="text-sm text-gray-600">QR code generated and ready for use</p>
              </div>
            </div>

            {/* Guest Details */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <User className="w-5 h-5" />
                  <span>Guest Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{successData.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bed className="w-4 h-4 text-gray-400" />
                    <span>Room {successData.roomNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{successData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{successData.roomTypeName}</Badge>
                  </div>
                  {successData.email && (
                    <div className="flex items-center space-x-2 md:col-span-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{successData.email}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 md:col-span-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Check-in: {format(new Date(successData.checkinTime!), "MMM dd, yyyy 'at' h:mm a")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Section */}
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <QrCode className="w-5 h-5" />
                  <span>Hotel Service QR Code</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {successData.qrCode && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                      <img 
                        src={successData.qrCode} 
                        alt="QR Code for Hotel Services" 
                        className="max-w-[200px] h-auto mx-auto"
                      />
                    </div>
                    <div className="text-sm text-gray-600 max-w-md">
                      <p className="font-medium mb-2">Instructions for Guest:</p>
                      <ul className="text-left space-y-1">
                        <li>• Scan this QR code with your phone camera</li>
                        <li>• Access hotel services instantly</li>
                        <li>• Request room service, maintenance, or concierge</li>
                      </ul>
                    </div>
                    <Button 
                      onClick={handlePrintQR} 
                      variant="outline" 
                      className="flex items-center space-x-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print QR Code</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowSuccessPage(false);
                  setSuccessData(null);
                  reset();
                }}
              >
                Add Another Guest
              </Button>
              <Button
                type="button"
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                onClick={handleCloseModal}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-1">
          <div>
            <Label htmlFor="name">Customer Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter customer name"
              data-testid="input-customer-name"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="Enter phone number with country code (e.g., +91 9876543210)"
              data-testid="input-customer-phone"
            />
            <p className="text-xs text-gray-500 mt-1">
              Include country code (e.g., +91 for India, +1 for US/Canada, +44 for UK)
            </p>
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter valid email address (e.g., guest@example.com)"
              data-testid="input-customer-email"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional - Valid email format required if provided
            </p>
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="roomTypeId">Room Type</Label>
            <Select
              value={watch("roomTypeId") || ""}
              onValueChange={(value) => {
                setValue("roomTypeId", value, { shouldValidate: true });
                setValue("roomNumber", "", { shouldValidate: true }); // Reset room number when room type changes
              }}
            >
              <SelectTrigger data-testid="select-room-type">
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((roomType: RoomType) => {
                  const availableCount = availableRooms[roomType.id]?.length || 0;
                  return (
                    <SelectItem 
                      key={roomType.id} 
                      value={roomType.id}
                      disabled={availableCount === 0}
                    >
                      <div className="flex flex-col">
                        <span>{roomType.name}</span>
                        <span className="text-xs text-gray-500">
                          ₹{roomType.price}/night • {availableCount} available
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.roomTypeId && (
              <p className="text-sm text-red-500 mt-1">{errors.roomTypeId.message}</p>
            )}
          </div>

          {watch("roomTypeId") && (
            <div>
              <Label htmlFor="roomNumber">Available Room Numbers</Label>
              <Select
                value={watch("roomNumber") || ""}
                onValueChange={(value) => setValue("roomNumber", value, { shouldValidate: true })}
              >
                <SelectTrigger data-testid="select-room-number">
                  <SelectValue placeholder="Select room number" />
                </SelectTrigger>
                <SelectContent>
                  {(availableRooms[watch("roomTypeId")] || []).map((roomNumber: string) => (
                    <SelectItem key={roomNumber} value={roomNumber}>
                      Room {roomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roomNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.roomNumber.message}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="expectedStayDays">Expected Stay (days)</Label>
            <Input
              id="expectedStayDays"
              type="number"
              {...register("expectedStayDays", { valueAsNumber: true })}
              placeholder="Days"
              data-testid="input-expected-stay"
            />
            {errors.expectedStayDays && (
              <p className="text-sm text-red-500 mt-1">{errors.expectedStayDays.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="checkinTime">Check-in Date & Time</Label>
            <Input
              id="checkinTime"
              type="datetime-local"
              {...register("checkinTime")}
              data-testid="input-checkin-time"
            />
            {errors.checkinTime && (
              <p className="text-sm text-red-500 mt-1">{errors.checkinTime.message}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              disabled={createCustomerMutation.isPending}
              data-testid="button-submit"
            >
              {createCustomerMutation.isPending ? "Adding..." : "Add Customer"}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
