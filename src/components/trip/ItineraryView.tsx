
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, DollarSign, Users, MapPin, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TripItinerary } from "@/types/trip-types";
import { Card, CardContent } from "@/components/ui/card";

interface ItineraryViewProps {
  itinerary: TripItinerary | null;
  budget: number;
  groupSize: string;
  handleEditDetails: () => void;
}

const ItineraryView: React.FC<ItineraryViewProps> = ({
  itinerary,
  budget,
  groupSize,
  handleEditDetails
}) => {
  console.log("ItineraryView received:", itinerary);

  // Early return if no itinerary data is available
  if (!itinerary) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No itinerary data available. Please generate an itinerary first.</p>
        <Button onClick={handleEditDetails} className="mt-4">
          Back to Trip Details
        </Button>
      </div>
    );
  }

  // Extract days safely with fallback to empty array
  const days = itinerary.days && Array.isArray(itinerary.days) ? itinerary.days : [];
  console.log("Days array:", days);
  
  // Format dates safely
  const startDateFormatted = itinerary.dates?.start instanceof Date && !isNaN(itinerary.dates.start.getTime()) 
    ? format(itinerary.dates.start, "MMM d") 
    : "Start Date";
  
  const endDateFormatted = itinerary.dates?.end instanceof Date && !isNaN(itinerary.dates.end.getTime()) 
    ? format(itinerary.dates.end, "MMM d, yyyy") 
    : "End Date";
    
  // Helper function to get activity type color
  const getActivityTypeColor = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'Food': 'bg-orange-100 text-orange-800',
      'Sightseeing': 'bg-blue-100 text-blue-800',
      'Cultural': 'bg-purple-100 text-purple-800',
      'Adventure': 'bg-green-100 text-green-800',
      'Nature': 'bg-emerald-100 text-emerald-800',
      'Shopping': 'bg-pink-100 text-pink-800',
      'Relaxation': 'bg-indigo-100 text-indigo-800',
      'History': 'bg-amber-100 text-amber-800',
      'Entertainment': 'bg-fuchsia-100 text-fuchsia-800',
      'Nightlife': 'bg-violet-100 text-violet-800',
    };
    
    return typeMap[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none shadow-md">
        <div className="bg-gradient-to-r from-trypie-600 to-trypie-400 p-6 text-white">
          <h2 className="text-2xl font-semibold mb-3">
            Your Trip to {itinerary.destination || "Unknown Location"}
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center text-sm">
              <CalendarIcon size={16} className="mr-1 opacity-80" />
              <span>
                {startDateFormatted} - {endDateFormatted}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Clock size={16} className="mr-1 opacity-80" />
              <span>{days.length} days</span>
            </div>
            <div className="flex items-center text-sm">
              <DollarSign size={16} className="mr-1 opacity-80" />
              <span>Budget: ${budget}/person</span>
            </div>
            <div className="flex items-center text-sm">
              <Users size={16} className="mr-1 opacity-80" />
              <span>Group size: {groupSize}</span>
            </div>
          </div>
        </div>
        
        {itinerary.highlights && (
          <CardContent className="p-4 bg-trypie-50">
            <h3 className="font-medium text-trypie-700 mb-2">Trip Highlights</h3>
            <ul className="list-disc pl-5 space-y-1">
              {itinerary.highlights.map((highlight, i) => (
                <li key={i} className="text-sm text-gray-700">{highlight}</li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>
      
      {days.length > 0 ? (
        days.map((day, dayIndex) => {
          if (!day) return null;
          
          // Format date safely
          const dayDate = day.date instanceof Date && !isNaN(day.date.getTime())
            ? format(day.date, "EEEE, MMMM d")
            : "Date not specified";
          
          // Extract activities safely with fallback to empty array
          const activities = day.activities && Array.isArray(day.activities) ? day.activities : [];
          
          return (
            <Card key={`day-${dayIndex}`} className="overflow-hidden">
              <div className="bg-gray-100 p-4 border-b">
                <h3 className="font-medium flex items-center">
                  <span className="bg-trypie-100 text-trypie-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">
                    Day {day.day || dayIndex + 1}
                  </span>
                  <span className="text-gray-800">{dayDate}</span>
                  
                  {day.weather && (
                    <div className="ml-auto flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                      <span className="text-xs text-gray-600 mr-1">{day.weather.condition}</span>
                      <span className="text-xs font-medium">{day.weather.temperature}°</span>
                    </div>
                  )}
                </h3>
              </div>
              
              <CardContent className="p-0">
                {activities.length > 0 ? (
                  <div className="divide-y">
                    {activities.map((activity, activityIndex) => {
                      if (!activity) return null;
                      
                      return (
                        <div key={`activity-${dayIndex}-${activityIndex}`} className="p-4">
                          <div className="flex">
                            <div className="w-20 flex-shrink-0 text-sm font-medium text-gray-700">
                              {activity.time || "No time"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h4 className="font-medium text-trypie-700">{activity.name || "Untitled activity"}</h4>
                                
                                {activity.cost !== undefined && (
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md ml-2">
                                    ${activity.cost}
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 mt-1">{activity.description || "No description"}</p>
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className={`${getActivityTypeColor(activity.type)}`}>
                                  {activity.type || "Other"}
                                </Badge>
                                
                                {activity.location && (
                                  <div className="inline-flex items-center text-xs text-gray-500">
                                    <MapPin size={12} className="mr-0.5" />
                                    <span>{activity.location}</span>
                                  </div>
                                )}
                                
                                {activity.bookingUrl && (
                                  <a 
                                    href={activity.bookingUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-xs text-blue-600 hover:underline"
                                  >
                                    <ExternalLink size={12} className="mr-0.5" />
                                    <span>Book now</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No activities planned for this day</p>
                )}
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-gray-500">No days have been planned for this itinerary yet.</p>
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleEditDetails}>
          Edit Trip Details
        </Button>
        <Button>
          Save Itinerary
        </Button>
      </div>
    </div>
  );
};

export default ItineraryView;
