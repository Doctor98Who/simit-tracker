  export const simitPrograms = [
    { name: 'Push Pull Legs', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Push Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 3},
        {name: 'Barbell Overhead Press', numSets: 3},
        {name: 'Dumbbell Lateral Raise', numSets: 3},
        {name: 'Cable Tricep Pushdown', numSets: 3},
        {name: 'Cable Chest Fly', numSets: 3},
        {name: 'Overhead Dumbbell Tricep Extension', numSets: 3}
      ] },
      { name: 'Pull Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Conventional Deadlift', numSets: 3},
        {name: 'Bent-Over Barbell Row', numSets: 5},
        {name: 'Wide Grip Lat Pulldown', numSets: 3}
      ] },
      { name: 'Overhead Press Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Overhead Press', numSets: 3},
        {name: 'Dumbbell Lateral Raise', numSets: 5},
        {name: 'Dumbbell Rear Delt Fly', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Greyskull LP', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Workout A Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 3},
        {name: 'Barbell Back Squat', numSets: 3},
        {name: 'Bent-Over Barbell Row', numSets: 3}
      ] },
      { name: 'Workout B Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Overhead Press', numSets: 3},
        {name: 'Barbell Conventional Deadlift', numSets: 1},
        {name: 'Barbell Back Squat', numSets: 3}
      ] },
      { name: 'Workout A Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 3},
        {name: 'Barbell Back Squat', numSets: 3},
        {name: 'Bent-Over Barbell Row', numSets: 3}
      ] }
    ]
  })) },
  { name: 'nSuns 531 5-Day', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 9},
        {name: 'Barbell Overhead Press', numSets: 6},
        {name: 'Close Grip Bench Press', numSets: 5}
      ] },
      { name: 'Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 9},
        {name: 'Barbell Sumo Deadlift', numSets: 6},
        {name: 'Leg Press', numSets: 5}
      ] },
      { name: 'Day 3 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Overhead Press', numSets: 9},
        {name: 'Barbell Bench Press', numSets: 6},
        {name: 'Cable Tricep Extension', numSets: 5}
      ] },
      { name: 'Day 4 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Conventional Deadlift', numSets: 8},
        {name: 'Barbell Front Squat', numSets: 6},
        {name: 'Lying Leg Curl', numSets: 5}
      ] },
      { name: 'Day 5 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 9},
        {name: 'Dumbbell Incline Bench Press', numSets: 6},
        {name: 'Triceps Dip', numSets: 5}
      ] }
    ]
  })) },
  { name: 'Candito 6 Week Strength', mesocycleLength: 6, weeks: Array.from({length: 6}, (_, weekIdx) => ({
    days: [
      { name: 'Heavy Lower Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4},
        {name: 'Barbell Conventional Deadlift', numSets: 3},
        {name: 'Leg Press', numSets: 3}
      ] },
      { name: 'Heavy Upper Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 4},
        {name: 'Barbell Overhead Press', numSets: 3},
        {name: 'Bent-Over Barbell Row', numSets: 3}
      ] },
      { name: 'Control Lower Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4},
        {name: 'Barbell Romanian Deadlift', numSets: 3},
        {name: 'Seated Leg Curl', numSets: 3}
      ] },
      { name: 'Control Upper Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 4},
        {name: 'Wide Grip Lat Pulldown', numSets: 3},
        {name: 'Dumbbell Lateral Raise', numSets: 3}
      ] },
      { name: 'Optional Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Bicep Curl', numSets: 3},
        {name: 'Cable Tricep Extension', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Smolov Squat', mesocycleLength: 13, weeks: Array.from({length: 13}, (_, weekIdx) => ({
    days: [
      { name: 'Squat Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4}
      ] },
      { name: 'Squat Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 5}
      ] },
      { name: 'Squat Day 3 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 10}
      ] },
      { name: 'Squat Day 4 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Sheiko Beginner', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 5},
        {name: 'Barbell Back Squat', numSets: 5},
        {name: 'Barbell Bench Press', numSets: 4}
      ] },
      { name: 'Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Conventional Deadlift', numSets: 5},
        {name: 'Barbell Overhead Press', numSets: 5},
        {name: 'Bent-Over Barbell Row', numSets: 4}
      ] },
      { name: 'Day 3 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 5},
        {name: 'Barbell Back Squat', numSets: 5},
        {name: 'Barbell Conventional Deadlift', numSets: 4}
      ] }
    ]
  })) },
  { name: 'Juggernaut Method', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Squat Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 5},
        {name: 'Leg Press', numSets: 3},
        {name: 'Lying Leg Curl', numSets: 3}
      ] },
      { name: 'Bench Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 5},
        {name: 'Dumbbell Overhead Press', numSets: 3},
        {name: 'Cable Tricep Extension', numSets: 3}
      ] },
      { name: 'Deadlift Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Conventional Deadlift', numSets: 5},
        {name: 'Seated Cable Row', numSets: 3},
        {name: 'Wide Grip Lat Pulldown', numSets: 3}
      ] },
      { name: 'Overhead Press Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Overhead Press', numSets: 5},
        {name: 'Dumbbell Lateral Raise', numSets: 3},
        {name: 'Cable Rear Delt Fly', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Texas Method', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Volume Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 5},
        {name: 'Barbell Bench Press', numSets: 5},
        {name: 'Barbell Conventional Deadlift', numSets: 1}
      ] },
      { name: 'Light Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 2},
        {name: 'Barbell Overhead Press', numSets: 3},
        {name: 'Pull-Up', numSets: 3}
      ] },
      { name: 'Intensity Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 1},
        {name: 'Barbell Bench Press', numSets: 1},
        {name: 'Bent-Over Barbell Row', numSets: 5}
      ] }
    ]
  })) },
  { name: 'Madcow 5x5', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Heavy Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 5},
        {name: 'Barbell Bench Press', numSets: 5},
        {name: 'Bent-Over Barbell Row', numSets: 5}
      ] },
      { name: 'Light Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 3},
        {name: 'Barbell Overhead Press', numSets: 3},
        {name: 'Barbell Conventional Deadlift', numSets: 3}
      ] },
      { name: 'Medium Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4},
        {name: 'Barbell Bench Press', numSets: 4},
        {name: 'Bent-Over Barbell Row', numSets: 4}
      ] }
    ]
  })) },
  { name: 'GZCL Method', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Squat/Bench Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 3},
        {name: 'Barbell Bench Press', numSets: 3},
        {name: 'Leg Press', numSets: 3},
        {name: 'Close Grip Bench Press', numSets: 3}
      ] },
      { name: 'Deadlift/OHP Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Conventional Deadlift', numSets: 3},
        {name: 'Barbell Overhead Press', numSets: 3},
        {name: 'Bent-Over Barbell Row', numSets: 3},
        {name: 'Dumbbell Lateral Raise', numSets: 3}
      ] },
      { name: 'Accessory Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Leg Extension', numSets: 3},
        {name: 'Cable Tricep Extension', numSets: 3},
        {name: 'Dumbbell Bicep Curl', numSets: 3}
      ] },
      { name: 'Accessory Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Lying Leg Curl', numSets: 3},
        {name: 'Cable Face Pull', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Westside Barbell Athletic', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Max Effort Lower Week ' + (weekIdx + 1), exercises: [
        {name: 'Box Squat', numSets: 3},
        {name: 'Deficit Deadlift', numSets: 3},
        {name: 'Lying Leg Curl', numSets: 3}
      ] },
      { name: 'Dynamic Effort Upper Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 9},
        {name: 'Lying Barbell Tricep Extension', numSets: 3},
        {name: 'One Arm Dumbbell Row', numSets: 3}
      ] },
      { name: 'Max Effort Upper Week ' + (weekIdx + 1), exercises: [
        {name: 'Close Grip Bench Press', numSets: 3},
        {name: 'Barbell Overhead Press', numSets: 3},
        {name: 'Pull-Up', numSets: 3}
      ] },
      { name: 'Dynamic Effort Lower Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Conventional Deadlift', numSets: 8},
        {name: 'Leg Press', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Vert Shock Vertical Jump', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Plyo Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4},
        {name: 'Box Squat', numSets: 4},
        {name: 'Dumbbell Lunge', numSets: 3}
      ] },
      { name: 'Strength Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4},
        {name: 'Barbell Romanian Deadlift', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 4}
      ] },
      { name: 'Plyo Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Front Squat', numSets: 4},
        {name: 'Bulgarian Split Squat', numSets: 4},
        {name: 'Barbell Good Morning', numSets: 3}
      ] },
      { name: 'Strength Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Lunge', numSets: 4},
        {name: 'Barbell Hip Thrust', numSets: 3},
        {name: 'Leg Extension', numSets: 4}
      ] },
      { name: 'Recovery Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Plank', numSets: 3},
        {name: 'Glute Bridge', numSets: 3},
        {name: 'Single Leg Calf Raise', numSets: 3}
      ] },
      { name: 'Optional Speed Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Power Clean', numSets: 5},
        {name: 'Box Squat', numSets: 4}
      ] }
    ]
  })) },
  { name: 'Explosive Speed & Power', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Speed Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Power Clean', numSets: 6},
        {name: 'Box Squat', numSets: 4},
        {name: 'Barbell Back Squat', numSets: 3}
      ] },
      { name: 'Power Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Power Clean', numSets: 4},
        {name: 'Box Squat', numSets: 4},
        {name: 'Barbell Good Morning', numSets: 3}
      ] },
      { name: 'Speed Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Snatch', numSets: 5},
        {name: 'Barbell Front Squat', numSets: 4},
        {name: 'Bulgarian Split Squat', numSets: 3}
      ] },
      { name: 'Power Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Snatch', numSets: 4},
        {name: 'Box Squat', numSets: 4},
        {name: 'Barbell Good Morning', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Full Body High Frequency (Jeff Nippard)', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Full Body Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 3},
        {name: 'Barbell Bench Press', numSets: 3},
        {name: 'Bent-Over Barbell Row', numSets: 3},
        {name: 'Dumbbell Overhead Press', numSets: 3},
        {name: 'Pull-Up', numSets: 3},
        {name: 'Lying Leg Curl', numSets: 3}
      ] },
      { name: 'Full Body Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Romanian Deadlift', numSets: 3},
        {name: 'Dumbbell Incline Bench Press', numSets: 3},
        {name: 'Wide Grip Lat Pulldown', numSets: 3},
        {name: 'Dumbbell Lateral Raise', numSets: 3},
        {name: 'Overhead Dumbbell Tricep Extension', numSets: 3},
        {name: 'Dumbbell Bicep Curl', numSets: 3}
      ] },
      { name: 'Full Body Day 3 Week ' + (weekIdx + 1), exercises: [
        {name: 'Leg Press', numSets: 3},
        {name: 'Dumbbell Chest Fly', numSets: 3},
        {name: 'Seated Cable Row', numSets: 3},
        {name: 'Dumbbell Front Raise', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 3},
        {name: 'Crunch', numSets: 3}
      ] },
      { name: 'Full Body Day 4 Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Lunge', numSets: 3},
        {name: 'Chest Dip', numSets: 3},
        {name: 'Chin-Up', numSets: 3},
        {name: 'Dumbbell Rear Delt Fly', numSets: 3},
        {name: 'Cable Tricep Pushdown', numSets: 3},
        {name: 'Hammer Dumbbell Curl', numSets: 3}
      ] },
      { name: 'Full Body Day 5 Week ' + (weekIdx + 1), exercises: [
        {name: 'Hack Squat', numSets: 3},
        {name: 'Dumbbell Floor Press', numSets: 3},
        {name: 'Cable Face Pull', numSets: 3},
        {name: 'Barbell Upright Row', numSets: 3},
        {name: 'Leg Extension', numSets: 3},
        {name: 'Plank', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Pure Bodybuilding (Jeff Nippard)', mesocycleLength: 10, weeks: Array.from({length: 10}, (_, weekIdx) => ({
    days: [
      { name: 'Chest and Triceps Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 4},
        {name: 'Dumbbell Incline Bench Press', numSets: 3},
        {name: 'Cable Chest Fly', numSets: 3},
        {name: 'Lying Barbell Tricep Extension', numSets: 3},
        {name: 'Cable Tricep Pushdown', numSets: 3}
      ] },
      { name: 'Back and Biceps Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Conventional Deadlift', numSets: 3},
        {name: 'Bent-Over Barbell Row', numSets: 4},
        {name: 'Wide Grip Lat Pulldown', numSets: 3},
        {name: 'EZ Bar Bicep Curl', numSets: 3},
        {name: 'Hammer Dumbbell Curl', numSets: 3}
      ] },
      { name: 'Legs Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4},
        {name: 'Leg Press', numSets: 3},
        {name: 'Leg Extension', numSets: 3},
        {name: 'Seated Leg Curl', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 4}
      ] },
      { name: 'Shoulders and Abs Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Overhead Press', numSets: 4},
        {name: 'Dumbbell Lateral Raise', numSets: 3},
        {name: 'Machine Rear Delt Fly', numSets: 3},
        {name: 'Machine Crunch', numSets: 3},
        {name: 'Hanging Leg Raise', numSets: 3}
      ] },
      { name: 'Full Body Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Bench Press', numSets: 3},
        {name: 'Pull-Up', numSets: 3},
        {name: 'Goblet Squat', numSets: 3},
        {name: 'Cable Face Pull', numSets: 3},
        {name: 'Concentration Bicep Curl', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Powerbuilding (Jeff Nippard)', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Power Upper Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 5},
        {name: 'Barbell Overhead Press', numSets: 4},
        {name: 'T-Bar Row', numSets: 4},
        {name: 'Machine Tricep Extension', numSets: 3}
      ] },
      { name: 'Power Lower Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 5},
        {name: 'Barbell Conventional Deadlift', numSets: 4},
        {name: 'Leg Press', numSets: 3},
        {name: 'Seated Calf Raise', numSets: 3}
      ] },
      { name: 'Hypertrophy Upper Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Incline Bench Press', numSets: 3},
        {name: 'Cable Lateral Raise', numSets: 4},
        {name: 'Close Grip Lat Pulldown', numSets: 3},
        {name: 'Preacher Bicep Curl', numSets: 3}
      ] },
      { name: 'Hypertrophy Lower Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Front Squat', numSets: 3},
        {name: 'Barbell Romanian Deadlift', numSets: 3},
        {name: 'Bulgarian Split Squat', numSets: 3},
        {name: 'Leg Extension', numSets: 4}
      ] }
    ]
  })) },
  { name: 'Upper Lower (Jeff Nippard)', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Upper Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 4},
        {name: 'Bent-Over Dumbbell Row', numSets: 4},
        {name: 'Dumbbell Overhead Press', numSets: 3},
        {name: 'Pull-Up', numSets: 3},
      ] },
      { name: 'Lower Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4},
        {name: 'Barbell Romanian Deadlift', numSets: 3},
        {name: 'Lying Leg Curl', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 3}
      ] },
      { name: 'Upper Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Incline Bench Press', numSets: 3},
        {name: 'Wide Grip Lat Pulldown', numSets: 4},
        {name: 'Dumbbell Lateral Raise', numSets: 3},
        {name: 'Cable Tricep Pushdown', numSets: 3}
      ] },
      { name: 'Lower Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Leg Press', numSets: 4},
        {name: 'Walking Lunge', numSets: 3},
        {name: 'Leg Extension', numSets: 3},
        {name: 'Seated Calf Raise', numSets: 3}
      ] }
    ]
  })) },
  { name: 'AX-1 (Athlean X)', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Full Body Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Push-Up', numSets: 3},
        {name: 'Barbell Back Squat', numSets: 3},
        {name: 'Inverted Row', numSets: 3},
        {name: 'Plank', numSets: 3},
        {name: 'Reverse Lunge', numSets: 3}
      ] },
      { name: 'Full Body Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Chest Dip', numSets: 3},
        {name: 'Dumbbell Step-Up', numSets: 3},
        {name: 'Pull-Up', numSets: 3},
        {name: 'Bicycle Crunch', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 3}
      ] },
      { name: 'Full Body Day 3 Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Bench Press', numSets: 3},
        {name: 'Dumbbell Deadlift', numSets: 3},
        {name: 'Dumbbell Overhead Press', numSets: 3},
        {name: 'Inverted Row', numSets: 3},
        {name: 'Captains Chair Leg Raise', numSets: 3}
      ] },
      { name: 'Full Body Day 4 Week ' + (weekIdx + 1), exercises: [
        {name: 'Incline Push-Up', numSets: 3},
        {name: 'Bulgarian Split Squat', numSets: 3},
        {name: 'Cable Face Pull', numSets: 3},
        {name: 'Bird Dog', numSets: 3},
        {name: 'Glute Bridge', numSets: 3}
      ] },
      { name: 'Full Body Day 5 Week ' + (weekIdx + 1), exercises: [
        {name: 'Clap Push-Up', numSets: 3},
        {name: 'Wall Sit', numSets: 3},
        {name: 'Band Pull-Apart', numSets: 3},
        {name: 'Medicine Ball Russian Twist', numSets: 3},
        {name: 'Superman', numSets: 3}
      ] }
    ]
  })) },
  { name: 'AX-2 (Athlean X)', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Athletic Upper Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 4},
        {name: 'Weighted Pull-Up', numSets: 3},
        {name: 'Standing Barbell Overhead Press', numSets: 4},
        {name: 'Cable Face Pull', numSets: 3},
        {name: 'Cable Bicep Curl', numSets: 3}
      ] },
      { name: 'Athletic Lower Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Front Squat', numSets: 4},
        {name: 'Trap Bar Deadlift', numSets: 3},
        {name: 'Barbell Lunge', numSets: 3},
        {name: 'Donkey Calf Raise', numSets: 3},
        {name: 'Cable Glute Kickback', numSets: 3}
      ] },
      { name: 'Explosive Full Body Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Power Clean', numSets: 3},
        {name: 'Clap Push-Up', numSets: 3},
        {name: 'Muscle-Up', numSets: 3},
        {name: 'Pistol Squat', numSets: 3},
        {name: 'Barbell Clean and Jerk', numSets: 3}
      ] },
      { name: 'Core and Conditioning Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Weighted Plank', numSets: 3},
        {name: 'V-Up', numSets: 3},
        {name: 'Cable Woodchopper', numSets: 3},
        {name: 'Dumbbell Farmers Walk', numSets: 3},
        {name: 'Bird Dog', numSets: 3}
      ] },
      { name: 'Recovery Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Band External Shoulder Rotation', numSets: 3},
        {name: 'Band Internal Shoulder Rotation', numSets: 3},
        {name: 'Hyperextension', numSets: 3},
        {name: 'Glute Bridge', numSets: 3},
        {name: 'Wall Sit', numSets: 3}
      ] }
    ]
  })) },
  { name: 'XERO (Athlean X)', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Bodyweight Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Diamond Push-Up', numSets: 3},
        {name: 'Pistol Squat', numSets: 3},
        {name: 'Pull-Up', numSets: 3},
        {name: 'Triceps Dip', numSets: 3}
      ] },
      { name: 'Bodyweight Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Reverse Lunge', numSets: 3},
        {name: 'Inverted Row', numSets: 3},
        {name: 'Plank to Push-Up', numSets: 3},
        {name: 'Single Leg Calf Raise', numSets: 3}
      ] },
      { name: 'Bodyweight Day 3 Week ' + (weekIdx + 1), exercises: [
        {name: 'Bulgarian Split Squat', numSets: 3},
        {name: 'Decline Push-Up', numSets: 3},
        {name: 'Chin-Up', numSets: 3},
        {name: 'Twisting Crunch', numSets: 3}
      ] },
      { name: 'Bodyweight Day 4 Week ' + (weekIdx + 1), exercises: [
        {name: 'Wall Sit', numSets: 3},
        {name: 'Superman', numSets: 3},
        {name: 'Hanging Leg Raise', numSets: 3},
        {name: 'Side Plank', numSets: 3}
      ] }
    ]
  })) },
  { name: 'BEAXST (Athlean X)', mesocycleLength: 10, weeks: Array.from({length: 10}, (_, weekIdx) => ({
    days: [
      { name: 'Beast Push Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Close Grip Bench Press', numSets: 4},
        {name: 'Arnold Dumbbell Press', numSets: 3},
        {name: 'Weighted Dip', numSets: 3},
        {name: 'Dumbbell Tricep Kickback', numSets: 3},
        {name: 'Machine Chest Fly', numSets: 3},
        {name: 'Incline Push-Up', numSets: 3}
      ] },
      { name: 'Beast Pull Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Deficit Deadlift', numSets: 4},
        {name: 'One Arm Dumbbell Row', numSets: 3},
        {name: 'Weighted Pull-Up', numSets: 3},
        {name: 'Hammer Dumbbell Curl', numSets: 3},
        {name: 'Cable Face Pull', numSets: 3},
        {name: 'Dumbbell Shrug', numSets: 3}
      ] },
      { name: 'Beast Legs Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Box Squat', numSets: 4},
        {name: 'Single Leg Press', numSets: 3},
        {name: 'Barbell Lunge', numSets: 3},
        {name: 'Standing Leg Curl', numSets: 3},
        {name: 'Leg Press Calf Raise', numSets: 3},
        {name: 'Barbell Hip Thrust', numSets: 3}
      ] },
      { name: 'Beast Shoulders Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Machine Overhead Press', numSets: 4},
        {name: 'Machine Lateral Raise', numSets: 3},
        {name: 'Cable Front Raise', numSets: 3},
        {name: 'Cable Rear Delt Fly', numSets: 3},
        {name: 'Dumbbell Upright Row', numSets: 3},
        {name: 'Smith Machine Shrug', numSets: 3}
      ] },
      { name: 'Beast Arms Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Preacher Bicep Curl', numSets: 4},
        {name: 'Lying Barbell Tricep Extension', numSets: 4},
        {name: 'Hammer Dumbbell Curl', numSets: 3},
        {name: 'Cable Tricep Pushdown', numSets: 3},
        {name: 'Concentration Bicep Curl', numSets: 3},
        {name: 'Overhead Dumbbell Tricep Extension', numSets: 3}
      ] },
      { name: 'Beast Core Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Weighted Plank', numSets: 4},
        {name: 'Machine Crunch', numSets: 3},
        {name: 'Captains Chair Leg Raise', numSets: 3},
        {name: 'Medicine Ball Russian Twist', numSets: 3},
        {name: 'Cable Woodchopper', numSets: 3},
        {name: 'Weighted Hyperextension', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Old School Iron (Athlean X)', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Chest and Back Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 4},
        {name: 'Bent-Over Barbell Row', numSets: 4},
        {name: 'Barbell Incline Bench Press', numSets: 3},
        {name: 'V-Bar Pulldown', numSets: 3}
      ] },
      { name: 'Legs Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4},
        {name: 'Barbell Stiff-Legged Deadlift', numSets: 3},
        {name: 'Leg Extension', numSets: 3},
        {name: 'Lying Leg Curl', numSets: 3}
      ] },
      { name: 'Shoulders and Arms Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Seated Barbell Overhead Press', numSets: 4},
        {name: 'Barbell Bicep Curl', numSets: 3},
        {name: 'Lying Barbell Tricep Extension', numSets: 3},
        {name: 'Dumbbell Lateral Raise', numSets: 3}
      ] },
      { name: 'Full Body Recovery Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Pull-Up', numSets: 3},
        {name: 'Push-Up', numSets: 3},
        {name: 'Barbell Back Squat', numSets: 3},
        {name: 'Plank', numSets: 3}
      ] }
    ]
  })) },
  { name: 'RP Hypertrophy Templates', mesocycleLength: 6, weeks: Array.from({length: 6}, (_, weekIdx) => ({
    days: [
      { name: 'Push Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 4},
        {name: 'Dumbbell Overhead Press', numSets: 3},
        {name: 'Cable Tricep Pushdown', numSets: 3},
        {name: 'Dumbbell Lateral Raise', numSets: 3},
        {name: 'Dumbbell Chest Fly', numSets: 3}
      ] },
      { name: 'Pull Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Seated Cable Row', numSets: 4},
        {name: 'Pull-Up', numSets: 3},
        {name: 'Dumbbell Bicep Curl', numSets: 3},
        {name: 'Cable Face Pull', numSets: 3},
        {name: 'Dumbbell Rear Delt Fly', numSets: 3}
      ] },
      { name: 'Legs Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4},
        {name: 'Leg Press', numSets: 3},
        {name: 'Seated Leg Curl', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 3},
        {name: 'Leg Extension', numSets: 3}
      ] },
      { name: 'Upper Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Incline Bench Press', numSets: 3},
        {name: 'Close Grip Lat Pulldown', numSets: 3},
        {name: 'Machine Overhead Press', numSets: 3},
        {name: 'Cable Bicep Curl', numSets: 3},
        {name: 'Cable Tricep Extension', numSets: 3}
      ] },
      { name: 'Lower Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Romanian Deadlift', numSets: 3},
        {name: 'Bulgarian Split Squat', numSets: 3},
        {name: 'Barbell Hip Thrust', numSets: 3},
        {name: 'Seated Calf Raise', numSets: 3},
        {name: 'Cable Glute Kickback', numSets: 3}
      ] }
    ]
  })) },
  { name: 'RP Powerlifting Peaking', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Squat Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 5},
        {name: 'Leg Press', numSets: 4},
        {name: 'Leg Extension', numSets: 3},
        {name: 'Leg Press Calf Raise', numSets: 3}
      ] },
      { name: 'Bench Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 5},
        {name: 'Barbell Incline Bench Press', numSets: 4},
        {name: 'Overhead Dumbbell Tricep Extension', numSets: 3},
        {name: 'Cable Chest Fly', numSets: 3}
      ] },
      { name: 'Deadlift Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Conventional Deadlift', numSets: 5},
        {name: 'Barbell Rack Pull', numSets: 4},
        {name: 'Bent-Over Barbell Row', numSets: 3},
        {name: 'Lying Leg Curl', numSets: 3}
      ] },
      { name: 'Accessory Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Overhead Press', numSets: 3},
        {name: 'Wide Grip Lat Pulldown', numSets: 3},
        {name: 'Dumbbell Lateral Raise', numSets: 3},
        {name: 'Dumbbell Bicep Curl', numSets: 3}
      ] }
    ]
  })) },
  { name: 'RPE Strength Program', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Full Body Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4},
        {name: 'Barbell Bench Press', numSets: 4},
        {name: 'Barbell Conventional Deadlift', numSets: 3},
      ] },
      { name: 'Full Body Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Overhead Press', numSets: 4},
        {name: 'Bent-Over Barbell Row', numSets: 4},
        {name: 'Pull-Up', numSets: 3},
      ] },
      { name: 'Full Body Day 3 Week ' + (weekIdx + 1), exercises: [
        {name: 'Leg Press', numSets: 3},
        {name: 'Triceps Dip', numSets: 3},
        {name: 'Close Grip Lat Pulldown', numSets: 3},
      ] }
    ]
  })) },
  { name: 'RP Physique Templates', mesocycleLength: 10, weeks: Array.from({length: 10}, (_, weekIdx) => ({
    days: [
      { name: 'Chest Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Bench Press', numSets: 4},
        {name: 'Smith Machine Incline Bench Press', numSets: 3},
        {name: 'Machine Chest Fly', numSets: 3},
        {name: 'Low to High Cable Crossover', numSets: 3},
        {name: 'Push-Up', numSets: 3},
        {name: 'Chest Dip', numSets: 3}
      ] },
      { name: 'Back Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Trap Bar Deadlift', numSets: 3},
        {name: 'T-Bar Row', numSets: 4},
        {name: 'V-Bar Pulldown', numSets: 3},
        {name: 'Weighted Pull-Up', numSets: 3},
        {name: 'Cable Face Pull', numSets: 3},
        {name: 'Barbell Shrug', numSets: 3}
      ] },
      { name: 'Legs Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Hack Squat', numSets: 4},
        {name: 'Leg Press', numSets: 3},
        {name: 'Dumbbell Lunge', numSets: 3},
        {name: 'Seated Leg Curl', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 3},
        {name: 'Barbell Hip Thrust', numSets: 3}
      ] },
      { name: 'Shoulders Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Overhead Press', numSets: 4},
        {name: 'Cable Lateral Raise', numSets: 3},
        {name: 'Dumbbell Front Raise', numSets: 3},
        {name: 'Dumbbell Rear Delt Fly', numSets: 3},
        {name: 'Barbell Upright Row', numSets: 3},
        {name: 'Dumbbell Shrug', numSets: 3}
      ] },
      { name: 'Arms Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Bicep Curl', numSets: 4},
        {name: 'Cable Tricep Extension', numSets: 4},
        {name: 'Hammer Dumbbell Curl', numSets: 3},
        {name: 'Dumbbell Tricep Kickback', numSets: 3},
        {name: 'Preacher Bicep Curl', numSets: 3},
        {name: 'Lying Barbell Tricep Extension', numSets: 3}
      ] },
      { name: 'Core Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bicycle Crunch', numSets: 4},
        {name: 'Side Plank', numSets: 3},
        {name: 'Hanging Leg Raise', numSets: 3},
        {name: 'Medicine Ball Russian Twist', numSets: 3},
        {name: 'V-Up', numSets: 3},
        {name: 'Roman Chair Back Extension', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Lyle McDonald Generic Bulking', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Upper A Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 3},
        {name: 'Bent-Over Barbell Row', numSets: 3},
        {name: 'Barbell Overhead Press', numSets: 3},
        {name: 'Wide Grip Lat Pulldown', numSets: 3},
        {name: 'Barbell Bicep Curl', numSets: 3},
        {name: 'Lying Barbell Tricep Extension', numSets: 3}
      ] },
      { name: 'Lower A Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 3},
        {name: 'Barbell Romanian Deadlift', numSets: 3},
        {name: 'Leg Press', numSets: 3},
        {name: 'Lying Leg Curl', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 3}
      ] },
      { name: 'Upper B Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Incline Bench Press', numSets: 3},
        {name: 'One Arm Dumbbell Row', numSets: 3},
        {name: 'Dumbbell Lateral Raise', numSets: 3},
        {name: 'Chin-Up', numSets: 3},
        {name: 'Hammer Dumbbell Curl', numSets: 3},
        {name: 'Cable Tricep Pushdown', numSets: 3}
      ] },
      { name: 'Lower B Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Front Squat', numSets: 3},
        {name: 'Barbell Sumo Deadlift', numSets: 3},
        {name: 'Dumbbell Lunge', numSets: 3},
        {name: 'Leg Extension', numSets: 3},
        {name: 'Seated Calf Raise', numSets: 3}
      ] }
    ]
  })) },
  { name: 'PHAT (Layne Norton)', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Power Upper Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 5},
        {name: 'Bent-Over Barbell Row', numSets: 5},
        {name: 'Barbell Overhead Press', numSets: 3},
        {name: 'Pull-Up', numSets: 3}
      ] },
      { name: 'Power Lower Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 5},
        {name: 'Barbell Conventional Deadlift', numSets: 3},
        {name: 'Leg Press', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 3}
      ] },
      { name: 'Hypertrophy Back/Shoulders Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Seated Cable Row', numSets: 4},
        {name: 'Wide Grip Lat Pulldown', numSets: 4},
        {name: 'Dumbbell Lateral Raise', numSets: 4},
        {name: 'Dumbbell Rear Delt Fly', numSets: 4}
      ] },
      { name: 'Hypertrophy Legs/Calves Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Leg Extension', numSets: 4},
        {name: 'Seated Leg Curl', numSets: 4},
        {name: 'Walking Lunge', numSets: 4},
        {name: 'Seated Calf Raise', numSets: 4}
      ] },
      { name: 'Hypertrophy Chest/Arms Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Chest Fly', numSets: 4},
        {name: 'Dumbbell Incline Bench Press', numSets: 4},
        {name: 'Dumbbell Bicep Curl', numSets: 4},
        {name: 'Overhead Dumbbell Tricep Extension', numSets: 4}
      ] }
    ]
  })) },
  { name: 'PHUL Powerbuilding', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Power Upper Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 4},
        {name: 'Barbell Overhead Press', numSets: 3},
        {name: 'Bent-Over Barbell Row', numSets: 4},
        {name: 'Wide Grip Lat Pulldown', numSets: 3}
      ] },
      { name: 'Power Lower Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4},
        {name: 'Barbell Conventional Deadlift', numSets: 3},
        {name: 'Leg Press', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 3}
      ] },
      { name: 'Hypertrophy Upper Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Incline Bench Press', numSets: 4},
        {name: 'Dumbbell Lateral Raise', numSets: 4},
        {name: 'Cable Tricep Pushdown', numSets: 3},
        {name: 'Dumbbell Bicep Curl', numSets: 3}
      ] },
      { name: 'Hypertrophy Lower Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Front Squat', numSets: 4},
        {name: 'Barbell Romanian Deadlift', numSets: 3},
        {name: 'Leg Extension', numSets: 4},
        {name: 'Lying Leg Curl', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Joe Delaney 6 Day Upper Lower', mesocycleLength: 10, weeks: Array.from({length: 10}, (_, weekIdx) => ({
    days: [
      { name: 'Upper Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 4},
        {name: 'Dumbbell Overhead Press', numSets: 3},
        {name: 'One Arm Dumbbell Row', numSets: 4},
        {name: 'Pull-Up', numSets: 3}
      ] },
      { name: 'Lower Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4},
        {name: 'Barbell Romanian Deadlift', numSets: 3},
        {name: 'Leg Press', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 3}
      ] },
      { name: 'Isolation Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Lateral Raise', numSets: 4},
        {name: 'Concentration Bicep Curl', numSets: 3},
        {name: 'Cable Tricep Extension', numSets: 3},
        {name: 'Cable Face Pull', numSets: 3}
      ] },
      { name: 'Upper Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Incline Bench Press', numSets: 4},
        {name: 'Close Grip Lat Pulldown', numSets: 3},
        {name: 'Dumbbell Upright Row', numSets: 3},
        {name: 'Triceps Dip', numSets: 3}
      ] },
      { name: 'Lower Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Front Squat', numSets: 4},
        {name: 'Dumbbell Lunge', numSets: 3},
        {name: 'Seated Leg Curl', numSets: 3},
        {name: 'Seated Calf Raise', numSets: 3}
      ] },
      { name: 'Isolation Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Rear Delt Fly', numSets: 4},
        {name: 'Hammer Dumbbell Curl', numSets: 3},
        {name: 'Dumbbell Tricep Kickback', numSets: 3},
        {name: 'Dumbbell Shrug', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Reddit PPL (Metallicadpa)', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Push Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 3},
        {name: 'Barbell Overhead Press', numSets: 3},
        {name: 'Cable Tricep Pushdown', numSets: 3},
        {name: 'Dumbbell Lateral Raise', numSets: 3},
        {name: 'Dumbbell Chest Fly', numSets: 3},
        {name: 'Overhead Dumbbell Tricep Extension', numSets: 3}
      ] },
      { name: 'Pull Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Conventional Deadlift', numSets: 3},
        {name: 'Bent-Over Barbell Row', numSets: 3},
        {name: 'Pull-Up', numSets: 3},
        {name: 'Cable Face Pull', numSets: 3},
        {name: 'Dumbbell Bicep Curl', numSets: 3},
        {name: 'Hammer Dumbbell Curl', numSets: 3}
      ] },
      { name: 'Legs Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 3},
        {name: 'Barbell Romanian Deadlift', numSets: 3},
        {name: 'Leg Press', numSets: 3},
        {name: 'Lying Leg Curl', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 3}
      ] },
      { name: 'Push Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Incline Bench Press', numSets: 3},
        {name: 'Dumbbell Overhead Press', numSets: 3},
        {name: 'Triceps Dip', numSets: 3},
        {name: 'Cable Lateral Raise', numSets: 3},
        {name: 'High to Low Cable Crossover', numSets: 3},
        {name: 'Dumbbell Tricep Kickback', numSets: 3}
      ] },
      { name: 'Pull Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Seated Cable Row', numSets: 3},
        {name: 'Wide Grip Lat Pulldown', numSets: 3},
        {name: 'Chin-Up', numSets: 3},
        {name: 'Machine Rear Delt Fly', numSets: 3},
        {name: 'EZ Bar Bicep Curl', numSets: 3},
        {name: 'Concentration Bicep Curl', numSets: 3}
      ] },
      { name: 'Legs Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Front Squat', numSets: 3},
        {name: 'Barbell Sumo Deadlift', numSets: 3},
        {name: 'Dumbbell Lunge', numSets: 3},
        {name: 'Leg Extension', numSets: 3},
        {name: 'Seated Calf Raise', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Mike Israetel Hypertrophy', mesocycleLength: 5, weeks: Array.from({length: 5}, (_, weekIdx) => ({
    days: [
      { name: 'Chest and Back Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 4},
        {name: 'Bent-Over Dumbbell Row', numSets: 4},
        {name: 'Dumbbell Incline Bench Press', numSets: 3},
        {name: 'Close Grip Lat Pulldown', numSets: 3}
      ] },
      { name: 'Legs Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4},
        {name: 'Leg Press', numSets: 3},
        {name: 'Seated Leg Curl', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 3},
        {name: 'Bulgarian Split Squat', numSets: 3}
      ] },
      { name: 'Shoulders and Arms Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Overhead Press', numSets: 4},
        {name: 'Dumbbell Lateral Raise', numSets: 3},
        {name: 'Dumbbell Bicep Curl', numSets: 3},
        {name: 'Cable Tricep Extension', numSets: 3},
        {name: 'Dumbbell Rear Delt Fly', numSets: 3}
      ] },
      { name: 'Full Body Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Romanian Deadlift', numSets: 3},
        {name: 'Dumbbell Chest Fly', numSets: 3},
        {name: 'Leg Extension', numSets: 3},
        {name: 'Pull-Up', numSets: 3},
        {name: 'Crunch', numSets: 3}
      ] },
      { name: 'Full Body Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Dumbbell Lunge', numSets: 3},
        {name: 'Chest Dip', numSets: 3},
        {name: 'Cable Face Pull', numSets: 3},
        {name: 'Hammer Dumbbell Curl', numSets: 3},
        {name: 'Plank', numSets: 3}
      ] }
    ]
  })) },
  { name: '5/3/1 BBB for Bodybuilding', mesocycleLength: 7, weeks: Array.from({length: 7}, (_, weekIdx) => ({
    days: [
      { name: 'Squat Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 5},
        {name: 'Leg Press', numSets: 5},
        {name: 'Lying Leg Curl', numSets: 3}
      ] },
      { name: 'Bench Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 5},
        {name: 'Dumbbell Incline Bench Press', numSets: 5},
        {name: 'Overhead Dumbbell Tricep Extension', numSets: 3}
      ] },
      { name: 'Deadlift Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Conventional Deadlift', numSets: 5},
        {name: 'Bent-Over Barbell Row', numSets: 5},
        {name: 'Wide Grip Lat Pulldown', numSets: 3}
      ] },
      { name: 'Overhead Press Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Overhead Press', numSets: 5},
        {name: 'Dumbbell Lateral Raise', numSets: 5},
        {name: 'Dumbbell Rear Delt Fly', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Arnold Golden Six', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Full Body Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4},
        {name: 'Wide Grip Bench Press', numSets: 3},
        {name: 'Pull-Up', numSets: 3},
        {name: 'Barbell Overhead Press', numSets: 4},
        {name: 'Barbell Bicep Curl', numSets: 3},
        {name: 'Crunch', numSets: 3}
      ] },
      { name: 'Full Body Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4},
        {name: 'Wide Grip Bench Press', numSets: 3},
        {name: 'Pull-Up', numSets: 3},
        {name: 'Barbell Overhead Press', numSets: 4},
        {name: 'Barbell Bicep Curl', numSets: 3},
        {name: 'Crunch', numSets: 3}
      ] },
      { name: 'Full Body Day 3 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 4},
        {name: 'Wide Grip Bench Press', numSets: 3},
        {name: 'Pull-Up', numSets: 3},
        {name: 'Barbell Overhead Press', numSets: 4},
        {name: 'Barbell Bicep Curl', numSets: 3},
        {name: 'Crunch', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Push Pull Legs Hypertrophy (Jeff Nippard)', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Leg Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 3},
        {name: 'Barbell Romanian Deadlift', numSets: 3},
        {name: 'Single Leg Press', numSets: 3},
        {name: 'Leg Extension', numSets: 3},
        {name: 'Seated Leg Curl', numSets: 3},
        {name: 'Standing Calf Raise', numSets: 3},
        {name: 'Decline Crunch', numSets: 2},
        {name: 'Plank', numSets: 2}
      ] },
      { name: 'Push Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Bench Press', numSets: 3},
        {name: 'Machine Shoulder Press', numSets: 3},
        {name: 'Chest Dip', numSets: 3},
        {name: 'Lying Barbell Tricep Extension', numSets: 3},
        {name: 'Cable Lateral Raise', numSets: 3},
        {name: 'Cable Tricep Kickback', numSets: 3}
      ] },
      { name: 'Pull Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Weighted Pull-Up', numSets: 3},
        {name: 'Seated Cable Row', numSets: 3},
        {name: 'Cable Pullover', numSets: 3},
        {name: 'Hammer Dumbbell Curl', numSets: 3},
        {name: 'Dumbbell Incline Bench Press', numSets: 2}
      ] },
      { name: 'Leg Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Conventional Deadlift', numSets: 3},
        {name: 'Hack Squat', numSets: 3},
        {name: 'Barbell Hip Thrust', numSets: 3},
        {name: 'Lying Leg Curl', numSets: 2},
        {name: 'Machine Back Extension', numSets: 2},
        {name: 'Single Leg Calf Raise', numSets: 3},
        {name: 'Hanging Leg Raise', numSets: 3}
      ] },
      { name: 'Push Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Overhead Press', numSets: 4},
        {name: 'Close Grip Bench Press', numSets: 3},
        {name: 'Cable Chest Fly', numSets: 3},
        {name: 'Cable Tricep Extension', numSets: 3},
        {name: 'Dumbbell Lateral Raise', numSets: 3},
        {name: 'Cable Face Pull', numSets: 3}
      ] },
      { name: 'Pull Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Wide Grip Lat Pulldown', numSets: 3},
        {name: 'Chest Supported Row', numSets: 3},
        {name: 'Cable Face Pull', numSets: 3},
        {name: 'Dumbbell Shrug', numSets: 3},
        {name: 'Machine Rear Delt Fly', numSets: 2},
        {name: 'Dumbbell Bicep Curl', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Starting Strength', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Workout A Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 3},
        {name: 'Barbell Bench Press', numSets: 3},
        {name: 'Barbell Conventional Deadlift', numSets: 1}
      ] },
      { name: 'Workout B Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 3},
        {name: 'Barbell Overhead Press', numSets: 3},
        {name: 'Barbell Conventional Deadlift', numSets: 1}
      ] },
      { name: 'Workout A Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 3},
        {name: 'Barbell Bench Press', numSets: 3},
        {name: 'Barbell Conventional Deadlift', numSets: 1}
      ] }
    ]
  })) },
  { name: 'StrongLifts 5x5', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Workout A Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 5},
        {name: 'Barbell Bench Press', numSets: 5},
        {name: 'Bent-Over Barbell Row', numSets: 5}
      ] },
      { name: 'Workout B Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 5},
        {name: 'Barbell Overhead Press', numSets: 5},
        {name: 'Barbell Conventional Deadlift', numSets: 1}
      ] },
      { name: 'Workout A Week ' + (weekIdx + 1), exercises: [
        {name: 'Barbell Back Squat', numSets: 5},
        {name: 'Barbell Bench Press', numSets: 5},
        {name: 'Bent-Over Barbell Row', numSets: 5}
      ] }
    ]
  })) },
  { name: 'Wendler 5/3/1 Standard', mesocycleLength: 4, weeks: Array.from({length: 4}, (_, weekIdx) => ({
    days: [
      { name: 'Squat Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 3},
        {name: 'Leg Press', subtype: '', numSets: 5},
        {name: 'Leg Curl', subtype: 'Lying', numSets: 3}
      ] },
      { name: 'Bench Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 3},
        {name: 'Incline Bench Press', subtype: 'Dumbbell', numSets: 5},
        {name: 'Overhead Triceps Extension', subtype: '', numSets: 3}
      ] },
      { name: 'Deadlift Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 3},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 5},
        {name: 'Lat Pulldown', subtype: 'Wide Grip', numSets: 3}
      ] },
      { name: 'Overhead Press Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 3},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 5},
        {name: 'Rear Delt Fly', subtype: 'Dumbbell', numSets: 3}
      ] }
    ]
  })) }
];