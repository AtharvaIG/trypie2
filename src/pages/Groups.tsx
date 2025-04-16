
import { useState, useEffect } from "react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Plus, Search, Shield, Star, Users } from "lucide-react";
import TravelGroupCard from "@/components/travel-group-card";
import TravelGroupDetails from "@/components/travel-group-details";
import CreateTravelGroup from "@/components/create-travel-group";
import { useAuth } from "@/contexts/AuthContext";
import { useTravelGroups } from "@/hooks/use-travel-groups";
import { TravelGroup } from "@/types/travel-group-types";
import { createGroup, joinGroup } from "@/services/travel-group-service";
import { useToast } from "@/hooks/use-toast";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { useNavigate } from "react-router-dom";

const Groups = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<TravelGroup | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("mygroups");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const {
    myGroups,
    influencerTrips,
    exploreGroups,
    isLoading,
    refreshAllGroups,
    loadMyGroups
  } = useTravelGroups();

  const filterGroups = (groups: TravelGroup[]) => {
    return groups.filter(group => 
      group.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      group.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (locationSearchQuery && group.destination.toLowerCase().includes(locationSearchQuery.toLowerCase()))
    );
  };
  
  const filteredMyGroups = filterGroups(myGroups);
  const filteredInfluencerTrips = filterGroups(influencerTrips);
  const filteredExploreGroups = filterGroups(exploreGroups);

  const handleCreateGroup = async (newGroup: Omit<TravelGroup, 'id' | 'created_at' | 'creator_id'>) => {
    try {
      console.log("Creating group from Groups.tsx:", newGroup);
      const createdGroup = await createGroup(newGroup);
      console.log("Group created successfully:", createdGroup);
      setShowCreateForm(false);
      toast({
        title: "Group Created",
        description: "Your travel group has been created successfully!",
      });
      
      console.log("Refreshing all groups after creation");
      await refreshAllGroups();
      console.log("Groups refreshed");
      
      // Open the created group directly to chat tab
      setSelectedGroup(createdGroup);
      
      // Pre-select the "chat" tab for newly created groups
      setActiveTab("mygroups");
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "Failed to create the group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join a travel group.",
        variant: "destructive",
      });
      return;
    }

    try {
      await joinGroup(groupId);
      await refreshAllGroups();
      
      // Close the details modal and reload groups
      setSelectedGroup(null);
      
      // If we're joining from the "explore" or "influencer" tabs, let's fetch my groups again
      if (activeTab !== "mygroups") {
        await loadMyGroups();
        setActiveTab("mygroups");
      }
    } catch (error) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description: "Failed to join the group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  useEffect(() => {
    if (activeTab === "mygroups" && myGroups.length === 0 && !isLoading.myGroups && isAuthenticated) {
      if (exploreGroups.length > 0) {
        setActiveTab("explore");
      } else if (influencerTrips.length > 0) {
        setActiveTab("influencers");
      }
    }
  }, [myGroups, exploreGroups, influencerTrips, isLoading.myGroups, isAuthenticated]);

  // Handle clicks on group cards to either view details or go straight to chat
  const handleGroupCardClick = (group: TravelGroup) => {
    // If user is the creator or is already a member and it's in my groups tab, 
    // open the group details directly to chat tab by setting selectedGroup
    setSelectedGroup(group);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50">
        <div className="bg-gradient-to-br from-trypie-600 to-trypie-800 py-16 px-4 md:px-6">
          <div className="container mx-auto max-w-3xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Travel Better Together
            </h1>
            <p className="text-white/90 mb-8 max-w-xl mx-auto">
              Join travel groups with like-minded explorers or create your own adventure.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-grow flex items-center bg-white rounded-lg p-1">
                <div className="flex-grow flex items-center px-3">
                  <Search className="h-5 w-5 text-gray-400 mr-2" />
                  <Input
                    type="text"
                    placeholder="Search by group name or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
                  />
                </div>
                <Button>Search</Button>
              </div>
              
              <div className="md:w-1/3 w-full">
                <LocationAutocomplete
                  value={locationSearchQuery}
                  onChange={setLocationSearchQuery}
                  placeholder="Filter by destination"
                  className="h-12"
                />
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="bg-white text-trypie-700 hover:bg-white/90"
              onClick={() => {
                if (!isAuthenticated) {
                  toast({
                    title: "Authentication Required",
                    description: "Please log in to create a travel group.",
                    variant: "destructive",
                  });
                  return;
                }
                setShowCreateForm(true);
              }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create a Travel Group
            </Button>
          </div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 py-8">
          <Tabs defaultValue={activeTab} onValueChange={handleTabChange} value={activeTab}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="mygroups">My Groups</TabsTrigger>
                <TabsTrigger value="influencers" className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-400" />
                  Influencer Trips
                </TabsTrigger>
                <TabsTrigger value="explore">Explore Groups</TabsTrigger>
              </TabsList>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
            
            <TabsContent value="mygroups" className="mt-0">
              {isLoading.myGroups ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading your groups...</p>
                </div>
              ) : filteredMyGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMyGroups.map((group) => (
                    <TravelGroupCard 
                      key={group.id} 
                      group={group}
                      onClick={() => handleGroupCardClick(group)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                  <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h2 className="text-xl font-medium text-gray-700 mb-2">No Groups Yet</h2>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    {searchQuery ? 
                      "No groups match your search. Try different keywords." : 
                      "You haven't joined or created any travel groups yet. Start by browsing available groups or create your own."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => {
                      setSearchQuery("");
                      setActiveTab("explore");
                    }}>
                      Browse Groups
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create a Group
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="influencers" className="mt-0">
              <div className="mb-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
                  <Shield className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-amber-800">Verified Influencer Trips</h3>
                    <p className="text-sm text-amber-700">
                      These trips are led by vetted travel influencers. All experiences are verified and reviews are authentic.
                    </p>
                  </div>
                </div>
              </div>
              
              {isLoading.influencerTrips ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading influencer trips...</p>
                </div>
              ) : filteredInfluencerTrips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInfluencerTrips.map((group) => (
                    <TravelGroupCard 
                      key={group.id} 
                      group={group}
                      onClick={() => handleGroupCardClick(group)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No influencer trips match your search. Try different keywords.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="explore" className="mt-0">
              {isLoading.exploreGroups ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading groups to explore...</p>
                </div>
              ) : filteredExploreGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExploreGroups.map((group) => (
                    <TravelGroupCard 
                      key={group.id} 
                      group={group}
                      onClick={() => handleGroupCardClick(group)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {searchQuery 
                      ? "No groups match your search. Try different keywords." 
                      : "No groups available to explore. Check back later or create your own!"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Why Travel in Groups?
              </h2>
              <p className="text-gray-600 text-lg">
                Trypie makes group travel seamless and enjoyable with these exclusive features.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="bg-trypie-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-trypie-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  Built-in Group Chat
                </h3>
                <p className="text-gray-600">
                  Communicate effortlessly with your travel companions through our integrated messaging system.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="bg-coral-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-coral-600">
                    <rect width="16" height="16" x="4" y="4" rx="2" />
                    <path d="M4 8h16" />
                    <path d="M8 4v16" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  Collaborative Itinerary
                </h3>
                <p className="text-gray-600">
                  Plan your trip together with a shared itinerary that everyone can view and contribute to.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="bg-sand-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-sand-900">
                    <path d="M2.5 19h19" />
                    <path d="M2.5 5h19" />
                    <path d="M5 12h14" />
                    <path d="M18 12a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  Split Payments
                </h3>
                <p className="text-gray-600">
                  Easily divide and track expenses among your group members for a stress-free travel experience.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {selectedGroup && (
        <TravelGroupDetails 
          isOpen={!!selectedGroup} 
          onClose={() => setSelectedGroup(null)} 
          group={selectedGroup}
          onJoinGroup={() => handleJoinGroup(selectedGroup.id)}
        />
      )}
      
      <CreateTravelGroup 
        isOpen={showCreateForm} 
        onClose={() => setShowCreateForm(false)}
        onCreateGroup={handleCreateGroup}
      />
      
      <Footer />
    </div>
  );
};

export default Groups;
