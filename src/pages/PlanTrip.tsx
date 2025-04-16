import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { MapPin, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TripDetailsForm from "@/components/trip/TripDetailsForm";
import ItineraryView from "@/components/trip/ItineraryView";
import { TripItinerary } from "@/types/trip-types";
import { supabase } from "@/integrations/supabase/client";

const PlanTrip = () => {
  const { toast } = useToast();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [budget, setBudget] = useState(500);
  const [groupSize, setGroupSize] = useState("1");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [accommodation, setAccommodation] = useState("hotel");
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<TripItinerary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateItinerary = async () => {
    if (!destination || !startDate || !endDate) {
      toast({
        title: "Missing information",
        description: "Please fill in destination and dates to generate an itinerary.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-itinerary', {
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          budget,
          groupSize,
          preferences,
          accommodation,
          notes
        }),
      });

      if (error) {
        throw new Error(error.message || "Failed to generate itinerary");
      }
      
      if (!data) {
        throw new Error("No itinerary data received");
      }
      
      // Process dates in the response
      const processedItinerary = {
        ...data,
        dates: {
          start: new Date(data.dates.start),
          end: new Date(data.dates.end)
        },
        days: data.days.map((day: any) => ({
          ...day,
          date: new Date(day.date)
        }))
      };

      console.log("Received itinerary:", processedItinerary);
      
      setItinerary(processedItinerary);
      setActiveTab("itinerary");
      
      toast({
        title: "Itinerary generated!",
        description: `Your personalized trip to ${destination} is ready to view.`,
      });
    } catch (err: any) {
      console.error("Error generating itinerary:", err);
      setError(err.message || "An unexpected error occurred");
      
      toast({
        title: "Error generating itinerary",
        description: err.message || "There was a problem creating your itinerary. Please try again.",
        variant: "destructive",
      });
      
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <MapPin className="mr-2 text-trypie-500" size={24} />
                Plan Your Perfect Trip
              </h1>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Trip Details</TabsTrigger>
                  <TabsTrigger value="itinerary" disabled={!itinerary}>Generated Itinerary</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-4">
                  <TripDetailsForm
                    destination={destination}
                    setDestination={setDestination}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    budget={budget}
                    setBudget={setBudget}
                    groupSize={groupSize}
                    setGroupSize={setGroupSize}
                    preferences={preferences}
                    setPreferences={setPreferences}
                    accommodation={accommodation}
                    setAccommodation={setAccommodation}
                    notes={notes}
                    setNotes={setNotes}
                    generateItinerary={generateItinerary}
                    isGenerating={isGenerating}
                  />
                </TabsContent>
                
                <TabsContent value="itinerary" className="mt-4">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-12 w-12 text-trypie-500 animate-spin mb-4" />
                      <h3 className="text-lg font-medium mb-2">Creating your perfect itinerary...</h3>
                      <p className="text-gray-500 text-center max-w-md">
                        We're generating a personalized travel plan for your trip to {destination}.
                        This may take a minute.
                      </p>
                    </div>
                  ) : (
                    <ItineraryView
                      itinerary={itinerary}
                      budget={budget}
                      groupSize={groupSize}
                      handleEditDetails={() => setActiveTab("details")}
                    />
                  )}
                  
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md mt-4">
                      <p className="text-red-700">{error}</p>
                      <button 
                        className="text-red-600 underline mt-2"
                        onClick={() => setActiveTab("details")}
                      >
                        Go back and try again
                      </button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PlanTrip;
