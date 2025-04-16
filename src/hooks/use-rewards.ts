
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserRewardSettings, 
  getVisibleRewardTypes, 
  getUserBadges,
  getUserRewardHistory
} from '@/services/reward-service';
import { 
  UserRewardSettings, 
  RewardType, 
  Badge, 
  UserBadge, 
  UserReward,
  USER_LEVELS
} from '@/types/reward-types';

export const useRewards = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userSettings, setUserSettings] = useState<UserRewardSettings | null>(null);
  const [rewardTypes, setRewardTypes] = useState<RewardType[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [rewardHistory, setRewardHistory] = useState<UserReward[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadRewardsData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Load user reward settings
      const settings = await getUserRewardSettings(user.id);
      setUserSettings(settings);

      // Load reward types
      const types = await getVisibleRewardTypes();
      setRewardTypes(types);

      // Load badges
      const badgesData = await getUserBadges(user.id);
      setBadges(badgesData.badges);
      setEarnedBadges(badgesData.userBadges);

      // Load reward history
      const history = await getUserRewardHistory(user.id);
      setRewardHistory(history);
    } catch (err) {
      console.error('Error loading rewards data:', err);
      setError('Failed to load rewards data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate progress to next level
  const calculateLevelProgress = (): { 
    currentLevel: string; 
    nextLevel: string | null;
    progressPercentage: number;
    pointsToNextLevel: number;
  } => {
    if (!userSettings) {
      return {
        currentLevel: 'Wanderer',
        nextLevel: 'Explorer',
        progressPercentage: 0,
        pointsToNextLevel: 200
      };
    }

    const currentLevelIndex = USER_LEVELS.findIndex(level => level.level === userSettings.level);
    const currentLevel = USER_LEVELS[currentLevelIndex];
    const nextLevel = currentLevelIndex < USER_LEVELS.length - 1 ? USER_LEVELS[currentLevelIndex + 1] : null;
    
    let progressPercentage = 100;
    let pointsToNextLevel = 0;
    
    if (nextLevel) {
      const currentLevelPoints = userSettings.current_points - currentLevel.minPoints;
      const totalLevelPoints = nextLevel.minPoints - currentLevel.minPoints;
      progressPercentage = Math.min(100, Math.round((currentLevelPoints / totalLevelPoints) * 100));
      pointsToNextLevel = nextLevel.minPoints - userSettings.current_points;
    }

    return {
      currentLevel: currentLevel.level,
      nextLevel: nextLevel ? nextLevel.level : null,
      progressPercentage,
      pointsToNextLevel
    };
  };

  // Get earned badges with their details
  const getEarnedBadgesWithDetails = (): (Badge & { earned_at: string })[] => {
    if (!badges.length || !earnedBadges.length) return [];
    
    return earnedBadges
      .map(userBadge => {
        const badgeDetails = badges.find(b => b.id === userBadge.badge_id);
        if (!badgeDetails) return null;
        
        return {
          ...badgeDetails,
          earned_at: userBadge.earned_at
        };
      })
      .filter(Boolean) as (Badge & { earned_at: string })[];
  };

  useEffect(() => {
    loadRewardsData();
  }, [user]);

  return {
    isLoading,
    error,
    userSettings,
    rewardTypes,
    badges,
    earnedBadges: getEarnedBadgesWithDetails(),
    rewardHistory,
    levelProgress: calculateLevelProgress(),
    refresh: loadRewardsData
  };
};
