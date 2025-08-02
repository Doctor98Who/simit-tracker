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
    const { userId, workoutTime } = JSON.parse(event.body || '{}');

    // Get the workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises (
          *,
          exercise_sets (*)
        )
      `)
      .eq('user_id', userId)
      .eq('start_time', workoutTime)
      .single();

    if (workoutError) throw workoutError;

    // Transform to match your app's format
    const formattedWorkout = {
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
    };

    return {
      statusCode: 200,
      body: JSON.stringify({ data: formattedWorkout })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};