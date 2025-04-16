
import { supabase } from "@/integrations/supabase/client";
import { TravelGroup, GroupMember } from "@/types/travel-group-types";
import { Profile } from "@/types/auth-types";

// Helper function to map Supabase profile data to our Profile type
const mapProfile = (profile: any): Profile | undefined => {
  if (!profile) return undefined;
  return {
    id: profile.id,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    email: profile.email || "",
    createdAt: profile.created_at || new Date().toISOString()
  };
};

// Sample influencer trips data
const sampleInfluencerTrips: TravelGroup[] = [
  {
    id: "sample-influencer-1",
    title: "Rajasthan Heritage Tour",
    destination: "Jaipur, Udaipur & Jaisalmer, India",
    description: "Join travel photographer @IndiaLens for a 10-day adventure capturing Rajasthan's magnificent palaces, vibrant markets, and desert landscapes. Perfect for photography enthusiasts of all levels. Includes exclusive sunrise access to forts and personalized editing workshops.",
    start_date: "2025-10-15",
    end_date: "2025-10-25",
    capacity: 12,
    memberCount: 4,
    is_influencer_trip: true,
    is_public: true,
    creator_id: "sample-creator",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80",
    organizer: {
      id: "sample-creator",
      fullName: "India Lens",
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      email: "indialens@example.com",
      createdAt: new Date().toISOString()
    }
  },
  {
    id: "sample-influencer-2",
    title: "Kerala Backwaters Cruise",
    destination: "Kochi & Alleppey, India",
    description: "Float through the serene backwaters of Kerala with influencer @IndianEscape. Experience 7 days of houseboat living, ayurvedic treatments, and unforgettable sunsets. All-inclusive package with luxury accommodation and curated cultural experiences at each stop.",
    start_date: "2025-01-10",
    end_date: "2025-01-17",
    capacity: 15,
    memberCount: 8,
    is_influencer_trip: true,
    is_public: true,
    creator_id: "sample-creator-2",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80",
    organizer: {
      id: "sample-creator-2",
      fullName: "Indian Escape",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      email: "indianescape@example.com",
      createdAt: new Date().toISOString()
    }
  },
  {
    id: "sample-influencer-3",
    title: "Himalayan Mountain Trek",
    destination: "Manali & Ladakh, India",
    description: "Experience the magic of the Himalayas with trekking expert @MountainTales. This 12-day guided tour includes traditional homestays, hidden mountain trails, and exclusive access to remote villages normally closed to tourists.",
    start_date: "2025-05-25",
    end_date: "2025-06-05",
    capacity: 10,
    memberCount: 6,
    is_influencer_trip: true,
    is_public: true,
    creator_id: "sample-creator-3",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1587922546925-ab57ef2aa006?auto=format&fit=crop&q=80",
    organizer: {
      id: "sample-creator-3",
      fullName: "Mountain Tales",
      avatarUrl: "https://randomuser.me/api/portraits/women/63.jpg",
      email: "mountaintales@example.com",
      createdAt: new Date().toISOString()
    }
  }
];

// Sample explore groups data
const sampleExploreGroups: TravelGroup[] = [
  {
    id: "sample-explore-1",
    title: "Golden Triangle Adventure",
    destination: "Delhi, Agra & Jaipur, India",
    description: "Join our small group exploring India's iconic Golden Triangle! We'll visit the magnificent Taj Mahal, explore ancient forts, and experience vibrant markets. Looking for culture enthusiasts with a sense of adventure.",
    start_date: "2025-09-10",
    end_date: "2025-09-20",
    capacity: 8,
    memberCount: 3,
    is_influencer_trip: false,
    is_public: true,
    creator_id: "sample-creator-4",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80",
    organizer: {
      id: "sample-creator-4",
      fullName: "Travel India",
      avatarUrl: "https://randomuser.me/api/portraits/women/22.jpg",
      email: "travelindia@example.com",
      createdAt: new Date().toISOString()
    }
  },
  {
    id: "sample-explore-2",
    title: "South Indian Culinary Tour",
    destination: "Chennai, Madurai & Pondicherry, India",
    description: "Calling all foodies! Join us for a 10-day culinary journey through South India. We'll explore bustling street food markets, take cooking classes, and taste our way through the diverse regional cuisines of Tamil Nadu.",
    start_date: "2025-11-05",
    end_date: "2025-11-15",
    capacity: 6,
    memberCount: 2,
    is_influencer_trip: false,
    is_public: true,
    creator_id: "sample-creator-5",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1589778655375-3c31f9a5dc33?auto=format&fit=crop&q=80",
    organizer: {
      id: "sample-creator-5",
      fullName: "South Indian Foodie",
      avatarUrl: "https://randomuser.me/api/portraits/men/45.jpg",
      email: "southindianfoodie@example.com",
      createdAt: new Date().toISOString()
    }
  },
  {
    id: "sample-explore-3",
    title: "Goa Beach Retreat",
    destination: "North & South Goa, India",
    description: "Experience Goa's incredible beaches and Portuguese heritage on this relaxing tour. We'll visit pristine beaches, historic churches, and vibrant markets while staying in beachfront accommodations. Perfect for beach lovers and cultural explorers.",
    start_date: "2025-12-01",
    end_date: "2025-12-12",
    capacity: 10,
    memberCount: 5,
    is_influencer_trip: false,
    is_public: true,
    creator_id: "sample-creator-6",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80",
    organizer: {
      id: "sample-creator-6",
      fullName: "Goa Explorers",
      avatarUrl: "https://randomuser.me/api/portraits/men/67.jpg",
      email: "goaexplorers@example.com",
      createdAt: new Date().toISOString()
    }
  }
];

