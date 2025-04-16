
import { Users, Calendar, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TravelGroup } from "@/types/travel-group-types";
import { formatDate } from "@/lib/utils";

interface TravelGroupCardProps {
  group: TravelGroup;
  onClick?: () => void;
}

const TravelGroupCard = ({
  group,
  onClick,
}: TravelGroupCardProps) => {
  // Add a guard clause to handle undefined group
  if (!group) {
    return null; // Or return a placeholder/skeleton UI
  }

  const {
    title,
    destination,
    start_date,
    end_date,
    image_url,
    capacity,
    memberCount = 0,
    is_influencer_trip
  } = group;

  // Format dates
  const formattedDate = start_date && end_date 
    ? `${formatDate(start_date)} - ${formatDate(end_date)}`
    : "Dates not specified";

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 card-hover transition-all duration-300 hover:shadow-md"
      onClick={onClick}
    >
      <div className="aspect-video relative overflow-hidden cursor-pointer">
        <img 
          src={image_url || "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&q=80"} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
        />
        {is_influencer_trip && (
          <div className="absolute top-3 left-3 bg-coral-500 text-white text-xs font-medium px-2 py-1 rounded flex items-center">
            <Star className="h-3 w-3 mr-1 text-yellow-300" />
            Influencer Trip
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 text-gray-900 cursor-pointer">{title}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-2 text-trypie-500" />
            <span>{destination}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-2 text-trypie-500" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users size={16} className="mr-2 text-trypie-500" />
            <span>{memberCount} / {capacity} travelers</span>
          </div>
        </div>
        
        <Button 
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onClick && onClick();
          }}
        >
          View Group
        </Button>
      </div>
    </div>
  );
};

export default TravelGroupCard;
