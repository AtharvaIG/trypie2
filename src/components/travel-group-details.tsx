
import { useState, useEffect, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Shield, 
  X, 
  MessageCircle,
  UserPlus,
  UserX,
  Edit,
  Trash2,
  Image,
  AtSign,
  LogOut,
  DollarSign,
  CalendarIcon,
  Settings,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TravelGroupChat from "./travel-group-chat";
import TravelGroupExpenses from "./travel-group-expenses";
import TravelGroupItinerary from "./travel-group-itinerary";
import { useIsMobile } from "@/hooks/use-mobile";
import { TravelGroup, GroupMember } from "@/types/travel-group-types";
import { fetchGroupMembers, leaveGroup } from "@/services/travel-group-service";
import { Profile } from "@/types/auth-types";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
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
import GroupSettingsModal from "./group-settings-modal";
import { cn } from "@/lib/utils";

interface TravelGroupDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  group: TravelGroup;
  onJoinGroup?: () => void;
}

const TravelGroupDetails = ({ isOpen, onClose, group, onJoinGroup }: TravelGroupDetailsProps) => {
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [showInfoOverlay, setShowInfoOverlay] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLeaveAlertOpen, setIsLeaveAlertOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, isAuthenticated } = useAuth();
  
  // Check if user is the group creator
  const isCreator = user?.id === group.creator_id;
  
  // Check if user is already a member of this group
  const isGroupMember = useRef(false);
  
  // Load group members
  const loadGroupMembers = async () => {
    if (!group?.id) return;
    
    setIsLoadingMembers(true);
    try {
      const members = await fetchGroupMembers(group.id);
      setGroupMembers(members);
      
      // Determine if current user is a member
      if (user?.id) {
        const isMember = members.some(member => member.user_id === user.id);
        isGroupMember.current = isMember;
        setHasJoined(isMember);
        
        // If creator or member is viewing group, auto-select chat tab
        if ((isCreator || isMember) && activeTab === "info") {
          setActiveTab("chat");
        }
      }
    } catch (error) {
      console.error("Error fetching group members:", error);
      toast({
        title: "Error",
        description: "Failed to load group members",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (isOpen && group?.id) {
      loadGroupMembers();
    }
  }, [isOpen, group?.id, user?.id]);

  const handleJoinGroup = async () => {
    if (!onJoinGroup) return;
    
    setIsJoining(true);
    
    try {
      await onJoinGroup();
      setHasJoined(true);
      
      // Reload group members to update the UI
      await loadGroupMembers();
      
      // Switch to chat tab after joining
      setActiveTab("chat");
      
      toast({
        title: "Successfully joined group!",
        description: "You can now chat with other members.",
      });
    } catch (error) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description: "Failed to join the group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(group.id);
      setHasJoined(false);
      isGroupMember.current = false;
      setActiveTab("info");
      
      // Reload group members to update UI
      await loadGroupMembers();
      
      toast({
        title: "Left group",
        description: "You have successfully left the group.",
      });
    } catch (error) {
      console.error("Error leaving group:", error);
      toast({
        title: "Error",
        description: "Failed to leave the group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLeaveAlertOpen(false);
    }
  };

  const handleGroupSettingsUpdate = async () => {
    // Refresh group member data after settings update
    await loadGroupMembers();
    
    toast({
      title: "Settings Updated",
      description: "Group settings have been updated successfully",
    });
  };

  const formattedDate = group?.start_date && group?.end_date 
    ? `${formatDate(group.start_date)} - ${formatDate(group.end_date)}`
    : "Dates not specified";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 overflow-hidden w-[calc(100vw-2rem)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center gap-2">
                <DialogTitle 
                  className="text-xl sm:text-2xl line-clamp-1 cursor-pointer hover:text-trypie-600 transition-colors"
                  onClick={() => setShowInfoOverlay(!showInfoOverlay)}
                >
                  {group?.title}
                </DialogTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowInfoOverlay(!showInfoOverlay)}
                  className="h-8 w-8"
                  title="Show group info"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
              
              {(isCreator || hasJoined) && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="mr-2"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              )}
              <TabsList>
                <TabsTrigger value="info" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Group Info</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="chat" 
                  className="flex items-center gap-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="expenses" 
                  className="flex items-center gap-1"
                >
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Expenses</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="itinerary" 
                  className="flex items-center gap-1"
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Itinerary</span>
                </TabsTrigger>
              </TabsList>
            </div>
          
            <TabsContent value="info" className="flex-1 overflow-y-auto m-0 px-4 sm:px-6 py-4 space-y-4 sm:space-y-6">
              <DialogDescription className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1 text-trypie-500 flex-shrink-0" />
                <span className="line-clamp-1">{group?.destination}</span>
              </DialogDescription>
              
              <div className="relative aspect-video w-full overflow-hidden rounded-md">
                <img 
                  src={group?.image_url || "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&q=80"} 
                  alt={group?.title} 
                  className="w-full h-full object-cover" 
                />
                {group?.is_influencer_trip && (
                  <div className="absolute top-3 left-3 bg-coral-500 text-white text-xs font-medium px-2 py-1 rounded flex items-center">
                    <Star className="h-3 w-3 mr-1 text-yellow-300" />
                    Influencer Trip
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-md">
                    <Calendar className="h-4 w-4 mr-2 text-trypie-600" />
                    <span className="text-sm font-medium">{formattedDate}</span>
                  </div>
                  
                  <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-md">
                    <Users className="h-4 w-4 mr-2 text-trypie-600" />
                    <span className="text-sm font-medium">
                      {group?.memberCount || groupMembers.length}/{group?.capacity} travelers
                    </span>
                  </div>
                </div>
                
                {isLoadingMembers ? (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-500">Loading group members...</p>
                  </div>
                ) : groupMembers.length > 0 && groupMembers[0]?.profile ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-600">Group Members</h3>
                    <div className="flex flex-wrap gap-2">
                      {groupMembers.map((member, idx) => (
                        <div key={member.id || idx} className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-md">
                          <Avatar className="h-6 w-6 border border-gray-200">
                            <AvatarImage src={member.profile?.avatarUrl || undefined} alt={member.profile?.fullName || "Member"} />
                            <AvatarFallback>{member.profile?.fullName?.substring(0, 2) || "ME"}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{member.profile?.fullName || "Member"}</span>
                          {member.user_id === group?.creator_id && (
                            <span className="text-xs px-1 bg-trypie-100 text-trypie-700 rounded">
                              Organizer
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                
                <div>
                  <h3 className="text-md font-semibold mb-2">About this trip</h3>
                  <p className="text-gray-700 text-sm">
                    {group?.description || 
                      `Join us for an amazing adventure to ${group?.destination}! We'll explore local 
                      culture, enjoy delicious food, and create unforgettable memories together.
                      This trip is perfect for travelers who enjoy cultural experiences and want to 
                      connect with like-minded explorers.`}
                  </p>
                </div>
                
                {group?.is_influencer_trip && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
                    <Shield className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">Verified Influencer Trip</h3>
                      <p className="text-sm text-amber-700">
                        This trip is led by a vetted travel influencer. All experiences are verified and reviews are authentic.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="sm:justify-between flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t">
                <Button variant="outline" onClick={onClose} className="sm:w-auto w-full order-2 sm:order-1">
                  <X className="mr-2 h-4 w-4" /> 
                  Close
                </Button>
                
                {!hasJoined ? (
                  <Button 
                    onClick={handleJoinGroup} 
                    disabled={isJoining} 
                    className="sm:w-auto w-full order-1 sm:order-2"
                  >
                    {isJoining ? "Joining..." : "Join Group"}
                  </Button>
                ) : (
                  <div className="flex gap-2 order-1 sm:order-2">
                    {isCreator || hasJoined ? (
                      <Button 
                        onClick={() => setActiveTab("chat")} 
                        className="sm:w-auto w-full bg-trypie-600 hover:bg-trypie-700"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Open Chat
                      </Button>
                    ) : null}
                    
                    {hasJoined && !isCreator && (
                      <Button 
                        variant="outline" 
                        onClick={() => setIsLeaveAlertOpen(true)}
                        className="sm:w-auto w-full text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Leave Group
                      </Button>
                    )}
                  </div>
                )}
              </DialogFooter>
            </TabsContent>
            
            <TabsContent value="chat" className="flex-1 m-0 p-0 h-full">
              {!hasJoined && !isCreator ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
                  <h2 className="text-xl font-medium text-gray-700 mb-2">Join to Access Group Chat</h2>
                  <p className="text-gray-500 max-w-md mb-6">
                    You need to join this group to access the chat and communicate with other members.
                  </p>
                  <Button
                    onClick={handleJoinGroup}
                    disabled={isJoining}
                  >
                    {isJoining ? "Joining..." : "Join Group"}
                  </Button>
                </div>
              ) : (
                <TravelGroupChat 
                  groupId={group.id} 
                  groupName={group.title}
                  groupMembers={groupMembers.map(member => ({
                    id: member.user_id,
                    name: member.profile?.fullName || "User",
                    avatar: member.profile?.avatarUrl || "",
                    isCreator: member.user_id === group.creator_id
                  }))}
                  currentUserId={user?.id}
                  isCreator={isCreator}
                  onRefreshMembers={loadGroupMembers}
                />
              )}
            </TabsContent>
            
            <TabsContent value="expenses" className="flex-1 m-0 p-0 h-full">
              {!hasJoined && !isCreator ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <DollarSign className="h-16 w-16 text-gray-300 mb-4" />
                  <h2 className="text-xl font-medium text-gray-700 mb-2">Join to Access Expenses</h2>
                  <p className="text-gray-500 max-w-md mb-6">
                    You need to join this group to track shared expenses and split costs with other travelers.
                  </p>
                  <Button
                    onClick={handleJoinGroup}
                    disabled={isJoining}
                  >
                    {isJoining ? "Joining..." : "Join Group"}
                  </Button>
                </div>
              ) : (
                <TravelGroupExpenses 
                  groupId={group.id}
                  groupMembers={groupMembers}
                  currentUserId={user?.id}
                />
              )}
            </TabsContent>
            
            <TabsContent value="itinerary" className="flex-1 m-0 p-0 h-full">
              {!hasJoined && !isCreator ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <CalendarIcon className="h-16 w-16 text-gray-300 mb-4" />
                  <h2 className="text-xl font-medium text-gray-700 mb-2">Join to Access Itinerary</h2>
                  <p className="text-gray-500 max-w-md mb-6">
                    You need to join this group to view and contribute to the travel itinerary.
                  </p>
                  <Button
                    onClick={handleJoinGroup}
                    disabled={isJoining}
                  >
                    {isJoining ? "Joining..." : "Join Group"}
                  </Button>
                </div>
              ) : (
                <TravelGroupItinerary 
                  groupId={group.id}
                  groupMembers={groupMembers}
                  currentUserId={user?.id}
                  isCreator={isCreator}
                />
              )}
            </TabsContent>
          </Tabs>
          
          {/* Group Info Overlay */}
          {showInfoOverlay && (
            <div className="absolute inset-0 bg-white p-6 z-10 overflow-y-auto animate-in slide-in-from-bottom">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{group.title} - Group Information</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowInfoOverlay(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-trypie-600 mr-2" />
                    <h3 className="font-medium">Destination</h3>
                  </div>
                  <p className="text-gray-700 ml-6">{group.destination}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-trypie-600 mr-2" />
                    <h3 className="font-medium">Trip Dates</h3>
                  </div>
                  <p className="text-gray-700 ml-6">{formattedDate}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-trypie-600 mr-2" />
                    <h3 className="font-medium">Group Members ({groupMembers.length}/{group.capacity})</h3>
                  </div>
                  <div className="ml-6 space-y-2">
                    {isLoadingMembers ? (
                      <p className="text-gray-500">Loading group members...</p>
                    ) : groupMembers.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {groupMembers.map((member) => (
                          <div 
                            key={member.id} 
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-md",
                              member.user_id === group.creator_id ? "bg-trypie-50" : "bg-gray-50"
                            )}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.profile?.avatarUrl || undefined} alt={member.profile?.fullName || "Member"} />
                              <AvatarFallback>{member.profile?.fullName?.substring(0, 2) || "ME"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{member.profile?.fullName || "Unknown User"}</p>
                              {member.user_id === group.creator_id && (
                                <p className="text-xs text-trypie-600">Group Organizer</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No members found</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Info className="h-4 w-4 text-trypie-600 mr-2" />
                    <h3 className="font-medium">About This Trip</h3>
                  </div>
                  <p className="text-gray-700 ml-6">
                    {group.description || 
                      `Join us for an amazing adventure to ${group.destination}! We'll explore local 
                      culture, enjoy delicious food, and create unforgettable memories together.
                      This trip is perfect for travelers who enjoy cultural experiences and want to 
                      connect with like-minded explorers.`}
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t flex flex-col sm:flex-row justify-end gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInfoOverlay(false)}
                >
                  Close
                </Button>
                {hasJoined ? (
                  <Button 
                    onClick={() => {
                      setShowInfoOverlay(false);
                      setActiveTab("chat");
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Go to Chat
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      handleJoinGroup();
                      setShowInfoOverlay(false);
                    }}
                    disabled={isJoining}
                  >
                    Join Group
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isLeaveAlertOpen} onOpenChange={setIsLeaveAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this group? You will no longer have access to the group chat and activities.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLeaveGroup}
              className="bg-red-600 hover:bg-red-700"
            >
              Leave Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isSettingsModalOpen && (
        <GroupSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          group={group}
          members={groupMembers}
          onUpdate={handleGroupSettingsUpdate}
          isCreator={isCreator}
        />
      )}
    </>
  );
};

export default TravelGroupDetails;
