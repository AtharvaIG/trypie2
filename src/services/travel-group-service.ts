
import { supabase } from "@/integrations/supabase/client";
import { TravelGroup, GroupMember, GroupExpense, GroupItinerary } from "@/types/travel-group-types";
import { Profile } from "@/types/auth-types";

// Re-export from other service files
export { 
  fetchMyGroups, 
  fetchInfluencerTrips, 
  fetchExploreGroups,
  fetchGroupById,
  createGroup,
  joinGroup,
  leaveGroup
} from "./travel-group-service-groups";

export {
  fetchGroupMembers
} from "./travel-group-service-members";

export {
  fetchGroupExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchExpenseShares,
  createExpenseShare,
  updateExpenseShare,
  deleteExpenseShare
} from "./travel-group-service-expenses";

export {
  fetchGroupItineraries,
  createItinerary,
  updateItinerary,
  deleteItinerary
} from "./travel-group-service-itinerary";

export {
  sendMessage,
  fetchMessages,
  subscribeToGroupMessages,
  subscribeToGroupChanges
} from "./travel-group-service-messages";

// Group settings functions
export async function updateGroupSettings(groupId: string, updates: {
  title?: string;
  description?: string;
  destination?: string;
  image_url?: string;
  is_public?: boolean;
  capacity?: number;
}): Promise<TravelGroup> {
  if (groupId.startsWith('sample-')) {
    return {
      id: groupId,
      title: updates.title || 'Sample Group',
      description: updates.description,
      destination: updates.destination || 'Sample Destination',
      image_url: updates.image_url,
      is_public: updates.is_public !== undefined ? updates.is_public : true,
      capacity: updates.capacity || 10,
      creator_id: 'sample-user',
      created_at: new Date().toISOString(),
      is_influencer_trip: false
    } as TravelGroup;
  }
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user?.id) {
    throw new Error("User not authenticated");
  }

  // Check if current user is the creator
  const { data: groupData, error: groupError } = await supabase
    .from('travel_groups')
    .select('creator_id')
    .eq('id', groupId)
    .single();

  if (groupError) {
    console.error("Error fetching group:", groupError);
    throw groupError;
  }

  if (groupData.creator_id !== userData.user.id) {
    throw new Error("Only the group creator can update group settings");
  }

  const { data, error } = await supabase
    .from('travel_groups')
    .update(updates)
    .eq('id', groupId)
    .select()
    .single();

  if (error) {
    console.error("Error updating group settings:", error);
    throw error;
  }

  return data as TravelGroup;
}

// Invite user to group
export async function inviteUserToGroup(groupId: string, email: string): Promise<boolean> {
  // For sample groups, simulate success
  if (groupId.startsWith('sample-')) {
    // In a real app, this would send an email invitation
    console.log(`Sample invite sent to ${email} for group ${groupId}`);
    return true;
  }
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user?.id) {
    throw new Error("User not authenticated");
  }

  // Get current user's information
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userData.user.id)
    .single();
  
  // Get group information
  const { data: group } = await supabase
    .from('travel_groups')
    .select('title')
    .eq('id', groupId)
    .single();

  if (!group) {
    throw new Error("Group not found");
  }

  const inviterName = profile?.full_name || "A Trypie user";
  const groupName = group.title;

  try {
    // Fix: Use a properly constructed URL instead of accessing protected supabaseUrl property
    const functionUrl = 'https://dfyxmrskfmzufjqaanjo.supabase.co/functions/v1/send-invitation';
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        email,
        groupId,
        groupName,
        inviterName
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send invitation");
    }

    const result = await response.json();
    console.log(`Invitation process completed:`, result);
    
    // Check if we're in test mode
    if (result.testMode) {
      console.log(`Test mode active: Email sent to ${result.recipientEmail} instead of ${result.actualEmail}`);
    }
    
    if (!result.emailSent) {
      console.warn(`Email delivery failed but invitation was created. Error: ${result.emailError}`);
    }

    return true;
  } catch (error) {
    console.error("Error inviting user:", error);
    throw error;
  }
}

// Accept group invitation
export async function acceptGroupInvitation(token: string): Promise<{ group: TravelGroup; success: boolean }> {
  try {
    console.log("Accepting invitation with token:", token);
    
    // Use the correct RPC function name and handle the response properly
    const { data, error } = await supabase.rpc('get_group_invitation_by_token', {
      p_token: token
    });
    
    console.log("Invitation data:", data, "Error:", error);
    
    if (error || !data) {
      throw new Error("Invalid or expired invitation");
    }
    
    // The RPC function returns an array
    if (Array.isArray(data) && data.length === 0) {
      throw new Error("Invalid or expired invitation");
    }
    
    // Get the first invitation from the array
    const invitation = Array.isArray(data) ? data[0] : data;
    
    // Check if invitation is expired
    if (invitation.status !== "pending" || new Date(invitation.expires_at) < new Date()) {
      throw new Error("Invitation has expired or already been used");
    }
    
    const groupId = invitation.group_id;
    console.log("Group ID from invitation:", groupId);
    
    // Import the joinGroup function directly to avoid circular references
    const { joinGroup } = await import('./travel-group-service-groups');
    await joinGroup(groupId);
    
    // Update invitation status using RPC function
    const { error: updateError } = await supabase.rpc('update_invitation_status', {
      p_token: token,
      p_status: 'accepted'
    });
    
    if (updateError) {
      throw new Error(`Error updating invitation status: ${updateError.message}`);
    }
    
    // Get group details by importing the needed function
    const { fetchGroupById } = await import('./travel-group-service-groups');
    const group = await fetchGroupById(groupId);
    
    return {
      group,
      success: true
    };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    throw error;
  }
}
