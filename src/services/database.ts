import { supabase, supabaseService } from '../lib/supabase';
console.log('DatabaseService loaded');
console.log('supabaseService exists:', !!supabaseService);
console.log('Service key in supabaseService:', !!(supabaseService as any).supabaseKey);
import { StorageService } from './storage';
import { DataType } from '../DataContext';
console.log('Supabase Service Key exists:', !!process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY);
console.log('Service key first 10 chars:', process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10));

export class DatabaseService {
  static async syncUserProfile(auth0Id: string, email: string) {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('auth0_id', auth0Id)
      .single();

    if (!existingUser) {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          auth0_id: auth0Id,
          email: email,
          username: email.split('@')[0]
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }

      return data;
    }

    return existingUser;
  }

  static async updateUserProfile(auth0Id: string, updates: Partial<DataType>) {
    try {
      // Get user ID first
      const { data: user } = await supabase
        .from('users')
        .select('id, profile_pic, cover_photo')
        .eq('auth0_id', auth0Id)
        .single();

      if (!user) throw new Error('User not found');

      let profilePicUrl = user.profile_pic;
      let coverPhotoUrl = user.cover_photo;

      // Handle profile picture upload
      if (updates.profilePic && updates.profilePic.startsWith('data:')) {
        // Delete old image if exists
        if (user.profile_pic) {
          const oldPath = StorageService.getFilePathFromUrl(user.profile_pic, 'avatars');
          if (oldPath) await StorageService.deleteImage('avatars', oldPath);
        }

        // Upload new image
        const path = StorageService.generateFilePath(user.id, 'avatar');
        profilePicUrl = await StorageService.uploadImage('avatars', path, updates.profilePic);
      }

      // Handle cover photo upload
      if (updates.coverPhoto && updates.coverPhoto.startsWith('data:')) {
        // Delete old image if exists
        if (user.cover_photo) {
          const oldPath = StorageService.getFilePathFromUrl(user.cover_photo, 'covers');
          if (oldPath) await StorageService.deleteImage('covers', oldPath);
        }

        // Upload new image
        const path = StorageService.generateFilePath(user.id, 'cover');
        coverPhotoUrl = await StorageService.uploadImage('covers', path, updates.coverPhoto);
      }

      // Update user profile
      const { data, error } = await supabase
        .from('users')
        .update({
          username: updates.username,
          first_name: updates.firstName,
          last_name: updates.lastName,
          bio: updates.bio,
          country: updates.country,
          state: updates.state,
          profile_pic: profilePicUrl,
          cover_photo: coverPhotoUrl,
          theme: updates.theme,
          intensity_metric: updates.intensityMetric,
          weight_unit: updates.weightUnit,
          distance_unit: updates.distanceUnit,
          current_workout: updates.currentWorkout || null,
          history: updates.history || [],
          updated_at: new Date().toISOString()
        })
        .eq('auth0_id', auth0Id);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  static async saveWorkout(userId: string, workout: any) {
    // Save workout
    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        name: workout.name,
        start_time: workout.startTime,
        duration: workout.duration,
        pump: workout.pump,
        soreness: workout.soreness,
        workload: workout.workload,
        suggestion: workout.suggestion,
        program_name: workout.programName
      })
      .select()
      .single();

    if (workoutError) throw workoutError;

    // Save exercises and sets
    for (let i = 0; i < workout.exercises.length; i++) {
      const exercise = workout.exercises[i];

      const { data: exerciseData, error: exerciseError } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workoutData.id,
          exercise_name: exercise.name,
          exercise_subtype: exercise.subtype,
          muscles: exercise.muscles,
          instructions: exercise.instructions,
          equipment: exercise.equipment,
          order_index: i
        })
        .select()
        .single();

      if (exerciseError) throw exerciseError;

      // Save sets
      for (let j = 0; j < exercise.sets.length; j++) {
        const set = exercise.sets[j];

        await supabase
          .from('exercise_sets')
          .insert({
            workout_exercise_id: exerciseData.id,
            set_number: j + 1,
            weight: set.weight,
            reps: set.reps,
            rpe: set.rpe,
            rir: set.rir,
            completed: set.completed,
            set_type: set.type,
            is_drop_set: set.isDropSet
          });
      }
    }

    return workoutData;
  }

  static async getWorkoutHistory(userId: string) {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises (
          *,
          exercise_sets (*)
        )
      `)
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (error) throw error;

    // Transform to match your app's format
    return data.map(workout => ({
      name: workout.name,
      startTime: workout.start_time,
      duration: workout.duration,
      pump: workout.pump,
      soreness: workout.soreness,
      workload: workout.workload,
      suggestion: workout.suggestion,
      programName: workout.program_name,
      exercises: workout.workout_exercises
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((ex: any) => ({
          name: ex.exercise_name,
          subtype: ex.exercise_subtype,
          muscles: ex.muscles,
          instructions: ex.instructions,
          equipment: ex.equipment,
          sets: ex.exercise_sets
            .sort((a: any, b: any) => a.set_number - b.set_number)
            .map((set: any) => ({
              weight: set.weight,
              reps: set.reps,
              rpe: set.rpe,
              rir: set.rir,
              completed: set.completed,
              type: set.set_type,
              isDropSet: set.is_drop_set
            }))
        }))
    }));
  }

  static async saveCustomExercise(userId: string, exercise: any) {
    const { data, error } = await supabase
      .from('custom_exercises')
      .insert({
        user_id: userId,
        name: exercise.name,
        subtype: exercise.subtype,
        muscles: exercise.muscles,
        instructions: exercise.instructions,
        equipment: exercise.equipment
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteCustomExercise(userId: string, exerciseId: string) {
    const { error } = await supabase
      .from('custom_exercises')
      .delete()
      .eq('id', exerciseId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async getCustomExercises(userId: string) {
    const { data, error } = await supabase
      .from('custom_exercises')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return data.map(ex => ({
      id: ex.id,
      name: ex.name,
      subtype: ex.subtype,
      muscles: ex.muscles,
      instructions: ex.instructions,
      equipment: ex.equipment,
      sets: []
    }));
  }

  static async saveProgressPhoto(userId: string, photo: any) {
    try {
      let photoUrl = photo.base64;
      // Upload image if it's base64
      if (photo.base64 && photo.base64.startsWith('data:')) {
        const path = StorageService.generateFilePath(userId, 'progress');
        photoUrl = await StorageService.uploadImage('progress', path, photo.base64);
      }
      const { data, error } = await supabase
        .from('progress_photos')
        .insert({
          user_id: userId,
          photo_url: photoUrl,
          timestamp: photo.timestamp,
          weight: photo.weight,
          caption: photo.caption,
          pump: photo.pump,
          likes: photo.likes || 0,
          visibility: photo.isPublic ? 'public' : 'private',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving progress photo:', error);
      throw error;
    }
  }

  static async deleteProgressPhoto(userId: string, photoId: string, photoUrl: string) {
    try {
      // Delete from storage
      const path = StorageService.getFilePathFromUrl(photoUrl, 'progress');
      if (path) {
        await StorageService.deleteImage('progress', path);
      }
      // Delete from database
      const { error } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', photoId)
        .eq('user_id', userId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting progress photo:', error);
      throw error;
    }
  }

static async getProgressPhotos(userId: string) {
  const { data, error } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
 
  // Get user's likes for these photos
  const photoIds = data.map(p => p.id);
  const userLikedPhotos = photoIds.length > 0 
    ? await this.getUserLikedPhotos(userId, photoIds)
    : [];
  
  return data.map(photo => ({
    id: photo.id,
    base64: photo.photo_url,
    timestamp: photo.timestamp,
    weight: photo.weight,
    caption: photo.caption,
    pump: photo.pump,
    likes: photo.likes,
    visibility: photo.visibility,
    userHasLiked: userLikedPhotos.includes(photo.id),
    comments: []
  }));
}
  static async getPublicFriendPhotos(userId: string): Promise<any[]> {
    // First get all friend IDs
    const { data: friendships, error: friendError } = await supabase
      .from('friendships')
      .select('friend_id, user_id')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (friendError) throw friendError;

    // Extract friend IDs
    const friendIds = friendships?.map(f =>
      f.user_id === userId ? f.friend_id : f.user_id
    ) || [];

    if (friendIds.length === 0) return [];

    // Get public photos from friends
    const { data: photos, error: photoError } = await supabase
      .from('progress_photos')
      .select(`
      *,
      user:users(id, username, first_name, last_name, profile_pic)
    `)
      .in('user_id', friendIds)
      .eq('visibility', 'public')  // Changed from 'is_public' to 'visibility'    
      .order('created_at', { ascending: false })
      .limit(50);

    if (photoError) throw photoError;

    return photos?.map(photo => ({
      id: photo.id,
      base64: photo.photo_url,
      timestamp: photo.timestamp,
      weight: photo.weight,
      caption: photo.caption,
      pump: photo.pump,
      likes: photo.likes,
      isPublic: photo.visibility === 'public',
      user: photo.user
    })) || [];
  }

  static async saveProgramTemplate(userId: string, template: any) {
    const { data, error } = await supabase
      .from('program_templates')
      .insert({
        user_id: userId,
        name: template.name,
        mesocycle_length: template.mesocycleLength,
        weeks: template.weeks,
        last_used: template.lastUsed
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  static async updateProgramTemplate(userId: string, templateId: string, updates: any) {
    const { data, error } = await supabase
      .from('program_templates')
      .update({
        name: updates.name,
        mesocycle_length: updates.mesocycleLength,
        weeks: updates.weeks,
        last_used: updates.lastUsed,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  static async deleteProgramTemplate(userId: string, templateId: string) {
    const { error } = await supabase
      .from('program_templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async getProgramTemplates(userId: string) {
    const { data, error } = await supabase
      .from('program_templates')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return data.map(template => ({
      id: template.id,
      name: template.name,
      mesocycleLength: template.mesocycle_length,
      weeks: template.weeks,
      lastUsed: template.last_used
    }));
  }


  // Friend-related methods
  static async searchUsers(currentUserId: string, searchQuery: string) {
    const { data, error } = await supabaseService
      .from('users')
      .select('id, username, first_name, last_name, profile_pic')
      .neq('id', currentUserId)
      .or(`username.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`)
      .limit(20);

    if (error) throw error;
    return data;
  }

  static async sendFriendRequest(senderId: string, receiverUsername: string) {
    // First, find the receiver by username
    const { data: receiver, error: receiverError } = await supabaseService
      .from('users')
      .select('id')
      .eq('username', receiverUsername)
      .single();

    if (receiverError || !receiver) {
      throw new Error('User not found');
    }

    // Check if request already exists
    const { data: existingRequest } = await supabaseService
      .from('friend_requests')
      .select('id')
      .eq('sender_id', senderId)
      .eq('receiver_id', receiver.id)
      .single();

    if (existingRequest) {
      throw new Error('Friend request already sent');
    }

    // Check if already friends
    const { data: existingFriend } = await supabaseService
      .from('friends')
      .select('id')
      .eq('user_id', senderId)
      .eq('friend_id', receiver.id)
      .single();

    if (existingFriend) {
      throw new Error('Already friends with this user');
    }

    // Send friend request
    const { data, error } = await supabaseService
      .from('friend_requests')
      .insert({
        sender_id: senderId,
        receiver_id: receiver.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async acceptFriendRequest(requestId: string, userId: string) {
    // Get the friend request
    const { data: request, error: requestError } = await supabaseService
      .from('friend_requests')
      .select('*')
      .eq('id', requestId)
      .eq('receiver_id', userId)
      .single();

    if (requestError || !request) {
      throw new Error('Friend request not found');
    }

    // Update request status
    await supabaseService
      .from('friend_requests')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    // Create bidirectional friend relationships
    const { error: friendError } = await supabaseService
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
    return true;
  }

  static async rejectFriendRequest(requestId: string, userId: string) {
    const { error } = await supabaseService
      .from('friend_requests')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('receiver_id', userId);

    if (error) throw error;
    return true;
  }

  static async getFriends(userId: string) {
    const { data, error } = await supabaseService
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
    return data.map(f => f.friend);
  }

  static async getPendingFriendRequests(userId: string) {
    const { data, error } = await supabaseService
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
    return data;
  }

  static async removeFriend(userId: string, friendId: string) {
    // Remove both directions of the friendship
    const { error } = await supabaseService
      .from('friends')
      .delete()
      .or(`user_id.eq.${userId},user_id.eq.${friendId}`)
      .or(`friend_id.eq.${userId},friend_id.eq.${friendId}`);

    if (error) throw error;
    return true;
  }

static async getFriendsFeed(userId: string) {
  // First get all friend IDs
  const { data: friends, error: friendsError } = await supabaseService
    .from('friends')
    .select('friend_id')
    .eq('user_id', userId)
    .eq('status', 'accepted');
    
  if (friendsError) throw friendsError;
  
  const friendIds = friends.map(f => f.friend_id);
  
  if (friendIds.length === 0) {
    return [];
  }
  
  // Get public progress photos from friends
  const { data: photos, error: photosError } = await supabaseService
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
  const userLikedPhotos = photoIds.length > 0 
    ? await this.getUserLikedPhotos(userId, photoIds)
    : [];
  
  return photos.map(photo => ({
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
}
  static async updateProgressPhotoVisibility(userId: string, photoId: string, visibility: 'private' | 'public') {
    const { error } = await supabase
      .from('progress_photos')
      .update({ visibility })
      .eq('id', photoId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
  static async likePhoto(userId: string, photoId: string) {
console.log('likePhoto called with:', { userId, photoId });
  try {      // Check if already liked
      const { data: existingLike } = await supabaseService
        .from('likes')
        .select('id')
        .eq('photo_id', photoId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike - delete the like
        const { error } = await supabaseService
          .from('likes')
          .delete()
          .eq('photo_id', photoId)
          .eq('user_id', userId);

        if (error) throw error;
        return { liked: false };
      } else {
        // Like - insert new like
        const { error } = await supabaseService
          .from('likes')
          .insert({
            photo_id: photoId,
            user_id: userId
          });

        if (error) throw error;
        return { liked: true };
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  static async addComment(userId: string, photoId: string, text: string) {
    try {
      const { data, error } = await supabaseService
        .from('comments')
        .insert({
          photo_id: photoId,
          user_id: userId,
          text
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  static async deleteComment(commentId: string, userId: string) {
    try {
      const { error } = await supabaseService
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  static async getPhotoComments(photoId: string) {
    try {
      const { data, error } = await supabaseService
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
      return data;
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  }

  static async getUserLikedPhotos(userId: string, photoIds: string[]) {
 console.log('getUserLikedPhotos called with:', { userId, photoIds });
  try {      const { data, error } = await supabaseService
        .from('likes')
        .select('photo_id')
        .eq('user_id', userId)
        .in('photo_id', photoIds);

      if (error) throw error;
      return data.map(like => like.photo_id);
    } catch (error) {
      console.error('Error getting user likes:', error);
      throw error;
    }
  }
}