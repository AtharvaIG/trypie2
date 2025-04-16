
import { useEffect, useState } from "react";
import { Review } from "@/types/review-types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getUserReviews } from "@/services/review-service";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import StarRating from "@/components/ui/star-rating";

interface MyReviewsSectionProps {
  userId?: string;
}

const MyReviewsSection = ({ userId }: MyReviewsSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user && !userId) return;
      
      try {
        setLoading(true);
        const reviewsData = await getUserReviews(userId || user?.id || "");
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user, userId]);

  const handleEditReview = (reviewId: string | undefined) => {
    // This would open a modal for editing the review
    toast({
      title: "Edit Review",
      description: `Edit functionality to be implemented for review ${reviewId}`,
    });
  };

  const handleDeleteReview = (reviewId: string | undefined) => {
    // This would show a confirmation dialog before deleting
    toast({
      title: "Delete Review",
      description: `Delete functionality to be implemented for review ${reviewId}`,
      variant: "destructive",
    });
  };

  return (
    <Card className="subtle-shadow">
      <CardHeader className="pb-2">
        <CardTitle>My Reviews</CardTitle>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="border rounded-lg p-3">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-2">
            {reviews.map((review, index) => (
              <AccordionItem 
                key={review.id || index} 
                value={`review-${review.id || index}`}
                className="border rounded-lg p-0 overflow-hidden bg-white"
              >
                <div className="flex items-start justify-between px-4 pt-3 pb-1">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 line-clamp-1">{review.title}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Menu">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem onClick={() => handleEditReview(review.id)}>
                            Edit review
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-600"
                          >
                            Delete review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <StarRating value={review.rating} readOnly size={16} />
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{review.description || "No description provided."}</p>
                  </div>
                </div>
                
                <AccordionTrigger className="py-1 px-4 text-xs text-gray-500 hover:no-underline">
                  View details
                </AccordionTrigger>
                
                <AccordionContent className="px-4 pb-3 pt-0">
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">Location:</span> {review.location || "Not specified"}
                    </div>
                    <div>
                      <span className="font-medium">Date visited:</span> {new Date(review.visit_date).toLocaleDateString()}
                    </div>
                    {review.pros && (
                      <div>
                        <span className="font-medium">Pros:</span> {review.pros}
                      </div>
                    )}
                    {review.cons && (
                      <div>
                        <span className="font-medium">Cons:</span> {review.cons}
                      </div>
                    )}
                    {review.media_urls && review.media_urls.length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium block mb-1">Photos:</span>
                        <div className="flex flex-wrap gap-2">
                          {review.media_urls.map((url, i) => (
                            <img 
                              key={i} 
                              src={url} 
                              alt={`Review image ${i + 1}`} 
                              className="h-16 w-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">You haven't written any reviews yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyReviewsSection;
