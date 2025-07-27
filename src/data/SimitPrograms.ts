export const simitPrograms = [
    { name: 'Push Pull Legs', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Push Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 3},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 3},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 3},
        {name: 'Tricep Pushdown', subtype: 'Cable', numSets: 3},
        {name: 'Chest Fly', subtype: 'Cable', numSets: 3},
        {name: 'Overhead Tricep Extension', subtype: '', numSets: 3}
      ] },
      { name: 'Pull Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: 'Barbell', numSets: 3},
        {name: 'Pull-Up', subtype: '', numSets: 3},
        {name: 'Bent-Over Row', subtype: 'Barbell', numSets: 3},
        {name: 'Face Pull', subtype: '', numSets: 3},
        {name: 'Bicep Curl', subtype: 'Dumbbell', numSets: 3},
        {name: 'Hammer Curl', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Legs Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell', numSets: 3},
        {name: 'Romanian Deadlift', subtype: 'Barbell', numSets: 3},
        {name: 'Leg Press', subtype: '', numSets: 3},
        {name: 'Leg Curl', subtype: '', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Full Body High Frequency (Jeff Nippard)', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Full Body Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 3},
        {name: 'Bench Press', subtype: 'Barbell', numSets: 3},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 3},
        {name: 'Overhead Press', subtype: 'Dumbbell', numSets: 3},
        {name: 'Pull-Up', subtype: '', numSets: 3},
        {name: 'Leg Curl', subtype: 'Lying', numSets: 3}
      ] },
      { name: 'Full Body Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: 'Barbell Romanian', numSets: 3},
        {name: 'Incline Bench Press', subtype: 'Dumbbell', numSets: 3},
        {name: 'Lat Pulldown', subtype: 'Wide Grip', numSets: 3},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 3},
        {name: 'Tricep Extension', subtype: 'Overhead Dumbbell', numSets: 3},
        {name: 'Bicep Curl', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Full Body Day 3 Week ' + (weekIdx + 1), exercises: [
        {name: 'Leg Press', subtype: '', numSets: 3},
        {name: 'Chest Fly', subtype: 'Dumbbell', numSets: 3},
        {name: 'Row', subtype: 'Seated Cable', numSets: 3},
        {name: 'Front Raise', subtype: 'Dumbbell', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 3},
        {name: 'Crunch', subtype: '', numSets: 3}
      ] },
      { name: 'Full Body Day 4 Week ' + (weekIdx + 1), exercises: [
        {name: 'Lunge', subtype: 'Dumbbell', numSets: 3},
        {name: 'Dip', subtype: 'Chest', numSets: 3},
        {name: 'Chin-Up', subtype: '', numSets: 3},
        {name: 'Rear Delt Fly', subtype: 'Dumbbell', numSets: 3},
        {name: 'Tricep Pushdown', subtype: 'Cable', numSets: 3},
        {name: 'Hammer Curl', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Full Body Day 5 Week ' + (weekIdx + 1), exercises: [
        {name: 'Hack Squat', subtype: '', numSets: 3},
        {name: 'Floor Press', subtype: 'Dumbbell', numSets: 3},
        {name: 'Face Pull', subtype: 'Cable', numSets: 3},
        {name: 'Upright Row', subtype: 'Barbell', numSets: 3},
        {name: 'Leg Extension', subtype: '', numSets: 3},
        {name: 'Plank', subtype: '', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Pure Bodybuilding (Jeff Nippard)', mesocycleLength: 10, weeks: Array.from({length: 10}, (_, weekIdx) => ({
    days: [
      { name: 'Chest and Triceps Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 4},
        {name: 'Incline Bench Press', subtype: 'Dumbbell', numSets: 3},
        {name: 'Chest Fly', subtype: 'Cable', numSets: 3},
        {name: 'Tricep Extension', subtype: 'Lying Barbell', numSets: 3},
        {name: 'Tricep Pushdown', subtype: 'Cable', numSets: 3}
      ] },
      { name: 'Back and Biceps Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 3},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 4},
        {name: 'Lat Pulldown', subtype: 'Wide Grip', numSets: 3},
        {name: 'Bicep Curl', subtype: 'EZ Bar', numSets: 3},
        {name: 'Hammer Curl', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Legs Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 4},
        {name: 'Leg Press', subtype: '', numSets: 3},
        {name: 'Leg Extension', subtype: '', numSets: 3},
        {name: 'Leg Curl', subtype: 'Seated', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 4}
      ] },
      { name: 'Shoulders and Abs Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 4},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 3},
        {name: 'Rear Delt Fly', subtype: 'Machine', numSets: 3},
        {name: 'Crunch', subtype: 'Machine', numSets: 3},
        {name: 'Leg Raise', subtype: 'Hanging', numSets: 3}
      ] },
      { name: 'Full Body Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Dumbbell', numSets: 3},
        {name: 'Pull-Up', subtype: '', numSets: 3},
        {name: 'Squat', subtype: 'Goblet', numSets: 3},
        {name: 'Face Pull', subtype: 'Cable', numSets: 3},
        {name: 'Bicep Curl', subtype: 'Concentration', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Powerbuilding (Jeff Nippard)', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Power Upper Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 5},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 4},
        {name: 'Row', subtype: 'T-Bar', numSets: 4},
        {name: 'Tricep Extension', subtype: 'Machine', numSets: 3}
      ] },
      { name: 'Power Lower Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 5},
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 4},
        {name: 'Leg Press', subtype: '', numSets: 3},
        {name: 'Calf Raise', subtype: 'Seated', numSets: 3}
      ] },
      { name: 'Hypertrophy Upper Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Incline Bench Press', subtype: 'Dumbbell', numSets: 3},
        {name: 'Lateral Raise', subtype: 'Cable', numSets: 4},
        {name: 'Lat Pulldown', subtype: 'Close Grip', numSets: 3},
        {name: 'Bicep Curl', subtype: 'Preacher', numSets: 3}
      ] },
      { name: 'Hypertrophy Lower Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Front Squat', subtype: '', numSets: 3},
        {name: 'Romanian Deadlift', subtype: 'Barbell', numSets: 3},
        {name: 'Bulgarian Split Squat', subtype: '', numSets: 3},
        {name: 'Leg Extension', subtype: '', numSets: 4}
      ] }
    ]
  })) },
  { name: 'Upper Lower (Jeff Nippard)', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Upper Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 4},
        {name: 'Row', subtype: 'Bent-Over Dumbbell', numSets: 4},
        {name: 'Overhead Press', subtype: 'Dumbbell', numSets: 3},
        {name: 'Pull-Up', subtype: '', numSets: 3},
      ] },
      { name: 'Lower Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 4},
        {name: 'Deadlift', subtype: 'Barbell Romanian', numSets: 3},
        {name: 'Leg Curl', subtype: 'Lying', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 3}
      ] },
      { name: 'Upper Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Incline Bench Press', subtype: 'Barbell', numSets: 3},
        {name: 'Lat Pulldown', subtype: 'Wide Grip', numSets: 4},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 3},
        {name: 'Tricep Pushdown', subtype: 'Cable', numSets: 3}
      ] },
      { name: 'Lower Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Leg Press', subtype: '', numSets: 4},
        {name: 'Lunge', subtype: 'Walking', numSets: 3},
        {name: 'Leg Extension', subtype: '', numSets: 3},
        {name: 'Calf Raise', subtype: 'Seated', numSets: 3}
      ] }
    ]
  })) },
  { name: 'AX-1 (Athlean X)', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Full Body Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Push-Up', subtype: '', numSets: 3},
        {name: 'Squat', subtype: 'Bodyweight', numSets: 3},
        {name: 'Inverted Row', subtype: '', numSets: 3},
        {name: 'Plank', subtype: '', numSets: 3},
        {name: 'Lunge', subtype: 'Reverse', numSets: 3}
      ] },
      { name: 'Full Body Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Dip', subtype: 'Chest', numSets: 3},
        {name: 'Step-Up', subtype: 'Bodyweight', numSets: 3},
        {name: 'Pull-Up', subtype: '', numSets: 3},
        {name: 'Crunch', subtype: 'Bicycle', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 3}
      ] },
      { name: 'Full Body Day 3 Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Dumbbell', numSets: 3},
        {name: 'Deadlift', subtype: 'Dumbbell', numSets: 3},
        {name: 'Overhead Press', subtype: 'Dumbbell', numSets: 3},
        {name: 'Row', subtype: 'Inverted', numSets: 3},
        {name: 'Leg Raise', subtype: "Captains Chair", numSets: 3}
      ] },
      { name: 'Full Body Day 4 Week ' + (weekIdx + 1), exercises: [
        {name: 'Incline Push-Up', subtype: '', numSets: 3},
        {name: 'Bulgarian Split Squat', subtype: '', numSets: 3},
        {name: 'Face Pull', subtype: 'Band', numSets: 3},
        {name: 'Bird Dog', subtype: '', numSets: 3},
        {name: 'Glute Bridge', subtype: '', numSets: 3}
      ] },
      { name: 'Full Body Day 5 Week ' + (weekIdx + 1), exercises: [
        {name: 'Clap Push-Up', subtype: '', numSets: 3},
        {name: 'Wall Sit', subtype: '', numSets: 3},
        {name: 'Band Pull-Apart', subtype: '', numSets: 3},
        {name: 'Russian Twist', subtype: '', numSets: 3},
        {name: 'Superman', subtype: '', numSets: 3}
      ] }
    ]
  })) },
  { name: 'AX-2 (Athlean X)', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Athletic Upper Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 4},
        {name: 'Pull-Up', subtype: 'Weighted', numSets: 3},
        {name: 'Overhead Press', subtype: 'Standing', numSets: 4},
        {name: 'Face Pull', subtype: 'Cable', numSets: 3},
        {name: 'Bicep Curl', subtype: 'Cable', numSets: 3}
      ] },
      { name: 'Athletic Lower Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Front', numSets: 4},
        {name: 'Deadlift', subtype: 'Trap Bar', numSets: 3},
        {name: 'Lunge', subtype: 'Barbell', numSets: 3},
        {name: 'Calf Raise', subtype: 'Donkey', numSets: 3},
        {name: 'Glute Kickback', subtype: 'Cable', numSets: 3}
      ] },
      { name: 'Explosive Full Body Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Power Clean', subtype: 'Barbell', numSets: 3},
        {name: 'Push-Up', subtype: 'Clap', numSets: 3},
        {name: 'Muscle-Up', subtype: '', numSets: 3},
        {name: 'Pistol Squat', subtype: '', numSets: 3},
        {name: 'Clean and Jerk', subtype: 'Barbell', numSets: 3}
      ] },
      { name: 'Core and Conditioning Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Plank', subtype: 'Weighted', numSets: 3},
        {name: 'V-Up', subtype: '', numSets: 3},
        {name: 'Woodchopper', subtype: 'Cable', numSets: 3},
        {name: 'Farmers Walk', subtype: 'Dumbbell', numSets: 3},
        {name: 'Bird Dog', subtype: '', numSets: 3}
      ] },
      { name: 'Recovery Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Band External Shoulder Rotation', subtype: '', numSets: 3},
        {name: 'Band Internal Shoulder Rotation', subtype: '', numSets: 3},
        {name: 'Hyperextension', subtype: '', numSets: 3},
        {name: 'Glute Bridge', subtype: '', numSets: 3},
        {name: 'Wall Sit', subtype: '', numSets: 3}
      ] }
    ]
  })) },
  { name: 'XERO (Athlean X)', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Bodyweight Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Push-Up', subtype: 'Diamond', numSets: 3},
        {name: 'Squat', subtype: 'Pistol', numSets: 3},
        {name: 'Pull-Up', subtype: '', numSets: 3},
        {name: 'Dip', subtype: 'Triceps', numSets: 3}
      ] },
      { name: 'Bodyweight Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Lunge', subtype: 'Reverse', numSets: 3},
        {name: 'Inverted Row', subtype: '', numSets: 3},
        {name: 'Plank to Push-Up', subtype: '', numSets: 3},
        {name: 'Calf Raise', subtype: 'Single Leg', numSets: 3}
      ] },
      { name: 'Bodyweight Day 3 Week ' + (weekIdx + 1), exercises: [
        {name: 'Bulgarian Split Squat', subtype: '', numSets: 3},
        {name: 'Push-Up', subtype: 'Decline', numSets: 3},
        {name: 'Chin-Up', subtype: '', numSets: 3},
        {name: 'Crunch', subtype: 'Twisting', numSets: 3}
      ] },
      { name: 'Bodyweight Day 4 Week ' + (weekIdx + 1), exercises: [
        {name: 'Wall Sit', subtype: '', numSets: 3},
        {name: 'Superman', subtype: '', numSets: 3},
        {name: 'Leg Raise', subtype: 'Hanging', numSets: 3},
        {name: 'Plank', subtype: 'Side', numSets: 3}
      ] }
    ]
  })) },
  { name: 'BEAXST (Athlean X)', mesocycleLength: 10, weeks: Array.from({length: 10}, (_, weekIdx) => ({
    days: [
      { name: 'Beast Push Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Close Grip', numSets: 4},
        {name: 'Overhead Press', subtype: 'Arnold Dumbbell', numSets: 3},
        {name: 'Dip', subtype: 'Weighted', numSets: 3},
        {name: 'Tricep Kickback', subtype: 'Dumbbell', numSets: 3},
        {name: 'Chest Fly', subtype: 'Machine', numSets: 3},
        {name: 'Push-Up', subtype: 'Incline', numSets: 3}
      ] },
      { name: 'Beast Pull Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: 'Deficit', numSets: 4},
        {name: 'Row', subtype: 'One Arm Dumbbell', numSets: 3},
        {name: 'Pull-Up', subtype: 'Weighted', numSets: 3},
        {name: 'Bicep Curl', subtype: 'Hammer Dumbbell', numSets: 3},
        {name: 'Face Pull', subtype: 'Cable', numSets: 3},
        {name: 'Shrug', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Beast Legs Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Box', numSets: 4},
        {name: 'Leg Press', subtype: 'Single Leg', numSets: 3},
        {name: 'Lunge', subtype: 'Barbell', numSets: 3},
        {name: 'Leg Curl', subtype: 'Standing', numSets: 3},
        {name: 'Calf Raise', subtype: 'Leg Press', numSets: 3},
        {name: 'Hip Thrust', subtype: 'Barbell', numSets: 3}
      ] },
      { name: 'Beast Shoulders Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Overhead Press', subtype: 'Machine', numSets: 4},
        {name: 'Lateral Raise', subtype: 'Machine', numSets: 3},
        {name: 'Front Raise', subtype: 'Cable', numSets: 3},
        {name: 'Rear Delt Fly', subtype: 'Cable', numSets: 3},
        {name: 'Upright Row', subtype: 'Dumbbell', numSets: 3},
        {name: 'Shrug', subtype: 'Smith Machine', numSets: 3}
      ] },
      { name: 'Beast Arms Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bicep Curl', subtype: 'Preacher', numSets: 4},
        {name: 'Tricep Extension', subtype: 'Skull Crusher', numSets: 4},
        {name: 'Hammer Curl', subtype: 'Dumbbell', numSets: 3},
        {name: 'Tricep Pushdown', subtype: 'Cable', numSets: 3},
        {name: 'Concentration Curl', subtype: '', numSets: 3},
        {name: 'Overhead Tricep Extension', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Beast Core Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Plank', subtype: 'Weighted', numSets: 4},
        {name: 'Crunch', subtype: 'Machine', numSets: 3},
        {name: 'Leg Raise', subtype: 'Captains Chair', numSets: 3},
        {name: 'Russian Twist', subtype: 'Medicine Ball', numSets: 3},
        {name: 'Woodchopper', subtype: 'Cable', numSets: 3},
        {name: 'Back Extension', subtype: 'Weighted', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Old School Iron (Athlean X)', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Chest and Back Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 4},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 4},
        {name: 'Incline Bench Press', subtype: 'Barbell', numSets: 3},
        {name: 'Lat Pulldown', subtype: 'V-Bar', numSets: 3}
      ] },
      { name: 'Legs Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 4},
        {name: 'Deadlift', subtype: 'Barbell Stiff-Legged', numSets: 3},
        {name: 'Leg Extension', subtype: '', numSets: 3},
        {name: 'Leg Curl', subtype: 'Lying', numSets: 3}
      ] },
      { name: 'Shoulders and Arms Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Overhead Press', subtype: 'Seated', numSets: 4},
        {name: 'Bicep Curl', subtype: 'Barbell', numSets: 3},
        {name: 'Tricep Extension', subtype: 'Lying Barbell', numSets: 3},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Full Body Recovery Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Pull-Up', subtype: '', numSets: 3},
        {name: 'Push-Up', subtype: '', numSets: 3},
        {name: 'Squat', subtype: 'Bodyweight', numSets: 3},
        {name: 'Plank', subtype: '', numSets: 3}
      ] }
    ]
  })) },
  { name: 'RP Hypertrophy Templates', mesocycleLength: 6, weeks: Array.from({length: 6}, (_, weekIdx) => ({
    days: [
      { name: 'Push Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 4},
        {name: 'Overhead Press', subtype: 'Dumbbell', numSets: 3},
        {name: 'Tricep Pushdown', subtype: 'Cable', numSets: 3},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 3},
        {name: 'Chest Fly', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Pull Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Row', subtype: 'Seated Cable', numSets: 4},
        {name: 'Pull-Up', subtype: '', numSets: 3},
        {name: 'Bicep Curl', subtype: 'Dumbbell', numSets: 3},
        {name: 'Face Pull', subtype: 'Cable', numSets: 3},
        {name: 'Rear Delt Fly', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Legs Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 4},
        {name: 'Leg Press', subtype: '', numSets: 3},
        {name: 'Leg Curl', subtype: 'Seated', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 3},
        {name: 'Leg Extension', subtype: '', numSets: 3}
      ] },
      { name: 'Upper Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Incline Bench Press', subtype: 'Barbell', numSets: 3},
        {name: 'Lat Pulldown', subtype: 'Close Grip', numSets: 3},
        {name: 'Overhead Press', subtype: 'Machine', numSets: 3},
        {name: 'Bicep Curl', subtype: 'Cable', numSets: 3},
        {name: 'Tricep Extension', subtype: 'Cable', numSets: 3}
      ] },
      { name: 'Lower Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: 'Barbell Romanian', numSets: 3},
        {name: 'Bulgarian Split Squat', subtype: '', numSets: 3},
        {name: 'Hip Thrust', subtype: 'Barbell', numSets: 3},
        {name: 'Calf Raise', subtype: 'Seated', numSets: 3},
        {name: 'Glute Kickback', subtype: 'Cable', numSets: 3}
      ] }
    ]
  })) },
  { name: 'RP Powerlifting Peaking', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Squat Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 5},
        {name: 'Leg Press', subtype: '', numSets: 4},
        {name: 'Leg Extension', subtype: '', numSets: 3},
        {name: 'Calf Raise', subtype: 'Leg Press', numSets: 3}
      ] },
      { name: 'Bench Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 5},
        {name: 'Incline Bench Press', subtype: 'Barbell', numSets: 4},
        {name: 'Tricep Extension', subtype: 'Overhead Dumbbell', numSets: 3},
        {name: 'Chest Fly', subtype: 'Cable', numSets: 3}
      ] },
      { name: 'Deadlift Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 5},
        {name: 'Rack Pull', subtype: 'Barbell', numSets: 4},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 3},
        {name: 'Leg Curl', subtype: 'Lying', numSets: 3}
      ] },
      { name: 'Accessory Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 3},
        {name: 'Lat Pulldown', subtype: 'Wide Grip', numSets: 3},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 3},
        {name: 'Bicep Curl', subtype: 'Dumbbell', numSets: 3}
      ] }
    ]
  })) },
  { name: 'RPE Strength Program', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Full Body Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 4},
        {name: 'Bench Press', subtype: 'Barbell', numSets: 4},
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 3},
      ] },
      { name: 'Full Body Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 4},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 4},
        {name: 'Pull-Up', subtype: '', numSets: 3},
      ] },
      { name: 'Full Body Day 3 Week ' + (weekIdx + 1), exercises: [
        {name: 'Leg Press', subtype: '', numSets: 3},
        {name: 'Dip', subtype: 'Triceps', numSets: 3},
        {name: 'Lat Pulldown', subtype: 'Close Grip', numSets: 3},
      ] }
    ]
  })) },
  { name: 'RP Physique Templates', mesocycleLength: 10, weeks: Array.from({length: 10}, (_, weekIdx) => ({
    days: [
      { name: 'Chest Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Dumbbell', numSets: 4},
        {name: 'Incline Bench Press', subtype: 'Smith Machine', numSets: 3},
        {name: 'Chest Fly', subtype: 'Machine', numSets: 3},
        {name: 'Cable Crossover', subtype: 'Low to High', numSets: 3},
        {name: 'Push-Up', subtype: '', numSets: 3},
        {name: 'Dip', subtype: 'Chest', numSets: 3}
      ] },
      { name: 'Back Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: 'Trap Bar', numSets: 3},
        {name: 'Row', subtype: 'T-Bar', numSets: 4},
        {name: 'Lat Pulldown', subtype: 'V-Bar', numSets: 3},
        {name: 'Pull-Up', subtype: 'Weighted', numSets: 3},
        {name: 'Face Pull', subtype: 'Cable', numSets: 3},
        {name: 'Shrug', subtype: 'Barbell', numSets: 3}
      ] },
      { name: 'Legs Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Hack', numSets: 4},
        {name: 'Leg Press', subtype: '', numSets: 3},
        {name: 'Lunge', subtype: 'Dumbbell', numSets: 3},
        {name: 'Leg Curl', subtype: 'Seated', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 3},
        {name: 'Hip Thrust', subtype: 'Barbell', numSets: 3}
      ] },
      { name: 'Shoulders Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Overhead Press', subtype: 'Dumbbell', numSets: 4},
        {name: 'Lateral Raise', subtype: 'Cable', numSets: 3},
        {name: 'Front Raise', subtype: 'Dumbbell', numSets: 3},
        {name: 'Rear Delt Fly', subtype: 'Dumbbell', numSets: 3},
        {name: 'Upright Row', subtype: 'Barbell', numSets: 3},
        {name: 'Shrug', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Arms Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bicep Curl', subtype: 'Dumbbell', numSets: 4},
        {name: 'Tricep Extension', subtype: 'Cable', numSets: 4},
        {name: 'Hammer Curl', subtype: 'Dumbbell', numSets: 3},
        {name: 'Tricep Kickback', subtype: 'Dumbbell', numSets: 3},
        {name: 'Preacher Curl', subtype: '', numSets: 3},
        {name: 'Skull Crusher', subtype: '', numSets: 3}
      ] },
      { name: 'Core Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Crunch', subtype: 'Bicycle', numSets: 4},
        {name: 'Plank', subtype: 'Side', numSets: 3},
        {name: 'Leg Raise', subtype: 'Hanging', numSets: 3},
        {name: 'Russian Twist', subtype: 'Medicine Ball', numSets: 3},
        {name: 'V-Up', subtype: '', numSets: 3},
        {name: 'Back Extension', subtype: 'Roman Chair', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Lyle McDonald Generic Bulking', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Upper A Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 3},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 3},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 3},
        {name: 'Pull-Down', subtype: 'Wide Grip', numSets: 3},
        {name: 'Bicep Curl', subtype: 'Barbell', numSets: 3},
        {name: 'Tricep Extension', subtype: 'Lying Barbell', numSets: 3}
      ] },
      { name: 'Lower A Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 3},
        {name: 'Deadlift', subtype: 'Barbell Romanian', numSets: 3},
        {name: 'Leg Press', subtype: '', numSets: 3},
        {name: 'Leg Curl', subtype: 'Lying', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 3}
      ] },
      { name: 'Upper B Week ' + (weekIdx + 1), exercises: [
        {name: 'Incline Bench Press', subtype: 'Dumbbell', numSets: 3},
        {name: 'Row', subtype: 'One Arm Dumbbell', numSets: 3},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 3},
        {name: 'Chin-Up', subtype: '', numSets: 3},
        {name: 'Hammer Curl', subtype: 'Dumbbell', numSets: 3},
        {name: 'Tricep Pushdown', subtype: 'Cable', numSets: 3}
      ] },
      { name: 'Lower B Week ' + (weekIdx + 1), exercises: [
        {name: 'Front Squat', subtype: '', numSets: 3},
        {name: 'Deadlift', subtype: 'Barbell Sumo', numSets: 3},
        {name: 'Lunge', subtype: 'Dumbbell', numSets: 3},
        {name: 'Leg Extension', subtype: '', numSets: 3},
        {name: 'Calf Raise', subtype: 'Seated', numSets: 3}
      ] }
    ]
  })) },
  { name: 'PHAT (Layne Norton)', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Power Upper Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 5},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 5},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 3},
        {name: 'Pull-Up', subtype: '', numSets: 3}
      ] },
      { name: 'Power Lower Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 5},
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 3},
        {name: 'Leg Press', subtype: '', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 3}
      ] },
      { name: 'Hypertrophy Back/Shoulders Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Row', subtype: 'Seated Cable', numSets: 4},
        {name: 'Lat Pulldown', subtype: 'Wide Grip', numSets: 4},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 4},
        {name: 'Rear Delt Fly', subtype: 'Dumbbell', numSets: 4}
      ] },
      { name: 'Hypertrophy Legs/Calves Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Leg Extension', subtype: '', numSets: 4},
        {name: 'Leg Curl', subtype: 'Seated', numSets: 4},
        {name: 'Lunge', subtype: 'Walking', numSets: 4},
        {name: 'Calf Raise', subtype: 'Seated', numSets: 4}
      ] },
      { name: 'Hypertrophy Chest/Arms Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Chest Fly', subtype: 'Dumbbell', numSets: 4},
        {name: 'Incline Bench Press', subtype: 'Dumbbell', numSets: 4},
        {name: 'Bicep Curl', subtype: 'Dumbbell', numSets: 4},
        {name: 'Tricep Extension', subtype: 'Overhead Dumbbell', numSets: 4}
      ] }
    ]
  })) },
  { name: 'PHUL Powerbuilding', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Power Upper Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 4},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 3},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 4},
        {name: 'Pull-Down', subtype: 'Wide Grip', numSets: 3}
      ] },
      { name: 'Power Lower Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 4},
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 3},
        {name: 'Leg Press', subtype: '', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 3}
      ] },
      { name: 'Hypertrophy Upper Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Incline Bench Press', subtype: 'Dumbbell', numSets: 4},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 4},
        {name: 'Tricep Pushdown', subtype: 'Cable', numSets: 3},
        {name: 'Bicep Curl', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Hypertrophy Lower Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Front Squat', subtype: '', numSets: 4},
        {name: 'Romanian Deadlift', subtype: 'Barbell', numSets: 3},
        {name: 'Leg Extension', subtype: '', numSets: 4},
        {name: 'Leg Curl', subtype: 'Lying', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Joe Delaney 6 Day Upper Lower', mesocycleLength: 10, weeks: Array.from({length: 10}, (_, weekIdx) => ({
    days: [
      { name: 'Upper Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 4},
        {name: 'Overhead Press', subtype: 'Dumbbell', numSets: 3},
        {name: 'Row', subtype: 'One Arm Dumbbell', numSets: 4},
        {name: 'Pull-Up', subtype: '', numSets: 3}
      ] },
      { name: 'Lower Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 4},
        {name: 'Deadlift', subtype: 'Barbell Romanian', numSets: 3},
        {name: 'Leg Press', subtype: '', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 3}
      ] },
      { name: 'Isolation Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 4},
        {name: 'Bicep Curl', subtype: 'Concentration', numSets: 3},
        {name: 'Tricep Extension', subtype: 'Cable', numSets: 3},
        {name: 'Face Pull', subtype: 'Cable', numSets: 3}
      ] },
      { name: 'Upper Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Incline Bench Press', subtype: 'Dumbbell', numSets: 4},
        {name: 'Lat Pulldown', subtype: 'Close Grip', numSets: 3},
        {name: 'Upright Row', subtype: 'Dumbbell', numSets: 3},
        {name: 'Dip', subtype: 'Triceps', numSets: 3}
      ] },
      { name: 'Lower Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Front Squat', subtype: '', numSets: 4},
        {name: 'Lunge', subtype: 'Dumbbell', numSets: 3},
        {name: 'Leg Curl', subtype: 'Seated', numSets: 3},
        {name: 'Calf Raise', subtype: 'Seated', numSets: 3}
      ] },
      { name: 'Isolation Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Rear Delt Fly', subtype: 'Dumbbell', numSets: 4},
        {name: 'Hammer Curl', subtype: 'Dumbbell', numSets: 3},
        {name: 'Tricep Kickback', subtype: 'Dumbbell', numSets: 3},
        {name: 'Shrug', subtype: 'Dumbbell', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Reddit PPL (Metallicadpa)', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Push Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 3},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 3},
        {name: 'Tricep Pushdown', subtype: 'Cable', numSets: 3},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 3},
        {name: 'Chest Fly', subtype: 'Dumbbell', numSets: 3},
        {name: 'Tricep Extension', subtype: 'Overhead Dumbbell', numSets: 3}
      ] },
      { name: 'Pull Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 3},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 3},
        {name: 'Pull-Up', subtype: '', numSets: 3},
        {name: 'Face Pull', subtype: 'Cable', numSets: 3},
        {name: 'Bicep Curl', subtype: 'Dumbbell', numSets: 3},
        {name: 'Hammer Curl', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Legs Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 3},
        {name: 'Romanian Deadlift', subtype: 'Barbell', numSets: 3},
        {name: 'Leg Press', subtype: '', numSets: 3},
        {name: 'Leg Curl', subtype: 'Lying', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 3}
      ] },
      { name: 'Push Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Incline Bench Press', subtype: 'Barbell', numSets: 3},
        {name: 'Overhead Press', subtype: 'Dumbbell', numSets: 3},
        {name: 'Dip', subtype: 'Triceps', numSets: 3},
        {name: 'Lateral Raise', subtype: 'Cable', numSets: 3},
        {name: 'Cable Crossover', subtype: 'High to Low', numSets: 3},
        {name: 'Tricep Kickback', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Pull Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Row', subtype: 'Seated Cable', numSets: 3},
        {name: 'Lat Pulldown', subtype: 'Wide Grip', numSets: 3},
        {name: 'Chin-Up', subtype: '', numSets: 3},
        {name: 'Rear Delt Fly', subtype: 'Machine', numSets: 3},
        {name: 'Bicep Curl', subtype: 'EZ Bar', numSets: 3},
        {name: 'Concentration Curl', subtype: '', numSets: 3}
      ] },
      { name: 'Legs Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Front Squat', subtype: '', numSets: 3},
        {name: 'Deadlift', subtype: 'Barbell Sumo', numSets: 3},
        {name: 'Lunge', subtype: 'Dumbbell', numSets: 3},
        {name: 'Leg Extension', subtype: '', numSets: 3},
        {name: 'Calf Raise', subtype: 'Seated', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Mike Israetel Hypertrophy', mesocycleLength: 5, weeks: Array.from({length: 5}, (_, weekIdx) => ({
    days: [
      { name: 'Chest and Back Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 4},
        {name: 'Row', subtype: 'Bent-Over Dumbbell', numSets: 4},
        {name: 'Incline Bench Press', subtype: 'Dumbbell', numSets: 3},
        {name: 'Lat Pulldown', subtype: 'Close Grip', numSets: 3}
      ] },
      { name: 'Legs Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 4},
        {name: 'Leg Press', subtype: '', numSets: 3},
        {name: 'Leg Curl', subtype: 'Seated', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 3},
        {name: 'Bulgarian Split Squat', subtype: '', numSets: 3}
      ] },
      { name: 'Shoulders and Arms Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Overhead Press', subtype: 'Dumbbell', numSets: 4},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 3},
        {name: 'Bicep Curl', subtype: 'Dumbbell', numSets: 3},
        {name: 'Tricep Extension', subtype: 'Cable', numSets: 3},
        {name: 'Rear Delt Fly', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Full Body Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: 'Barbell Romanian', numSets: 3},
        {name: 'Chest Fly', subtype: 'Dumbbell', numSets: 3},
        {name: 'Leg Extension', subtype: '', numSets: 3},
        {name: 'Pull-Up', subtype: '', numSets: 3},
        {name: 'Crunch', subtype: '', numSets: 3}
      ] },
      { name: 'Full Body Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Lunge', subtype: 'Dumbbell', numSets: 3},
        {name: 'Dip', subtype: 'Chest', numSets: 3},
        {name: 'Face Pull', subtype: 'Cable', numSets: 3},
        {name: 'Hammer Curl', subtype: 'Dumbbell', numSets: 3},
        {name: 'Plank', subtype: '', numSets: 3}
      ] }
    ]
  })) },
  { name: '5/3/1 BBB for Bodybuilding', mesocycleLength: 7, weeks: Array.from({length: 7}, (_, weekIdx) => ({
    days: [
      { name: 'Squat Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 5},
        {name: 'Leg Press', subtype: '', numSets: 5},
        {name: 'Leg Curl', subtype: 'Lying', numSets: 3}
      ] },
      { name: 'Bench Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 5},
        {name: 'Incline Bench Press', subtype: 'Dumbbell', numSets: 5},
        {name: 'Overhead Triceps Extension', subtype: '', numSets: 3}
      ] },
      { name: 'Deadlift Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 5},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 5},
        {name: 'Lat Pulldown', subtype: 'Wide Grip', numSets: 3}
      ] },
      { name: 'Overhead Press Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 5},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 5},
        {name: 'Rear Delt Fly', subtype: 'Dumbbell', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Arnold Golden Six', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Full Body Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 4},
        {name: 'Bench Press', subtype: 'Barbell Wide Grip', numSets: 3},
        {name: 'Pull-Up', subtype: '', numSets: 3},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 4},
        {name: 'Bicep Curl', subtype: 'Barbell', numSets: 3},
        {name: 'Crunch', subtype: '', numSets: 3}
      ] },
      { name: 'Full Body Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 4},
        {name: 'Bench Press', subtype: 'Barbell Wide Grip', numSets: 3},
        {name: 'Pull-Up', subtype: '', numSets: 3},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 4},
        {name: 'Bicep Curl', subtype: 'Barbell', numSets: 3},
        {name: 'Crunch', subtype: '', numSets: 3}
      ] },
      { name: 'Full Body Day 3 Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 4},
        {name: 'Bench Press', subtype: 'Barbell Wide Grip', numSets: 3},
        {name: 'Pull-Up', subtype: '', numSets: 3},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 4},
        {name: 'Bicep Curl', subtype: 'Barbell', numSets: 3},
        {name: 'Crunch', subtype: '', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Push Pull Legs Hypertrophy (Jeff Nippard)', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Leg Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: '', numSets: 3},
        {name: 'Romanian Deadlift', subtype: '', numSets: 3},
        {name: 'Single Leg Press', subtype: '', numSets: 3},
        {name: 'Eccentric Leg Extension', subtype: '', numSets: 3},
        {name: 'Seated Leg Curls', subtype: '', numSets: 3},
        {name: 'Standing Calf Raise', subtype: '', numSets: 3},
        {name: 'Decline Crunches', subtype: '', numSets: 2},
        {name: 'Long-Lever Planks', subtype: '', numSets: 2}
      ] },
      { name: 'Push Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: '', numSets: 3},
        {name: 'Machine Shoulder Press', subtype: '', numSets: 3},
        {name: 'Dips', subtype: '', numSets: 3},
        {name: 'Eccentric Skullcrushers', subtype: '', numSets: 3},
        {name: 'Egyptian Lateral Raise', subtype: '', numSets: 3},
        {name: 'Cable Triceps Kickbacks', subtype: '', numSets: 3}
      ] },
      { name: 'Pull Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Weighted Pull-Up', subtype: '', numSets: 3},
        {name: 'Seated Cable Row', subtype: '', numSets: 3},
        {name: 'Cable Pullover', subtype: '', numSets: 3},
        {name: 'Hammer Cheat Curl', subtype: '', numSets: 3},
        {name: 'Incline Dumbbell Curl', subtype: '', numSets: 2}
      ] },
      { name: 'Leg Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: '', numSets: 3},
        {name: 'Hack Squat', subtype: '', numSets: 3},
        {name: 'Single-Leg Hip Thrust', subtype: '', numSets: 3},
        {name: 'Nordic Ham Curl', subtype: '', numSets: 2},
        {name: 'Prisoner Back Extension', subtype: '', numSets: 2},
        {name: 'Single-Leg Calf Raise', subtype: '', numSets: 3},
        {name: 'Weighted L-Sit Hold', subtype: '', numSets: 3}
      ] },
      { name: 'Push Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Overhead Press', subtype: '', numSets: 4},
        {name: 'Close-Grip Bench Press', subtype: '', numSets: 3},
        {name: 'Cable Crossover', subtype: '', numSets: 3},
        {name: 'Overhead Triceps Extension', subtype: '', numSets: 3},
        {name: 'Lateral Raise 21’s', subtype: '', numSets: 3},
        {name: 'Neck Flexion/Extension', subtype: '', numSets: 3}
      ] },
      { name: 'Pull Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Omni-Grip Lat Pulldown', subtype: '', numSets: 3},
        {name: 'Chest Supported Row', subtype: '', numSets: 3},
        {name: 'Rope Face Pull', subtype: '', numSets: 3},
        {name: 'Incline Dumbbell Shrug', subtype: '', numSets: 3},
        {name: 'Reverse Pec Deck', subtype: '', numSets: 2},
        {name: 'Pronated/Supinated Curl', subtype: '', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Starting Strength', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Workout A Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 3},
        {name: 'Bench Press', subtype: 'Barbell', numSets: 3},
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 1}
      ] },
      { name: 'Workout B Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 3},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 3},
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 1}
      ] },
      { name: 'Workout A Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 3},
        {name: 'Bench Press', subtype: 'Barbell', numSets: 3},
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 1}
      ] }
    ]
  })) },
  { name: 'StrongLifts 5x5', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Workout A Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 5},
        {name: 'Bench Press', subtype: 'Barbell', numSets: 5},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 5}
      ] },
      { name: 'Workout B Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 5},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 5},
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 1}
      ] },
      { name: 'Workout A Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 5},
        {name: 'Bench Press', subtype: 'Barbell', numSets: 5},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 5}
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
  })) },
  { name: 'Greyskull LP', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Workout A Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 3},
        {name: 'Squat', subtype: 'Barbell Back', numSets: 3},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 3}
      ] },
      { name: 'Workout B Week ' + (weekIdx + 1), exercises: [
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 3},
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 1},
        {name: 'Squat', subtype: 'Barbell Back', numSets: 3}
      ] },
      { name: 'Workout A Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 3},
        {name: 'Squat', subtype: 'Barbell Back', numSets: 3},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 3}
      ] }
    ]
  })) },
  { name: 'nSuns 531 5-Day', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 9},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 6},
        {name: 'Close Grip Bench Press', subtype: '', numSets: 5}
      ] },
      { name: 'Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 9},
        {name: 'Sumo Deadlift', subtype: '', numSets: 6},
        {name: 'Leg Press', subtype: '', numSets: 5}
      ] },
      { name: 'Day 3 Week ' + (weekIdx + 1), exercises: [
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 9},
        {name: 'Bench Press', subtype: 'Barbell', numSets: 6},
        {name: 'Tricep Extension', subtype: 'Cable', numSets: 5}
      ] },
      { name: 'Day 4 Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 8},
        {name: 'Front Squat', subtype: '', numSets: 6},
        {name: 'Leg Curl', subtype: 'Lying', numSets: 5}
      ] },
      { name: 'Day 5 Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 9},
        {name: 'Incline Bench Press', subtype: 'Dumbbell', numSets: 6},
        {name: 'Dip', subtype: 'Triceps', numSets: 5}
      ] }
    ]
  })) },
  { name: 'Candito 6 Week Strength', mesocycleLength: 6, weeks: Array.from({length: 6}, (_, weekIdx) => ({
    days: [
      { name: 'Heavy Lower Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 4},
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 3},
        {name: 'Leg Press', subtype: '', numSets: 3}
      ] },
      { name: 'Heavy Upper Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 4},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 3},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 3}
      ] },
      { name: 'Control Lower Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 4},
        {name: 'Romanian Deadlift', subtype: 'Barbell', numSets: 3},
        {name: 'Leg Curl', subtype: 'Seated', numSets: 3}
      ] },
      { name: 'Control Upper Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 4},
        {name: 'Lat Pulldown', subtype: 'Wide Grip', numSets: 3},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Optional Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bicep Curl', subtype: 'Dumbbell', numSets: 3},
        {name: 'Tricep Extension', subtype: 'Cable', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Smolov Squat', mesocycleLength: 13, weeks: Array.from({length: 13}, (_, weekIdx) => ({
    days: [
      { name: 'Squat Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 4}
      ] },
      { name: 'Squat Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 5}
      ] },
      { name: 'Squat Day 3 Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 10}
      ] },
      { name: 'Squat Day 4 Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Sheiko Beginner', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 5},
        {name: 'Squat', subtype: 'Barbell Back', numSets: 5},
        {name: 'Bench Press', subtype: 'Barbell', numSets: 4}
      ] },
      { name: 'Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 5},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 5},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 4}
      ] },
      { name: 'Day 3 Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 5},
        {name: 'Squat', subtype: 'Barbell Back', numSets: 5},
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 4}
      ] }
    ]
  })) },
  { name: 'Juggernaut Method', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Squat Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 5},
        {name: 'Leg Press', subtype: '', numSets: 3},
        {name: 'Leg Curl', subtype: 'Lying', numSets: 3}
      ] },
      { name: 'Bench Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 5},
        {name: 'Overhead Press', subtype: 'Dumbbell', numSets: 3},
        {name: 'Tricep Extension', subtype: 'Cable', numSets: 3}
      ] },
      { name: 'Deadlift Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 5},
        {name: 'Row', subtype: 'Seated Cable', numSets: 3},
        {name: 'Lat Pulldown', subtype: 'Wide Grip', numSets: 3}
      ] },
      { name: 'Overhead Press Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 5},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 3},
        {name: 'Rear Delt Fly', subtype: 'Cable', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Texas Method', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Volume Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 5},
        {name: 'Bench Press', subtype: 'Barbell', numSets: 5},
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 1}
      ] },
      { name: 'Light Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 2},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 3},
        {name: 'Pull-Up', subtype: '', numSets: 3}
      ] },
      { name: 'Intensity Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 1},
        {name: 'Bench Press', subtype: 'Barbell', numSets: 1},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 5}
      ] }
    ]
  })) },
  { name: 'Madcow 5x5', mesocycleLength: 12, weeks: Array.from({length: 12}, (_, weekIdx) => ({
    days: [
      { name: 'Heavy Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 5},
        {name: 'Bench Press', subtype: 'Barbell', numSets: 5},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 5}
      ] },
      { name: 'Light Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 3},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 3},
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 3}
      ] },
      { name: 'Medium Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 4},
        {name: 'Bench Press', subtype: 'Barbell', numSets: 4},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 4}
      ] }
    ]
  })) },
  { name: 'GZCL Method', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Squat/Bench Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 3},
        {name: 'Bench Press', subtype: 'Barbell', numSets: 3},
        {name: 'Leg Press', subtype: '', numSets: 3},
        {name: 'Close Grip Bench Press', subtype: '', numSets: 3}
      ] },
      { name: 'Deadlift/OHP Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 3},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 3},
        {name: 'Row', subtype: 'Bent-Over Barbell', numSets: 3},
        {name: 'Lateral Raise', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Accessory Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Leg Extension', subtype: '', numSets: 3},
        {name: 'Tricep Extension', subtype: 'Cable', numSets: 3},
        {name: 'Bicep Curl', subtype: 'Dumbbell', numSets: 3}
      ] },
      { name: 'Accessory Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Leg Curl', subtype: 'Lying', numSets: 3},
        {name: 'Face Pull', subtype: 'Cable', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Westside Barbell Athletic', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Max Effort Lower Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Box', numSets: 3},
        {name: 'Deadlift', subtype: 'Deficit', numSets: 3},
        {name: 'Leg Curl', subtype: 'Lying', numSets: 3}
      ] },
      { name: 'Dynamic Effort Upper Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Barbell', numSets: 9},
        {name: 'Tricep Extension', subtype: 'Skull Crusher', numSets: 3},
        {name: 'Row', subtype: 'One Arm Dumbbell', numSets: 3}
      ] },
      { name: 'Max Effort Upper Week ' + (weekIdx + 1), exercises: [
        {name: 'Bench Press', subtype: 'Close Grip', numSets: 3},
        {name: 'Overhead Press', subtype: 'Barbell', numSets: 3},
        {name: 'Pull-Up', subtype: '', numSets: 3}
      ] },
      { name: 'Dynamic Effort Lower Week ' + (weekIdx + 1), exercises: [
        {name: 'Deadlift', subtype: 'Barbell Conventional', numSets: 8},
        {name: 'Leg Press', subtype: '', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 3}
      ] }
    ]
  })) },
  { name: 'Vert Shock Vertical Jump', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Plyo Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat Jump', subtype: '', numSets: 4},
        {name: 'Box Jump', subtype: '', numSets: 4},
        {name: 'Lunge Jump', subtype: '', numSets: 3}
      ] },
      { name: 'Strength Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Squat', subtype: 'Barbell Back', numSets: 4},
        {name: 'Deadlift', subtype: 'Barbell Romanian', numSets: 3},
        {name: 'Calf Raise', subtype: 'Standing', numSets: 4}
      ] },
      { name: 'Plyo Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Tuck Jump', subtype: '', numSets: 4},
        {name: 'Depth Jump', subtype: '', numSets: 4},
        {name: 'Broad Jump', subtype: '', numSets: 3}
      ] },
      { name: 'Strength Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Lunge', subtype: 'Dumbbell', numSets: 4},
        {name: 'Hip Thrust', subtype: 'Barbell', numSets: 3},
        {name: 'Leg Extension', subtype: '', numSets: 4}
      ] },
      { name: 'Recovery Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Plank', subtype: '', numSets: 3},
        {name: 'Glute Bridge', subtype: '', numSets: 3},
        {name: 'Calf Raise', subtype: 'Single Leg', numSets: 3}
      ] },
      { name: 'Optional Speed Day Week ' + (weekIdx + 1), exercises: [
        {name: 'Sprint', subtype: '20m', numSets: 5},
        {name: 'Agility Ladder', subtype: '', numSets: 4}
      ] }
    ]
  })) },
  { name: 'Explosive Speed & Power', mesocycleLength: 8, weeks: Array.from({length: 8}, (_, weekIdx) => ({
    days: [
      { name: 'Speed Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Sprint', subtype: '40m', numSets: 6},
        {name: 'High Knees', subtype: '', numSets: 4},
        {name: 'Bounding', subtype: '', numSets: 3}
      ] },
      { name: 'Power Day 1 Week ' + (weekIdx + 1), exercises: [
        {name: 'Power Clean', subtype: 'Barbell', numSets: 4},
        {name: 'Box Jump', subtype: '', numSets: 4},
        {name: 'Medicine Ball Slam', subtype: '', numSets: 3}
      ] },
      { name: 'Speed Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Sprint', subtype: '60m', numSets: 5},
        {name: 'A-Skips', subtype: '', numSets: 4},
        {name: 'Ladder Drills', subtype: '', numSets: 3}
      ] },
      { name: 'Power Day 2 Week ' + (weekIdx + 1), exercises: [
        {name: 'Snatch', subtype: 'Barbell', numSets: 4},
        {name: 'Depth Jump', subtype: '', numSets: 4},
        {name: 'Kettlebell Swing', subtype: '', numSets: 3}
      ] }
    ]
  })) }
];