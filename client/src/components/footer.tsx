import { Hotel, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 mt-auto z-10 relative font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Hotel className="text-accent text-2xl mr-3" />
              <h3 className="text-xl font-bold font-serif">Grand Hotel</h3>
            </div>
            <p className="text-gray-300 font-serif">
              Experience luxury and comfort with our premium hotel services. Your satisfaction is our priority.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 font-serif">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 font-serif">
              <li>
                <Link 
                  href="/" 
                  className="hover:text-yellow-400 transition-colors"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/services" 
                  className="hover:text-yellow-400 transition-colors"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  Services
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="hover:text-yellow-400 transition-colors"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="hover:text-yellow-400 transition-colors"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 font-serif">Contact Info</h4>
            <div className="space-y-2 text-gray-300 font-serif">
              <p className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                +1 (555) 123-4567
              </p>
              <p className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                info@grandhotel.com
              </p>
              <p className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                123 Luxury Avenue, Hotel District
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300 font-serif">
          <p>&copy; 2024 Grand Hotel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
