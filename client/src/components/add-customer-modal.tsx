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

const formSchema = insertCustomerSchema.omit({ hotelId: true }).extend({
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
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/room-types"] });
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
    createCustomerMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md mx-4">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              onValueChange={(value) => setValue("roomTypeId", value)}
            >
              <SelectTrigger data-testid="select-room-type">
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((roomType: RoomType) => (
                  <SelectItem 
                    key={roomType.id} 
                    value={roomType.id}
                    disabled={roomType.availableRooms === 0}
                  >
                    <div className="flex flex-col">
                      <span>{roomType.name}</span>
                      <span className="text-xs text-gray-500">
                        ₹{roomType.price}/night • {roomType.availableRooms} available
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomTypeId && (
              <p className="text-sm text-red-500 mt-1">{errors.roomTypeId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                {...register("roomNumber")}
                placeholder="Room #"
                data-testid="input-room-number"
              />
              {errors.roomNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.roomNumber.message}</p>
              )}
            </div>
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

          <div className="flex space-x-4 pt-4">
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
              className="flex-1"
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
