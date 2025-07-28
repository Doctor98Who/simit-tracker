// Fully fixed version of DataContext.tsx with theme and settings support
import { createContext, useState, useEffect } from 'react';
import { exerciseDatabase } from './data/ExerciseDatabase';
import { simitPrograms } from './data/SimitPrograms';

export interface Set {
  weight: string;
  reps: string;
  rpe: string;
  rir?: string;
  completed: boolean;
  type?: 'W' | 'D' | 'S';
}

export interface Exercise {
  name: string;
  subtype?: string;
  muscles: string;
  instructions?: string;
  equipment?: string;
  sets: Set[];
  numSets?: number;
}

interface Workout {
  name: string;
  exercises: Exercise[];
  startTime: number;
  duration: number;
  pump?: string;
  soreness?: string;
  workload?: string;
  suggestion?: string;
}

export interface DataType {
  templates: any[];
  history: Workout[];
  progressPics: any[];
  profilePic: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string;
  email: string;
  country: string;
  state: string;
  coverPhoto: string;
  completedPrograms: Record<string, any>;
  customExercises: Exercise[];
  currentWorkout: Workout | null;
  isWorkoutSelect: boolean;
  currentExerciseIdx: number | null;
  tempBase64: string | null;
  tempTimestamp: number | null;
  currentProgram: { weeks: any[] };
  currentWeekIndex: number | null;
  currentDayIndex: number | null;
  currentDayExercises: Exercise[];
  currentHistoryIdx: number | null;
  currentProgName: string | null;
  currentCustomIdx: number | null;
  currentCustomName: string | null;
  currentCustomSubtype: string | null;
  activeModal: string | null;
  currentExercise: Exercise | null;
  returnModal: string | null;
  theme: 'dark' | 'light';
  intensityMetric: 'rpe' | 'rir';
}

interface DataContextType {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
  exerciseDatabase: typeof exerciseDatabase;
  simitPrograms: typeof simitPrograms;
}

const initialData: DataType = {
  templates: [],
  history: [],
  progressPics: [],
  profilePic: '',
  username: 'User',
  firstName: '',
  lastName: '',
  bio: '',
  email: '',
  country: 'United States',
  state: '',
  coverPhoto: '',
  completedPrograms: {},
  customExercises: [],
  currentWorkout: null,
  isWorkoutSelect: false,
  currentExerciseIdx: null,
  tempBase64: null,
  tempTimestamp: null,
  currentProgram: { weeks: [] },
  currentWeekIndex: null,
  currentDayIndex: null,
  currentDayExercises: [],
  currentHistoryIdx: null,
  currentProgName: null,
  currentCustomIdx: null,
  currentCustomName: null,
  currentCustomSubtype: null,
  activeModal: null,
  currentExercise: null,
  returnModal: null,
  theme: 'dark',
  intensityMetric: 'rpe',
};

export const DataContext = createContext<DataContextType>({
  data: initialData,
  setData: () => {},
  exerciseDatabase,
  simitPrograms,
});

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<DataType>(initialData);
  const [storageAvailable, setStorageAvailable] = useState(false);

  const checkLocalStorage = () => {
    try {
      const testKey = 'localStorageTest';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.error('localStorage is not available:', e);
      return false;
    }
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', data.theme);
  }, [data.theme]);

  useEffect(() => {
    const available = checkLocalStorage();
    setStorageAvailable(available);
    if (available) {
      const templates = JSON.parse(localStorage.getItem('templates') || '[]');
      const history = JSON.parse(localStorage.getItem('history') || '[]');
      const progressPics = JSON.parse(localStorage.getItem('progressPics') || '[]');
      const profilePic = localStorage.getItem('profilePic') || '';
      const username = localStorage.getItem('username') || 'User';
      const firstName = localStorage.getItem('firstName') || '';
      const lastName = localStorage.getItem('lastName') || '';
      const bio = localStorage.getItem('bio') || '';
      const email = localStorage.getItem('email') || '';
      const country = localStorage.getItem('country') || 'United States';
      const state = localStorage.getItem('state') || '';
      const coverPhoto = localStorage.getItem('coverPhoto') || '';
      const completedPrograms = JSON.parse(localStorage.getItem('completedPrograms') || '{}');
      const customExercises = JSON.parse(localStorage.getItem('customExercises') || '[]');
      const theme = (localStorage.getItem('theme') || 'dark') as 'dark' | 'light';
      const intensityMetric = (localStorage.getItem('intensityMetric') || 'rpe') as 'rpe' | 'rir';
      
      // Check for saved workout in sessionStorage
      const savedWorkout = sessionStorage.getItem('currentWorkout');
      const currentWorkout = savedWorkout ? JSON.parse(savedWorkout) : null;
      
      setData(prev => ({ 
        ...prev, 
        templates, 
        history, 
        progressPics, 
        profilePic, 
        username, 
        firstName, 
        lastName, 
        bio, 
        email, 
        country, 
        state, 
        coverPhoto, 
        completedPrograms, 
        customExercises,
        theme,
        intensityMetric,
        currentWorkout,
        // Reset these state variables on load unless there's a saved workout
        isWorkoutSelect: false,
        currentExerciseIdx: null,
        activeModal: currentWorkout ? 'workout-modal' : null,
        returnModal: null,
        currentDayExercises: []
      }));
    }
  }, []);

  // Save current workout to sessionStorage
  useEffect(() => {
    if (data.currentWorkout) {
      sessionStorage.setItem('currentWorkout', JSON.stringify(data.currentWorkout));
    } else {
      sessionStorage.removeItem('currentWorkout');
    }
  }, [data.currentWorkout]);

  useEffect(() => {
    if (storageAvailable) {
      localStorage.setItem('templates', JSON.stringify(data.templates));
      localStorage.setItem('history', JSON.stringify(data.history));
      localStorage.setItem('progressPics', JSON.stringify(data.progressPics));
      localStorage.setItem('profilePic', data.profilePic);
      localStorage.setItem('username', data.username);
      localStorage.setItem('firstName', data.firstName);
      localStorage.setItem('lastName', data.lastName);
      localStorage.setItem('bio', data.bio);
      localStorage.setItem('email', data.email);
      localStorage.setItem('country', data.country);
      localStorage.setItem('state', data.state);
      localStorage.setItem('coverPhoto', data.coverPhoto);
      localStorage.setItem('completedPrograms', JSON.stringify(data.completedPrograms));
      localStorage.setItem('customExercises', JSON.stringify(data.customExercises));
      localStorage.setItem('theme', data.theme);
      localStorage.setItem('intensityMetric', data.intensityMetric);
    }
  }, [data, storageAvailable]);

  return (
    <DataContext.Provider value={{ data, setData, exerciseDatabase, simitPrograms }}>
      {children}
    </DataContext.Provider>
  );
};