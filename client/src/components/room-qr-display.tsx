import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, QrCode, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RoomQRCode {
  roomNumber: string;
  roomType: string;
  qrCode: string;
  qrCodeUrl: string;
}

interface RoomQRDisplayProps {
  hotelId?: string;
}

export default function RoomQRDisplay({ hotelId }: RoomQRDisplayProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roomQRCodes = [], isLoading } = useQuery<RoomQRCode[]>({
    queryKey: ["/api/qr-codes", hotelId],
    queryFn: async () => {
      if (!hotelId) return [];
      const response = await fetch(`/api/qr-codes/${hotelId}`);
      if (!response.ok) throw new Error('Failed to fetch room QR codes');
      return response.json();
    },
    enabled: !!hotelId,
  });

  const regenerateQRMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/regenerate-all-qr-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        let errorMessage = 'Failed to regenerate QR codes';
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
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Regenerated QR codes for ${data.updatedCount} rooms to point to service app`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/qr-codes", hotelId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const downloadQRCode = (roomNumber: string, qrCode: string) => {
    try {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `room-${roomNumber}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: `QR code for Room ${roomNumber} downloaded`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent>
              <div className="w-full h-48 bg-gray-200 rounded mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-8 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (roomQRCodes.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">No Room QR Codes Generated</h3>
          <p className="text-gray-600 text-center max-w-md">
            Generate QR codes for your rooms so guests can easily access hotel services.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Room QR Codes</h3>
        <Button
          onClick={() => regenerateQRMutation.mutate()}
          disabled={regenerateQRMutation.isPending}
          className="flex items-center space-x-2"
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 ${regenerateQRMutation.isPending ? 'animate-spin' : ''}`} />
          <span>{regenerateQRMutation.isPending ? 'Updating...' : 'Update All QR Codes'}</span>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {roomQRCodes.map((room) => (
        <Card key={room.roomNumber} className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30 hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-purple-600" />
                <span>Room {room.roomNumber}</span>
              </CardTitle>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                {room.roomType}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg shadow-inner">
              <img 
                src={room.qrCode} 
                alt={`QR Code for Room ${room.roomNumber}`}
                className="w-48 h-48 object-contain"
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600 break-all">
                <strong>URL:</strong> {room.qrCodeUrl}
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 flex items-center space-x-2"
                onClick={() => downloadQRCode(room.roomNumber, room.qrCode)}
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 flex items-center space-x-2"
                onClick={() => window.open(room.qrCodeUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Test</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      </div>
    </div>
  );
}