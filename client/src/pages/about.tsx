import { Star, Users, Award, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Grand Hotel</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the story behind our commitment to exceptional hospitality and luxury service that has made Grand Hotel a premier destination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5 text-yellow-500" />
                Our Heritage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Since 1950, Grand Hotel has been synonymous with luxury, elegance, and impeccable service. Our rich heritage spans over seven decades of hospitality excellence.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-500" />
                Our Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our dedicated team of hospitality professionals is committed to ensuring every guest experiences the highest level of comfort and satisfaction.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-green-500" />
                Awards & Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Winner of multiple hospitality awards, including "Best Luxury Hotel" and "Excellence in Customer Service" for three consecutive years.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5 text-red-500" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To create unforgettable experiences through personalized service, luxurious accommodations, and attention to every detail that matters to our guests.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6">What Sets Us Apart</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <p className="text-gray-600">Luxury Rooms & Suites</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <p className="text-gray-600">Concierge Service</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">75+</div>
              <p className="text-gray-600">Years of Excellence</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}