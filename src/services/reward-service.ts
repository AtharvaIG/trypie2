
import { supabase } from "@/integrations/supabase/client";
import { UserRewardSettings, RewardType, Badge, UserBadge, UserReward } from "@/types/reward-types";
import { toast } from "@/hooks/use-toast";

// Get the user's reward settings (points, level)
export const getUserRewardSettings = async (userId: string): Promise<UserRewardSettings | null> => {
  try {
    // Use type assertion to bypass type checking for tables not in the schema
    const { data, error } = await supabase
      .from('user_reward_settings' as any)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) throw error;
    
    return data as unknown as UserRewardSettings;
  } catch (error) {
    console.error('Error fetching user reward settings:', error);
    return null;
  }
};

// Get all visible reward types for the user
export const getVisibleRewardTypes = async (): Promise<RewardType[]> => {
  try {
    // Use type assertion to bypass type checking for tables not in the schema
    const { data, error } = await supabase
      .from('reward_types' as any)
      .select('*')
      .eq('is_secret', false)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    return data as unknown as RewardType[];
  } catch (error) {
    console.error('Error fetching reward types:', error);
    return [];
  }
};

// Get rewards by category
export const getRewardsByCategory = async (category: string): Promise<RewardType[]> => {
  try {
    const { data, error } = await supabase
      .from('reward_types' as any)
      .select('*')
      .eq('category', category)
      .eq('is_secret', false)
      .order('points', { ascending: true });
      
    if (error) throw error;
    
    return data as unknown as RewardType[];
  } catch (error) {
    console.error(`Error fetching ${category} rewards:`, error);
    return [];
  }
};

// Get all badges (earned and non-earned) for the user
export const getUserBadges = async (userId: string): Promise<{badges: Badge[], userBadges: UserBadge[]}> => {
  try {
    // Get all badges
    const { data: badges, error: badgesError } = await supabase
      .from('badges' as any)
      .select('*')
      .eq('is_secret', false)
      .order('created_at', { ascending: true });
      
    if (badgesError) throw badgesError;
    
    // Get user's earned badges
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges' as any)
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
      
    if (userBadgesError) throw userBadgesError;
    
    return {
      badges: badges as unknown as Badge[],
      userBadges: userBadges as unknown as UserBadge[]
    };
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return { badges: [], userBadges: [] };
  }
};

// Get user's reward history (points history)
export const getUserRewardHistory = async (userId: string): Promise<UserReward[]> => {
  try {
    const { data, error } = await supabase
      .from('user_rewards' as any)
      .select(`
        *,
        reward_types(title, description, icon),
        badges(title, description, icon)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data as unknown as UserReward[];
  } catch (error) {
    console.error('Error fetching user reward history:', error);
    return [];
  }
};

// Award points to a user (calls the edge function)
export const awardPoints = async (
  rewardTypeId: string, 
  points: number, 
  description: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('award-points', {
      body: {
        rewardTypeId,
        points,
        description
      }
    });
    
    if (error) throw error;
    
    toast({
      title: "Points Awarded!",
      description: `You earned ${points} points: ${description}`,
    });
    
    return true;
  } catch (error) {
    console.error('Error awarding points:', error);
    toast({
      title: "Error",
      description: "Failed to award points. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

// Trigger a reward by action type
export const triggerReward = async (
  actionType: string, 
  metadata: Record<string, any> = {}
): Promise<boolean> => {
  try {
    // The award-points edge function will handle checking for eligibility
    // and automatically assigning the reward if conditions are met
    const { data, error } = await supabase.functions.invoke('award-points', {
      body: {
        actionType,
        metadata
      }
    });
    
    if (error) throw error;
    
    if (data?.success && data?.points) {
      toast({
        title: data.title || "Points Awarded!",
        description: data.description || `You earned ${data.points} points!`,
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error triggering reward:', error);
    return false;
  }
};

// Get reward progress for a specific action type
export const getRewardProgress = async (
  userId: string,
  actionType: string
): Promise<{
  current: number;
  target: number;
  percentage: number;
  rewardType: RewardType | null;
}> => {
  try {
    // Get the specific reward type for this action
    const { data, error } = await supabase
      .from('reward_types' as any)
      .select('*')
      .eq('trigger_condition->action', actionType)
      .maybeSingle();
      
    if (error) throw error;
    
    if (!data) {
      return {
        current: 0,
        target: 0,
        percentage: 0,
        rewardType: null
      };
    }
    
    // Type assertion to ensure we can safely access trigger_condition
    const rewardType = data as unknown as RewardType;
    
    // Count user's actions of this type
    const { count, error: countError } = await supabase
      .from('user_rewards' as any)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .ilike('description', `%${actionType}%`);
      
    if (countError) throw countError;
    
    const current = count || 0;
    // Safely access trigger_condition after type assertion
    const target = rewardType.trigger_condition?.count || 1;
    const percentage = Math.min(100, Math.round((current / target) * 100));
    
    return {
      current,
      target,
      percentage,
      rewardType: rewardType
    };
  } catch (error) {
    console.error('Error fetching reward progress:', error);
    return {
      current: 0,
      target: 0,
      percentage: 0,
      rewardType: null
    };
  }
};
