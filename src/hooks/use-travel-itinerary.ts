
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { GroupItinerary } from '@/types/travel-group-types';
import { 
  fetchGroupItineraries, 
  createItinerary, 
  updateItinerary, 
  deleteItinerary 
} from '@/services/travel-group-service';

export function useTravelItinerary(groupId: string) {
  const [itineraries, setItineraries] = useState<GroupItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadItineraries = async () => {
    if (!groupId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedItineraries = await fetchGroupItineraries(groupId);
      setItineraries(fetchedItineraries);
    } catch (err) {
      console.error('Error fetching itineraries:', err);
      setError('Failed to load itineraries');
      toast({
        title: "Error",
        description: "Failed to load group itineraries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addItinerary = async (itineraryData: {
    title: string;
    description?: string;
    dayNumber?: number;
  }) => {
    if (!groupId || !user?.id) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newItinerary = await createItinerary({
        group_id: groupId,
        title: itineraryData.title,
        description: itineraryData.description,
        day_number: itineraryData.dayNumber,
        created_by: user.id
      });
      
      setItineraries(prev => [...prev, newItinerary]);
      
      toast({
        title: "Itinerary Added",
        description: "The itinerary item has been added successfully",
      });
      
      return newItinerary;
    } catch (err) {
      console.error('Error creating itinerary:', err);
      setError('Failed to add itinerary');
      toast({
        title: "Error",
        description: "Failed to add itinerary item",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const editItinerary = async (id: string, itineraryData: {
    title?: string;
    description?: string;
    dayNumber?: number;
  }) => {
    if (!id) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedItinerary = await updateItinerary(id, {
        title: itineraryData.title,
        description: itineraryData.description,
        day_number: itineraryData.dayNumber
      });
      
      setItineraries(prev => 
        prev.map(item => item.id === id ? updatedItinerary : item)
      );
      
      toast({
        title: "Itinerary Updated",
        description: "The itinerary item has been updated successfully",
      });
      
      return true;
    } catch (err) {
      console.error('Error updating itinerary:', err);
      setError('Failed to update itinerary');
      toast({
        title: "Error",
        description: "Failed to update itinerary item",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItinerary = async (id: string) => {
    if (!id) return false;
    
    try {
      await deleteItinerary(id);
      
      setItineraries(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Itinerary Removed",
        description: "The itinerary item has been removed successfully",
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting itinerary:', err);
      toast({
        title: "Error",
        description: "Failed to remove itinerary item",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    itineraries,
    isLoading,
    error,
    loadItineraries,
    addItinerary,
    editItinerary,
    removeItinerary
  };
}
