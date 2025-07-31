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
      case 'getFriendsFeed': {
        const { userId } = params;
        
        // Get friend IDs
        const { data: friends, error: friendsError } = await supabase
          .from('friends')
          .select('friend_id')
          .eq('user_id', userId)
          .eq('status', 'accepted');
          
        if (friendsError) throw friendsError;
        
        const friendIds = friends.map(f => f.friend_id);
        
        if (friendIds.length === 0) {
          return {
            statusCode: 200,
            body: JSON.stringify({ data: [] })
          };
        }
        
        // Get public photos from friends
        const { data: photos, error: photosError } = await supabase
          .from('progress_photos')
          .select(`
            *,
            user:user_id(
              id,
              username,
              first_name,
              last_name,
              profile_pic
            )
          `)
          .in('user_id', friendIds)
          .eq('visibility', 'public')
          .order('timestamp', { ascending: false })
          .limit(50);
          
        if (photosError) throw photosError;
        
        // Get user's likes for these photos
        const photoIds = photos.map(p => p.id);
        let userLikedPhotos: string[] = [];
        
        if (photoIds.length > 0) {
          const { data: likes, error: likesError } = await supabase
            .from('likes')
            .select('photo_id')
            .eq('user_id', userId)
            .in('photo_id', photoIds);
            
          if (!likesError && likes) {
            userLikedPhotos = likes.map(like => like.photo_id);
          }
        }
        
        const feedData = photos.map(photo => ({
          id: photo.id,
          base64: photo.photo_url,
          timestamp: photo.timestamp,
          weight: photo.weight,
          caption: photo.caption,
          pump: photo.pump,
          likes: photo.likes,
          visibility: photo.visibility,
          userHasLiked: userLikedPhotos.includes(photo.id),
          user: photo.user,
          comments: []
        }));

        return {
          statusCode: 200,
          body: JSON.stringify({ data: feedData })
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