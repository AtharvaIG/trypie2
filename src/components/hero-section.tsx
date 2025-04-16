
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Search } from "lucide-react";
import HeroCarousel from "./hero-carousel";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const HeroSection = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchDestination, setSearchDestination] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchDestination.trim()) {
      toast({
        title: "Please enter a destination",
        description: "Enter a location to explore travel options.",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to explore page with the search parameter for all users
    // Removed any authentication checks since the explore page can be accessed by everyone
    navigate(`/explore?destination=${encodeURIComponent(searchDestination.trim())}`);
  };

  return (
    <div className="relative">
      {/* Replace static background with dynamic carousel */}
      <HeroCarousel />
      
      {/* Search and CTA overlay */}
      <div className="container mx-auto px-4 relative z-10 -mt-40">
        <div className="max-w-3xl mx-auto">
          {/* Search bar placeholder */}
          <form onSubmit={handleSearch} className="bg-white rounded-lg p-2 flex items-center mb-8 shadow-lg animate-fade-in">
            <div className="flex-1 flex items-center px-3 py-2">
              <MapPin className="mr-2 text-trypie-600" size={20} />
              <input 
                type="text" 
                placeholder="Where would you like to go?" 
                className="w-full focus:outline-none text-gray-700"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                aria-label="Search destination"
              />
            </div>
            <Button 
              type="submit"
              className="bg-trypie-600 hover:bg-trypie-700 text-white rounded-md flex items-center px-5"
            >
              <Search size={18} className="mr-2" /> Explore
            </Button>
          </form>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-trypie-500 hover:bg-trypie-600 text-white font-medium shadow-md hover:shadow-lg transition-all px-8"
              asChild
            >
              <Link to="/plan-trip">
                Plan Your Trip
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-trypie-600 border-white text-white hover:bg-trypie-700 hover:border-trypie-400 shadow-md"
              asChild
            >
              <Link to="/explore">
                Discover Experiences
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
