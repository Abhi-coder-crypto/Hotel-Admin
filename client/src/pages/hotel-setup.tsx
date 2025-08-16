import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertHotelSchema } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Hotel } from "lucide-react";

const formSchema = insertHotelSchema;
type FormData = z.infer<typeof formSchema>;

export default function HotelSetup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalRooms: 50,
    },
  });

  const createHotelMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/hotel", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hotel setup completed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hotel"] });
      // Page will automatically redirect once hotel is created
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create hotel. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createHotelMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Hotel className="text-white text-2xl" />
          </div>
          <CardTitle className="text-2xl">Setup Your Hotel</CardTitle>
          <p className="text-gray-600">
            Let's get started by setting up your hotel information
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Hotel Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter your hotel name"
                data-testid="input-hotel-name"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder="Enter hotel address"
                data-testid="input-hotel-address"
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="Enter phone number"
                data-testid="input-hotel-phone"
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="totalRooms">Total Number of Rooms</Label>
              <Input
                id="totalRooms"
                type="number"
                {...register("totalRooms", { valueAsNumber: true })}
                placeholder="Number of rooms"
                data-testid="input-total-rooms"
              />
              {errors.totalRooms && (
                <p className="text-sm text-red-500 mt-1">{errors.totalRooms.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createHotelMutation.isPending}
              data-testid="button-create-hotel"
            >
              {createHotelMutation.isPending ? "Creating..." : "Create Hotel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}