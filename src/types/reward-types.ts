
export interface RewardType {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  is_secret: boolean;
  visibility_rule: string | null;
  created_at: string;
  updated_at: string;
  // New fields
  trigger_type: 'action' | 'count' | 'streak' | 'time-based' | 'system';
  trigger_condition: Record<string, any> | null;
  visibility: 'visible' | 'hidden' | 'secret';
  category: 'explorer' | 'reviewer' | 'group' | 'engagement' | 'streak' | 'secret';
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  is_secret: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_type_id: string | null;
  badge_id: string | null;
  points: number;
  description: string;
  created_at: string;
  reward_types?: {
    title: string;
    description: string;
    icon: string;
  } | null;
  badges?: {
    title: string;
    description: string;
    icon: string;
  } | null;
}

export interface UserRewardSettings {
  id: string;
  user_id: string;
  current_points: number;
  level: 'Wanderer' | 'Explorer' | 'Adventurer' | 'Pathfinder' | 'Globetrotter';
  updated_at: string;
}

export interface UserLevel {
  level: 'Wanderer' | 'Explorer' | 'Adventurer' | 'Pathfinder' | 'Globetrotter';
  minPoints: number;
  maxPoints?: number;
}

export const USER_LEVELS: UserLevel[] = [
  { level: 'Wanderer', minPoints: 0, maxPoints: 199 },
  { level: 'Explorer', minPoints: 200, maxPoints: 499 },
  { level: 'Adventurer', minPoints: 500, maxPoints: 999 },
  { level: 'Pathfinder', minPoints: 1000, maxPoints: 1999 },
  { level: 'Globetrotter', minPoints: 2000 }
];
