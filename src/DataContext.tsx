// Fully integrated DataContext with Supabase Storage
import { useAuth0 } from '@auth0/auth0-react';
import { DatabaseService } from './services/database';
import { setSupabaseAuth0Id } from './lib/supabase';
import { createContext, useState, useEffect } from 'react';
import { exerciseDatabase } from './data/ExerciseDatabase';
import { simitPrograms } from './data/SimitPrograms';
import { supabase } from './lib/supabase';

export interface Set {
  weight: string;
  reps: string;
  rpe: string;
  rir?: string;
  completed: boolean;
  type?: 'W' | 'D' | 'S';
}

export interface Exercise {
  id?: string;
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
  programName?: string;
}

export interface ProgressPhoto {
  id?: string;
  base64: string; // This will now be a URL or base64
  timestamp: number;
  weight?: string;
  caption?: string;
  pump?: number;
  likes?: number;
  visibility?: 'private' | 'public';
  comments?: { user: string; text: string; timestamp: number }[];
}

export interface Template {
  id?: string;
  name: string;
  mesocycleLength: number;
  weeks: any[];
  lastUsed?: number;
}

export interface Friend {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePic?: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: string;
  sender: Friend;
}

export interface FeedItem extends ProgressPhoto {
  user: Friend;
}

export interface DataType {
  profilePic: string;
  coverPhoto: string;
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  email: string;
  country: string;
  state: string;
  history: Workout[];
  progressPics: ProgressPhoto[];
  customExercises: Exercise[];
  templates: Template[];
  completedPrograms: Record<string, any>;
  currentWorkout: any;
  currentProgram: any;
  currentWeekIndex: number | null;
  currentDayIndex: number | null;
  currentDayExercises: Exercise[];
  currentExercise: Exercise | null;
  currentExerciseIdx: number | null;
  currentHistoryIdx: number | null;
  currentProgName: string | null;
  currentCustomName: string | null;
  currentCustomSubtype: string | null;
  currentCustomIdx: number | null;
  isEditingProgram: boolean;
  activeModal: string | null;
  activeTab: string;
  isWorkoutSelect: boolean;
  returnModal: string | null;
  tempBase64: string | null;
  tempTimestamp: number | null;
  tempIsPublic: boolean;  // Add this line
  intensityMetric: 'rpe' | 'rir';
  theme: 'dark' | 'light';
  weightUnit: 'kg' | 'lbs';
  distanceUnit: 'km' | 'miles';
  previousModal?: string;
  isEditingCustomExercise: boolean;
  editingCustomExerciseData: Exercise | null;
  editingPhotoData: ProgressPhoto | null;
  friends: Friend[];
  friendRequests: FriendRequest[];
  friendsFeed: FeedItem[];
  showFriendsModal: boolean;
  showFindFriendsModal: boolean;
   showComments: boolean;
  selectedPhoto: any;
}
interface DataContextType {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
  exerciseDatabase: typeof exerciseDatabase;
  simitPrograms: typeof simitPrograms;
  isLoading?: boolean;
  dbUser?: any;
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
  tempIsPublic: false,  // Add this line
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
  activeTab: 'start-workout-tab',
  weightUnit: 'lbs',
  distanceUnit: 'miles',
  isEditingProgram: false,
  isEditingCustomExercise: false,
  editingCustomExerciseData: null,
  editingPhotoData: null,
  friends: [],
  friendRequests: [],
  friendsFeed: [],
  showFriendsModal: false,
  showFindFriendsModal: false,
  showComments: false,
  selectedPhoto: null,
};
export const DataContext = createContext<DataContextType>({
  data: initialData,
  setData: () => {},
  exerciseDatabase,
  simitPrograms,
});

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<DataType>(initialData);
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [dbUser, setDbUser] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

