
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import StarRating from "@/components/ui/star-rating";
import { ReviewFormValues } from "@/types/review-types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { createReview } from "@/services/review-service";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ReviewModal = ({ open, onOpenChange, onSuccess }: ReviewModalProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [rating, setRating] = useState(0);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
  } = useForm<ReviewFormValues>({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      rating: 0,
      visit_date: "",
      location: "",
      pros: "",
      cons: "",
    },
  });

  const watchRequired = {
    title: watch("title"),
    visitDate: watch("visit_date"),
  };

  const isFormValid = () => {
    return !!(watchRequired.title && watchRequired.visitDate && rating > 0);
  };

  useEffect(() => {
    setValue("rating", rating);
    trigger("rating");
  }, [rating, setValue, trigger]);

  useEffect(() => {
    if (selectedDate) {
      setValue("visit_date", format(selectedDate, "yyyy-MM-dd"));
      trigger("visit_date");
    }
  }, [selectedDate, setValue, trigger]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        reset();
        setRating(0);
        setSelectedDate(undefined);
        setSelectedImages([]);
        setPreviewUrls([]);
      }, 300);
    }
  }, [open, reset]);

  // Generate preview URLs for selected images
  useEffect(() => {
    if (!selectedImages.length) {
      setPreviewUrls([]);
      return;
    }

    const newPreviewUrls: string[] = [];
    
    selectedImages.forEach(image => {
      const url = URL.createObjectURL(image);
      newPreviewUrls.push(url);
    });
    
    setPreviewUrls(newPreviewUrls);
    
    // Clean up URLs when component unmounts
    return () => {
      newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedImages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...filesArray]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ReviewFormValues) => {
    if (!isFormValid() || !user) return;

    try {
      setIsSubmitting(true);

      await createReview({
        user_id: user.id,
        title: data.title,
        description: data.description,
        rating: rating,
        visit_date: data.visit_date,
        location: data.location,
        pros: data.pros,
        cons: data.cons,
      }, selectedImages);

      toast.success("Your review has been submitted!");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Write a Review</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Rating*</Label>
            <StarRating value={rating} onChange={setRating} size={32} />
            {rating === 0 && (
              <p className="text-sm text-red-500">Please select a rating</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title*</Label>
            <Input
              id="title"
              placeholder="Give your review a title"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="visit_date">Date of Visit*</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  disabled={(date) => date > new Date()}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {!watchRequired.visitDate && (
              <p className="text-sm text-red-500">Visit date is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              placeholder="Where did you visit?"
              {...register("location")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Tell others about your experience"
              rows={4}
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pros">Pros (optional)</Label>
              <Textarea
                id="pros"
                placeholder="What did you love?"
                rows={3}
                {...register("pros")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cons">Cons (optional)</Label>
              <Textarea
                id="cons"
                placeholder="What could be improved?"
                rows={3}
                {...register("cons")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photos (optional)</Label>
            <div className="border-2 border-dashed rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-center flex-col">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">
                  Drag & drop photos here or click to browse
                </p>
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("images")?.click()}
                >
                  Browse Files
                </Button>
              </div>
            </div>

            {/* Image previews */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
