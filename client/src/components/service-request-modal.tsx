import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Send, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const serviceRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  roomNumber: z.string().min(1, "Room number is required"),
  service: z.string().min(1, "Service is required"),
  notes: z.string().optional(),
});

type ServiceRequestForm = z.infer<typeof serviceRequestSchema>;

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: string;
}

export default function ServiceRequestModal({
  isOpen,
  onClose,
  selectedService,
}: ServiceRequestModalProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract room number from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const roomFromUrl = urlParams.get("room");
  const isRoomAutoFilled = Boolean(roomFromUrl);

  const form = useForm<ServiceRequestForm>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      name: "",
      roomNumber: roomFromUrl || "",
      service: selectedService,
      notes: "",
    },
  });

  // Update form when selectedService changes
  useEffect(() => {
    form.setValue("service", selectedService);
  }, [selectedService, form]);

  // Update room number when URL changes or modal opens
  useEffect(() => {
    if (roomFromUrl) {
      form.setValue("roomNumber", roomFromUrl);
    }
  }, [roomFromUrl, form, isOpen]);

  const submitServiceRequest = useMutation({
    mutationFn: async (data: ServiceRequestForm) => {
      return await apiRequest("POST", "/api/request-service", data);
    },
    onSuccess: () => {
      toast({
        title: "Service Request Submitted",
        description: "Your service request has been submitted successfully. Our staff will assist you shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit service request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ServiceRequestForm) => {
    submitServiceRequest.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full mx-4 sm:mx-auto bg-white shadow-2xl border-2 border-gray-200 rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center justify-between">
            <span className="text-primary">🛎️ Request Service</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2 text-sm sm:text-base">
            Fill out the form below to request hotel service. Our staff will assist you promptly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name *</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              {...form.register("name")}
              className="h-12 sm:h-11 border-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg text-base"
              data-testid="input-name"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Room Number Field */}
          <div className="space-y-2">
            <Label htmlFor="roomNumber" className="text-sm font-semibold text-gray-700">Room Number *</Label>
            <Input
              id="roomNumber"
              placeholder="Enter room number"
              {...form.register("roomNumber")}
              readOnly={isRoomAutoFilled}
              className={`h-12 sm:h-11 border-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg text-base ${isRoomAutoFilled ? "bg-gray-100" : ""}`}
              data-testid="input-room-number"
            />
            {isRoomAutoFilled && (
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <Info className="mr-1 h-3 w-3" />
                Room number auto-filled from QR code
              </p>
            )}
            {form.formState.errors.roomNumber && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.roomNumber.message}
              </p>
            )}
          </div>

          {/* Selected Service Field */}
          <div className="space-y-2">
            <Label htmlFor="service" className="text-sm font-semibold text-gray-700">Selected Service</Label>
            <Input
              id="service"
              {...form.register("service")}
              readOnly
              className="h-11 bg-primary/10 border-2 border-primary/30 text-primary font-medium rounded-lg"
              data-testid="input-service"
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Any special requests or additional information..."
              {...form.register("notes")}
              className="border-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg resize-none"
              data-testid="textarea-notes"
            />
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 border-2 border-gray-300 hover:bg-gray-50 font-semibold"
              disabled={submitServiceRequest.isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={submitServiceRequest.isPending}
              data-testid="button-submit"
            >
              {submitServiceRequest.isPending ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
