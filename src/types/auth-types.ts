
export interface Profile {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  email: string;
  createdAt: string;
  bio?: string | null;
  interests?: string[] | null;
  websiteUrl?: string | null;
  instagramHandle?: string | null;
  twitterHandle?: string | null;
}

export interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}
