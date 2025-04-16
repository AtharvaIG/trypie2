
import { supabase } from "@/integrations/supabase/client";
import { GroupMessage } from "@/types/travel-group-types";
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

export async function fetchMessages(groupId: string): Promise<GroupMessage[]> {
  if (!groupId) {
    console.error("Invalid group ID provided to fetchMessages");
    return [];
  }
  
  // For sample groups, check if we have real messages first
  if (groupId.startsWith('sample-')) {
    try {
      // Try to fetch real messages first (in case they were added after joining)
      const { data, error } = await supabase
        .from('group_chat_messages')
        .select(`
          *
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });
        
      if (!error && data && data.length > 0) {
        console.log("Found existing messages for sample group:", data.length);
        
        // Process these messages normally
        const messagesWithProfiles = await Promise.all(data.map(async (message) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', message.user_id)
            .single();
          
          if (profileError) {
            console.error("Error fetching message sender profile:", profileError);
          }
          
          return {
            ...message,
            senderProfile: profileData ? mapProfile(profileData) : undefined
          } as GroupMessage;
        }));

        return messagesWithProfiles;
      } else {
        // No real messages yet, return empty array
        console.log("No messages found for sample group, returning empty array");
        return [];
      }
    } catch (error) {
      console.error("Error checking for real messages in sample group:", error);
      return [];
    }
  }
  
  // Standard message fetching for real groups
  const { data, error } = await supabase
    .from('group_chat_messages')
    .select(`
      *
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching group messages:", error);
    throw error;
  }

  const messagesWithProfiles = await Promise.all(data.map(async (message) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', message.user_id)
      .single();
    
    if (profileError) {
      console.error("Error fetching message sender profile:", profileError);
    }
    
    return {
      ...message,
      senderProfile: profileData ? mapProfile(profileData) : undefined
    } as GroupMessage;
  }));

  return messagesWithProfiles;
}

export async function sendMessage(groupId: string, message: string, mediaUrl?: string): Promise<GroupMessage> {
  // Validate inputs
  if (!groupId) {
    throw new Error("Group ID is required");
  }
  
  if (!message && !mediaUrl) {
    throw new Error("Message or media is required");
  }
  
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user?.id) {
    throw new Error("User is not authenticated");
  }
  
  // Special handling for sample group IDs to make them work like real groups
  if (groupId.startsWith('sample-')) {
    try {
      // For sample groups, we actually insert into the real table
      const { data, error } = await supabase
        .from('group_chat_messages')
        .insert({
          group_id: groupId, // Keep the sample ID as is
          user_id: userData.user.id,
          message,
          media_url: mediaUrl
        })
        .select()
        .single();
    
      if (error) {
        console.error("Error sending message to sample group:", error);
        throw error;
      }
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();
    
      return {
        ...data,
        senderProfile: profileData ? mapProfile(profileData) : undefined
      } as GroupMessage;
    } catch (error) {
      console.error("Error sending message to sample group:", error);
      throw error;
    }
  }
  
  // Normal flow for real groups
  const { data, error } = await supabase
    .from('group_chat_messages')
    .insert({
      group_id: groupId,
      user_id: userData.user.id,
      message,
      media_url: mediaUrl
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    throw error;
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();

  return {
    ...data,
    senderProfile: profileData ? mapProfile(profileData) : undefined
  } as GroupMessage;
}

export function subscribeToGroupMessages(groupId: string, callback: (message: GroupMessage) => void) {
  if (!groupId) {
    console.error("Invalid group ID provided to subscribeToGroupMessages");
    return {
      unsubscribe: () => {}
    };
  }
  
  // Even for sample groups, we subscribe to real-time updates
  return supabase
    .channel(`group-messages-${groupId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'group_chat_messages',
        filter: `group_id=eq.${groupId}`
      },
      async (payload) => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', payload.new.user_id)
          .single();

        const message = {
          ...payload.new,
          senderProfile: data ? mapProfile(data) : undefined
        } as GroupMessage;
        
        callback(message);
      }
    )
    .subscribe();
}

export function subscribeToGroupChanges(groupId: string, callback: () => void) {
  if (!groupId) {
    console.error("Invalid group ID provided to subscribeToGroupChanges");
    return {
      unsubscribe: () => {}
    };
  }
  
  // Even for sample groups, we subscribe to real-time updates
  return supabase
    .channel(`group-changes-${groupId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'travel_groups',
        filter: `id=eq.${groupId}`
      },
      () => callback()
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_groups',
        filter: `group_id=eq.${groupId}`
      },
      () => callback()
    )
    .subscribe();
}
