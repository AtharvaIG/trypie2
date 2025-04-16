
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  RefreshCw,
  MapPin 
} from "lucide-react";
import { useTravelItinerary } from "@/hooks/use-travel-itinerary";
import { GroupMember } from "@/types/travel-group-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TravelGroupItineraryProps {
  groupId: string;
  groupMembers: GroupMember[];
  currentUserId: string | undefined;
  isCreator: boolean;
}

const TravelGroupItinerary = ({ 
  groupId, 
  groupMembers,
  currentUserId,
  isCreator
}: TravelGroupItineraryProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [itineraryTitle, setItineraryTitle] = useState("");
  const [itineraryDescription, setItineraryDescription] = useState("");
  const [itineraryDay, setItineraryDay] = useState<string>("");
  const [editingItineraryId, setEditingItineraryId] = useState<string | null>(null);
  const [deletingItineraryId, setDeletingItineraryId] = useState<string | null>(null);
  
  const { 
    itineraries, 
    isLoading, 
    loadItineraries, 
    addItinerary, 
    editItinerary,
    removeItinerary
  } = useTravelItinerary(groupId);
  
  useEffect(() => {
    if (groupId) {
      loadItineraries();
    }
  }, [groupId]);
  
  const handleAddItinerary = async () => {
    if (!itineraryTitle) return;
    
    const dayNumber = itineraryDay ? parseInt(itineraryDay, 10) : undefined;
    
    const success = await addItinerary({
      title: itineraryTitle,
      description: itineraryDescription || undefined,
      dayNumber: dayNumber
    });
    
    if (success) {
      setIsAddDialogOpen(false);
      resetForm();
    }
  };
  
  const handleEditItinerary = async () => {
    if (!editingItineraryId || !itineraryTitle) return;
    
    const dayNumber = itineraryDay ? parseInt(itineraryDay, 10) : undefined;
    
    const success = await editItinerary(editingItineraryId, {
      title: itineraryTitle,
      description: itineraryDescription || undefined,
      dayNumber: dayNumber
    });
    
    if (success) {
      setIsEditDialogOpen(false);
      setEditingItineraryId(null);
      resetForm();
    }
  };
  
  const handleDeleteItinerary = async () => {
    if (!deletingItineraryId) return;
    
    const success = await removeItinerary(deletingItineraryId);
    
    if (success) {
      setIsDeleteAlertOpen(false);
      setDeletingItineraryId(null);
    }
  };
  
  const openEditDialog = (itinerary: any) => {
    setItineraryTitle(itinerary.title);
    setItineraryDescription(itinerary.description || "");
    setItineraryDay(itinerary.day_number?.toString() || "");
    setEditingItineraryId(itinerary.id);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (id: string) => {
    setDeletingItineraryId(id);
    setIsDeleteAlertOpen(true);
  };
  
  const resetForm = () => {
    setItineraryTitle("");
    setItineraryDescription("");
    setItineraryDay("");
  };
  
  const canEditItinerary = (creatorId: string) => {
    return isCreator || creatorId === currentUserId;
  };
  
  // Helper function to sort itineraries by day
  const sortedItineraries = [...itineraries].sort((a, b) => {
    // Sort by day number first (undefined days go last)
    if (a.day_number !== undefined && b.day_number !== undefined) {
      return a.day_number - b.day_number;
    }
    if (a.day_number !== undefined) return -1;
    if (b.day_number !== undefined) return 1;
    
    // If no day numbers, sort by creation date
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-trypie-600" />
          <h2 className="text-lg font-medium">Trip Itinerary</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="ghost"
            onClick={loadItineraries}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          
          <Button 
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Activity
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-grow px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Loading itinerary...</p>
          </div>
        ) : sortedItineraries.length > 0 ? (
          <div className="space-y-4 py-4">
            {sortedItineraries.map(item => {
              const creator = groupMembers.find(m => m.user_id === item.created_by);
              const canEdit = canEditItinerary(item.created_by);
              
              return (
                <div 
                  key={item.id}
                  className="border rounded-lg overflow-hidden bg-white"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          {item.day_number !== undefined && (
                            <div className="bg-trypie-100 text-trypie-800 text-sm font-medium px-2 py-0.5 rounded-md">
                              Day {item.day_number}
                            </div>
                          )}
                          <h3 className="font-medium">{item.title}</h3>
                        </div>
                        
                        {item.description && (
                          <p className="text-gray-600 text-sm mt-2">{item.description}</p>
                        )}
                        
                        <div className="flex items-center text-xs text-gray-500 mt-3">
                          <span>Added by </span>
                          <div className="flex items-center ml-1">
                            <Avatar className="h-4 w-4 mr-1">
                              <AvatarImage src={creator?.profile?.avatarUrl || item.creatorProfile?.avatarUrl} />
                              <AvatarFallback>
                                {(creator?.profile?.fullName || item.creatorProfile?.fullName || "U").substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{creator?.profile?.fullName || item.creatorProfile?.fullName || "User"}</span>
                          </div>
                        </div>
                      </div>
                      
                      {canEdit && (
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => openDeleteDialog(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-40">
            <MapPin className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-gray-500 mb-2">No activities planned yet</p>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add First Activity
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* Add Itinerary Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Activity</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="itinerary-title">Activity Name</Label>
              <Input
                id="itinerary-title"
                placeholder="e.g., Visit Taj Mahal"
                value={itineraryTitle}
                onChange={(e) => setItineraryTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itinerary-day">Day (Optional)</Label>
              <Input
                id="itinerary-day"
                type="number"
                placeholder="e.g., 1"
                value={itineraryDay}
                onChange={(e) => setItineraryDay(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itinerary-description">Description (Optional)</Label>
              <Textarea
                id="itinerary-description"
                placeholder="Details about this activity..."
                value={itineraryDescription}
                onChange={(e) => setItineraryDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddItinerary}>Add Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Itinerary Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-itinerary-title">Activity Name</Label>
              <Input
                id="edit-itinerary-title"
                placeholder="e.g., Visit Taj Mahal"
                value={itineraryTitle}
                onChange={(e) => setItineraryTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-itinerary-day">Day (Optional)</Label>
              <Input
                id="edit-itinerary-day"
                type="number"
                placeholder="e.g., 1"
                value={itineraryDay}
                onChange={(e) => setItineraryDay(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-itinerary-description">Description (Optional)</Label>
              <Textarea
                id="edit-itinerary-description"
                placeholder="Details about this activity..."
                value={itineraryDescription}
                onChange={(e) => setItineraryDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingItineraryId(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditItinerary}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingItineraryId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteItinerary}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TravelGroupItinerary;
