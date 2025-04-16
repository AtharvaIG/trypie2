import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface TripDetailsFormProps {
  destination: string;
  setDestination: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  budget: number;
  setBudget: (value: number) => void;
  groupSize: string;
  setGroupSize: (value: string) => void;
  preferences: string[];
  setPreferences: (value: string[]) => void;
  accommodation: string;
  setAccommodation: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  generateItinerary: () => void;
  isGenerating: boolean;
}

const TripDetailsForm: React.FC<TripDetailsFormProps> = ({
  destination,
  setDestination,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  budget,
  setBudget,
  groupSize,
  setGroupSize,
  preferences,
  setPreferences,
  accommodation,
  setAccommodation,
  notes,
  setNotes,
  generateItinerary,
  isGenerating
}) => {
  const [customPreference, setCustomPreference] = useState("");

  const preferenceOptions = [
    "Adventure", "Cultural", "Relaxation", "Foodie", "Nature", 
    "Shopping", "History", "Photography", "Budget-friendly", "Luxury"
  ];

  const addCustomPreference = () => {
    if (customPreference && !preferences.includes(customPreference)) {
      setPreferences([...preferences, customPreference]);
      setCustomPreference("");
    }
  };

  const removePreference = (pref: string) => {
    setPreferences(preferences.filter(p => p !== pref));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="destination">Destination</Label>
          <Input
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Where do you want to go?"
            className="mt-1"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => startDate ? date < startDate : false}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between mb-2">
          <Label htmlFor="budget">Budget (per person)</Label>
          <span className="text-sm text-gray-600">${budget}</span>
        </div>
        <Slider
          id="budget"
          min={100}
          max={5000}
          step={100}
          value={[budget]}
          onValueChange={(value) => setBudget(value[0])}
        />
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Budget</span>
          <span>Luxury</span>
        </div>
      </div>
      
      <div>
        <Label htmlFor="group-size">Group Size</Label>
        <Select value={groupSize} onValueChange={setGroupSize}>
          <SelectTrigger id="group-size" className="input-focused">
            <SelectValue placeholder="Select group size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Solo Traveler</SelectItem>
            <SelectItem value="2">Couple</SelectItem>
            <SelectItem value="3-5">Small Group (3-5)</SelectItem>
            <SelectItem value="6-10">Medium Group (6-10)</SelectItem>
            <SelectItem value="10+">Large Group (10+)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="accommodation">Accommodation Preference</Label>
        <Select value={accommodation} onValueChange={setAccommodation}>
          <SelectTrigger id="accommodation" className="input-focused">
            <SelectValue placeholder="Select accommodation type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hotel">Hotel</SelectItem>
            <SelectItem value="hostel">Hostel</SelectItem>
            <SelectItem value="apartment">Vacation Rental/Apartment</SelectItem>
            <SelectItem value="resort">Resort</SelectItem>
            <SelectItem value="camping">Camping</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Trip Preferences</Label>
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          {preferences.map((pref) => (
            <Badge key={pref} variant="secondary" className="px-3 py-1">
              {pref}
              <button 
                onClick={() => removePreference(pref)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <div className="flex-1">
            <Select
              onValueChange={(value) => {
                if (!preferences.includes(value)) {
                  setPreferences([...preferences, value]);
                }
              }}
            >
              <SelectTrigger className="input-focused">
                <SelectValue placeholder="Add preference" />
              </SelectTrigger>
              <SelectContent>
                {preferenceOptions.filter(opt => !preferences.includes(opt)).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-2">
            <Input
              placeholder="Custom preference"
              value={customPreference}
              onChange={(e) => setCustomPreference(e.target.value)}
              className="input-focused"
            />
            <Button
              type="button"
              size="icon"
              onClick={addCustomPreference}
              disabled={!customPreference || preferences.includes(customPreference)}
            >
              <PlusCircle size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any special requests or information about your trip..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-focused min-h-[100px]"
        />
      </div>
      
      <Button 
        onClick={generateItinerary} 
        className="w-full" 
        disabled={isGenerating || !destination || !startDate || !endDate}
      >
        {isGenerating ? "Generating your perfect trip..." : "Generate Itinerary"}
      </Button>
    </div>
  );
};

export default TripDetailsForm;
