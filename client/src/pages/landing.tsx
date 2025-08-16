import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hotel, Users, Bell, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
              <Hotel className="text-white text-2xl" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">HotelAdmin</h1>
          <p className="text-xl text-gray-600 mb-8">
            Complete hotel management solution for modern hospitality
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-login"
          >
            Login to Your Dashboard
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Customer Management</h3>
              <p className="text-gray-600 text-sm">
                Track check-ins, check-outs, and guest information seamlessly
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Bell className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Service Requests</h3>
              <p className="text-gray-600 text-sm">
                Handle guest requests and coordinate with service providers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">
                Get insights into occupancy rates and operational metrics
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Hotel className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Multi-Property</h3>
              <p className="text-gray-600 text-sm">
                Manage multiple hotels from a single dashboard
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose HotelAdmin?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Real-time Updates</h3>
              <p className="text-gray-600">
                Get instant notifications for new service requests and customer activities
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Secure & Reliable</h3>
              <p className="text-gray-600">
                Enterprise-grade security with reliable data storage and backup
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Easy to Use</h3>
              <p className="text-gray-600">
                Intuitive interface designed for busy hotel administrators
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
