
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const getSupabaseClient = (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || '',
    {
      global: {
        headers: {
          Authorization: authHeader || '',
        },
      },
    }
  );
};
