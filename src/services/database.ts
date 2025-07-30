import { supabase } from '../lib/supabase';
import { StorageService } from './storage';
import { DataType } from '../DataContext';

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
          current_workout: updates.currentWorkout || null,  // Add this line
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
          likes: photo.likes || 0
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
    
    return data.map(photo => ({
      id: photo.id,
      base64: photo.photo_url, // Keep as 'base64' for compatibility
      timestamp: photo.timestamp,
      weight: photo.weight,
      caption: photo.caption,
      pump: photo.pump,
      likes: photo.likes,
      comments: []
    }));
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
}