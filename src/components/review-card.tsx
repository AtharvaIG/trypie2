
import { useState, useEffect } from "react";
import { Star, MapPin, ThumbsUp, MessageCircle, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ReviewCardProps {
  image: string;
  title: string;
  location: string;
  rating: number;
  reviewText: string;
  username: string;
  userAvatar: string;
  date: string;
  likes: number;
  comments: number;
}

const ReviewCard = ({
  image,
  title,
  location,
  rating,
  reviewText,
  username,
  userAvatar,
  date,
  likes,
  comments,
}: ReviewCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [isSaved, setIsSaved] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Check if this review is saved in localStorage
  useEffect(() => {
    const savedReviews = JSON.parse(localStorage.getItem("savedReviews") || "[]");
    const isReviewSaved = savedReviews.some((review: any) => 
      review.title === title && review.username === username && review.reviewText === reviewText
    );
    setIsSaved(isReviewSaved);
  }, [title, username, reviewText]);

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
    
    toast({
      title: liked ? "Like removed" : "Review liked",
      description: liked 
        ? `You removed your like from ${username}'s review` 
        : `You liked ${username}'s review`,
    });
  };

  const handleSave = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    const savedReviews = JSON.parse(localStorage.getItem("savedReviews") || "[]");
    let updatedReviews;
    
    if (isSaved) {
      // Remove from saved reviews
      updatedReviews = savedReviews.filter((review: any) => 
        !(review.title === title && review.username === username && review.reviewText === reviewText)
      );
      toast({
        title: "Removed from saved",
        description: `Review "${title}" has been removed from your saved items`,
      });
    } else {
      // Add to saved reviews
      const reviewToSave = {
        image, title, location, rating, reviewText, username, userAvatar, date, likes: likeCount, comments
      };
      updatedReviews = [...savedReviews, reviewToSave];
      toast({
        title: "Added to saved",
        description: `Review "${title}" has been saved to your collection`,
      });
    }
    
    localStorage.setItem("savedReviews", JSON.stringify(updatedReviews));
    setIsSaved(!isSaved);
    
    // Force refresh of other components that might display saved items
    window.dispatchEvent(new Event('savedItemsUpdated'));
  };

  const handleComment = () => {
    setIsDetailsOpen(true);
  };

  // Ensure travel-related image
  const ensureTravelImage = (img: string) => {
    // Check if the image URL contains coding-related keywords
    if (img.includes("code") || img.includes("programming") || img.includes("computer") || img.includes("488590528505")) {
      // Return a default travel image instead
      return "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80";
    }
    return img;
  };

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 card-hover h-full flex flex-col" 
           onClick={() => setIsDetailsOpen(true)} 
           role="button" 
           tabIndex={0}>
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={ensureTravelImage(image)} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
          />
          <div className="absolute top-3 left-3 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center text-xs">
            <MapPin size={12} className="text-coral-500 mr-1" />
            <span>{location}</span>
          </div>
          <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center text-xs">
            <Star size={12} className="text-yellow-500 mr-1" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-bold text-lg mb-1 text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">{reviewText}</p>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center">
              <img 
                src={userAvatar} 
                alt={username} 
                className="w-8 h-8 rounded-full mr-2 object-cover" 
              />
              <div>
                <p className="text-sm font-medium">{username}</p>
                <p className="text-xs text-gray-500">{date}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 px-2 ${liked ? 'text-coral-500' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
              >
                <ThumbsUp size={14} className={`mr-1 ${liked ? 'fill-coral-500' : ''}`} />
                <span className="text-xs">{likeCount}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 px-2 ${isSaved ? 'text-trypie-600' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave(e);
                }}
              >
                <Bookmark size={14} className={`mr-1 ${isSaved ? 'fill-trypie-600' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleComment();
                }}
              >
                <MessageCircle size={14} className="mr-1" />
                <span className="text-xs">{comments}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Review Detail Dialog */}
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

            <div className="flex items-center mb-4">
              <Star size={16} className="text-yellow-500 mr-1" />
              <span className="font-medium">{rating.toFixed(1)} rating</span>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">{reviewText}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center">
                <img 
                  src={userAvatar} 
                  alt={username} 
                  className="w-10 h-10 rounded-full mr-3 object-cover" 
                />
                <div>
                  <p className="font-medium">{username}</p>
                  <p className="text-sm text-gray-500">{date}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button 
                  variant={liked ? "coral" : "outline"} 
                  size="sm"
                  onClick={handleLike}
                >
                  <ThumbsUp size={14} className="mr-1" />
                  <span>{liked ? 'Liked' : 'Like'} ({likeCount})</span>
                </Button>
                <Button 
                  variant={isSaved ? "coral" : "outline"} 
                  size="sm"
                  onClick={() => handleSave()}
                >
                  <Bookmark size={14} className={`mr-1 ${isSaved ? 'fill-white' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle size={14} className="mr-1" />
                  <span>Comment ({comments})</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReviewCard;
