
export interface Review {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  rating: number;
  visit_date: string;
  location?: string;
  pros?: string;
  cons?: string;
  media_urls?: string[];
  created_at?: string;
}

export interface ReviewFormValues {
  title: string;
  description?: string;
  rating: number;
  visit_date: string;
  location?: string;
  pros?: string;
  cons?: string;
  images?: File[];
}
