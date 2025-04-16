
import { supabase } from "@/integrations/supabase/client";
import { GroupMember } from "@/types/travel-group-types";
import { Profile } from "@/types/auth-types";
import { sampleInfluencerTrips, sampleExploreGroups } from "./travel-group-service-samples";

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

export async function fetchGroupMembers(groupId: string): Promise<GroupMember[]> {
  if (groupId.startsWith('sample-influencer-')) {
    const sampleGroup = sampleInfluencerTrips.find(group => group.id === groupId);
    if (sampleGroup && sampleGroup.organizer) {
      return [{
        id: `sample-member-${sampleGroup.id}`,
        user_id: sampleGroup.organizer.id,
        group_id: sampleGroup.id,
        joined_at: sampleGroup.created_at,
        role: 'organizer',
        profile: sampleGroup.organizer
      } as GroupMember];
    }
  }
  
  if (groupId.startsWith('sample-explore-')) {
    const sampleGroup = sampleExploreGroups.find(group => group.id === groupId);
    if (sampleGroup && sampleGroup.organizer) {
      return [{
        id: `sample-member-${sampleGroup.id}`,
        user_id: sampleGroup.organizer.id,
        group_id: sampleGroup.id,
        joined_at: sampleGroup.created_at,
        role: 'organizer',
        profile: sampleGroup.organizer
      } as GroupMember];
    }
  }
  
  const { data, error } = await supabase
    .from('user_groups')
    .select('*')
    .eq('group_id', groupId);

  if (error) {
    console.error("Error fetching group members:", error);
    throw error;
  }

  const membersWithProfiles = await Promise.all(data.map(async (member) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', member.user_id)
      .single();
    
    if (profileError) {
      console.error("Error fetching member profile:", profileError);
    }
    
    return {
      ...member,
      profile: profileData ? mapProfile(profileData) : undefined
    } as GroupMember;
  }));

  return membersWithProfiles;
}