const syncUserData = async () => {
  if (!user?.sub || !user?.email) return;
 
  setIsSyncing(true);
  try {
    // Get Auth0 access token and set Supabase session
    try {
      const token = await getAccessTokenSilently();
await setSupabaseAuth0Id(user.sub, token);
      console.log('Set Supabase session with Auth0 token');
    } catch (error) {
      console.error('Error getting Auth0 token:', error);
      await setSupabaseAuth0Id(user.sub);
    }
    
    console.log('Setting Auth0 ID for RLS:', user.sub);
   
    // Check if Supabase session exists
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current Supabase session after setSupabaseAuth0Id:', session);      
    
    // Sync user profile
    const userProfile = await DatabaseService.syncUserProfile(user.sub, user.email);
    setDbUser(userProfile);
   
    // Load user data from Supabase
    const [history, customExercises, progressPhotos, templates, friends, friendRequests] = await Promise.all([
      DatabaseService.getWorkoutHistory(userProfile.id),
      DatabaseService.getCustomExercises(userProfile.id),
      DatabaseService.getProgressPhotos(userProfile.id),
      DatabaseService.getProgramTemplates(userProfile.id),
      DatabaseService.getFriends(userProfile.id),
      DatabaseService.getPendingFriendRequests(userProfile.id)
    ]);
    
    // Load friends feed separately
    const friendsFeed = await DatabaseService.getFriendsFeed(userProfile.id);

      // Add this to load current workout
      const currentWorkout = userProfile.current_workout || null;

      setData(prev => ({
        ...prev,
        username: userProfile.username || prev.username,
        firstName: userProfile.first_name || prev.firstName,
        lastName: userProfile.last_name || prev.lastName,
        bio: userProfile.bio || prev.bio,
        email: userProfile.email || prev.email,
        country: userProfile.country || prev.country,
        state: userProfile.state || prev.state,
        profilePic: userProfile.profile_pic || prev.profilePic,
        coverPhoto: userProfile.cover_photo || prev.coverPhoto,
        theme: userProfile.theme || prev.theme,
        intensityMetric: userProfile.intensity_metric || prev.intensityMetric,
        weightUnit: userProfile.weight_unit || prev.weightUnit,
        distanceUnit: userProfile.distance_unit || prev.distanceUnit,
        history,
        customExercises,
        progressPics: progressPhotos,
        templates,
        currentWorkout,
        friends,
        friendRequests,
        friendsFeed,
      }));
    } catch (error) {
      console.error('Error syncing user data:', error);
    } finally {
      setIsSyncing(false);
      setIsDataLoading(false);
    }
  };

  // Override setData to sync with Supabase
  const enhancedSetData = (updater: any) => {
    setData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      
      // Sync specific changes to Supabase
      if (dbUser && !isSyncing && user?.sub) {
        // Profile updates
        if (newData.username !== prev.username || 
            newData.firstName !== prev.firstName ||
            newData.lastName !== prev.lastName ||
            newData.bio !== prev.bio ||
            newData.country !== prev.country ||
            newData.state !== prev.state ||
            newData.profilePic !== prev.profilePic ||
            newData.coverPhoto !== prev.coverPhoto ||
            newData.theme !== prev.theme ||
            newData.intensityMetric !== prev.intensityMetric ||
            newData.weightUnit !== prev.weightUnit ||
            newData.distanceUnit !== prev.distanceUnit ||
            JSON.stringify(newData.currentWorkout) !== JSON.stringify(prev.currentWorkout)) {
          DatabaseService.updateUserProfile(user.sub, newData).catch(console.error);
        }
        
        // Workout completion
        if (newData.history.length > prev.history.length) {
          const newWorkout = newData.history[newData.history.length - 1];
          DatabaseService.saveWorkout(dbUser.id, newWorkout).catch(console.error);
        }

        // Workout deletion
        if (newData.history.length < prev.history.length) {
          // Find which workout was deleted
          const deletedIndex = prev.history.findIndex((workout, index) => 
            !newData.history[index] || newData.history[index].startTime !== workout.startTime
          );
          
          if (deletedIndex !== -1) {
            const deletedWorkout = prev.history[deletedIndex];
            
            // Create an async function to handle the deletion
            const deleteWorkoutFromSupabase = async () => {
              try {
                const { data: workoutToDelete, error } = await supabase
                  .from('workouts')
                  .select('id')
                  .eq('user_id', dbUser.id)
                  .eq('start_time', deletedWorkout.startTime)
                  .eq('name', deletedWorkout.name)
                  .single();
                
                if (!error && workoutToDelete) {
                  const { error: deleteError } = await supabase
                    .from('workouts')
                    .delete()
                    .eq('id', workoutToDelete.id);
                  
                  if (deleteError) {
                    console.error('Error deleting workout:', deleteError);
                  }
                }
              } catch (error) {
                console.error('Error in workout deletion:', error);
              }
            };
            
            // Call the async function
            deleteWorkoutFromSupabase();
          }
        }

        // Progress photo addition
        if (newData.progressPics.length > prev.progressPics.length) {
          const newPhoto = newData.progressPics[newData.progressPics.length - 1];
          DatabaseService.saveProgressPhoto(dbUser.id, newPhoto)
            .then(savedPhoto => {
              // Update with the saved photo data (includes ID and URL)
              setData(current => ({
                ...current,
                progressPics: current.progressPics.map((p, idx) => 
                  idx === current.progressPics.length - 1 ? 
                  { ...p, id: savedPhoto.id, base64: savedPhoto.photo_url } : p
                )
              }));
            })
            .catch(console.error);
        }
        
        // Progress photo deletion
        if (newData.progressPics.length < prev.progressPics.length) {
          // Find the deleted photo
          const deletedPhoto = prev.progressPics.find(p => 
            !newData.progressPics.some((np: ProgressPhoto) => np.id === p.id)
          );
          if (deletedPhoto?.id && deletedPhoto.base64) {
            DatabaseService.deleteProgressPhoto(dbUser.id, deletedPhoto.id, deletedPhoto.base64)
              .catch(console.error);
          }
        }
        
        // Progress photo update (visibility change)
// Progress photo update (comments change)
const photoWithUpdatedComments = newData.progressPics.find((p: ProgressPhoto, idx: number) => {
  if (!p.id || !prev.progressPics[idx]) return false;
  const prevComments = prev.progressPics[idx].comments || [];
  const newComments = p.comments || [];
  // Check if comments array length changed or content changed
  return prevComments.length !== newComments.length || 
    JSON.stringify(prevComments) !== JSON.stringify(newComments);
});

if (photoWithUpdatedComments && photoWithUpdatedComments.id) {
  // Update the entire photo object with new comments
  DatabaseService.updateProgressPhoto(dbUser.id, photoWithUpdatedComments.id, {
    comments: photoWithUpdatedComments.comments || []
  }).catch(console.error);
}        
        // Custom exercise addition
        if (newData.customExercises.length > prev.customExercises.length) {
          const newExercise = newData.customExercises[newData.customExercises.length - 1];
          DatabaseService.saveCustomExercise(dbUser.id, newExercise)
            .then(savedExercise => {
              // Update with the saved exercise data (includes ID)
              setData(current => ({
                ...current,
                customExercises: current.customExercises.map((e, idx) => 
                  idx === current.customExercises.length - 1 ? 
                  { ...e, id: savedExercise.id } : e
                )
              }));
            })
            .catch(console.error);
        }
        
        // Custom exercise deletion
        if (newData.customExercises.length < prev.customExercises.length) {
          const deletedExercise = prev.customExercises.find(e => 
            !newData.customExercises.some((ne: Exercise) => ne.id === e.id)
          );
          if (deletedExercise?.id) {
            DatabaseService.deleteCustomExercise(dbUser.id, deletedExercise.id)
              .catch(console.error);
          }
        }
        
        // Program template addition
        if (newData.templates.length > prev.templates.length) {
          const newTemplate = newData.templates[newData.templates.length - 1];
          DatabaseService.saveProgramTemplate(dbUser.id, newTemplate)
            .then(savedTemplate => {
              // Update with the saved template data (includes ID)
              setData(current => ({
                ...current,
                templates: current.templates.map((t, idx) => 
                  idx === current.templates.length - 1 ? 
                  { ...t, id: savedTemplate.id } : t
                )
              }));
            })
            .catch(console.error);
        }
        
        // Program template update
        const updatedTemplate = newData.templates.find((t: Template, idx: number) => 
          t.id && prev.templates[idx] && JSON.stringify(t) !== JSON.stringify(prev.templates[idx])
        );
        if (updatedTemplate) {
          DatabaseService.updateProgramTemplate(dbUser.id, updatedTemplate.id, updatedTemplate)
            .catch(console.error);
        }
        
        // Program template deletion
        if (newData.templates.length < prev.templates.length) {
          const deletedTemplate = prev.templates.find(t => 
            !newData.templates.some((nt: Template) => nt.id === t.id)
          );
          if (deletedTemplate?.id) {
            DatabaseService.deleteProgramTemplate(dbUser.id, deletedTemplate.id)
              .catch(console.error);
          }
        }
      }
      
      return newData;
    });
  };

  // Sync with Auth0 and Supabase
  useEffect(() => {
    if (isAuthenticated && user) {
      syncUserData();
    } else if (!isLoading && !isAuthenticated) {
      setIsDataLoading(false);
    }
  }, [isAuthenticated, user, isLoading]);
  
  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', data.theme);
  }, [data.theme]);
  
  // Save current workout to sessionStorage (keep this for active workout persistence)
  useEffect(() => {
    if (data.currentWorkout) {
      sessionStorage.setItem('currentWorkout', JSON.stringify(data.currentWorkout));
    } else {
      sessionStorage.removeItem('currentWorkout');
    }
  }, [data.currentWorkout]);

  // Restore current workout from sessionStorage on mount
  useEffect(() => {
    const savedWorkout = sessionStorage.getItem('currentWorkout');
    if (savedWorkout) {
      try {
        const workout = JSON.parse(savedWorkout);
        setData(prev => ({ ...prev, currentWorkout: workout }));
      } catch (error) {
        console.error('Error restoring workout:', error);
        sessionStorage.removeItem('currentWorkout');
      }
    }
  }, []);

  // Refresh friends feed periodically
  useEffect(() => {
    if (dbUser && isAuthenticated) {
      const refreshFeed = async () => {
        try {
          const friendsFeed = await DatabaseService.getFriendsFeed(dbUser.id);
          console.log('Friends feed data:', friendsFeed);
          setData(prev => ({ ...prev, friendsFeed }));
        } catch (error) {
          console.error('Error refreshing friends feed:', error);
        }
      };

      // Refresh on mount and every 30 seconds
      refreshFeed();
      const interval = setInterval(refreshFeed, 30000);

      return () => clearInterval(interval);
    }
  }, [dbUser, isAuthenticated]);

  return (
    <DataContext.Provider value={{ 
      data, 
      setData: enhancedSetData,      
      exerciseDatabase, 
      simitPrograms,
      isLoading: isLoading || isSyncing || isDataLoading,
      dbUser
    }}>
      {children}
    </DataContext.Provider>
  );
};

export type { DataContextType };