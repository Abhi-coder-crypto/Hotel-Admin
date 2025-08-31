import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/home";
import Services from "./pages/services";
import Contact from "./pages/contact";
import About from "./pages/about";
import GuestService from "./pages/guest-service";
import Dashboard from "./pages/dashboard";
import Customers from "./pages/customers";
import ServiceRequests from "./pages/service-requests";
import Rooms from "./pages/rooms";
import HotelSetup from "./pages/hotel-setup";
import Sidebar from "./components/sidebar";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/landing" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/service" component={GuestService} />
      <Route path="/contact" component={Contact} />
      <Route path="/about" component={About} />
      <Route path="/hotel-setup" component={HotelSetup} />
      <Route path="/">
        {() => (
          <div className="flex min-h-screen">
            <Sidebar />
            <Dashboard />
          </div>
        )}
      </Route>
      <Route path="/customers">
        {() => (
          <div className="flex min-h-screen">
            <Sidebar />
            <Customers />
          </div>
        )}
      </Route>
      <Route path="/service-requests">
        {() => (
          <div className="flex min-h-screen">
            <Sidebar />
            <ServiceRequests />
          </div>
        )}
      </Route>
      <Route path="/rooms">
        {() => (
          <div className="flex min-h-screen">
            <Sidebar />
            <Rooms />
          </div>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
