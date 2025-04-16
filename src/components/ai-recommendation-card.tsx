
import { useState, useEffect } from "react";
import { Star, Sparkles, Eye, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AIRecommendationCardProps {
  image: string;
  title: string;
  location: string;
  rating: number;
  description: string;
  matchPercentage: number;
  tags: string[];
}

const AIRecommendationCard = ({
  image,
  title,
  location,
  rating,
  description,
  matchPercentage,
  tags,
}: AIRecommendationCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Check if this item is saved in localStorage
  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem("savedRecommendations") || "[]");
    const isItemSaved = savedItems.some((item: any) => item.title === title && item.location === location);
    setIsSaved(isItemSaved);
  }, [title, location]);

  // Function to handle save/bookmark action
  const handleSave = () => {
    const savedItems = JSON.parse(localStorage.getItem("savedRecommendations") || "[]");
    let updatedItems;
    
    if (isSaved) {
      // Remove from saved items
      updatedItems = savedItems.filter((item: any) => 
        !(item.title === title && item.location === location)
      );
      toast({
        title: "Removed from saved",
        description: `${title} has been removed from your saved destinations`,
      });
    } else {
      // Add to saved items
      const itemToSave = {
        image, title, location, rating, description, matchPercentage, tags
      };
      updatedItems = [...savedItems, itemToSave];
      toast({
        title: "Added to saved",
        description: `${title} has been saved to your destinations`,
      });
    }
    
    localStorage.setItem("savedRecommendations", JSON.stringify(updatedItems));
    setIsSaved(!isSaved);
    
    // Force refresh of other components that might display saved items
    window.dispatchEvent(new Event('savedItemsUpdated'));
  };

  // Ensure the image is travel-related
  const ensureTravelImage = (img: string) => {
    // Check if the image URL contains coding-related keywords
    if (img.includes("code") || img.includes("programming") || img.includes("computer") || img.includes("488590528505")) {
      // Return a default travel image instead
      return "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80";
    }
    return img;
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 card-hover h-full flex flex-col">
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={ensureTravelImage(image)} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
        />
        <div className="absolute top-3 right-3 bg-trypie-600 text-white rounded-full px-2 py-1 flex items-center text-xs">
          <Sparkles size={12} className="text-yellow-300 mr-1" />
          <span>{matchPercentage}% Match</span>
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
          <div className="flex items-center">
            <Star size={16} className="text-yellow-500 mr-1" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-1">{location}</p>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">{description}</p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex gap-2 mt-auto">
          <Button 
            onClick={() => setIsDetailsOpen(true)}
            className="flex-1 bg-trypie-600 hover:bg-trypie-700"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
          <Button 
            onClick={handleSave}
            variant={isSaved ? "coral" : "outline"} 
            className={`flex-1 ${isSaved ? 'text-white' : 'text-gray-700'}`}
          >
            <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? 'fill-white' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{title}</DialogTitle>
            <DialogDescription className="text-gray-600">
              {location}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="aspect-video overflow-hidden rounded-md mb-4">
              <img 
                src={ensureTravelImage(image)} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Star size={16} className="text-yellow-500 mr-1" />
                <span className="font-medium">{rating.toFixed(1)} rating</span>
              </div>
              <div className="flex items-center bg-trypie-100 text-trypie-800 px-2 py-1 rounded-full">
                <Sparkles size={14} className="text-trypie-600 mr-1" />
                <span className="text-sm">{matchPercentage}% Match</span>
              </div>
            </div>

            <h3 className="font-medium mb-2">About this destination</h3>
            <p className="text-gray-700 mb-4">{description}</p>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Why it's a good match</h3>
              <p className="text-gray-700">
                Based on your preferences and travel history, this destination 
                offers experiences that align with your interests, making it a 
                {matchPercentage >= 90 ? ' perfect' : matchPercentage >= 80 ? ' great' : ' good'} 
                match for your travel style.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button className="flex-1 bg-trypie-600 hover:bg-trypie-700">
                Add to Itinerary
              </Button>
              <Button 
                onClick={handleSave} 
                variant={isSaved ? "coral" : "outline"}
                className="flex-1"
              >
                <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? 'fill-white' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIRecommendationCard;
