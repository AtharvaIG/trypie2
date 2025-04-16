
import { supabase } from "@/integrations/supabase/client";
import { Review } from "@/types/review-types";

export const createReview = async (review: Omit<Review, 'id' | 'created_at'>, images?: File[]): Promise<Review> => {
  // First, insert the review
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  // If there are images, upload them to storage
  if (images && images.length > 0) {
    const mediaUrls: string[] = [];

    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `${data.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('review_media')
        .upload(filePath, image);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('review_media')
        .getPublicUrl(filePath);

      mediaUrls.push(urlData.publicUrl);
    }

    // Update the review with media URLs
    if (mediaUrls.length > 0) {
      const { data: updatedReview, error: updateError } = await supabase
        .from('reviews')
        .update({ media_urls: mediaUrls })
        .eq('id', data.id)
        .select('*')
        .single();

      if (updateError) {
        console.error('Error updating review with media URLs:', updateError);
      } else {
        return updatedReview as Review;
      }
    }
  }

  return data as Review;
};

export const getUserReviews = async (userId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as Review[];
};
