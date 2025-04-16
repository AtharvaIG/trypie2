
import { Profile } from "./auth-types";

export interface TravelGroup {
  id: string;
  title: string;
  destination: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  capacity: number;
  memberCount?: number;
  is_influencer_trip: boolean;
  is_public?: boolean;
  creator_id: string;
  created_at: string;
  image_url?: string;
  organizer?: Profile;
}

export interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  joined_at: string;
  role?: string;
  profile?: Profile;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  message: string;
  created_at: string;
  media_url?: string;
  sender?: Profile;
  senderProfile?: Profile; // Added for compatibility
}

export interface GroupExpense {
  id: string;
  group_id: string;
  title: string;
  amount: number;
  paid_by: string;
  currency: string;
  created_at: string;
  payer?: Profile;
  paidByProfile?: Profile; // Added for compatibility
  shares?: ExpenseShare[];
}

export interface ExpenseShare {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  is_paid?: boolean;
  user?: Profile;
}

export interface GroupItinerary {
  id: string;
  group_id: string;
  title: string;
  description?: string;
  day_number?: number;
  created_by: string;
  created_at: string;
  creatorProfile?: Profile;
}

export interface GroupInvitation {
  id: string;
  group_id: string;
  email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  inviter?: Profile;
}
