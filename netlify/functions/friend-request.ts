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
        
        // Find receiver by username (case insensitive)
        const { data: receiver, error: receiverError } = await supabase
          .from('users')
          .select('id')
          .ilike('username', receiverUsername)
          .single();

        if (receiverError || !receiver) {
          return { 
            statusCode: 404, 
            body: JSON.stringify({ error: 'User not found' }) 
          };
        }

        // Check if already friends
        const { data: existingFriend } = await supabase
          .from('friends')
          .select('id')
          .or(`and(user_id.eq.${senderId},friend_id.eq.${receiver.id}),and(user_id.eq.${receiver.id},friend_id.eq.${senderId})`)
          .single();

        if (existingFriend) {
          return { 
            statusCode: 400, 
            body: JSON.stringify({ error: 'Already friends with this user' }) 
          };
        }

        // Check for any existing request between these users
        const { data: existingRequest } = await supabase
          .from('friend_requests')
          .select('id, status')
          .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiver.id}),and(sender_id.eq.${receiver.id},receiver_id.eq.${senderId})`)
          .single();

        if (existingRequest) {
          // If there's an old rejected or accepted request, delete it first
          if (existingRequest.status === 'rejected' || existingRequest.status === 'accepted') {
            await supabase
              .from('friend_requests')
              .delete()
              .eq('id', existingRequest.id);
          } else if (existingRequest.status === 'pending') {
            return {
              statusCode: 400,
              body: JSON.stringify({ error: 'Friend request already sent' })
            };
          }
        }

        // Create new friend request
        const { data, error } = await supabase
          .from('friend_requests')
          .insert({
            sender_id: senderId,
            receiver_id: receiver.id,
            status: 'pending'
          })
          .select()
          .single();

        if (error) throw error;

        return {
          statusCode: 200,
          body: JSON.stringify({ data })
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
        
        // Delete friendship records (both directions)
        const { error } = await supabase
          .from('friends')
          .delete()
          .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

        if (error) throw error;

        // Also delete any friend requests between these users
        await supabase
          .from('friend_requests')
          .delete()
          .or(`and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`);
        
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