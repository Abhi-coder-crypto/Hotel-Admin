import { Link, useLocation } from "wouter";
import { Hotel, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const [location] = useLocation();

  const navigation = [
    { name: "Home", href: "/" },
  ];

  return (
    <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-gray-800 shadow-lg border-b-2 border-gray-200 relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }}></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center py-4 sm:py-6">
          <Link href="/" className="flex items-center group transition-all duration-300 hover:scale-105">
            <div className="relative">
              <Hotel className="text-2xl sm:text-3xl mr-2 sm:mr-3 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" style={{ filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.5))' }} />
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white group-hover:text-blue-300 transition-all duration-300">
                Grand Hotel
              </h1>
              <p className="text-xs text-gray-300 mt-1 font-medium tracking-wide hidden sm:block">LUXURY & COMFORT</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden sm:flex space-x-4 sm:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`transition-colors duration-200 font-bold text-sm sm:text-base ${
                  location === item.href
                    ? "text-white hover:text-blue-300"
                    : "text-white hover:text-blue-300"
                }`}
                onClick={() => {
                  // Scroll to top when navigating
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 100);
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden border-2 border-gray-300 bg-white/10 hover:bg-white/20 min-h-[44px] min-w-[44px]">
                <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="bg-white shadow-lg max-w-xs mx-auto h-fit p-4 rounded-b-lg border-x border-b">
              <div className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm py-2 px-3 rounded transition-colors ${
                      location === item.href
                        ? "text-blue-600 bg-blue-50 font-semibold"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50 font-medium"
                    }`}
                    onClick={() => {
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 100);
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
