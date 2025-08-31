import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ServiceRequestModal from "../components/service-request-modal";
import { useScrollAnimation } from "../hooks/use-scroll-animation";
import Header from "@/components/header";
import { 
  Utensils, 
  Fan, 
  Shirt, 
  Plane, 
  Bell, 
  Sparkles, 
  Dumbbell, 
  Waves, 
  Briefcase, 
  Wifi 
} from "lucide-react";

const services = [
  {
    id: "room-service",
    name: "Room Service",
    description: "Delicious meals delivered directly to your room, available 24/7.",
    icon: Utensils,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
  },
  {
    id: "housekeeping",
    name: "Housekeeping",
    description: "Professional room cleaning and maintenance services.",
    icon: Fan,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
  },
  {
    id: "laundry-service",
    name: "Laundry Service",
    description: "Professional cleaning and pressing of your garments.",
    icon: Shirt,
    image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
  },
  {
    id: "airport-shuttle",
    name: "Airport Shuttle",
    description: "Convenient transportation to and from the airport.",
    icon: Plane,
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
  },
  {
    id: "concierge",
    name: "Concierge",
    description: "Personal assistance for reservations and recommendations.",
    icon: Bell,
    image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
  },
  {
    id: "spa-wellness",
    name: "Spa & Wellness",
    description: "Rejuvenating spa treatments and wellness services.",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
  },
  {
    id: "gym",
    name: "Gym",
    description: "State-of-the-art fitness center with modern equipment.",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
  },
  {
    id: "swimming-pool",
    name: "Swimming Pool",
    description: "Refreshing pool area with poolside service available.",
    icon: Waves,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
  },
  {
    id: "business-center",
    name: "Business Center",
    description: "Fully equipped business facilities for your work needs.",
    icon: Briefcase,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
  },
  {
    id: "free-wifi",
    name: "Free Wi-Fi",
    description: "High-speed internet access throughout the hotel.",
    icon: Wifi,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
  }
];

function ServiceCard({ service, index, onServiceRequest }: { service: typeof services[0], index: number, onServiceRequest: (name: string) => void }) {
  const { ref, isVisible } = useScrollAnimation(0.1, '50px');
  const IconComponent = service.icon;
  
  const animationClasses = [
    'scroll-reveal-left',
    'scroll-reveal',
    'scroll-reveal-right',
    'scroll-reveal-scale'
  ];
  
  const animationClass = animationClasses[index % animationClasses.length];
  
  return (
    <div 
      ref={ref}
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-full flex flex-col ${animationClass} ${isVisible ? 'revealed' : ''}`}
      style={{ transitionDelay: `${(index % 4) * 150}ms` }}
    >
      <img 
        src={service.image} 
        alt={service.name} 
        className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 hover:scale-105"
      />
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <div className="flex items-center mb-3">
          <IconComponent className="text-primary text-lg sm:text-xl mr-2 sm:mr-3 animate-float flex-shrink-0" style={{animationDelay: `${index * 0.5}s`}} />
          <h3 className="text-lg sm:text-xl font-semibold leading-tight">{service.name}</h3>
        </div>
        <p className="text-gray-600 mb-4 flex-grow text-sm sm:text-base leading-relaxed">{service.description}</p>
        <Button 
          onClick={() => onServiceRequest(service.name)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 sm:px-5 rounded-lg transition-all duration-300 transform hover:scale-102 shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px]"
          data-testid={`button-request-${service.id}`}
        >
          <span className="text-sm sm:text-base">🛎️ Request Service</span>
        </Button>
      </div>
    </div>
  );
}

export default function Services() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestInfo, setGuestInfo] = useState<any>(null);
  const [roomNumber, setRoomNumber] = useState<string | null>(null);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation(0.2);

  useEffect(() => {
    // Get room number from URL (when QR code is scanned)
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get('room');
    
    if (room) {
      setRoomNumber(room);
      
      // Fetch guest information from hotel management system
      fetch(`https://your-hotel-domain.replit.app/api/public/guest/${room}`)
        .then(response => response.json())
        .then(data => {
          if (data.name) {
            setGuestInfo(data);
          }
        })
        .catch(error => {
          console.log('Could not fetch guest info:', error);
        });
    }
  }, []);

  const handleServiceRequest = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full overflow-x-hidden">
      <Header />
      <section className="py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative w-full">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div ref={headerRef} className={`text-center mb-8 sm:mb-12 scroll-reveal ${headerVisible ? 'revealed' : ''}`}>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">Hotel Services</h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Discover our comprehensive range of premium hotel services designed for your comfort and convenience.
            </p>
          </div>

          {/* Personalized Welcome Section */}
          {guestInfo && (
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6 mb-8 mx-4 sm:mx-0">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-emerald-800 mb-2">
                  🏨 Welcome {guestInfo.name}!
                </h2>
                <p className="text-emerald-700 text-lg">
                  Room {guestInfo.roomNumber} - {guestInfo.roomTypeName}
                </p>
                <p className="text-emerald-600 text-sm mt-1">
                  {guestInfo.hotelName}
                </p>
                <p className="text-emerald-600 text-sm mt-2">
                  ✨ Select any service below to place your request
                </p>
              </div>
            </div>
          )}

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {services.map((service, index) => (
              <ServiceCard 
                key={service.id}
                service={service}
                index={index}
                onServiceRequest={handleServiceRequest}
              />
            ))}
          </div>
        </div>
      </section>

      <ServiceRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedService={selectedService}
      />
    </div>
  );
}
