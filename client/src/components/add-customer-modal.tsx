import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { insertCustomerSchema, RoomType } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/room-types"] });
      queryClient.invalidateQueries({ queryKey: ["/api/available-rooms"] });
      onOpenChange(false);
      reset();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        
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
              placeholder="Enter phone number"
              data-testid="input-customer-phone"
            />
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
              placeholder="Enter email address"
              data-testid="input-customer-email"
            />
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
      </DialogContent>
    </Dialog>
  );
}
