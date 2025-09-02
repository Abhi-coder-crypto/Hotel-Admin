import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ServiceRequest } from "@shared/types";

interface AssignServiceModalProps {
  request: ServiceRequest;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssignServiceModal({ request, isOpen, onClose }: AssignServiceModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [assignedTo, setAssignedTo] = useState("");
  const [timeFrame, setTimeFrame] = useState("");

  const assignMutation = useMutation({
    mutationFn: async (data: { assignedTo: string; timeFrame: string }) => {
      // Create admin service record
      const adminServiceResponse = await apiRequest("POST", "/api/admin-services", {
        serviceRequestId: request.id,
        requestType: request.service || request.type || "Service Request",
        assignedTo: data.assignedTo,
        timeFrame: data.timeFrame,
        hotelId: request.hotelId,
        service: true
      });

      // Update service request status
      const updateResponse = await apiRequest("PUT", `/api/service-requests/${request.id}`, {
        status: "assigned",
        assignedTo: data.assignedTo,
        assignedBy: "admin",
        assignedAt: new Date(),
      });

      return { adminService: await adminServiceResponse.json(), serviceRequest: await updateResponse.json() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      toast({
        title: "Service Request Assigned",
        description: `Assigned to ${assignedTo} for ${timeFrame}`,
      });
      setAssignedTo("");
      setTimeFrame("");
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign service request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedTo.trim() || !timeFrame.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    assignMutation.mutate({ assignedTo: assignedTo.trim(), timeFrame: timeFrame.trim() });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Service Request</DialogTitle>
          <DialogDescription>
            Assign this service request to a staff member with a timeframe.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="requestType">Service Request</Label>
            <Input
              id="requestType"
              value={request.service || request.type || "Service Request"}
              disabled
              className="bg-gray-50"
              data-testid="input-request-type"
            />
          </div>
          
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={request.guestName || "Not specified"}
              disabled
              className="bg-gray-50"
              data-testid="input-customer-name"
            />
          </div>
          
          <div>
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input
              id="roomNumber"
              value={request.roomNumber}
              disabled
              className="bg-gray-50"
              data-testid="input-room-number"
            />
          </div>
          
          <div>
            <Label htmlFor="assignedTo">Assign to Person</Label>
            <Input
              id="assignedTo"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Enter staff member name"
              required
              data-testid="input-assigned-to"
            />
          </div>
          
          <div>
            <Label htmlFor="timeFrame">Time Frame</Label>
            <Input
              id="timeFrame"
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              placeholder="e.g., 30 minutes, 2 hours, by 3 PM"
              required
              data-testid="input-time-frame"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={assignMutation.isPending}
              data-testid="button-submit"
            >
              {assignMutation.isPending ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}