// Travel Groups
export async function fetchMyGroups(): Promise<TravelGroup[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  
  if (!userId) {
    console.log("No authenticated user found when fetching my groups");
    return [];
  }
  
  console.log("Fetching groups for user:", userId);
  
  // First, check for groups created by the user
  const { data: createdGroups, error: createdGroupsError } = await supabase
    .from('travel_groups')
    .select('*')
    .eq('creator_id', userId);
  
  if (createdGroupsError) {
    console.error("Error fetching created groups:", createdGroupsError);
  } else {
    console.log("Groups created by user:", createdGroups || []);
  }
  
  // Get all groups the user is a member of
  const { data: userGroups, error: userGroupsError } = await supabase
    .from('user_groups')
    .select('group_id')
    .eq('user_id', userId);

  if (userGroupsError) {
    console.error("Error fetching user groups:", userGroupsError);
    throw userGroupsError;
  }

  console.log("User group memberships:", userGroups || []);
  
  if (!userGroups || userGroups.length === 0) {
    console.log("User is not a member of any groups");
    return [];
  }

  const groupIds = userGroups.map(ug => ug.group_id);
  console.log("Found group IDs:", groupIds);

  // Fetch the groups with their info
  const { data: groups, error } = await supabase
    .from('travel_groups')
    .select('*')
    .in('id', groupIds);

  if (error) {
    console.error("Error fetching travel groups:", error);
    throw error;
  }

  if (!groups || groups.length === 0) {
    console.log("No group data found");
    return [];
  }

  // Fetch user counts for each group
  const groupsWithCounts = await Promise.all(groups.map(async (group) => {
    console.log("Processing group:", group.id);
    
    const { count, error: countError } = await supabase
      .from('user_groups')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', group.id);
    
    if (countError) {
      console.error("Error counting group members:", countError);
    }
    
    // Fetch the organizer's profile
    const { data: organizerData, error: organizerError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', group.creator_id)
      .single();
    
    if (organizerError) {
      console.error("Error fetching organizer profile:", organizerError);
    }
    
    return {
      ...group,
      memberCount: count || 0,
      organizer: organizerData ? mapProfile(organizerData) : undefined
    } as TravelGroup;
  }));

  return groupsWithCounts;
}

export async function fetchInfluencerTrips(): Promise<TravelGroup[]> {
  const { data, error } = await supabase
    .from('travel_groups')
    .select('*')
    .eq('is_influencer_trip', true)
    .eq('is_public', true);

  if (error) {
    console.error("Error fetching influencer trips:", error);
    return sampleInfluencerTrips;
  }

  if (!data || data.length === 0) {
    return sampleInfluencerTrips;
  }

  const groupsWithDetails = await Promise.all(data.map(async (group) => {
    const { count, error: countError } = await supabase
      .from('user_groups')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', group.id);
    
    if (countError) {
      console.error("Error counting group members:", countError);
    }
    
    const { data: organizerData, error: organizerError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', group.creator_id)
      .single();
    
    if (organizerError) {
      console.error("Error fetching organizer profile:", organizerError);
    }
    
    return {
      ...group,
      memberCount: count || 0,
      organizer: organizerData ? mapProfile(organizerData) : undefined
    } as TravelGroup;
  }));

  return groupsWithDetails;
}

export async function fetchExploreGroups(): Promise<TravelGroup[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  
  if (!userId) {
    return sampleExploreGroups;
  }
  
  const { data: userGroups, error: userGroupsError } = await supabase
    .from('user_groups')
    .select('group_id')
    .eq('user_id', userId);

  if (userGroupsError) {
    console.error("Error fetching user groups:", userGroupsError);
    return sampleExploreGroups;
  }

  const excludeIds = userGroups?.map(ug => ug.group_id) || [];

  try {
    // If no groups to exclude, just get all public groups
    let query;
    if (excludeIds.length === 0) {
      query = supabase
        .from('travel_groups')
        .select('*')
        .eq('is_public', true);
    } else {
      // Use a different approach to exclude the IDs
      query = supabase
        .from('travel_groups')
        .select('*')
        .eq('is_public', true)
        .not('id', 'in', `(${excludeIds.map(id => `'${id}'`).join(',')})`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return sampleExploreGroups;
    }

    const groupsWithDetails = await Promise.all(data.map(async (group) => {
      const { count, error: countError } = await supabase
        .from('user_groups')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);
      
      if (countError) {
        console.error("Error counting group members:", countError);
      }
      
      const { data: organizerData, error: organizerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', group.creator_id)
        .single();
      
      if (organizerError) {
        console.error("Error fetching organizer profile:", organizerError);
      }
      
      return {
        ...group,
        memberCount: count || 0,
        organizer: organizerData ? mapProfile(organizerData) : undefined
      } as TravelGroup;
    }));

    return groupsWithDetails;
  } catch (error) {
    console.error("Error fetching explore groups:", error);
    return sampleExploreGroups;
  }
}

export async function fetchGroupById(groupId: string): Promise<TravelGroup> {
  if (groupId.startsWith('sample-influencer-')) {
    const sampleGroup = sampleInfluencerTrips.find(group => group.id === groupId);
    if (sampleGroup) return sampleGroup;
  }
  
  if (groupId.startsWith('sample-explore-')) {
    const sampleGroup = sampleExploreGroups.find(group => group.id === groupId);
    if (sampleGroup) return sampleGroup;
  }

  const { data, error } = await supabase
    .from('travel_groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (error) {
    console.error("Error fetching group by ID:", error);
    throw error;
  }

  const { count, error: countError } = await supabase
    .from('user_groups')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId);
  
  if (countError) {
    console.error("Error counting group members:", countError);
  }
  
  const { data: organizerData, error: organizerError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.creator_id)
    .single();
  
  if (organizerError) {
    console.error("Error fetching organizer profile:", organizerError);
  }
  
  return {
    ...data,
    memberCount: count || 0,
    organizer: organizerData ? mapProfile(organizerData) : undefined
  } as TravelGroup;
}

export async function createGroup(group: Omit<TravelGroup, 'id' | 'created_at' | 'creator_id'>): Promise<TravelGroup> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user?.id) {
    console.error("User is not authenticated");
    throw new Error("User is not authenticated");
  }
  
  console.log("Creating group with user ID:", userData.user.id);
  console.log("Group data:", group);
  
  const { data, error } = await supabase
    .from('travel_groups')
    .insert({
      ...group,
      creator_id: userData.user.id
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating group:", error);
    throw error;
  }

  if (!data) {
    console.error("No data returned from group creation");
    throw new Error("Failed to create group");
  }

  console.log("Group created successfully:", data);

  try {
    const joinResult = await joinGroup(data.id);
    console.log("Creator joined group successfully:", joinResult);
  } catch (joinError) {
    console.error("Error joining group:", joinError);
  }

  const { data: membershipCheck, error: membershipError } = await supabase
    .from('user_groups')
    .select('*')
    .eq('user_id', userData.user.id)
    .eq('group_id', data.id);
    
  if (membershipError) {
    console.error("Error checking membership:", membershipError);
  } else {
    console.log("Membership check result:", membershipCheck);
  }

  const { data: creatorData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();

  return {
    ...data,
    memberCount: 1,
    organizer: creatorData ? mapProfile(creatorData) : undefined
  } as TravelGroup;
}

export async function joinGroup(groupId: string): Promise<GroupMember> {
  if (!groupId) {
    throw new Error("Group ID is required");
  }
  
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user?.id) {
    console.error("User is not authenticated");
    throw new Error("User is not authenticated");
  }
  
  console.log("Joining group:", groupId, "User:", userData.user.id);
  
  const { data: existingMembership, error: checkError } = await supabase
    .from('user_groups')
    .select('*')
    .eq('user_id', userData.user.id)
    .eq('group_id', groupId)
    .maybeSingle();
  
  if (checkError) {
    console.error("Error checking existing membership:", checkError);
  } else if (existingMembership) {
    console.log("User is already a member of this group:", existingMembership);
    
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();
      
    return {
      ...existingMembership,
      profile: profileData ? mapProfile(profileData) : undefined
    } as GroupMember;
  }
  
  const { data, error } = await supabase
    .from('user_groups')
    .insert({
      user_id: userData.user.id,
      group_id: groupId,
      role: 'member'
    })
    .select()
    .single();

  if (error) {
    console.error("Error joining group:", error);
    throw error;
  }

  if (!data) {
    console.error("No data returned from joining group");
    throw new Error("Failed to join group");
  }
  
  console.log("Successfully joined group:", data);

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();

  return {
    ...data,
    profile: profileData ? mapProfile(profileData) : undefined
  } as GroupMember;
}

export async function leaveGroup(groupId: string): Promise<boolean> {
  if (!groupId) {
    throw new Error("Group ID is required");
  }
  
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user?.id) {
    throw new Error("User is not authenticated");
  }
  
  const { error } = await supabase
    .from('user_groups')
    .delete()
    .match({
      user_id: userData.user.id,
      group_id: groupId
    });

  if (error) {
    console.error("Error leaving group:", error);
    throw error;
  }

  return true;
}
