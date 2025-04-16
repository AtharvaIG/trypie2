import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import HeroSection from "@/components/hero-section";
import FeatureSection from "@/components/feature-section";
import ReviewCard from "@/components/review-card";
import TravelGroupCard from "@/components/travel-group-card";
import AIRecommendationCard from "@/components/ai-recommendation-card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TravelGroup } from "@/types/travel-group-types";
import { MapPin, Calendar, Users, Globe } from "lucide-react";

const Index = () => {
  // Sample data for the review cards
  const reviews = [
    {
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80",
      title: "Amazing Mountain Retreat",
      location: "Swiss Alps, Switzerland",
      rating: 4.8,
      reviewText: "The views were absolutely breathtaking and the cabin was perfect. Would definitely recommend for a peaceful getaway!",
      username: "Alex Morgan",
      userAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
      date: "2 days ago",
      likes: 24,
      comments: 5,
    },
    {
      image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80",
      title: "Unforgettable Beach Experience",
      location: "Bali, Indonesia",
      rating: 4.6,
      reviewText: "Crystal clear water, pristine beaches, and incredibly friendly locals. This place exceeded all my expectations!",
      username: "James Wilson",
      userAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
      date: "1 week ago",
      likes: 56,
      comments: 12,
    },
    {
      image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&q=80",
      title: "Hiking Paradise",
      location: "Yosemite, USA",
      rating: 4.9,
      reviewText: "The trails were challenging but rewarding. Saw some of the most beautiful landscapes I've ever encountered.",
      username: "Lisa Chen",
      userAvatar: "https://randomuser.me/api/portraits/women/63.jpg",
      date: "3 days ago",
      likes: 41,
      comments: 8,
    },
  ];

  // Sample data for travel groups
  const travelGroups: TravelGroup[] = [
    {
      id: "1",
      title: "Autumn in Japan",
      destination: "Tokyo & Kyoto, Japan",
      start_date: "2023-10-15",
      end_date: "2023-10-28",
      image_url: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&q=80",
      capacity: 12,
      memberCount: 8,
      is_public: true,
      is_influencer_trip: true,
      creator_id: "user-1",
      created_at: "2023-09-01",
      organizer: {
        id: "user-1",
        fullName: "Emma Thompson",
        avatarUrl: "https://randomuser.me/api/portraits/women/12.jpg",
        email: "emma@example.com",
        createdAt: "2023-01-01",
      }
    },
    {
      id: "2",
      title: "European Adventure",
      destination: "Paris, Rome, Barcelona",
      start_date: "2023-11-05",
      end_date: "2023-11-19",
      image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80",
      capacity: 10,
      memberCount: 6,
      is_public: true,
      is_influencer_trip: false,
      creator_id: "user-2",
      created_at: "2023-09-15",
      organizer: {
        id: "user-2",
        fullName: "Michael Scott", 
        avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg",
        email: "michael@example.com",
        createdAt: "2023-01-01",
      }
    },
  ];

  // Sample data for AI recommendations
  const recommendations = [
    {
      image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80",
      title: "Hidden Valley Resort",
      location: "New Zealand",
      rating: 4.7,
      description: "Based on your love for nature and hiking, this secluded resort offers stunning mountain views and direct access to hiking trails.",
      matchPercentage: 95,
      tags: ["Nature", "Hiking", "Peaceful", "Luxury"],
    },
    {
      image: "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?auto=format&fit=crop&q=80",
      title: "Coastal Village Experience",
      location: "Portugal",
      rating: 4.5,
      description: "This authentic fishing village matches your interest in local cultures and coastal activities.",
      matchPercentage: 88,
      tags: ["Cultural", "Beach", "Authentic", "Food"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Carousel - Replaced 3D airplane section */}
        <HeroSection />
        
        {/* Stats Section */}
        <section className="py-10 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4">
                <p className="text-3xl font-bold text-trypie-600 mb-1">10K+</p>
                <p className="text-gray-600 text-sm flex items-center justify-center"><Globe className="mr-1 h-4 w-4" /> Destinations</p>
              </div>
              <div className="p-4">
                <p className="text-3xl font-bold text-trypie-600 mb-1">50K+</p>
                <p className="text-gray-600 text-sm flex items-center justify-center"><Users className="mr-1 h-4 w-4" /> Happy Travelers</p>
              </div>
              <div className="p-4">
                <p className="text-3xl font-bold text-trypie-600 mb-1">250+</p>
                <p className="text-gray-600 text-sm flex items-center justify-center"><Calendar className="mr-1 h-4 w-4" /> Trips Daily</p>
              </div>
              <div className="p-4">
                <p className="text-3xl font-bold text-trypie-600 mb-1">1.2M+</p>
                <p className="text-gray-600 text-sm flex items-center justify-center"><MapPin className="mr-1 h-4 w-4" /> Local Experiences</p>
              </div>
            </div>
          </div>
        </section>
        
        <FeatureSection />
        
        {/* Trending Destinations */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex justify-between items-center mb-10">
              <div>
                <span className="text-trypie-600 font-medium mb-2 block">POPULAR DESTINATIONS</span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Trending Getaways
                </h2>
              </div>
              <Button variant="outline" asChild className="border-trypie-500 text-trypie-600">
                <Link to="/explore">Explore All Destinations</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[
                { name: "Santorini", country: "Greece", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80" },
                { name: "Kyoto", country: "Japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80" },
                { name: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80" },
                { name: "Amalfi", country: "Italy", image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80" },
              ].map((destination, index) => (
                <div key={index} className="relative group overflow-hidden rounded-xl">
                  <div className="aspect-[4/5] w-full">
                    <img 
                      src={destination.image} 
                      alt={destination.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-lg">{destination.name}</h3>
                    <p className="text-sm flex items-center"><MapPin className="mr-1 h-3 w-3" /> {destination.country}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Latest Reviews Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex justify-between items-center mb-10">
              <div>
                <span className="text-trypie-600 font-medium mb-2 block">TRAVELER EXPERIENCES</span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Latest Travel Stories
                </h2>
              </div>
              <Button variant="outline" asChild>
                <Link to="/explore">View All Stories</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <ReviewCard key={index} {...review} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Travel Groups Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex justify-between items-center mb-10">
              <div>
                <span className="text-trypie-600 font-medium mb-2 block">EXPLORE TOGETHER</span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Popular Group Trips
                </h2>
              </div>
              <Button variant="outline" asChild>
                <Link to="/groups">Browse All Trips</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {travelGroups.map((group, index) => (
                <TravelGroupCard key={index} group={group} />
              ))}
            </div>
          </div>
        </section>
        
        {/* AI Recommendations Section */}
        <section className="py-16 bg-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-trypie-50 to-white/0 pointer-events-none"></div>
          <div className="absolute left-0 bottom-0 w-1/2 h-1/2 bg-gradient-to-t from-trypie-50/30 to-white/0 pointer-events-none"></div>
          
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-trypie-600 font-medium mb-2 block">AI-POWERED INSPIRATION</span>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                Personalized For You
              </h2>
              <p className="text-gray-600">
                Our AI learns your preferences to suggest destinations and experiences that match your travel style perfectly.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {recommendations.map((recommendation, index) => (
                <AIRecommendationCard key={index} {...recommendation} />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button asChild className="bg-trypie-600 hover:bg-trypie-700 text-white px-8 py-6 text-lg">
                <Link to="/explore">Find Your Perfect Trip</Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* App Promotion */}
        <section className="py-16 bg-gradient-to-r from-trypie-600 to-trypie-700 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Take Trypie With You
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-lg">
                  Download our app for on-the-go travel planning, real-time updates, and access to your trips even when offline.
                </p>
                <div className="flex flex-wrap gap-4">
                  <img src="https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&q=80&w=160" alt="App Store" className="h-12 w-auto hover:opacity-90 transition-opacity cursor-pointer" />
                  <img src="https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&q=80&w=160" alt="Google Play" className="h-12 w-auto hover:opacity-90 transition-opacity cursor-pointer" />
                </div>
              </div>
              <div className="md:w-5/12">
                <img 
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=500" 
                  alt="Mobile App" 
                  className="w-full max-w-xs mx-auto rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24 bg-white text-center">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 max-w-3xl mx-auto">
              Ready to Transform Your Travel Experience?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join our community of travel enthusiasts and start planning your next unforgettable journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-trypie-600 hover:bg-trypie-700 text-white px-8 py-6 text-lg"
                asChild
              >
                <Link to="/signup">Start Planning For Free</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-trypie-600 text-trypie-700 hover:bg-trypie-50 px-8 py-6 text-lg"
                asChild
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
