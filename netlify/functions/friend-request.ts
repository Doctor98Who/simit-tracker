import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { action, ...params } = JSON.parse(event.body || '{}');

    switch (action) {
      case 'sendFriendRequest': {
        const { senderId, receiverUsername } = params;
        
        // Find receiver by username
        const { data: receiver, error: receiverError } = await supabase
          .from('users')
          .select('id')
          .eq('username', receiverUsername)
          .single();

        if (receiverError || !receiver) {
          return { 
            statusCode: 404, 
            body: JSON.stringify({ error: 'User not found' }) 
          };
        }

        // Check if request already exists
        const { data: existingRequest } = await supabase
          .from('friend_requests')
          .select('id')
          .eq('sender_id', senderId)
          .eq('receiver_id', receiver.id)
          .single();

        if (existingRequest) {
          return { 
            statusCode: 400, 
            body: JSON.stringify({ error: 'Friend request already sent' }) 
          };
        }

        // Check if already friends
        const { data: existingFriend } = await supabase
          .from('friends')
          .select('id')
          .eq('user_id', senderId)
          .eq('friend_id', receiver.id)
          .single();

        if (existingFriend) {
          return { 
            statusCode: 400, 
            body: JSON.stringify({ error: 'Already friends with this user' }) 
          };
        }

        // Send friend request
        const { data, error } = await supabase
          .from('friend_requests')
          .insert({
            sender_id: senderId,
            receiver_id: receiver.id
          })
          .select()
          .single();

        if (error) throw error;

        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, data })
        };
      }

      case 'acceptFriendRequest': {
        const { requestId, userId } = params;
        
        // Get the friend request
        const { data: request, error: requestError } = await supabase
          .from('friend_requests')
          .select('*')
          .eq('id', requestId)
          .eq('receiver_id', userId)
          .single();

        if (requestError || !request) {
          return { 
            statusCode: 404, 
            body: JSON.stringify({ error: 'Friend request not found' }) 
          };
        }

        // Update request status
        await supabase
          .from('friend_requests')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', requestId);

        // Create bidirectional friendships
        const { error: friendError } = await supabase
          .from('friends')
          .insert([
            {
              user_id: request.sender_id,
              friend_id: request.receiver_id,
              status: 'accepted'
            },
            {
              user_id: request.receiver_id,
              friend_id: request.sender_id,
              status: 'accepted'
            }
          ]);

        if (friendError) throw friendError;

        return {
          statusCode: 200,
          body: JSON.stringify({ success: true })
        };
      }

      case 'rejectFriendRequest': {
        const { requestId, userId } = params;
        
        const { error } = await supabase
          .from('friend_requests')
          .update({ status: 'rejected', updated_at: new Date().toISOString() })
          .eq('id', requestId)
          .eq('receiver_id', userId);

        if (error) throw error;
        
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true })
        };
      }

      case 'getFriends': {
        const { userId } = params;
        
        const { data, error } = await supabase
          .from('friends')
          .select(`
            *,
            friend:friend_id(
              id,
              username,
              first_name,
              last_name,
              profile_pic
            )
          `)
          .eq('user_id', userId)
          .eq('status', 'accepted');

        if (error) throw error;
        
        return {
          statusCode: 200,
          body: JSON.stringify({ data: data.map(f => f.friend) })
        };
      }

      case 'getPendingFriendRequests': {
        const { userId } = params;
        
        const { data, error } = await supabase
          .from('friend_requests')
          .select(`
            *,
            sender:sender_id(
              id,
              username,
              first_name,
              last_name,
              profile_pic
            )
          `)
          .eq('receiver_id', userId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        return {
          statusCode: 200,
          body: JSON.stringify({ data })
        };
      }

      case 'removeFriend': {
        const { userId, friendId } = params;
        
        const { error } = await supabase
          .from('friends')
          .delete()
          .or(`user_id.eq.${userId},user_id.eq.${friendId}`)
          .or(`friend_id.eq.${userId},friend_id.eq.${friendId}`);

        if (error) throw error;
        
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true })
        };
      }
case 'searchUsers': {
  const { currentUserId, searchQuery } = params;
  
  const { data, error } = await supabase
    .from('users')
    .select('id, username, first_name, last_name, profile_pic')
    .neq('id', currentUserId)
    .or(`username.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`)
    .limit(20);

  if (error) throw error;
  
  return {
    statusCode: 200,
    body: JSON.stringify({ data })
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