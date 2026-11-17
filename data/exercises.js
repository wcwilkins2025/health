/* Steadfast Health exercise library: weight exercises to pick from when building a workout, and starter routines.
   [name, muscle group, equipment]. A person can still type any exercise of their own. */
window.HT_EXERCISES = {
  groups: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Glutes', 'Core', 'Full body'],
  equipment: ['Dumbbell', 'Barbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Band'],
  list: [
    // Chest
    ['Bench Press', 'Chest', 'Barbell'], ['Incline Bench Press', 'Chest', 'Barbell'], ['Decline Bench Press', 'Chest', 'Barbell'],
    ['Dumbbell Bench Press', 'Chest', 'Dumbbell'], ['Incline Dumbbell Press', 'Chest', 'Dumbbell'], ['Dumbbell Fly', 'Chest', 'Dumbbell'],
    ['Dumbbell Floor Press', 'Chest', 'Dumbbell'], ['Dumbbell Pullover', 'Chest', 'Dumbbell'], ['Chest Press Machine', 'Chest', 'Machine'],
    ['Pec Deck', 'Chest', 'Machine'], ['Cable Crossover', 'Chest', 'Cable'], ['Push-up', 'Chest', 'Bodyweight'], ['Incline Push-up', 'Chest', 'Bodyweight'],
    ['Dip', 'Chest', 'Bodyweight'], ['Band Chest Press', 'Chest', 'Band'],
    // Back
    ['Deadlift', 'Back', 'Barbell'], ['Barbell Row', 'Back', 'Barbell'], ['Pendlay Row', 'Back', 'Barbell'], ['T-Bar Row', 'Back', 'Barbell'],
    ['One-Arm Dumbbell Row', 'Back', 'Dumbbell'], ['Chest-Supported Dumbbell Row', 'Back', 'Dumbbell'], ['Dumbbell Shrug', 'Back', 'Dumbbell'],
    ['Renegade Row', 'Back', 'Dumbbell'], ['Lat Pulldown', 'Back', 'Cable'], ['Seated Cable Row', 'Back', 'Cable'], ['Straight-Arm Pulldown', 'Back', 'Cable'],
    ['Seated Row Machine', 'Back', 'Machine'], ['Assisted Pull-up', 'Back', 'Machine'], ['Back Extension', 'Back', 'Machine'],
    ['Pull-up', 'Back', 'Bodyweight'], ['Chin-up', 'Back', 'Bodyweight'], ['Inverted Row', 'Back', 'Bodyweight'], ['Kettlebell Row', 'Back', 'Kettlebell'],
    ['Band Pull-Apart', 'Back', 'Band'], ['Band Row', 'Back', 'Band'],
    // Shoulders
    ['Overhead Press', 'Shoulders', 'Barbell'], ['Dumbbell Shoulder Press', 'Shoulders', 'Dumbbell'], ['Arnold Press', 'Shoulders', 'Dumbbell'],
    ['Lateral Raise', 'Shoulders', 'Dumbbell'], ['Front Raise', 'Shoulders', 'Dumbbell'], ['Rear Delt Fly', 'Shoulders', 'Dumbbell'],
    ['Upright Row', 'Shoulders', 'Dumbbell'], ['Shoulder Press Machine', 'Shoulders', 'Machine'], ['Reverse Pec Deck', 'Shoulders', 'Machine'],
    ['Cable Lateral Raise', 'Shoulders', 'Cable'], ['Face Pull', 'Shoulders', 'Cable'], ['Pike Push-up', 'Shoulders', 'Bodyweight'],
    ['Kettlebell Press', 'Shoulders', 'Kettlebell'], ['Band Lateral Raise', 'Shoulders', 'Band'],
    // Arms
    ['Barbell Curl', 'Arms', 'Barbell'], ['EZ-Bar Curl', 'Arms', 'Barbell'], ['Close-Grip Bench Press', 'Arms', 'Barbell'], ['Skull Crusher', 'Arms', 'Barbell'],
    ['Dumbbell Curl', 'Arms', 'Dumbbell'], ['Hammer Curl', 'Arms', 'Dumbbell'], ['Incline Dumbbell Curl', 'Arms', 'Dumbbell'], ['Concentration Curl', 'Arms', 'Dumbbell'],
    ['Overhead Triceps Extension', 'Arms', 'Dumbbell'], ['Dumbbell Kickback', 'Arms', 'Dumbbell'], ['Triceps Pushdown', 'Arms', 'Cable'],
    ['Cable Curl', 'Arms', 'Cable'], ['Rope Overhead Extension', 'Arms', 'Cable'], ['Preacher Curl Machine', 'Arms', 'Machine'],
    ['Bench Dip', 'Arms', 'Bodyweight'], ['Diamond Push-up', 'Arms', 'Bodyweight'], ['Band Curl', 'Arms', 'Band'], ['Band Triceps Pushdown', 'Arms', 'Band'],
    // Legs
    ['Back Squat', 'Legs', 'Barbell'], ['Front Squat', 'Legs', 'Barbell'], ['Romanian Deadlift', 'Legs', 'Barbell'], ['Barbell Lunge', 'Legs', 'Barbell'],
    ['Goblet Squat', 'Legs', 'Dumbbell'], ['Dumbbell Squat', 'Legs', 'Dumbbell'], ['Dumbbell Squat to Bench', 'Legs', 'Dumbbell'], ['Dumbbell Lunge', 'Legs', 'Dumbbell'],
    ['Bulgarian Split Squat', 'Legs', 'Dumbbell'], ['Dumbbell Step-up', 'Legs', 'Dumbbell'], ['Dumbbell Romanian Deadlift', 'Legs', 'Dumbbell'],
    ['Dumbbell Calf Raise', 'Legs', 'Dumbbell'], ['Leg Press', 'Legs', 'Machine'], ['Leg Extension', 'Legs', 'Machine'], ['Leg Curl', 'Legs', 'Machine'],
    ['Hack Squat', 'Legs', 'Machine'], ['Calf Raise', 'Legs', 'Machine'], ['Seated Calf Raise', 'Legs', 'Machine'], ['Bodyweight Squat', 'Legs', 'Bodyweight'],
    ['Wall Sit', 'Legs', 'Bodyweight'], ['Walking Lunge', 'Legs', 'Bodyweight'], ['Standing Calf Raise', 'Legs', 'Bodyweight'], ['Kettlebell Goblet Squat', 'Legs', 'Kettlebell'],
    // Glutes
    ['Hip Thrust', 'Glutes', 'Barbell'], ['Dumbbell Hip Thrust', 'Glutes', 'Dumbbell'], ['Glute Bridge', 'Glutes', 'Bodyweight'], ['Single-Leg Glute Bridge', 'Glutes', 'Bodyweight'],
    ['Cable Kickback', 'Glutes', 'Cable'], ['Hip Abduction Machine', 'Glutes', 'Machine'], ['Band Lateral Walk', 'Glutes', 'Band'], ['Kettlebell Swing', 'Glutes', 'Kettlebell'],
    // Core
    ['Plank', 'Core', 'Bodyweight'], ['Side Plank', 'Core', 'Bodyweight'], ['Crunch', 'Core', 'Bodyweight'], ['Flutter Kicks', 'Core', 'Bodyweight'],
    ['Flat Bench Leg Raises', 'Core', 'Bodyweight'], ['Hanging Leg Raise', 'Core', 'Bodyweight'], ['Dead Bug', 'Core', 'Bodyweight'], ['Bird Dog', 'Core', 'Bodyweight'],
    ['Russian Twist', 'Core', 'Dumbbell'], ['Cable Crunch', 'Core', 'Cable'], ['Pallof Press', 'Core', 'Cable'], ['Ab Crunch Machine', 'Core', 'Machine'],
    ['Farmer Carry', 'Core', 'Dumbbell'], ['Suitcase Carry', 'Core', 'Kettlebell'],
    // Full body
    ['Dumbbell Thruster', 'Full body', 'Dumbbell'], ['Dumbbell Clean and Press', 'Full body', 'Dumbbell'], ['Man Maker', 'Full body', 'Dumbbell'],
    ['Kettlebell Clean', 'Full body', 'Kettlebell'], ['Turkish Get-up', 'Full body', 'Kettlebell'], ['Burpee', 'Full body', 'Bodyweight'],
    ['Mountain Climber', 'Full body', 'Bodyweight'], ['Bear Crawl', 'Full body', 'Bodyweight'], ['Sled Push', 'Full body', 'Machine']
  ],
  /* starter routines: workout name -> [exercise, sets, reps] */
  routines: {
    'Push / Pull / Legs (gym)': {
      Push: [['Bench Press', 3, 10], ['Incline Dumbbell Press', 3, 10], ['Overhead Press', 3, 10], ['Lateral Raise', 3, 12], ['Triceps Pushdown', 3, 12]],
      Pull: [['Lat Pulldown', 3, 10], ['Seated Cable Row', 3, 10], ['Face Pull', 3, 15], ['Dumbbell Curl', 3, 10], ['Hammer Curl', 3, 10]],
      Legs: [['Leg Press', 3, 10], ['Romanian Deadlift', 3, 10], ['Leg Curl', 3, 12], ['Leg Extension', 3, 12], ['Calf Raise', 3, 15]]
    },
    'Upper / Lower': {
      Upper: [['Dumbbell Bench Press', 3, 10], ['One-Arm Dumbbell Row', 3, 10], ['Dumbbell Shoulder Press', 3, 10], ['Lat Pulldown', 3, 10], ['Dumbbell Curl', 2, 12], ['Triceps Pushdown', 2, 12]],
      Lower: [['Goblet Squat', 3, 10], ['Dumbbell Romanian Deadlift', 3, 10], ['Walking Lunge', 3, 10], ['Leg Curl', 3, 12], ['Calf Raise', 3, 15], ['Plank', 3, 30]]
    },
    'Full body, three days': {
      'Full Body A': [['Goblet Squat', 3, 10], ['Dumbbell Bench Press', 3, 10], ['One-Arm Dumbbell Row', 3, 10], ['Glute Bridge', 3, 12], ['Plank', 3, 30]],
      'Full Body B': [['Dumbbell Romanian Deadlift', 3, 10], ['Dumbbell Shoulder Press', 3, 10], ['Lat Pulldown', 3, 10], ['Dumbbell Step-up', 3, 10], ['Dead Bug', 3, 10]],
      'Full Body C': [['Bulgarian Split Squat', 3, 8], ['Incline Dumbbell Press', 3, 10], ['Seated Cable Row', 3, 10], ['Farmer Carry', 3, 40], ['Side Plank', 3, 30]]
    },
    'Dumbbells at home': {
      'Home Upper': [['Dumbbell Floor Press', 3, 12], ['One-Arm Dumbbell Row', 3, 12], ['Dumbbell Shoulder Press', 3, 10], ['Hammer Curl', 3, 12], ['Overhead Triceps Extension', 3, 12]],
      'Home Lower': [['Goblet Squat', 3, 12], ['Dumbbell Romanian Deadlift', 3, 12], ['Dumbbell Lunge', 3, 10], ['Dumbbell Hip Thrust', 3, 12], ['Dumbbell Calf Raise', 3, 15]]
    }
  }
};
