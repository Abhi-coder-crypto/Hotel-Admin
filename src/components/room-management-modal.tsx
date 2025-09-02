import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, QrCode } from "lucide-react";
import { RoomType } from "@shared/types";

interface RoomManagementModalProps {
  trigger?: React.ReactNode;
}

export default function RoomManagementModal({ trigger }: RoomManagementModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: "",
    roomTypeId: "",
    roomTypeName: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roomTypes = [] } = useQuery<RoomType[]>({
    queryKey: ["/api/room-types"],
  });

  const generateRoomQRMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/generate-room-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = "Failed to generate room QR code";
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room QR code generated successfully",
      });
      setOpen(false);
      setFormData({ roomNumber: "", roomTypeId: "", roomTypeName: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.roomNumber || !formData.roomTypeId || !formData.roomTypeName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    generateRoomQRMutation.mutate(formData);
  };

  const handleRoomTypeChange = (roomTypeId: string) => {
    const selectedRoomType = roomTypes.find(rt => rt.id === roomTypeId);
    setFormData({
      ...formData,
      roomTypeId,
      roomTypeName: selectedRoomType?.name || "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center space-x-2">
            <QrCode className="w-4 h-4" />
            <span>Generate Room QR Code</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>Generate Room QR Code</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input
              id="roomNumber"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              placeholder="Enter room number (e.g., 101, 205)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomType">Room Type</Label>
            <Select value={formData.roomTypeId} onValueChange={handleRoomTypeChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a room type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((roomType) => (
                  <SelectItem key={roomType.id} value={roomType.id}>
                    {roomType.name} - ₹{roomType.price}/night
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={generateRoomQRMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={generateRoomQRMutation.isPending}
              className="flex items-center space-x-2"
            >
              {generateRoomQRMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Generate QR Code</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}