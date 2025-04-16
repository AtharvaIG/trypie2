import { useEffect, useState } from "react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Award, MapPin, Plus, Star, Users } from "lucide-react";
import ReviewCard from "@/components/review-card";
import TravelGroupCard from "@/components/travel-group-card";
import AIRecommendationCard from "@/components/ai-recommendation-card";
import { TravelGroup } from "@/types/travel-group-types";
import { useAuth } from "@/contexts/AuthContext";
import ReviewModal from "@/components/review-modal";
import { getUserReviews } from "@/services/review-service";
import { Review } from "@/types/review-types";
import { UserRewardsWidget } from "@/components/user-rewards-widget";

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  
  const [userData, setUserData] = useState({
    name: profile?.fullName || "Traveler",
    avatar: profile?.avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg",
    points: 820,
    level: "Explorer",
    reviewCount: 0,
    tripCount: 5,
  });

  useEffect(() => {
    if (profile) {
      setUserData(prevState => ({
        ...prevState,
        name: profile.fullName || "Traveler",
        avatar: profile.avatarUrl || prevState.avatar
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      const loadReviews = async () => {
        try {
          const reviews = await getUserReviews(user.id);
          setRecentReviews(reviews);
          setUserData(prevState => ({
            ...prevState,
            reviewCount: reviews.length
          }));
        } catch (error) {
          console.error("Error loading reviews:", error);
        }
      };
      
      loadReviews();
    }
  }, [user]);

  const upcomingTrips = [
    {
      id: "trip-1",
      title: "European Adventure",
      description: "Exploring the best of Europe",
      destination: "Paris, Rome, Barcelona",
      start_date: "2023-11-05T00:00:00Z",
      end_date: "2023-11-19T00:00:00Z",
      image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80",
      is_public: true,
      is_influencer_trip: false,
      creator_id: "user-1",
      created_at: "2023-10-01T00:00:00Z",
      capacity: 10,
      memberCount: 6,
      organizer: {
        id: "user-1",
        fullName: "Sarah Johnson",
        avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
        email: "sarah@example.com",
        createdAt: "2023-01-01T00:00:00Z"
      },
    } as TravelGroup,
  ];

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
  ];

  const formatReviewsForDisplay = (reviews: Review[]) => {
    return reviews.map(review => ({
      image: review.media_urls && review.media_urls.length > 0 
        ? review.media_urls[0] 
        : "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80",
      title: review.title,
      location: review.location || "Unknown Location",
      rating: review.rating,
      reviewText: review.description || "",
      username: userData.name,
      userAvatar: userData.avatar,
      date: new Date(review.created_at || "").toLocaleDateString(),
      likes: Math.floor(Math.random() * 30),
      comments: Math.floor(Math.random() * 10),
    }));
  };

  const handleReviewSuccess = async () => {
    if (user) {
      try {
        const reviews = await getUserReviews(user.id);
        setRecentReviews(reviews);
        setUserData(prevState => ({
          ...prevState,
          reviewCount: reviews.length
        }));
      } catch (error) {
        console.error("Error refreshing reviews:", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center">
                <img 
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-16 h-16 rounded-full mr-4 object-cover border-2 border-trypie-500"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userData.name}!</h1>
                  <div className="flex items-center mt-1">
                    <Award size={16} className="text-trypie-500 mr-1" />
                    <span className="text-sm text-gray-600">{userData.level} Level • {userData.points} Points</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link to="/explore">Explore Destinations</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/profile">View Profile</Link>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-trypie-600">{userData.reviewCount}</p>
                <p className="text-sm text-gray-600">Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-trypie-600">{userData.tripCount}</p>
                <p className="text-sm text-gray-600">Trips</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-trypie-600">{userData.points}</p>
                <p className="text-sm text-gray-600">Points</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-coral-500">{userData.level}</p>
                <p className="text-sm text-gray-600">Status</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Upcoming Trips</h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/groups">
                      <Plus size={16} className="mr-1" />
                      <span>Plan New Trip</span>
                    </Link>
                  </Button>
                </div>
                
                {upcomingTrips.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingTrips.map((trip, index) => (
                      <TravelGroupCard key={index} group={trip} onClick={() => {}} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You don't have any upcoming trips.</p>
                    <Button asChild>
                      <Link to="/groups">Join a Travel Group</Link>
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Recent Reviews</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsReviewModalOpen(true)}
                  >
                    Write Review
                  </Button>
                </div>
                
                {recentReviews.length > 0 ? (
                  <div className="space-y-4">
                    {formatReviewsForDisplay(recentReviews).map((review, index) => (
                      <ReviewCard key={index} {...review} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't written any reviews yet.</p>
                    <Button onClick={() => setIsReviewModalOpen(true)}>
                      Start Reviewing
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">For You</h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/explore">View All</Link>
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {recommendations.map((recommendation, index) => (
                    <AIRecommendationCard key={index} {...recommendation} />
                  ))}
                </div>
              </div>
              
              <UserRewardsWidget />
            </div>
          </div>
        </div>
      </main>
      
      <ReviewModal 
        open={isReviewModalOpen} 
        onOpenChange={setIsReviewModalOpen} 
        onSuccess={handleReviewSuccess}
      />
      
      <Footer />
    </div>
  );
};

export default Dashboard;
