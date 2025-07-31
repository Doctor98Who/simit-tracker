// One Rep Max calculation table - RPE (vertical) vs Reps (horizontal)
const ONE_RM_TABLE: { [rpe: string]: { [reps: number]: number } } = {
  '10': { 1: 1.00, 2: 0.96, 3: 0.92, 4: 0.89, 5: 0.86, 6: 0.84, 7: 0.81, 8: 0.79, 9: 0.76, 10: 0.74 },
  '9.5': { 1: 0.98, 2: 0.94, 3: 0.91, 4: 0.88, 5: 0.85, 6: 0.82, 7: 0.80, 8: 0.77, 9: 0.75, 10: 0.72 },
  '9': { 1: 0.96, 2: 0.92, 3: 0.89, 4: 0.86, 5: 0.84, 6: 0.81, 7: 0.79, 8: 0.76, 9: 0.74, 10: 0.71 },
  '8.5': { 1: 0.94, 2: 0.91, 3: 0.88, 4: 0.85, 5: 0.82, 6: 0.80, 7: 0.77, 8: 0.75, 9: 0.72, 10: 0.69 },
  '8': { 1: 0.92, 2: 0.89, 3: 0.86, 4: 0.84, 5: 0.81, 6: 0.79, 7: 0.76, 8: 0.74, 9: 0.71, 10: 0.68 },
  '7.5': { 1: 0.91, 2: 0.88, 3: 0.85, 4: 0.82, 5: 0.80, 6: 0.77, 7: 0.75, 8: 0.72, 9: 0.69, 10: 0.67 },
  '7': { 1: 0.89, 2: 0.86, 3: 0.84, 4: 0.81, 5: 0.79, 6: 0.76, 7: 0.74, 8: 0.71, 9: 0.68, 10: 0.65 },
  '6.5': { 1: 0.88, 2: 0.85, 3: 0.82, 4: 0.80, 5: 0.77, 6: 0.75, 7: 0.72, 8: 0.69, 9: 0.67, 10: 0.64 }
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