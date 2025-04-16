import { supabase } from "@/integrations/supabase/client";
import { GroupItinerary } from "@/types/travel-group-types";
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

export async function fetchGroupItineraries(groupId: string): Promise<GroupItinerary[]> {
  if (groupId.startsWith('sample-')) {
    // Return sample itineraries for demo groups
    return [
      {
        id: 'sample-itinerary-1',
        group_id: groupId,
        title: 'Explore Local Attractions',
        description: 'Visit the main tourist spots in the city center',
        day_number: 1,
        created_by: 'sample-user-1',
        created_at: new Date().toISOString(),
        creatorProfile: {
          id: 'sample-user-1',
          fullName: 'Alex Johnson',
          avatarUrl: 'https://i.pravatar.cc/150?u=sample1',
          email: 'alex@example.com',
          createdAt: new Date().toISOString()
        }
      },
      {
        id: 'sample-itinerary-2',
        group_id: groupId,
        title: 'Beach Day',
        description: 'Relax at the beach and enjoy water sports',
        day_number: 2,
        created_by: 'sample-user-2',
        created_at: new Date().toISOString(),
        creatorProfile: {
          id: 'sample-user-2',
          fullName: 'Sam Smith',
          avatarUrl: 'https://i.pravatar.cc/150?u=sample2',
          email: 'sam@example.com',
          createdAt: new Date().toISOString()
        }
      }
    ];
  }
  
  // Fetch all itineraries for the group
  const { data: itinerariesData, error: itinerariesError } = await supabase
    .from('group_itineraries')
    .select('*')
    .eq('group_id', groupId);

  if (itinerariesError) {
    console.error("Error fetching group itineraries:", itinerariesError);
    throw itinerariesError;
  }

  // Fetch creator profiles for each itinerary
  const itinerariesWithProfiles = await Promise.all(itinerariesData.map(async (itinerary) => {
    const { data: creatorData, error: creatorError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', itinerary.created_by)
      .single();
    
    if (creatorError) {
      console.error("Error fetching creator profile:", creatorError);
    }

    return {
      ...itinerary,
      creatorProfile: creatorData ? mapProfile(creatorData) : undefined
    } as GroupItinerary;
  }));

  return itinerariesWithProfiles;
}

export async function createItinerary(itineraryData: {
  group_id: string;
  title: string;
  description?: string;
  day_number?: number;
  created_by: string;
}): Promise<GroupItinerary> {
  if (itineraryData.group_id.startsWith('sample-')) {
    return {
      id: `sample-itinerary-${Date.now()}`,
      group_id: itineraryData.group_id,
      title: itineraryData.title,
      description: itineraryData.description,
      day_number: itineraryData.day_number,
      created_by: itineraryData.created_by,
      created_at: new Date().toISOString()
    } as GroupItinerary;
  }
  
  const { data, error } = await supabase
    .from('group_itineraries')
    .insert(itineraryData)
    .select()
    .single();

  if (error) {
    console.error("Error creating itinerary:", error);
    throw error;
  }

  // Get the creator's profile
  const { data: creatorData, error: creatorError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', itineraryData.created_by)
    .single();
    
  if (creatorError) {
    console.error("Error fetching creator profile:", creatorError);
  }

  return {
    ...data,
    creatorProfile: creatorData ? mapProfile(creatorData) : undefined
  } as GroupItinerary;
}

export async function updateItinerary(
  id: string, 
  updates: {
    title?: string;
    description?: string;
    day_number?: number;
  }
): Promise<GroupItinerary> {
  if (id.startsWith('sample-')) {
    return {
      id: id,
      group_id: 'sample-group',
      title: updates.title || 'Sample Itinerary',
      description: updates.description,
      day_number: updates.day_number,
      created_by: 'sample-user',
      created_at: new Date().toISOString()
    } as GroupItinerary;
  }
  
  const { data, error } = await supabase
    .from('group_itineraries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating itinerary:", error);
    throw error;
  }

  // Get the creator's profile
  const { data: creatorData, error: creatorError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.created_by)
    .single();
    
  if (creatorError) {
    console.error("Error fetching creator profile:", creatorError);
  }

  return {
    ...data,
    creatorProfile: creatorData ? mapProfile(creatorData) : undefined
  } as GroupItinerary;
}

export async function deleteItinerary(id: string): Promise<boolean> {
  if (id.startsWith('sample-')) {
    return true;
  }
  
  const { error } = await supabase
    .from('group_itineraries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting itinerary:", error);
    throw error;
  }

  return true;
}
