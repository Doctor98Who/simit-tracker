// One Rep Max calculation table - RPE (vertical) vs Reps (horizontal)
const ONE_RM_TABLE: { [rpe: string]: { [reps: number]: number } } = {
  '10': { 1: 1.00, 2: 0.955, 3: 0.922, 4: 0.892, 5: 0.863, 6: 0.837, 7: 0.811, 8: 0.786, 9: 0.762, 10: 0.739 },
  '9.5': { 1: 0.978, 2: 0.939, 3: 0.907, 4: 0.878, 5: 0.850, 6: 0.824, 7: 0.799, 8: 0.774, 9: 0.751, 10: 0.723 },
  '9': { 1: 0.955, 2: 0.922, 3: 0.892, 4: 0.863, 5: 0.837, 6: 0.811, 7: 0.786, 8: 0.762, 9: 0.739, 10: 0.707 },
  '8.5': { 1: 0.939, 2: 0.907, 3: 0.878, 4: 0.850, 5: 0.824, 6: 0.799, 7: 0.774, 8: 0.751, 9: 0.723, 10: 0.694 },
  '8': { 1: 0.922, 2: 0.892, 3: 0.863, 4: 0.837, 5: 0.811, 6: 0.786, 7: 0.762, 8: 0.739, 9: 0.707, 10: 0.680 },
  '7.5': { 1: 0.907, 2: 0.878, 3: 0.850, 4: 0.824, 5: 0.799, 6: 0.774, 7: 0.751, 8: 0.723, 9: 0.694, 10: 0.667 },
  '7': { 1: 0.892, 2: 0.863, 3: 0.837, 4: 0.811, 5: 0.786, 6: 0.762, 7: 0.739, 8: 0.707, 9: 0.680, 10: 0.653 },
  '6.5': { 1: 0.878, 2: 0.850, 3: 0.824, 4: 0.799, 5: 0.774, 6: 0.751, 7: 0.723, 8: 0.694, 9: 0.667, 10: 0.640 }
};
export interface OneRMData {
  exercise: string;
  subtype?: string;
  date: number;
  estimated1RM: number;
  weight: number;
  reps: number;
  rpe?: number;
  programName?: string;
}

export function calculateOneRM(weight: number | string, reps: number | string, rpe?: number | string): number {
  // Convert all inputs to numbers
  const weightNum = typeof weight === 'string' ? parseFloat(weight) : weight;
  const repsNum = typeof reps === 'string' ? parseInt(reps) : reps;
  let rpeNum = typeof rpe === 'string' ? parseFloat(rpe) : rpe;
  
  // Validate inputs
  if (!weightNum || isNaN(weightNum) || weightNum <= 0) return 0;
  if (!repsNum || isNaN(repsNum) || repsNum < 1 || repsNum > 10) return 0;
  
  if (!rpeNum || isNaN(rpeNum) || rpeNum < 6.5 || rpeNum > 10) {
    // If no RPE provided, assume RPE 10 (max effort)
    rpeNum = 10;
  }
  
  // Round RPE to nearest 0.5
  rpeNum = Math.round(rpeNum * 2) / 2;
  
  // Get the percentage from the table
  const rpeKey = rpeNum.toString();
  const percentage = ONE_RM_TABLE[rpeKey]?.[repsNum]; // <- Fixed: use repsNum instead of reps
  
  if (!percentage) return 0;
  
  // Calculate 1RM: weight / percentage
  return Math.round(weightNum / percentage);
}
export function getOneRMHistory(history: any[], exerciseName: string, exerciseSubtype?: string): OneRMData[] {
  const oneRMHistory: OneRMData[] = [];
  
  console.log('Getting 1RM history for:', exerciseName, exerciseSubtype);
  console.log('Total workouts:', history.length);
  
  history.forEach(workout => {
    workout.exercises.forEach((exercise: any) => {
      if (exercise.name === exerciseName && (!exerciseSubtype || exercise.subtype === exerciseSubtype)) {
        console.log('Found matching exercise in workout:', workout.startTime);
        
        exercise.sets.forEach((set: any, idx: number) => {
          console.log(`Set ${idx + 1}:`, set);
          
          if (set.completed && set.weight && set.reps) {
            // Check for either RPE or RIR
            let rpeValue: number | undefined;
            
            // Handle RPE
            if (set.rpe !== undefined && set.rpe !== '') {
              rpeValue = typeof set.rpe === 'string' ? parseFloat(set.rpe) : set.rpe;
            }
            // Handle RIR - convert to RPE
            else if (set.rir !== undefined && set.rir !== '') {
              const rirNum = typeof set.rir === 'string' ? parseFloat(set.rir) : set.rir;
              if (!isNaN(rirNum)) {
                rpeValue = 10 - rirNum;
                console.log(`Converted RIR ${rirNum} to RPE ${rpeValue}`);
              }
            }
            
            if (rpeValue && !isNaN(rpeValue)) {
              const estimated1RM = calculateOneRM(
                set.weight,
                set.reps,
                rpeValue
              );
              
              console.log(`Calculated 1RM: ${estimated1RM}`);
              
              if (estimated1RM > 0) {
                oneRMHistory.push({
                  exercise: exercise.name,
                  subtype: exercise.subtype,
                  date: workout.startTime,
                  estimated1RM,
                  weight: parseFloat(set.weight),
                  reps: parseInt(set.reps),
                  rpe: rpeValue,
                  programName: workout.programName
                });
              }
            } else {
              console.log('Set missing or invalid intensity data:', {
                completed: set.completed,
                weight: set.weight,
                reps: set.reps,
                rpe: set.rpe,
                rir: set.rir
              });
            }
          } else {
            console.log('Set missing basic data:', {
              completed: set.completed,
              weight: set.weight,
              reps: set.reps
            });
          }
        });
      }
    });
  });
  
  console.log('Total 1RM entries found:', oneRMHistory.length);
  return oneRMHistory.sort((a, b) => a.date - b.date);
}