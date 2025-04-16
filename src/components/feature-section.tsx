
import { MapPin, Star, Search, Users, Calendar, Compass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: <Star className="h-10 w-10 text-coral-500" />,
    title: "Authentic Reviews",
    description: "Access real-time reviews from fellow travelers who've just returned from your destination.",
    color: "bg-gradient-to-br from-coral-50 to-coral-100",
    borderColor: "border-coral-200"
  },
  {
    icon: <Search className="h-10 w-10 text-trypie-500" />,
    title: "AI Recommendations",
    description: "Get personalized travel suggestions tailored to your unique preferences and interests.",
    color: "bg-gradient-to-br from-trypie-50 to-trypie-100",
    borderColor: "border-trypie-200"
  },
  {
    icon: <Users className="h-10 w-10 text-coral-500" />,
    title: "Travel Together",
    description: "Connect with like-minded travelers and join group trips to amazing destinations.",
    color: "bg-gradient-to-br from-coral-50 to-coral-100",
    borderColor: "border-coral-200"
  },
  {
    icon: <Calendar className="h-10 w-10 text-trypie-500" />,
    title: "Smart Itineraries",
    description: "Build the perfect trip with AI-powered itinerary planning and easy group collaboration.",
    color: "bg-gradient-to-br from-trypie-50 to-trypie-100",
    borderColor: "border-trypie-200"
  },
  {
    icon: <MapPin className="h-10 w-10 text-coral-500" />,
    title: "Local Discoveries",
    description: "Uncover hidden gems and authentic experiences vetted by our community of travelers.",
    color: "bg-gradient-to-br from-coral-50 to-coral-100",
    borderColor: "border-coral-200"
  },
  {
    icon: <Compass className="h-10 w-10 text-trypie-500" />,
    title: "Travel Assistance",
    description: "Access 24/7 support with real-time updates, local tips, and emergency guidance.",
    color: "bg-gradient-to-br from-trypie-50 to-trypie-100",
    borderColor: "border-trypie-200"
  },
];

const FeatureSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block rounded-full px-4 py-1.5 bg-trypie-100 text-trypie-600 font-medium mb-4">TRAVEL SMARTER</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-trypie-600 via-trypie-500 to-coral-500 text-transparent bg-clip-text">
            Why Explorers Choose Trypie
          </h2>
          <p className="text-lg text-gray-600">
            Unlock a world of possibilities with our unique blend of community insights, AI technology, and social connections.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`border-2 ${feature.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full transform hover:-translate-y-1`}
            >
              <CardContent className={`p-8 ${feature.color} h-full flex flex-col`}>
                <div className="mb-4 bg-white p-4 rounded-lg inline-flex shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 flex-grow">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
