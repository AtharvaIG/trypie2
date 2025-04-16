
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/auth-types";

export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log("Fetching profile for user:", userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, created_at, bio, interests, website_url, instagram_handle, twitter_handle')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (data) {
      console.log("Profile found:", data);
      return {
        id: data.id,
        fullName: data.full_name || null,
        avatarUrl: data.avatar_url || null,
        email: '', // Since this isn't in the profiles table, we'd need another query or context
        createdAt: data.created_at || new Date().toISOString(),
        bio: data.bio || null,
        interests: data.interests || null,
        websiteUrl: data.website_url || null,
        instagramHandle: data.instagram_handle || null,
        twitterHandle: data.twitter_handle || null
      };
    }
    
    console.log("No profile found for user:", userId);
    return null;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};
