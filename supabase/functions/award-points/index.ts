
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This edge function will handle awarding points securely
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the auth token from the request
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { 
            Authorization: req.headers.get("Authorization")! 
          },
        },
      }
    );
    
    // Verify authentication
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'User must be authenticated to award points'
      }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Parse request body
    const requestData = await req.json();
    
    // Handle direct point awarding
    if (requestData.rewardTypeId && requestData.points && requestData.description) {
      return await handleDirectPointsAward(
        supabaseClient, 
        user.id, 
        requestData.rewardTypeId, 
        requestData.points, 
        requestData.description
      );
    }
    
    // Handle action-based rewards
    if (requestData.actionType) {
      return await handleActionReward(
        supabaseClient,
        user.id,
        requestData.actionType,
        requestData.metadata || {}
      );
    }
    
    return new Response(JSON.stringify({
      error: 'Bad Request',
      message: 'Invalid request parameters'
    }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in award-points function:', error);
    return new Response(JSON.stringify({
      error: 'Server Error',
      message: error.message
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Handle direct awarding of points (admin or system-initiated)
async function handleDirectPointsAward(
  supabaseClient: any,
  userId: string,
  rewardTypeId: string,
  points: number,
  description: string
) {
  try {
    // Insert into user_rewards
    const { error: rewardError } = await supabaseClient
      .from('user_rewards')
      .insert({
        user_id: userId,
        reward_type_id: rewardTypeId,
        points: points,
        description: description
      });
    
    if (rewardError) {
      return new Response(JSON.stringify({
        error: 'Database Error',
        message: rewardError.message
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Update user reward settings
    await updateUserPoints(supabaseClient, userId, points);
    
    // Return success response
    return new Response(JSON.stringify({
      success: true,
      message: 'Points awarded successfully',
      points
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in handleDirectPointsAward:', error);
    throw error;
  }
}

// Handle action-based rewards (triggered by user actions)
async function handleActionReward(
  supabaseClient: any,
  userId: string,
  actionType: string,
  metadata: Record<string, any>
) {
  try {
    // Find matching reward type
    const { data: rewardTypes, error: rewardTypeError } = await supabaseClient
      .from('reward_types')
      .select('*')
      .filter('trigger_condition->action', 'eq', actionType);
    
    if (rewardTypeError) throw rewardTypeError;
    
    if (!rewardTypes || rewardTypes.length === 0) {
      // No matching reward found, but we'll still log the action
      const { error: logError } = await supabaseClient
        .from('user_rewards')
        .insert({
          user_id: userId,
          points: 0,
          description: `Action logged: ${actionType}`
        });
        
      if (logError) throw logError;
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Action logged',
        points: 0
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Check each potential reward to see if conditions are met
    for (const rewardType of rewardTypes) {
      const isEligible = await checkEligibility(
        supabaseClient, 
        userId, 
        rewardType, 
        actionType, 
        metadata
      );
      
      if (isEligible) {
        // User is eligible for this reward
        const { error: rewardError } = await supabaseClient
          .from('user_rewards')
          .insert({
            user_id: userId,
            reward_type_id: rewardType.id,
            points: rewardType.points,
            description: `${rewardType.title}: ${actionType}`
          });
        
        if (rewardError) throw rewardError;
        
        // Update user's total points
        await updateUserPoints(supabaseClient, userId, rewardType.points);
        
        // Check if badge should be awarded
        await checkAndAwardBadge(supabaseClient, userId, rewardType.category);
        
        // Return success with reward details
        return new Response(JSON.stringify({
          success: true,
          title: 'Reward Unlocked!',
          description: rewardType.title,
          points: rewardType.points,
          rewardType
        }), { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // No eligible rewards found, just log the action
    const { error: logError } = await supabaseClient
      .from('user_rewards')
      .insert({
        user_id: userId,
        points: 0,
        description: `Action performed: ${actionType}`
      });
      
    if (logError) throw logError;
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Action logged, no rewards unlocked',
      points: 0
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in handleActionReward:', error);
    throw error;
  }
}

// Check if user is eligible for a particular reward
async function checkEligibility(
  supabaseClient: any,
  userId: string,
  rewardType: any,
  actionType: string,
  metadata: Record<string, any>
): Promise<boolean> {
  try {
    // Check if user has already earned this reward
    const { count: existingRewards, error: existingError } = await supabaseClient
      .from('user_rewards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('reward_type_id', rewardType.id);
      
    if (existingError) throw existingError;
    
    // If user has already earned this reward and it's not repeatable, they're not eligible
    if (existingRewards && existingRewards > 0 && !rewardType.trigger_condition?.repeatable) {
      return false;
    }
    
    const triggerType = rewardType.trigger_type;
    const condition = rewardType.trigger_condition;
    
    switch (triggerType) {
      case 'action':
        // Simple action-based reward, just needs the right action type
        return true;
        
      case 'count':
        // Count-based reward, check if user has performed this action enough times
        const { count, error: countError } = await supabaseClient
          .from('user_rewards')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .ilike('description', `%${actionType}%`);
          
        if (countError) throw countError;
        
        return (count || 0) + 1 >= condition.count;
        
      case 'streak':
        // Streak-based reward (e.g., use app 3 days in a row)
        // This would need a more complex implementation with dates
        // For now, we'll just check if action matches
        return true;
        
      case 'time-based':
        // Time-based reward (e.g., account age)
        // Would need to check user's join date
        return false;
        
      case 'system':
        // System-based rewards are triggered directly, not by user actions
        return false;
        
      default:
        return false;
    }
    
  } catch (error) {
    console.error('Error checking eligibility:', error);
    return false;
  }
}

// Update user's total points
async function updateUserPoints(supabaseClient: any, userId: string, pointsToAdd: number) {
  try {
    // Get current user settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_reward_settings')
      .select('current_points, level')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (settingsError) throw settingsError;
    
    if (settings) {
      // Update existing settings
      const newPoints = settings.current_points + pointsToAdd;
      const newLevel = calculateLevel(newPoints);
      
      const { error: updateError } = await supabaseClient
        .from('user_reward_settings')
        .update({ 
          current_points: newPoints,
          level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) throw updateError;
    } else {
      // Create new settings
      const { error: insertError } = await supabaseClient
        .from('user_reward_settings')
        .insert({
          user_id: userId,
          current_points: pointsToAdd,
          level: calculateLevel(pointsToAdd)
        });
      
      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
}

// Calculate user level based on points
function calculateLevel(points: number): string {
  if (points >= 2000) return 'Globetrotter';
  if (points >= 1000) return 'Pathfinder';
  if (points >= 500) return 'Adventurer';
  if (points >= 200) return 'Explorer';
  return 'Wanderer';
}

// Check if user should be awarded a badge based on their activities in a category
async function checkAndAwardBadge(supabaseClient: any, userId: string, category: string) {
  try {
    // Get total points earned in this category
    const { data: categoryRewards, error: rewardsError } = await supabaseClient
      .from('user_rewards')
      .select('points, reward_types(category)')
      .eq('user_id', userId)
      .eq('reward_types.category', category);
      
    if (rewardsError) throw rewardsError;
    
    if (!categoryRewards || categoryRewards.length === 0) return;
    
    // Calculate total points in this category
    const totalCategoryPoints = categoryRewards.reduce(
      (sum: number, reward: any) => sum + reward.points, 0
    );
    
    // Find badges that match this category
    const { data: badges, error: badgesError } = await supabaseClient
      .from('badges')
      .select('*')
      .ilike('description', `%${category}%`)
      .order('points', { ascending: true });
      
    if (badgesError) throw badgesError;
    
    if (!badges || badges.length === 0) return;
    
    // Check if user qualifies for any new badges
    for (const badge of badges) {
      // If user has enough points and hasn't earned this badge yet
      if (totalCategoryPoints >= badge.points) {
        // Check if user already has this badge
        const { count: existingBadges, error: existingError } = await supabaseClient
          .from('user_badges')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('badge_id', badge.id);
          
        if (existingError) throw existingError;
        
        if (existingBadges === 0) {
          // Award new badge
          await supabaseClient
            .from('user_badges')
            .insert({
              user_id: userId,
              badge_id: badge.id
            });
            
          // Also add badge to reward history
          await supabaseClient
            .from('user_rewards')
            .insert({
              user_id: userId,
              badge_id: badge.id,
              points: badge.points,
              description: `Badge Earned: ${badge.title}`
            });
            
          // Update user points
          await updateUserPoints(supabaseClient, userId, badge.points);
        }
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }
}
