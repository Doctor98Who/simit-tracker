import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { action, ...params } = JSON.parse(event.body || '{}');

    switch (action) {
      case 'likePhoto': {
        const { userId, photoId } = params;
        
        // Check if already liked
        const { data: existingLike } = await supabase
          .from('likes')
          .select('id')
          .eq('photo_id', photoId)
          .eq('user_id', userId)
          .single();

        if (existingLike) {
          // Unlike
          const { error } = await supabase
            .from('likes')
            .delete()
            .eq('photo_id', photoId)
            .eq('user_id', userId);
            
          if (error) throw error;
          
          return {
            statusCode: 200,
            body: JSON.stringify({ data: { liked: false } })
          };
        } else {
          // Like
          const { error } = await supabase
            .from('likes')
            .insert({
              photo_id: photoId,
              user_id: userId
            });
            
          if (error) throw error;
          
          return {
            statusCode: 200,
            body: JSON.stringify({ data: { liked: true } })
          };
        }
      }

      case 'addComment': {
        const { userId, photoId, text } = params;
        
        const { data, error } = await supabase
          .from('comments')
          .insert({
            photo_id: photoId,
            user_id: userId,
            text
          })
          .select()
          .single();

        if (error) throw error;
        
        return {
          statusCode: 200,
          body: JSON.stringify({ data })
        };
      }

      case 'deleteComment': {
        const { commentId, userId } = params;
        
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentId)
          .eq('user_id', userId);

        if (error) throw error;
        
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true })
        };
      }

      case 'getComments': {
        const { photoId } = params;
        
        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            user:users(
              id,
              username,
              first_name,
              last_name,
              profile_pic
            )
          `)
          .eq('photo_id', photoId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        return {
          statusCode: 200,
          body: JSON.stringify({ data })
        };
      }

      case 'getUserLikedPhotos': {
        const { userId, photoIds } = params;
        
        const { data, error } = await supabase
          .from('likes')
          .select('photo_id')
          .eq('user_id', userId)
          .in('photo_id', photoIds);

        if (error) throw error;
        
        return {
          statusCode: 200,
          body: JSON.stringify({ data: data.map(like => like.photo_id) })
        };
      }

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};