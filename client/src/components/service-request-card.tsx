import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  Users, 
  Utensils, 
  Sparkles, 
  HeadphonesIcon, 
  MoreHorizontal 
} from "lucide-react";
import { ServiceRequest } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ServiceRequestCardProps {
  request: ServiceRequest;
}

const getRequestIcon = (type: string) => {
  switch (type) {
    case "maintenance":
      return Wrench;
    case "room_service":
      return Users;
    case "food_delivery":
      return Utensils;
    case "housekeeping":
      return Sparkles;
    case "concierge":
      return HeadphonesIcon;
    default:
      return MoreHorizontal;
  }
};

const getRequestIconColor = (type: string) => {
  switch (type) {
    case "maintenance":
      return "text-amber-600 bg-amber-100";
    case "room_service":
      return "text-blue-600 bg-blue-100";
    case "food_delivery":
      return "text-green-600 bg-green-100";
    case "housekeeping":
      return "text-purple-600 bg-purple-100";
    case "concierge":
      return "text-pink-600 bg-pink-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "assigned":
      return "bg-blue-100 text-blue-800";
    case "in_progress":
      return "bg-purple-100 text-purple-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function ServiceRequestCard({ request }: ServiceRequestCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const Icon = getRequestIcon(request.type);

  const updateRequestMutation = useMutation({
    mutationFn: async (data: { status?: string; assignedTo?: string }) => {
      const response = await apiRequest("PUT", `/api/service-requests/${request.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update service request",
        variant: "destructive",
      });
    },
  });

  const handleAssign = () => {
    // In a real app, this would open a modal to select service provider
    const serviceProvider = prompt("Enter service provider name:");
    if (serviceProvider) {
      updateRequestMutation.mutate({
        status: "assigned",
        assignedTo: serviceProvider,
      });
      toast({
        title: "Service Request Assigned",
        description: `Assigned to ${serviceProvider}`,
      });
    }
  };

  const handleComplete = () => {
    updateRequestMutation.mutate({
      status: "completed",
      completedAt: new Date().toISOString() as any,
    });
    toast({
      title: "Service Request Completed",
      description: "Request marked as completed",
    });
  };

  return (
    <Card className="hover:border-gray-300 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getRequestIconColor(request.type)}`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 
                className="text-sm font-semibold text-gray-900 capitalize"
                data-testid={`text-request-type-${request.id}`}
              >
                {request.type.replace('_', ' ')}
              </h4>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="secondary" 
                  className={getStatusColor(request.status)}
                  data-testid={`badge-status-${request.id}`}
                >
                  {request.status}
                </Badge>
                <span 
                  className="text-xs text-gray-500"
                  data-testid={`text-request-time-${request.id}`}
                >
                  {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            <p 
              className="text-sm text-gray-600 mb-3"
              data-testid={`text-request-description-${request.id}`}
            >
              {request.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>Room:</span>
                <span 
                  className="font-medium"
                  data-testid={`text-room-number-${request.id}`}
                >
                  {request.roomNumber}
                </span>
                {request.assignedTo && (
                  <>
                    <span>•</span>
                    <span data-testid={`text-assigned-to-${request.id}`}>
                      Assigned to {request.assignedTo}
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex space-x-2">
                {request.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAssign}
                    disabled={updateRequestMutation.isPending}
                    className="text-blue-500 hover:text-blue-600 text-xs"
                    data-testid={`button-assign-${request.id}`}
                  >
                    Assign
                  </Button>
                )}
                
                {(request.status === "pending" || request.status === "assigned" || request.status === "in_progress") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleComplete}
                    disabled={updateRequestMutation.isPending}
                    className="text-green-500 hover:text-green-600 text-xs"
                    data-testid={`button-complete-${request.id}`}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
