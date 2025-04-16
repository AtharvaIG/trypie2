
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { TravelGroup } from "@/types/travel-group-types";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { cn, formatDate } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type CreateGroupProps = {
  title: string;
  destination: string;
  description?: string;
  start_date?: Date;
  end_date?: Date;
  capacity: number;
  is_public?: boolean;
  is_influencer_trip: boolean;
  image_url?: string;
};

interface CreateTravelGroupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (group: Omit<TravelGroup, "id" | "created_at" | "creator_id">) => Promise<void>;
}

const CreateTravelGroup = ({ isOpen, onClose, onCreateGroup }: CreateTravelGroupProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateGroupProps>({
    title: "",
    destination: "",
    description: "",
    start_date: undefined,
    end_date: undefined,
    capacity: 10,
    is_public: true,
    is_influencer_trip: false,
  });
  
  const [formErrors, setFormErrors] = useState({
    title: "",
    destination: "",
    dates: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (name in formErrors) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleDateChange = (field: 'start_date' | 'end_date', date?: Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
    
    // Clear date error when user selects dates
    setFormErrors(prev => ({
      ...prev,
      dates: ""
    }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseInt(value);
    
    if (isNaN(numberValue) || numberValue < 1) {
      setFormData(prev => ({
        ...prev,
        [name]: 1
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: numberValue
      }));
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validateForm = (): boolean => {
    const errors = {
      title: "",
      destination: "",
      dates: ""
    };
    
    let isValid = true;
    
    if (!formData.title.trim()) {
      errors.title = "Group title is required";
      isValid = false;
    }
    
    if (!formData.destination.trim()) {
      errors.destination = "Destination is required";
      isValid = false;
    }
    
    if (formData.start_date && formData.end_date) {
      if (formData.end_date < formData.start_date) {
        errors.dates = "End date must be after start date";
        isValid = false;
      }
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const groupData: Omit<TravelGroup, "id" | "created_at" | "creator_id"> = {
        title: formData.title,
        destination: formData.destination,
        description: formData.description,
        start_date: formData.start_date?.toISOString(),
        end_date: formData.end_date?.toISOString(),
        capacity: formData.capacity,
        is_public: formData.is_public,
        is_influencer_trip: formData.is_influencer_trip,
        image_url: formData.image_url
      };
      
      await onCreateGroup(groupData);
      
      // Close dialog and navigate to the Groups page with focus on My Groups tab
      onClose();
      
      // Navigate to the groups page and directly to the chat tab for the created group
      // This will happen if the creation is successful (handled in the parent component)
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create a Travel Group</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Group Title*</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Backpacking Europe"
              value={formData.title}
              onChange={handleInputChange}
              className={cn(formErrors.title && "border-red-400")}
            />
            {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="destination">Destination*</Label>
            <LocationAutocomplete 
              value={formData.destination}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, destination: value }));
                setFormErrors(prev => ({ ...prev, destination: "" }));
              }}
              placeholder="Where are you going?"
              className={cn(formErrors.destination && "border-red-400")}
            />
            {formErrors.destination && <p className="text-sm text-red-500">{formErrors.destination}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell potential travelers about your trip..."
              value={formData.description || ""}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.start_date && "text-muted-foreground",
                      formErrors.dates && "border-red-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? (
                      formatDate(formData.start_date.toISOString())
                    ) : (
                      <span>Pick a start date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => handleDateChange('start_date', date)}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.end_date && "text-muted-foreground",
                      formErrors.dates && "border-red-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? (
                      formatDate(formData.end_date.toISOString())
                    ) : (
                      <span>Pick an end date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => handleDateChange('end_date', date)}
                    initialFocus
                    disabled={(date) => 
                      date < new Date() || 
                      (formData.start_date && date < formData.start_date)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {formErrors.dates && <p className="text-sm text-red-500">{formErrors.dates}</p>}
          
          <div className="space-y-2">
            <Label htmlFor="capacity">Maximum Group Size</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              max={50}
              value={formData.capacity}
              onChange={handleNumberChange}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center justify-between border-t pt-4 mt-4">
            <Label htmlFor="is_public" className="text-sm font-medium">
              Make this group public
              <p className="font-normal text-xs text-gray-500">
                Public groups appear in search results and can be joined by anyone
              </p>
            </Label>
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => handleSwitchChange('is_public', checked)}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTravelGroup;
