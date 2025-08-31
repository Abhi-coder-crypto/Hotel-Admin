import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Header from "@/components/header";
import { User, Calendar, MapPin, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";

type GuestInfo = {
  name: string;
  room_no: string;
  room_type: string;
  check_in: string;
  check_out?: string;
  hotel_id: string;
};

export default function GuestService() {
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [roomNumber, setRoomNumber] = useState<string | null>(null);
  const [request, setRequest] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get room number from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const room_no = urlParams.get('room_no');
    
    if (!room_no) {
      setError("Room number not provided");
      setLoading(false);
      return;
    }

    setRoomNumber(room_no);

    // Fetch guest information
    fetch(`/service?room_no=${room_no}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.guest) {
          setGuestInfo(data.guest);
        } else {
          setError(data.error || "Guest not found");
        }
      })
      .catch(error => {
        console.error("Error fetching guest info:", error);
        setError("Failed to load guest information");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!request.trim() || !guestInfo) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_no: guestInfo.room_no,
          guest_name: guestInfo.name,
          request: request.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setRequest("");
      } else {
        setError(data.error || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      setError("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading guest information...</p>
        </div>
      </div>
    );
  }

  if (error || !guestInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Guest Not Found</h2>
              <p className="text-gray-600 mb-4">
                {error || "No active guest found for this room."}
              </p>
              <Button onClick={() => window.location.href = "/"} variant="outline">
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h2>
              <p className="text-gray-600 mb-4">
                Your request was sent successfully. Our staff will respond soon.
              </p>
              <Button onClick={() => setSubmitted(false)} className="bg-green-600 hover:bg-green-700">
                Submit Another Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Welcome Section */}
        <Card className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <User className="mr-3" />
              Welcome, {guestInfo.name}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                <div>
                  <p className="font-semibold">Room {guestInfo.room_no}</p>
                  <p className="text-blue-100">{guestInfo.room_type}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                <div>
                  <p className="font-semibold">Check-in</p>
                  <p className="text-blue-100">
                    {new Date(guestInfo.check_in).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inquiry Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-3" />
              Submit a Request
            </CardTitle>
            <p className="text-gray-600">
              Need assistance? Send us a message and our staff will help you promptly.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="request">Your Request</Label>
                <Textarea
                  id="request"
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  placeholder="Please describe what you need assistance with..."
                  className="min-h-[120px] mt-2"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={submitting || !request.trim()}
              >
                {submitting ? "Sending..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}