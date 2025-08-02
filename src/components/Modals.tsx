import React, { useContext, useState, useEffect, useMemo, useRef } from 'react';
import { DataContext, DataType, Exercise, Template, ProgressPhoto, Set } from '../DataContext';
import WorkoutModal from './WorkoutModal';
import { useAuth0 } from '@auth0/auth0-react';
import { DatabaseService } from '../services/database';
import CommentsModal from './CommentsModal';
interface Day {
  name: string;
  exercises: Exercise[];
}

interface Week {
  days: Day[];
}

interface SimitProgram {
  name: string;
  mesocycleLength: number;
  weeks: {
    days: {
      name: string;
      exercises: {
        name: string;
        numSets: number;
      }[];
    }[];
  }[];
}



interface ExerciseFromDatabase {
  name: string;
  subtype?: string;
  muscles: string;
  instructions?: string;
  equipment?: string;
}

const Modals = () => {
  const { data, setData, exerciseDatabase, simitPrograms, dbUser } = useContext(DataContext); const { logout } = useAuth0();
  const activeModal = data.activeModal;
  const [exerciseSelectMode, setExerciseSelectMode] = useState<'workout' | 'program' | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const [minimizedDragY, setMinimizedDragY] = useState(0);
  const [isDraggingMinimized, setIsDraggingMinimized] = useState(false);
  const minimizedStartY = useRef(0);
  const isPWAStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches;
  };


  const muscleGroups = [
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Quads',
    'Hamstrings',
    'Glutes',
    'Calves',
    'Abdominals',
    'Core',
    'Obliques',
    'Forearms',
    'Traps',
    'Lower Back',
    'Full Body',
    'Neck',
    'Other'
  ];

  const openModal = (id: string) => setData((prev: DataType) => ({ ...prev, activeModal: id }));
  const closeModal = () => setData((prev: DataType) => ({ ...prev, activeModal: null, isEditingProgram: false }));

  const goBack = () => {
    if (activeModal === 'day-modal') {
      openModal('week-modal');
    } else if (activeModal === 'week-modal') {
      // Check if we're editing - if so, go back to program modal
      if (data.isEditingProgram) {
        openModal('program-modal');
      } else {
        // If viewing, go back to program weeks
        openModal('program-weeks-modal');
      }
    } else if (activeModal === 'program-modal') {
      openModal('start-workout-tab');
    } else {
      closeModal();
    }
  };

  const isSimitProgram = useMemo(
    () => simitPrograms.some((p: SimitProgram) => p.name === (data.currentProgram as any)?.name),
    [data.currentProgram, simitPrograms]
  );

  const generateWeeks = () => {
    const input = document.getElementById('mesocycle-length') as HTMLInputElement | null;
    if (input) {
      const length = parseInt(input.value);
      if (!isNaN(length) && length > 0) {
        setData((prev: DataType) => ({
          ...prev,
          currentProgram: {
            ...prev.currentProgram,
            weeks: Array.from({ length }, () => ({ days: [] } as Week)),
          },
        }));
      }
    }
  };

  const addWeek = () => {
    setData((prev: DataType) => ({
      ...prev,
      currentProgram: {
        ...prev.currentProgram,
        weeks: [...prev.currentProgram.weeks, { days: [] } as Week],
      },
    }));
  };

  const saveProgram = () => {
    const input = document.getElementById('program-name') as HTMLInputElement | null;
    if (input) {
      const name = input.value;
      const weeksLength = data.currentProgram.weeks.length;
      if (!name || weeksLength === 0) return;

      // Deep copy the weeks to avoid reference issues
      const weeksCopy = data.currentProgram.weeks.map((week: any) => ({
        days: week.days.map((day: any) => ({
          ...day,
          exercises: day.exercises.map((ex: any) => ({ ...ex }))
        }))
      }));

      const programData: Template = {
        name,
        mesocycleLength: weeksLength,
        weeks: weeksCopy,
        lastUsed: Date.now(),
      };
      const existingIndex = data.templates.findIndex((t: Template) => t.name === name);
      const newTemplates = [...data.templates];
      if (existingIndex > -1) {
        newTemplates[existingIndex] = programData;
      } else {
        newTemplates.push(programData);
      }
      setData((prev: DataType) => ({
        ...prev,
        templates: newTemplates,
        isEditingProgram: false
      }));
      closeModal();
    }
  };

  const addDayToWeek = () => {
    if (data.currentWeekIndex === null) return;
    setData((prev: DataType) => {
      const newDays = [
        ...prev.currentProgram.weeks[data.currentWeekIndex!].days,
        { name: '', exercises: [] } as Day,
      ];
      const newWeeks = [...prev.currentProgram.weeks];
      newWeeks[data.currentWeekIndex!] = { days: newDays };
      return {
        ...prev,
        currentProgram: { ...prev.currentProgram, weeks: newWeeks },
        currentDayIndex: newDays.length - 1,
      };
    });
  };

  const saveWeek = () => {
    openModal('program-modal');
  };

  const addExerciseToDay = () => {
    setExerciseSelectMode('program');
    openModal('exercise-select-modal');
  };

  const saveDayToWeek = () => {
    const input = document.getElementById('day-name') as HTMLInputElement | null;
    if (input && data.currentWeekIndex !== null && data.currentDayIndex !== null) {
      const name = input.value;
      if (name) {
        const newDays = [...data.currentProgram.weeks[data.currentWeekIndex].days];
        newDays[data.currentDayIndex] = {
          name,
          exercises: data.currentDayExercises,
        };
        const newWeeks = [...data.currentProgram.weeks];
        newWeeks[data.currentWeekIndex] = { days: newDays };
        setData((prev: DataType) => ({
          ...prev,
          currentProgram: { ...prev.currentProgram, weeks: newWeeks },
          currentDayExercises: [],
        }));
        openModal('week-modal');
      }
    }
  };
  const startWorkoutFromDay = () => {
    if (data.currentWeekIndex !== null && data.currentDayIndex !== null) {
      const day = data.currentProgram.weeks[data.currentWeekIndex].days[data.currentDayIndex];
      if (day && day.exercises.length > 0) {
        const preFilledExercises: Exercise[] = day.exercises.map((ex: any) => ({
          ...ex,
          muscles: ex.muscles || '',
          sets: Array.from({ length: ex.numSets || 3 }, () => ({
            weight: '',
            reps: '',
            rpe: '',
            completed: false,
          })),
        }));
        const newWorkout = {
          name: day.name || 'Program Day Workout',
          exercises: preFilledExercises,
          startTime: Date.now(),
          duration: 0,
          programName: (data.currentProgram as any).name || ''
        };
        setData((prev: DataType) => ({
          ...prev,
          currentWorkout: newWorkout,
          activeModal: 'workout-modal',
        }));
      }
    }
  };

  const [selectSearchQuery, setSelectSearchQuery] = useState('');

  // Clear search query when modal changes
  useEffect(() => {
    if (activeModal !== 'exercise-select-modal') {
      setSelectSearchQuery('');
      setExerciseSelectMode(null);
    }
  }, [activeModal]);

  // This is called from WorkoutModal when Add Exercise is clicked
  useEffect(() => {
    if (data.isWorkoutSelect && activeModal === 'exercise-select-modal') {
      setExerciseSelectMode('workout');
    }
  }, [data.isWorkoutSelect, activeModal]);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    const listElement = document.getElementById('exercise-list-select');
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
      return () => {
        listElement.removeEventListener('scroll', handleScroll);
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
      };
    }
  }, [activeModal]);

  const selectExercise = (ex: Exercise | ExerciseFromDatabase) => {
    // Prevent selection while scrolling
    if (isScrolling) return;

    // Prevent double-tap issues on mobile
    if (!ex) return;

    // Convert ExerciseFromDatabase to Exercise if needed
    const exercise: Exercise = 'sets' in ex ? ex : {
      ...ex,
      sets: []
    };

    // Clear search
    setSelectSearchQuery('');

    // Create the new exercise with sets
    // Get previous sets for this exercise to carry over set types
    const getPreviousSetTypes = () => {
      // Look for the most recent workout with this exercise
      for (let i = data.history.length - 1; i >= 0; i--) {
        const workout = data.history[i];
        const matchingEx = workout.exercises.find((e: Exercise) =>
          e.name === exercise.name && (e.subtype || '') === (exercise.subtype || '')
        );
        if (matchingEx && matchingEx.sets) {
          return matchingEx.sets.map((s: Set) => s.type);
        }
      }
      return [];
    };

    const previousSetTypes = getPreviousSetTypes();

    // Create the new exercise with sets, carrying over set types
    const newExercise = {
      ...exercise,
      sets: Array.from({ length: 3 }, (_, index) => ({
        weight: '',
        reps: '',
        rpe: '',
        completed: false,
        type: previousSetTypes[index] || undefined,
      })),
    };

    if (exerciseSelectMode === 'workout') {
      // Adding to workout
      if (!data.currentWorkout) {
        console.error('No current workout found');
        return;
      }

      setData((prev: DataType) => ({
        ...prev,
        currentWorkout: {
          ...prev.currentWorkout!,
          exercises: [...prev.currentWorkout!.exercises, newExercise]
        },
        activeModal: 'workout-modal',
        isWorkoutSelect: false
      }));
      setExerciseSelectMode(null);
    } else if (exerciseSelectMode === 'program') {
      // Adding to program day
      setData((prev: DataType) => ({
        ...prev,
        currentDayExercises: [...prev.currentDayExercises, newExercise],
        activeModal: 'day-modal'
      }));
      setExerciseSelectMode(null);
    }
  };

  const renderExerciseSelectList = useMemo(() => {
    const query = selectSearchQuery.toLowerCase().trim();
    const combinedDatabase: (Exercise | ExerciseFromDatabase)[] = [...exerciseDatabase as ExerciseFromDatabase[], ...data.customExercises];

    let filtered = combinedDatabase;

    if (query) {
      filtered = combinedDatabase.filter(ex => {
        const name = ex.name.toLowerCase();
        const subtype = (ex.subtype || '').toLowerCase();

        // Check if query appears anywhere in name or subtype
        return name.includes(query) || subtype.includes(query);
      });
    }

    // Group by primary muscle group
    const muscleGroups: Record<string, (Exercise | ExerciseFromDatabase)[]> = {};

    filtered.forEach((ex: Exercise | ExerciseFromDatabase) => {
      // Get the primary muscle group (first muscle listed)
      let primaryMuscle = ex.muscles.split(',')[0].trim();

      // Normalize muscle groups
      if (primaryMuscle.toLowerCase().includes('chest')) {
        primaryMuscle = 'Chest';
      } else if (primaryMuscle.toLowerCase().includes('shoulder') || primaryMuscle.toLowerCase().includes('delt')) {
        primaryMuscle = 'Shoulders';
      } else if (primaryMuscle.toLowerCase().includes('back') || primaryMuscle === 'Lats' || primaryMuscle === 'Traps') {
        primaryMuscle = 'Back';
      } else if (primaryMuscle === 'Biceps' || primaryMuscle === 'Triceps' || primaryMuscle === 'Forearms') {
        primaryMuscle = 'Arms';
      } else if (primaryMuscle.toLowerCase().includes('quad') || primaryMuscle.toLowerCase().includes('hamstring') ||
        primaryMuscle.toLowerCase().includes('glute') || primaryMuscle.toLowerCase().includes('calf') ||
        primaryMuscle === 'Calves') {
        primaryMuscle = 'Legs';
      } else if (primaryMuscle.toLowerCase().includes('abs') || primaryMuscle.toLowerCase().includes('oblique') ||
        primaryMuscle.toLowerCase().includes('core')) {
        primaryMuscle = 'Core';
      }

      if (!muscleGroups[primaryMuscle]) {
        muscleGroups[primaryMuscle] = [];
      }
      muscleGroups[primaryMuscle].push(ex);
    });

    // Sort muscle groups with most common ones first
    const muscleGroupOrder = [
      'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body'
    ];

    const sortedMuscleGroups = Object.keys(muscleGroups).sort((a, b) => {
      const indexA = muscleGroupOrder.findIndex(m => a === m);
      const indexB = muscleGroupOrder.findIndex(m => b === m);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    if (filtered.length === 0 && query) {
      return [<div key="no-results" className="feed-placeholder" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No exercises found containing "{query}"</div>];
    }

    const list: React.ReactNode[] = [];

    sortedMuscleGroups.forEach((muscleGroup) => {
      // Add muscle group header
      list.push(
        <div key={`muscle-${muscleGroup}`} className="muscle-group-header" style={{
          fontSize: '1.2em',
          fontWeight: '600',
          color: 'var(--accent-primary)',
          marginTop: list.length > 0 ? '20px' : '0',
          marginBottom: '10px',
          padding: '10px 16px',
          background: 'linear-gradient(to right, var(--bg-dark), var(--bg-light))',
          borderRadius: '8px',
        }}>
          {muscleGroup}
        </div>
      );

      // Sort exercises alphabetically within muscle group
      const exercises = muscleGroups[muscleGroup].sort((a, b) => a.name.localeCompare(b.name));

      exercises.forEach((ex: Exercise | ExerciseFromDatabase) => {
        list.push(
          <div
            key={`${ex.name}-${ex.subtype || ''}-${Math.random()}`}
            className="exercise-item"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isScrolling) {
                selectExercise(ex);
              }
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              if (!isScrolling) {
                setTimeout(() => selectExercise(ex), 50);
              }
            }}
            style={{
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              background: 'var(--bg-dark)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '8px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              transition: 'all 0.2s ease',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            <div className="exercise-name" style={{
              pointerEvents: 'none',
              fontWeight: '600',
              fontSize: '1.1em',
              marginBottom: '4px'
            }}>{ex.name}</div>
            {ex.subtype && <div className="exercise-subtype" style={{
              pointerEvents: 'none',
              color: 'var(--accent-blue)',
              fontSize: '0.9em',
              marginBottom: '4px'
            }}>{ex.subtype}</div>}
            <div className="exercise-muscles" style={{
              pointerEvents: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.85em'
            }}>{ex.muscles}</div>
          </div>
        );
      });
    });

    return list;
  }, [selectSearchQuery, exerciseDatabase, data.customExercises, exerciseSelectMode, data.currentWorkout, isScrolling]);

  const renderProgramWeeks = useMemo(() => {
    return data.currentProgram.weeks.map((_: Week, index: number) => (
      <div
        key={index}
        className="program-day-card"
        onClick={() =>
          setData((prev: DataType) => ({
            ...prev,
            currentWeekIndex: index,
            activeModal: 'week-modal',
            isEditingProgram: prev.isEditingProgram || false,
          }))
        } style={{
          background: 'linear-gradient(135deg, var(--bg-light), var(--bg-lighter))',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '12px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
      >
        <div style={{ fontSize: '1.2em', fontWeight: '600', marginBottom: '8px' }}>
          Week {index + 1}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>
          Days: {data.currentProgram.weeks[index].days.length}
        </div>
      </div>
    ));
  }, [data.currentProgram.weeks]);

  const renderWeekDays = useMemo(() => {
    if (data.currentWeekIndex === null) return null;
    const week = data.currentProgram.weeks[data.currentWeekIndex];
    if (!week) return null;

    const programName = (data.currentProgram as any).name || '';

    return week.days.map((day: Day, index: number) => {
      // Check if this day is completed
      const isCompleted = programName && data.completedPrograms[programName]?.[`${data.currentWeekIndex}-${index}`];

      return (
        <div
          key={index}
          className={`program-day-card ${isCompleted ? 'completed' : ''}`}
          onClick={() => {
            if (data.isEditingProgram && !isSimitProgram) {
              // In edit mode for custom programs, open day modal for editing
              setData((prev: DataType) => ({
                ...prev,
                currentDayIndex: index,
                currentDayExercises: day.exercises || [],
                activeModal: 'day-modal',
              }));
            } else {
              // In view mode (or for Simit programs), start the workout directly
              const currentDay = day || (data.currentProgram as any).weeks[data.currentWeekIndex!].days[index];
              const preFilledExercises: Exercise[] = currentDay.exercises.map((ex: any) => {
                const fullExercise = exerciseDatabase.find((dbEx: any) =>
                  dbEx.name === ex.name && dbEx.subtype === ex.subtype
                ) || data.customExercises.find((customEx: any) =>
                  customEx.name === ex.name && customEx.subtype === ex.subtype
                ) || { muscles: '', instructions: '', equipment: '' };

                return {
                  name: ex.name,
                  subtype: ex.subtype,
                  muscles: fullExercise.muscles || ex.muscles || '',
                  instructions: fullExercise.instructions || ex.instructions || '',
                  equipment: fullExercise.equipment || ex.equipment || '',
                  sets: Array.from({ length: ex.numSets || 3 }, () => ({
                    weight: '',
                    reps: '',
                    rpe: '',
                    completed: false,
                  })),
                };
              });
              const newWorkout = {
                name: currentDay.name,
                exercises: preFilledExercises,
                startTime: Date.now(),
                duration: 0,
                programName: (data.currentProgram as any).name || ''
              };
              setData((prev: DataType) => ({
                ...prev,
                currentWorkout: newWorkout,
                activeModal: 'workout-modal',
              }));
            }
          }}
          style={{
            background: isCompleted
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : 'linear-gradient(135deg, var(--bg-light), var(--bg-lighter))',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            color: isCompleted ? 'white' : 'var(--text)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
        >
          <div style={{ fontSize: '1.1em', fontWeight: '600', marginBottom: '8px' }}>
            {day.name || (data.currentProgram as any).weeks?.[data.currentWeekIndex!]?.days?.[index]?.name}
          </div>
          <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
            Exercises: {day.exercises?.length || (data.currentProgram as any).weeks?.[data.currentWeekIndex!]?.days?.[index]?.exercises?.length || 0}
          </div>
        </div>
      );
    });
  }, [data.currentWeekIndex, data.currentProgram.weeks, data.completedPrograms, isSimitProgram]);

  const renderDayExercises = useMemo(() => {
    return data.currentDayExercises.map((ex: Exercise, index: number) => (
      <div key={index} className="exercise-item">
        {ex.name} {ex.subtype ? `(${ex.subtype})` : ''}
        <div className="exercise-muscles">{ex.muscles}</div>
      </div>
    ));
  }, [data.currentDayExercises]);

  // Handle day name input value
  useEffect(() => {
    if (activeModal === 'day-modal' && data.currentWeekIndex !== null && data.currentDayIndex !== null) {
      const dayNameInput = document.getElementById('day-name') as HTMLInputElement | null;
      if (dayNameInput) {
        const currentDay = data.currentProgram.weeks[data.currentWeekIndex].days[data.currentDayIndex];
        dayNameInput.value = currentDay?.name || '';
      }
    }
  }, [activeModal, data.currentWeekIndex, data.currentDayIndex, data.currentProgram.weeks]);

  // Handle program weeks modal for Simit programs
  const renderSimitProgramWeeks = useMemo(() => {
    if (!data.currentProgram || !isSimitProgram) return null;
    const program = data.currentProgram as any;
    return program.weeks?.map((_: any, index: number) => (
      <div
        key={index}
        className="program-day-card"
        onClick={() =>
          setData((prev: DataType) => ({
            ...prev,
            currentWeekIndex: index,
            activeModal: 'week-modal',
            isEditingProgram: false,  // Simit programs are never editable
          }))
        } style={{
          background: 'linear-gradient(135deg, var(--bg-light), var(--bg-lighter))',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '12px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
      >
        <div style={{ fontSize: '1.2em', fontWeight: '600', marginBottom: '8px' }}>
          Week {index + 1}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>
          Days: {program.weeks[index].days.length}
        </div>
      </div>
    ));
  }, [data.currentProgram, isSimitProgram]);

  // Exercise menu modal handlers
  const deleteExercise = () => {
    if (data.currentExerciseIdx !== null && data.currentWorkout) {
      const newExercises = [...data.currentWorkout.exercises];
      newExercises.splice(data.currentExerciseIdx, 1);
      setData((prev: DataType) => ({
        ...prev,
        currentWorkout: {
          ...prev.currentWorkout!,
          exercises: newExercises,
        },
        activeModal: 'workout-modal',
      }));
    }
  };

  const deleteLastSet = () => {
    if (data.currentExerciseIdx !== null && data.currentWorkout) {
      const newExercises = [...data.currentWorkout.exercises];
      if (newExercises[data.currentExerciseIdx].sets.length > 1) {
        newExercises[data.currentExerciseIdx].sets.pop();
        setData((prev: DataType) => ({
          ...prev,
          currentWorkout: {
            ...prev.currentWorkout!,
            exercises: newExercises,
          },
          activeModal: 'workout-modal',
        }));
      }
    }
  };

  // History menu modal handlers
  const startWorkoutFromHistory = () => {
    if (data.currentHistoryIdx !== null) {
      const historyWorkout = data.history[data.currentHistoryIdx];
      const newWorkout = {
        ...historyWorkout,
        startTime: Date.now(),
        duration: 0,
        exercises: historyWorkout.exercises.map((ex: Exercise) => ({
          ...ex,
          sets: ex.sets?.map(s => ({ ...s, completed: false })) || []
        }))
      };
      setData((prev: DataType) => ({
        ...prev,
        currentWorkout: newWorkout,
        activeModal: 'workout-modal',
      }));
    }
  };

  const deleteHistoryEntry = async () => {
    if (data.currentHistoryIdx !== null && window.confirm("Are you sure you want to delete this workout?")) {
      const newHistory = [...data.history];
      newHistory.splice(data.currentHistoryIdx, 1);
      setData((prev: DataType) => ({
        ...prev,
        history: newHistory,
        activeModal: null,
      }));
    }
  };
  // Edit profile handlers
  const saveProfile = () => {
    const firstName = (document.getElementById('edit-first-name') as HTMLInputElement)?.value || '';
    const lastName = (document.getElementById('edit-last-name') as HTMLInputElement)?.value || '';
    const username = (document.getElementById('edit-username') as HTMLInputElement)?.value || 'User';
    const bio = (document.getElementById('edit-bio') as HTMLTextAreaElement)?.value || '';
    const email = (document.getElementById('edit-email') as HTMLInputElement)?.value || '';
    const country = (document.getElementById('edit-country') as HTMLSelectElement)?.value || 'United States';
    const state = (document.getElementById('edit-state') as HTMLInputElement)?.value || '';

    setData((prev: DataType) => ({
      ...prev,
      firstName,
      lastName,
      username,
      bio,
      email,
      country,
      state,
      activeModal: null,
    }));
  };

  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB for cover photos)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image is too large. Please choose an image under 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setData((prev: DataType) => ({
          ...prev,
          coverPhoto: base64,
          activeModal: 'edit-profile-modal' // Keep modal open
        }));
      };
      reader.onerror = () => {
        alert('Failed to read image. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };
  // Custom exercise handlers
  const saveCustomExercise = () => {
    const name = (document.getElementById('custom-exercise-name') as HTMLInputElement)?.value;
    const subtype = (document.getElementById('custom-exercise-subtype') as HTMLInputElement)?.value;
    const muscles = (document.getElementById('custom-exercise-muscles') as HTMLSelectElement)?.value;
    const customMuscle = (document.getElementById('custom-muscle-input') as HTMLInputElement)?.value;
    const instructions = (document.getElementById('custom-exercise-instructions') as HTMLTextAreaElement)?.value;
    const equipment = (document.getElementById('custom-exercise-equipment') as HTMLInputElement)?.value;

    const finalMuscles = muscles === 'Other' && customMuscle ? customMuscle : muscles;

    if (name && finalMuscles) {
      const exerciseData: Exercise = {
        name,
        subtype: subtype || '',
        muscles: finalMuscles,
        instructions: instructions || '',
        equipment: equipment || '',
        sets: []
      };

      if (data.isEditingCustomExercise && data.currentCustomIdx !== null) {
        // Update existing exercise
        const updatedCustomExercises = [...data.customExercises];
        updatedCustomExercises[data.currentCustomIdx] = {
          ...updatedCustomExercises[data.currentCustomIdx],
          ...exerciseData,
          id: updatedCustomExercises[data.currentCustomIdx].id // Preserve the ID
        };

        setData((prev: DataType) => ({
          ...prev,
          customExercises: updatedCustomExercises,
          activeModal: null,
          isEditingCustomExercise: false,
          editingCustomExerciseData: null,
          currentCustomIdx: null,
        }));
      } else {
        // Add new exercise (existing code)
        const updatedCustomExercises = [...data.customExercises, exerciseData];

        if (data.returnModal === 'exercise-select-modal' && data.isWorkoutSelect && data.currentWorkout) {
          const workoutExercise = {
            ...exerciseData,
            sets: Array.from({ length: 3 }, () => ({
              weight: '',
              reps: '',
              rpe: '',
              completed: false,
            })),
          };

          setData((prev: DataType) => ({
            ...prev,
            customExercises: updatedCustomExercises,
            currentWorkout: {
              ...prev.currentWorkout!,
              exercises: [...prev.currentWorkout!.exercises, workoutExercise]
            },
            activeModal: 'workout-modal',
            returnModal: null,
            isWorkoutSelect: false,
          }));
        } else {
          setData((prev: DataType) => ({
            ...prev,
            customExercises: updatedCustomExercises,
            activeModal: prev.returnModal || null,
            returnModal: null,
          }));
        }
      }
    }
  };
  // Delete custom exercise
  const deleteCustomExercise = () => {
    if (data.currentCustomIdx !== null && window.confirm("Are you sure you want to delete this custom exercise?")) {
      const newCustomExercises = [...data.customExercises];
      newCustomExercises.splice(data.currentCustomIdx, 1);
      setData((prev: DataType) => ({
        ...prev,
        customExercises: newCustomExercises,
        activeModal: null,
      }));
    }
  };

  // Feedback modal handlers
  const finishWorkout = () => {
    const pump = (document.getElementById('pump-select') as HTMLInputElement)?.value || '';
    const soreness = (document.getElementById('soreness-select') as HTMLSelectElement)?.value || '';
    const workload = (document.getElementById('workload-select') as HTMLSelectElement)?.value || '';
    const suggestion = (document.getElementById('suggestion-select') as HTMLSelectElement)?.value || '';

    if (data.currentWorkout) {
      const finishedWorkout = {
        ...data.currentWorkout,
        duration: Date.now() - data.currentWorkout.startTime,
        pump,
        soreness,
        workload,
        suggestion,
      };

      // Track program progress if this workout is from a program
      let updatedCompletedPrograms = { ...data.completedPrograms };

      // Check if this workout is from a program by checking the workout name
      const workoutName = data.currentWorkout.name;

      // Find matching program
      const allPrograms = [...data.templates, ...simitPrograms];
      for (const program of allPrograms) {
        for (let weekIdx = 0; weekIdx < program.weeks.length; weekIdx++) {
          const week = program.weeks[weekIdx];
          for (let dayIdx = 0; dayIdx < week.days.length; dayIdx++) {
            const day = week.days[dayIdx];
            if (day.name === workoutName) {
              // Found matching program day
              if (!updatedCompletedPrograms[program.name]) {
                updatedCompletedPrograms[program.name] = {};
              }
              updatedCompletedPrograms[program.name][`${weekIdx}-${dayIdx}`] = true;
            }
          }
        }
      }

      setData((prev: DataType) => ({
        ...prev,
        history: [...prev.history, finishedWorkout],
        completedPrograms: updatedCompletedPrograms,
        currentWorkout: null,
        activeModal: null,
        isWorkoutSelect: false,
        returnModal: null
      }));
    }
  };

  // Weight prompt modal for progress pics
  const saveProgressPic = () => {
    const weight = (document.getElementById('progress-weight') as HTMLInputElement)?.value;
    if (weight && data.tempBase64 && data.tempTimestamp) {
      const newPic = {
        base64: data.tempBase64,
        timestamp: data.tempTimestamp,
        weight,
      };
      setData((prev: DataType) => ({
        ...prev,
        progressPics: [...prev.progressPics, newPic],
        tempBase64: null,
        tempTimestamp: null,
        activeModal: null,
      }));
    }
  };

  // Handle drag for minimized workout
  const handleMinimizedTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    minimizedStartY.current = clientY;
    setIsDraggingMinimized(true);
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  };

  const handleMinimizedTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingMinimized) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - minimizedStartY.current;

    // Only allow upward drag (negative deltaY)
    if (deltaY < 0) {
      setMinimizedDragY(deltaY);
    }
  };

  const handleMinimizedTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingMinimized) return;
    setIsDraggingMinimized(false);

    // Unlock body scroll
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';

    const deltaY = minimizedDragY;

    // If dragged up more than 50px, maximize
    if (deltaY < -50) {
      setData((prev: DataType) => ({ ...prev, activeModal: 'workout-modal' }));
    }

    // Reset transform
    setMinimizedDragY(0);
  };

  // Calculate the preview style based on drag distance
  const getMinimizedStyle = () => {
    const baseHeight = 50; // Reduced to half the height
    const maxPreviewHeight = window.innerHeight * 0.8; // Max 80% of viewport

    if (isDraggingMinimized && minimizedDragY < 0) {
      // Calculate expansion based on drag distance
      const expansion = Math.min(Math.abs(minimizedDragY) * 2.5, maxPreviewHeight - baseHeight);
      return {
        height: `${baseHeight + expansion}px`,
        transform: 'none',
        transition: 'none',
        borderRadius: Math.abs(minimizedDragY) > 50 ? '20px 20px 0 0' : '0',
      };
    }

    return {
      height: `${baseHeight}px`,
      transform: 'none',
      transition: 'all 0.3s ease',
      borderRadius: '0',
    };
  };

  return (
    <>
      <div id="program-modal" className={`modal ${activeModal === 'program-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          background: 'linear-gradient(135deg, var(--bg-dark), var(--bg-light))',
          borderRadius: '24px',
          padding: '0',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '450px',
          width: '90%',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.3em',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #fff, #e0e0e0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}>Create Program</h2>
            {data.isEditingProgram && (
              <span style={{
                fontSize: '0.75em',
                padding: '4px 12px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--accent-primary)',
                borderRadius: '12px',
                fontWeight: '500',
              }}>
                Editing
              </span>
            )}
          </div>

          {/* Content */}
          <div style={{
            padding: '24px',
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 80px)',
            WebkitOverflowScrolling: 'touch',
          }}>
            {/* Program Name Input */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-muted)',
                fontSize: '0.85em',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Program Name
              </label>
              <input
                type="text"
                id="program-name"
                placeholder="e.g., Push Pull Legs"
                defaultValue={(data.currentProgram as any)?.name || ''}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.05))',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'var(--text)',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-primary)';
                  e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.08))';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.05))';
                }}
              />
            </div>

            {/* Number of Weeks */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-muted)',
                fontSize: '0.85em',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Program Duration
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.05))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
              }}>
                <input
                  type="number"
                  id="mesocycle-length"
                  placeholder="4"
                  min="1"
                  max="52"
                  defaultValue={data.currentProgram.weeks.length || ''}
                  onInput={generateWeeks}
                  style={{
                    width: '80px',
                    padding: '8px 12px',
                    background: 'var(--bg-lighter)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: '16px',
                    textAlign: 'center',
                    outline: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield',
                  }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.95em' }}>weeks</span>
              </div>
              <p style={{
                marginTop: '8px',
                fontSize: '0.8em',
                color: 'var(--text-muted)',
                lineHeight: '1.4',
              }}>
                Each week will repeat with progressive overload
              </p>
            </div>

            {/* Weeks Overview */}
            {data.currentProgram.weeks.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1em',
                    color: 'var(--text)',
                    fontWeight: '600',
                  }}>
                    Week Structure
                  </h3>
                  <span style={{
                    fontSize: '0.85em',
                    color: 'var(--accent-primary)',
                    fontWeight: '500',
                  }}>
                    {data.currentProgram.weeks.length} {data.currentProgram.weeks.length === 1 ? 'week' : 'weeks'}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  {data.currentProgram.weeks.map((_: Week, index: number) => (
                    <div
                      key={index}
                      onClick={() => setData((prev: DataType) => ({
                        ...prev,
                        currentWeekIndex: index,
                        activeModal: 'week-modal',
                        isEditingProgram: prev.isEditingProgram || false,
                      }))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.04))',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.08))';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.04))';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div>
                        <div style={{
                          fontSize: '1em',
                          fontWeight: '600',
                          marginBottom: '4px',
                          color: 'var(--text)',
                        }}>
                          Week {index + 1}
                        </div>
                        <div style={{
                          fontSize: '0.85em',
                          color: 'var(--text-muted)'
                        }}>
                          {data.currentProgram.weeks[index].days.length} training days
                        </div>
                      </div>
                      <div style={{
                        color: 'var(--text-muted)',
                        fontSize: '1.2em',
                      }}>
                        →
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addWeek}
                  style={{
                    width: '100%',
                    padding: '14px',
                    marginTop: '12px',
                    background: 'transparent',
                    color: 'var(--accent-primary)',
                    border: '1px dashed rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    fontSize: '0.9em',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  }}
                >
                  <span style={{ fontSize: '1.2em' }}>+</span> Add Week
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '32px',
            }}>
              <button
                onClick={saveProgram}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--accent-gradient)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1em',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  opacity: data.currentProgram.weeks.length > 0 ? 1 : 0.5,
                  pointerEvents: data.currentProgram.weeks.length > 0 ? 'auto' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (data.currentProgram.weeks.length > 0) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
                }}
              >
                Save Program
              </button>

              <button
                className="secondary"
                onClick={closeModal}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  fontSize: '0.9em',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = 'var(--text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      <div id="program-weeks-modal" className={`modal ${activeModal === 'program-weeks-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          background: 'linear-gradient(135deg, var(--bg-dark), var(--bg-light))',
          borderRadius: '24px',
          padding: '0',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '450px',
          width: '90%',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.3em',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #fff, #e0e0e0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}>{(data.currentProgram as any)?.name || 'Program'}</h2>
          </div>
          <div style={{ padding: '24px' }}>
            <div id="program-weeks">{isSimitProgram ? renderSimitProgramWeeks : renderProgramWeeks}</div>
            <button className="secondary" onClick={closeModal} style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              fontSize: '0.9em',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '16px',
            }}>Close</button>
          </div>
        </div>
      </div>

      <div id="week-modal" className={`modal ${activeModal === 'week-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          background: 'linear-gradient(135deg, var(--bg-dark), var(--bg-light))',
          borderRadius: '24px',
          padding: '0',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '450px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={goBack}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.2em',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 'auto',
                  transition: 'color 0.2s ease',
                }}
              >
                ←
              </button>
              <h2 style={{
                margin: 0,
                fontSize: '1.2em',
                fontWeight: '700',
                color: 'var(--text)',
              }}>
                {data.isEditingProgram ? 'Edit' : 'View'} Week {data.currentWeekIndex !== null ? data.currentWeekIndex + 1 : ''}
              </h2>
            </div>
          </div>

          <div style={{
            padding: '24px',
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 80px)',
            WebkitOverflowScrolling: 'touch',
          }}>
            {!isSimitProgram && data.isEditingProgram && (
              <button onClick={addDayToWeek} style={{
                width: '100%',
                padding: '14px',
                marginBottom: '20px',
                background: 'transparent',
                color: 'var(--accent-primary)',
                border: '1px dashed rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                fontSize: '0.9em',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                }}
              >
                <span style={{ fontSize: '1.2em' }}>+</span> Add Training Day
              </button>
            )}

            <div id="week-days">{renderWeekDays}</div>

            {!isSimitProgram && data.isEditingProgram && (
              <button onClick={saveWeek} style={{
                width: '100%',
                padding: '14px',
                background: 'var(--accent-gradient)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1em',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease',
                marginTop: '20px',
              }}>
                Save Week
              </button>
            )}

            <button className="secondary" onClick={closeModal} style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              fontSize: '0.9em',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '12px',
            }}>Cancel</button>
          </div>
        </div>
      </div>

      <div id="day-modal" className={`modal ${activeModal === 'day-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          background: 'linear-gradient(135deg, var(--bg-dark), var(--bg-light))',
          borderRadius: '24px',
          padding: '0',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '450px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={goBack}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.2em',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 'auto',
                  transition: 'color 0.2s ease',
                }}
              >
                ←
              </button>
              <h2 style={{
                margin: 0,
                fontSize: '1.2em',
                fontWeight: '700',
                color: 'var(--text)',
              }}>Edit Training Day</h2>
            </div>
          </div>

          <div style={{
            padding: '24px',
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 80px)',
            WebkitOverflowScrolling: 'touch',
          }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-muted)',
                fontSize: '0.85em',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Day Name
              </label>
              <input
                type="text"
                id="day-name"
                placeholder="e.g., Push Day, Pull Day, Leg Day"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.05))',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'var(--text)',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-primary)';
                  e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.08))';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.05))';

                  if (data.currentWeekIndex !== null && data.currentDayIndex !== null) {
                    const newDays = [...data.currentProgram.weeks[data.currentWeekIndex].days];
                    newDays[data.currentDayIndex] = {
                      ...newDays[data.currentDayIndex],
                      name: e.target.value
                    };
                    const newWeeks = [...data.currentProgram.weeks];
                    newWeeks[data.currentWeekIndex] = { days: newDays };
                    setData((prev: DataType) => ({
                      ...prev,
                      currentProgram: { ...prev.currentProgram, weeks: newWeeks }
                    }));
                  }
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1em',
                  color: 'var(--text)',
                  fontWeight: '600',
                }}>Exercises</h3>
                <span style={{
                  fontSize: '0.85em',
                  color: 'var(--accent-primary)',
                  fontWeight: '500',
                }}>
                  {data.currentDayExercises.length} exercises
                </span>
              </div>

              <button onClick={addExerciseToDay} style={{
                width: '100%',
                padding: '14px',
                marginBottom: '16px',
                background: 'transparent',
                color: 'var(--accent-primary)',
                border: '1px dashed rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                fontSize: '0.9em',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                }}
              >
                <span style={{ fontSize: '1.2em' }}>+</span> Add Exercise
              </button>

              <div id="day-exercises" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>{renderDayExercises}</div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: '24px',
            }}>
              <button onClick={saveDayToWeek} style={{
                width: '100%',
                padding: '14px',
                background: 'var(--accent-gradient)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1em',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease',
              }}>
                Save Day
              </button>

              <button className="secondary" onClick={closeModal} style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontSize: '0.9em',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="exercise-select-modal" className={`modal exercise-select-modal ${activeModal === 'exercise-select-modal' ? 'active' : ''}`} style={{ alignItems: 'stretch' }}>
        <div className="modal-content exercise-select-content" style={{
          height: '-webkit-fill-available',
          maxHeight: '-webkit-fill-available',
          borderRadius: 0,
          margin: 0,
          width: '100%',
          maxWidth: '100%',
          paddingBottom: 'env(safe-area-inset-bottom)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        } as React.CSSProperties}>
          <div className="exercise-select-header" style={{
            paddingTop: 'env(safe-area-inset-top)',
          }}>
            <h2>Select Exercise</h2>
          </div>
          <div className="exercise-select-search" style={{
            padding: '10px 20px 15px',
            background: 'var(--bg-dark)',
            position: 'sticky',
            top: '60px',
            zIndex: 10,
          }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="search-bar"
                id="exercise-search-select"
                placeholder="Search exercises..."
                value={selectSearchQuery}
                onChange={(e) => setSelectSearchQuery(e.target.value)}
                style={{
                  background: 'var(--bg-lighter)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  paddingRight: selectSearchQuery ? '40px' : '16px',
                  marginBottom: '8px',
                  fontSize: '16px',
                  color: 'var(--text)',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
              {selectSearchQuery && (
                <button
                  onClick={() => setSelectSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '1.2em',
                    cursor: 'pointer',
                    padding: '4px',
                    minHeight: 'auto',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              )}
            </div>
            <div
              onClick={() => {
                setData((prev: DataType) => ({
                  ...prev,
                  activeModal: 'custom-exercise-modal',
                  returnModal: 'exercise-select-modal'
                }));
              }}
              style={{
                color: 'var(--accent-primary)',
                fontSize: '0.9em',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '8px 0',
                fontWeight: '500',
              }}
            >
              + Exercise
            </div>
          </div>
          <div className="exercise-select-list" id="exercise-list-select" style={{ paddingBottom: '80px' }}>
            {renderExerciseSelectList}
          </div>
          <div className="exercise-select-footer">
            <button className="secondary" onClick={() => {
              setSelectSearchQuery('');
              setExerciseSelectMode(null);
              if (exerciseSelectMode === 'workout') {
                setData((prev: DataType) => ({
                  ...prev,
                  activeModal: 'workout-modal',
                  isWorkoutSelect: false
                }));
              } else if (exerciseSelectMode === 'program') {
                setData((prev: DataType) => ({
                  ...prev,
                  activeModal: 'day-modal'
                }));
              } else {
                closeModal();
              }
            }}>Cancel</button>
          </div>
        </div>
      </div>
      <div id="workout-modal" className={`modal ${activeModal === 'workout-modal' && data.currentWorkout ? 'active' : ''}`}>
        {data.currentWorkout && <WorkoutModal />}
      </div>
      {/* CommentsModal */}
      {data.showComments && data.selectedPhoto && (
        <CommentsModal
          photo={data.selectedPhoto}
          isOwn={data.selectedPhoto.isOwn}
          onClose={() => setData(prev => ({ ...prev, showComments: false, selectedPhoto: null }))}
        />
      )}
      {data.currentWorkout && activeModal !== 'workout-modal' && (
        <div id="minimized-workout"
          className="minimized-workout"
          style={{
            position: 'fixed',
            bottom: '0',
            left: '0',
            right: '0',
            width: '100%',
            maxWidth: '428px',
            margin: '0 auto',
            background: 'var(--bg-dark)',
            padding: isPWAStandalone() ? '8px 16px 95px' : '8px 16px 70px',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'grab',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
            ...getMinimizedStyle(),
          }}
          onTouchStart={handleMinimizedTouchStart}
          onTouchMove={handleMinimizedTouchMove}
          onTouchEnd={handleMinimizedTouchEnd}
          onMouseDown={handleMinimizedTouchStart}
          onMouseMove={handleMinimizedTouchMove}
          onMouseUp={handleMinimizedTouchEnd}
          onMouseLeave={handleMinimizedTouchEnd}
        >
          <div className="drag-indicator" style={{
            margin: '2px auto 4px',
            width: '36px',
            height: '4px',
            background: data.theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
            borderRadius: '2px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}></div>
          <div style={{
            fontSize: '0.95em',
            fontWeight: '700',
            color: 'var(--text)',
            textAlign: 'center',
            letterSpacing: '0.3px',
            width: '100%',
          }}>
            {data.currentWorkout?.name || 'Workout in Progress'}
          </div>

          {/* Preview content that expands when dragging */}
          {isDraggingMinimized && minimizedDragY < -20 && (
            <div style={{
              marginTop: '10px',
              width: '100%',
              opacity: Math.min(Math.abs(minimizedDragY) / 100, 1),
              transition: 'opacity 0.2s ease',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '0 20px',
              }}>
                {data.currentWorkout?.exercises.map((ex: Exercise, idx: number) => (
                  <div key={idx} style={{
                    background: 'var(--bg-lighter)',
                    borderRadius: '8px',
                    padding: '12px',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{
                      fontSize: '0.85em',
                      fontWeight: '600',
                      color: 'var(--text)',
                      marginBottom: '8px',
                    }}>
                      {ex.name} {ex.subtype && `(${ex.subtype})`}
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr 1fr 1fr',
                      gap: '4px',
                      fontSize: '0.7em',
                      color: 'var(--text-muted)',
                    }}>
                      <div style={{ fontWeight: '600' }}>Set</div>
                      <div style={{ textAlign: 'center', fontWeight: '600' }}>Weight</div>
                      <div style={{ textAlign: 'center', fontWeight: '600' }}>Reps</div>
                      <div style={{ textAlign: 'center', fontWeight: '600' }}>{data.intensityMetric.toUpperCase()}</div>
                      {ex.sets.map((set: any, sIdx: number) => (
                        <React.Fragment key={sIdx}>
                          <div>{sIdx + 1}</div>
                          <div style={{ textAlign: 'center' }}>{set.weight || '-'}</div>
                          <div style={{ textAlign: 'center' }}>{set.reps || '-'}</div>
                          <div style={{ textAlign: 'center' }}>{set[data.intensityMetric] || '-'}</div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div id="exercise-menu-modal" className={`modal ${activeModal === 'exercise-menu-modal' ? 'active' : ''}`}>
        <div className="modal-content">
          <h2>Exercise Options</h2>
          <button onClick={deleteExercise}>Delete Exercise</button>
          <button onClick={deleteLastSet}>Delete Last Set</button>
          <button className="secondary" onClick={() => openModal('workout-modal')}>Cancel</button>
        </div>
      </div>

      <div id="history-menu-modal" className={`modal ${activeModal === 'history-menu-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '300px',
          background: '#1a1a1a',
          borderRadius: '16px',
          padding: '8px',
        }}>
          <div
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.15s',
              fontSize: '0.9em',
              color: 'white',
            }}
            onClick={startWorkoutFromHistory}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Start Workout
          </div>
          <div
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.15s',
              fontSize: '0.9em',
              color: '#ef4444',
            }}
            onClick={deleteHistoryEntry}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Delete
          </div>
          <div
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.15s',
              fontSize: '0.9em',
              color: 'var(--text-muted)',
            }}
            onClick={closeModal}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Cancel
          </div>
        </div>
      </div>

      <div id="custom-menu-modal" className={`modal ${activeModal === 'custom-menu-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '300px',
          background: '#1a1a1a',
          borderRadius: '16px',
          padding: '8px',
        }}>
          <div
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.15s',
              fontSize: '0.9em',
              color: 'white',
            }}
            onClick={() => {
              // Set the exercise data for editing
              const exercise = data.customExercises[data.currentCustomIdx!];
              setData((prev: DataType) => ({
                ...prev,
                isEditingCustomExercise: true,
                editingCustomExerciseData: exercise,
                activeModal: 'custom-exercise-modal',
              }));
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Edit Exercise
          </div>
          <div
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.15s',
              fontSize: '0.9em',
              color: '#ef4444',
            }}
            onClick={deleteCustomExercise}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Delete Exercise
          </div>
          <div
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.15s',
              fontSize: '0.9em',
              color: 'var(--text-muted)',
            }}
            onClick={closeModal}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Cancel
          </div>
        </div>
      </div>
      <div id="exercise-detail-modal" className={`modal ${activeModal === 'exercise-detail-modal' ? 'active' : ''}`}>
        <div className="modal-content">
          <h2>{data.currentExercise?.name} {data.currentExercise?.subtype ? `(${data.currentExercise.subtype})` : ''}</h2>
          <div className="exercise-detail">
            <strong>Muscles:</strong> {data.currentExercise?.muscles}
          </div>
          {data.currentExercise?.instructions && (
            <div className="exercise-detail">
              <strong>Instructions:</strong> {data.currentExercise.instructions}
            </div>
          )}
          {data.currentExercise?.equipment && (
            <div className="exercise-detail">
              <strong>Equipment:</strong> {data.currentExercise.equipment}
            </div>
          )}
          <button onClick={closeModal}>Close</button>
        </div>
      </div>

      <div id="custom-exercise-modal" className={`modal ${activeModal === 'custom-exercise-modal' ? 'active' : ''}`}>
        <div className="modal-content">
          <h2>{data.isEditingCustomExercise ? 'Edit' : 'Create'} Custom Exercise</h2>
          <input
            type="text"
            id="custom-exercise-name"
            placeholder="Exercise Name"
            defaultValue={data.isEditingCustomExercise ? data.editingCustomExerciseData?.name : ''}
          />
          <input
            type="text"
            id="custom-exercise-subtype"
            placeholder="Subtype (optional)"
            defaultValue={data.isEditingCustomExercise ? data.editingCustomExerciseData?.subtype : ''}
          />
          <select
            id="custom-exercise-muscles"
            defaultValue={data.isEditingCustomExercise ? data.editingCustomExerciseData?.muscles : ''}
            onChange={(e) => {
              const customInput = document.getElementById('custom-muscle-input');
              if (customInput) {
                customInput.style.display = e.target.value === 'Other' ? 'block' : 'none';
              }
            }}
          >
            <option value="">Select Muscle Group</option>
            {muscleGroups.map(muscle => (
              <option key={muscle} value={muscle}>{muscle}</option>
            ))}
          </select>
          <input
            type="text"
            id="custom-muscle-input"
            placeholder="Enter muscle group"
            style={{ display: 'none' }}
          />
          <textarea
            id="custom-exercise-instructions"
            placeholder="Instructions (optional)"
            defaultValue={data.isEditingCustomExercise ? data.editingCustomExerciseData?.instructions : ''}
          />
          <input
            type="text"
            id="custom-exercise-equipment"
            placeholder="Equipment (optional)"
            defaultValue={data.isEditingCustomExercise ? data.editingCustomExerciseData?.equipment : ''}
          />
          <button onClick={saveCustomExercise}>
            {data.isEditingCustomExercise ? 'Update' : 'Save'} Exercise
          </button>
          <button className="secondary" onClick={() => {
            setData((prev: DataType) => ({
              ...prev,
              activeModal: prev.returnModal || null,
              returnModal: null,
              isEditingCustomExercise: false,
              editingCustomExerciseData: null,
            }));
          }}>Cancel</button>
        </div>
      </div>
      <div id="edit-profile-modal" className={`modal ${activeModal === 'edit-profile-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '400px',
          maxHeight: '90vh',
          background: 'var(--bg-dark)',
          borderRadius: '24px',
          padding: '0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Modern Header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-darker)',
          }}>
            <button
              onClick={closeModal}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'var(--text)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0',
                minHeight: 'auto',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h2 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}>
              Edit Profile
            </h2>

            <div style={{ width: '32px' }}></div>
          </div>

          {/* Modern Form Content */}
          <div style={{
            padding: '20px',
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}>
            {/* Cover Photo Upload */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-muted)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Cover Photo
              </label>
              <label
                htmlFor="cover-photo-upload"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '2px dashed rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                {data.coverPhoto ? 'Change Cover Photo' : 'Upload Cover Photo'}
              </label>
              <input
                type="file"
                id="cover-photo-upload"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Image is too large. Please choose an image under 5MB.');
                      e.target.value = '';
                      return;
                    }

                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const base64 = event.target?.result as string;
                      const img = new Image();
                      img.src = base64;

                      img.onload = () => {
                        const maxSize = 800;
                        let width = img.width;
                        let height = img.height;

                        if (width > maxSize || height > maxSize) {
                          const ratio = Math.min(maxSize / width, maxSize / height);
                          width = Math.round(width * ratio);
                          height = Math.round(height * ratio);
                        }

                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');

                        if (ctx) {
                          ctx.drawImage(img, 0, 0, width, height);
                          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                          setData((prev: DataType) => ({
                            ...prev,
                            coverPhoto: resizedBase64
                          }));
                        }
                      };

                      img.onerror = () => {
                        alert('Failed to process image. Please try another photo.');
                        e.target.value = '';
                      };
                    };

                    reader.onerror = () => {
                      alert('Failed to read image. Please try again.');
                      e.target.value = '';
                    };

                    reader.readAsDataURL(file);
                  }
                }}
                style={{ display: 'none' }}
              />
            </div>

            {/* Name Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  First Name
                </label>
                <input
                  type="text"
                  id="edit-first-name"
                  placeholder="Enter first name"
                  defaultValue={data.firstName}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    color: 'var(--text)',
                    fontSize: '15px',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Last Name
                </label>
                <input
                  type="text"
                  id="edit-last-name"
                  placeholder="Enter last name"
                  defaultValue={data.lastName}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    color: 'var(--text)',
                    fontSize: '15px',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                />
              </div>
            </div>

            {/* Username Field */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Username
              </label>
              <input
                type="text"
                id="edit-username"
                placeholder="Choose a username"
                defaultValue={data.username}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: 'var(--text)',
                  fontSize: '15px',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
              />
            </div>

            {/* Bio Field */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Bio
              </label>
              <textarea
                id="edit-bio"
                placeholder="Tell us about yourself..."
                defaultValue={data.bio}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: 'var(--text)',
                  fontSize: '15px',
                  minHeight: '80px',
                  resize: 'vertical',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
              />
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Email
              </label>
              <input
                type="email"
                id="edit-email"
                placeholder="your@email.com"
                defaultValue={data.email}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: 'var(--text)',
                  fontSize: '15px',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
              />
            </div>

            {/* Location Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Country
                </label>
                <select
                  id="edit-country"
                  defaultValue={data.country || 'United States'}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    color: 'var(--text)',
                    fontSize: '15px',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  State/Region
                </label>
                <input
                  type="text"
                  id="edit-state"
                  placeholder="Enter state"
                  defaultValue={data.state}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    color: 'var(--text)',
                    fontSize: '15px',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={saveProfile}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--accent-gradient)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginTop: 'auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
      <div id="feedback-modal" className={`modal ${activeModal === 'feedback-modal' ? 'active' : ''}`}>
        <div className="modal-content">
          <h2>How was your workout?</h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
              Pump Quality (1-100)
            </label>
            <input
              type="range"
              id="pump-select"
              min="1"
              max="100"
              defaultValue="50"
              style={{
                width: '100%',
                marginBottom: '8px',
              }}
              onChange={(e) => {
                const value = e.target.value;
                const label = document.getElementById('pump-feedback-value');
                if (label) label.textContent = value;
              }}
            />
            <div style={{ textAlign: 'center', fontSize: '1.1em', fontWeight: '600' }}>
              <span id="pump-feedback-value">50</span>/100
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
              Recovery Status
            </label>
            <select id="soreness-select" className="feedback-select" style={{ width: '100%' }}>
              <option value="">How recovered do you feel?</option>
              <option value="fully-recovered">Fully Recovered - No soreness</option>
              <option value="mostly-recovered">Mostly Recovered - Minor soreness</option>
              <option value="somewhat-recovered">Somewhat Recovered - Moderate soreness</option>
              <option value="not-recovered">Not Recovered - Very sore</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
              Workout Difficulty
            </label>
            <select id="workload-select" className="feedback-select" style={{ width: '100%' }}>
              <option value="">How hard was this workout?</option>
              <option value="too-easy">Too Easy - Could do much more</option>
              <option value="easy">Easy - Could do more</option>
              <option value="just-right">Just Right - Challenging but doable</option>
              <option value="hard">Hard - Almost at limit</option>
              <option value="too-hard">Too Hard - Couldn't complete properly</option>
            </select>
          </div>

          <button onClick={() => {
            const pump = (document.getElementById('pump-select') as HTMLInputElement)?.value || '50';
            const soreness = (document.getElementById('soreness-select') as HTMLSelectElement)?.value || '';
            const workload = (document.getElementById('workload-select') as HTMLSelectElement)?.value || '';

            // Calculate suggestion based on feedback
            let suggestion = 'maintain';
            const pumpValue = parseInt(pump);

            if (workload === 'too-easy' && pumpValue < 70) {
              suggestion = 'increase';
            } else if (workload === 'easy' && soreness === 'fully-recovered') {
              suggestion = 'increase';
            } else if (workload === 'too-hard' || soreness === 'not-recovered') {
              suggestion = 'decrease';
            } else if (pumpValue > 80 && workload === 'just-right') {
              suggestion = 'maintain';
            }

            if (data.currentWorkout) {
              const finishedWorkout = {
                ...data.currentWorkout,
                duration: Date.now() - data.currentWorkout.startTime,
                pump,
                soreness,
                workload,
                suggestion,
              };

              // Track program progress if this workout is from a program
              let updatedCompletedPrograms = { ...data.completedPrograms };

              // Check if this workout is from a program by checking the workout name
              const workoutName = data.currentWorkout.name;

              // Find matching program
              const allPrograms = [...data.templates, ...simitPrograms];
              for (const program of allPrograms) {
                for (let weekIdx = 0; weekIdx < program.weeks.length; weekIdx++) {
                  const week = program.weeks[weekIdx];
                  for (let dayIdx = 0; dayIdx < week.days.length; dayIdx++) {
                    const day = week.days[dayIdx];
                    if (day.name === workoutName) {
                      // Found matching program day
                      if (!updatedCompletedPrograms[program.name]) {
                        updatedCompletedPrograms[program.name] = {};
                      }
                      updatedCompletedPrograms[program.name][`${weekIdx}-${dayIdx}`] = true;
                    }
                  }
                }
              }

              setData((prev: DataType) => ({
                ...prev,
                history: [...prev.history, finishedWorkout],
                completedPrograms: updatedCompletedPrograms,
                currentWorkout: null,
                activeModal: null,
                isWorkoutSelect: false,
                returnModal: null
              }));
            }
          }}>
            Finish
          </button>
          <button className="secondary" onClick={() => openModal('workout-modal')}>Cancel</button>
        </div>
      </div>

      <div id="weight-prompt-modal" className={`modal ${activeModal === 'weight-prompt-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{ zIndex: 1200, position: 'relative' }}>
          <h2>Enter Your Weight</h2>
          <input type="number" id="progress-weight" placeholder="Weight (lbs)" style={{ fontSize: '16px' }} />
          <button
            onClick={saveProgressPic}
            style={{
              position: 'relative',
              zIndex: 10,
              pointerEvents: 'auto',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            Save
          </button>
          <button className="secondary" onClick={closeModal}>Cancel</button>
        </div>
      </div>

      <div id="program-menu-modal" className={`modal ${activeModal === 'program-menu-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '300px',
          background: '#1a1a1a',
          borderRadius: '16px',
          padding: '8px',
        }}>
          <div
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.15s',
              fontSize: '0.9em',
              color: 'white',
            }}
            onClick={() => {
              // Edit program
              if (data.currentProgName) {
                const program = data.templates.find((t: Template) => t.name === data.currentProgName);
                if (program) {
                  // Create a deep copy of the program for editing
                  const programCopy = {
                    ...program,
                    weeks: program.weeks.map((week: any) => ({
                      days: week.days.map((day: any) => ({
                        ...day,
                        exercises: day.exercises.map((ex: any) => ({ ...ex }))
                      }))
                    }))
                  };
                  setData((prev) => ({
                    ...prev,
                    currentProgram: programCopy,
                    activeModal: 'program-modal',
                    isEditingProgram: true as boolean,
                  }));
                }
              }
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Edit Program
          </div>
          <div
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.15s',
              fontSize: '0.9em',
              color: '#ef4444',
            }}
            onClick={() => {
              if (data.currentProgName && window.confirm("Are you sure you want to delete this program?")) {
                const newTemplates = data.templates.filter((t: Template) => t.name !== data.currentProgName);
                setData((prev: DataType) => ({
                  ...prev,
                  templates: newTemplates,
                  activeModal: null,
                }));
              }
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Delete Program
          </div>
          <div
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.15s',
              fontSize: '0.9em',
              color: 'var(--text-muted)',
            }}
            onClick={closeModal}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Cancel
          </div>
        </div>
      </div>

<div id="progress-upload-modal" className={`modal ${activeModal === 'progress-upload-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '400px',
          background: 'var(--bg-dark)',
          borderRadius: '20px',
          padding: '0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}>
          {/* Modern Header - Profile Tab Style */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
          }}>
            <button
              onClick={closeModal}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            
            <h2 style={{ 
              margin: 0, 
              fontSize: '18px', 
              fontWeight: '600',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}>
              New Progress Photo
            </h2>
            
            <div style={{ width: '32px' }}></div>
          </div>

          <div style={{
            padding: '20px',
            overflowY: 'auto',
            flex: 1,
            WebkitOverflowScrolling: 'touch',
          }}>
            {data.tempBase64 ? (
              <>
                {/* Photo Preview - Fixed zoom issue */}
                <div style={{
                  marginBottom: '20px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#000',
                  aspectRatio: '1',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img
                    src={data.tempBase64}
                    alt="Progress"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',  // Changed from 'cover' to 'contain'
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                  />
                  <button
                    onClick={() => setData(prev => ({ ...prev, tempBase64: null }))}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(0, 0, 0, 0.7)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'}
                  >
                    ×
                  </button>
                </div>

                {/* Caption Input - Profile Tab Style */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Caption
                  </label>
                  <textarea
                    id="progress-caption"
                    placeholder="Share your progress..."
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      color: 'var(--text)',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                      lineHeight: '1.5',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent-primary)';
                      e.target.style.background = 'rgba(255,255,255,0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.background = 'rgba(255,255,255,0.05)';
                    }}
                  />
                </div>

                {/* Weight Input - Profile Tab Style */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Body Weight
                  </label>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                  }}>
                    <input
                      type="number"
                      id="progress-weight"
                      placeholder="0"
                      style={{
                        width: '80px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text)',
                        fontSize: '16px',
                        outline: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield',
                        textAlign: 'center',
                      }}
                    />
                    <span style={{
                      color: 'var(--text-muted)',
                      fontSize: '14px',
                    }}>
                      {data.weightUnit || 'lbs'}
                    </span>
                  </div>
                </div>

                {/* Pump Rating - Cleaner Style */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Pump Rating
                  </label>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px',
                  }}>
                    <input
                      type="range"
                      id="progress-pump"
                      min="0"
                      max="100"
                      defaultValue="50"
                      style={{
                        width: '100%',
                        height: '6px',
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '3px',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        const label = document.getElementById('pump-value');
                        if (label) label.textContent = value;
                      }}
                    />
                    <div style={{
                      textAlign: 'center',
                      marginTop: '12px',
                      fontSize: '24px',
                      fontWeight: '700',
                      color: 'var(--accent-primary)',
                    }}>
                      <span id="pump-value">50</span>
                      <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
                    </div>
                  </div>
                </div>

                {/* Workout Selection */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Link Workout (Optional)
                  </label>
                  <select
                    id="workout-select"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      color: 'var(--text)',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '16px',
                      paddingRight: '40px',
                    }}
                  >
                    <option value="">No workout linked</option>
                    {data.history
                      .slice(-3)
                      .reverse()
                      .map((workout: any, idx: number) => {
                        const date = new Date(workout.startTime);
                        const dateStr = date.toLocaleDateString();
                        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                          <option key={idx} value={workout.startTime}>
                            {workout.name} - {dateStr} {timeStr}
                          </option>
                        );
                      })}
                  </select>
                </div>

                {/* Visibility Toggle - Cleaner Style */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Visibility
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                  }}>
                    <button
                      onClick={() => setData(prev => ({ ...prev, tempIsPublic: false }))}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: !data.tempIsPublic ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                        color: !data.tempIsPublic ? 'white' : 'var(--text-muted)',
                        border: '1px solid',
                        borderColor: !data.tempIsPublic ? 'var(--accent-primary)' : 'var(--border)',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Private
                    </button>
                    <button
                      onClick={() => setData(prev => ({ ...prev, tempIsPublic: true }))}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: data.tempIsPublic ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                        color: data.tempIsPublic ? 'white' : 'var(--text-muted)',
                        border: '1px solid',
                        borderColor: data.tempIsPublic ? 'var(--accent-primary)' : 'var(--border)',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Public
                    </button>
                  </div>
                  <p style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                  }}>
                    {data.tempIsPublic
                      ? "Friends will see this in their feed"
                      : "Only you will see this photo"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}>
                  <button
                    onClick={() => {
                      const caption = (document.getElementById('progress-caption') as HTMLTextAreaElement)?.value || '';
                      const weight = (document.getElementById('progress-weight') as HTMLInputElement)?.value || '';
                      const pump = parseInt((document.getElementById('progress-pump') as HTMLInputElement)?.value || '50');
                      const selectedWorkoutTime = (document.getElementById('workout-select') as HTMLSelectElement)?.value || '';
                      
                      if (data.tempBase64 && data.tempTimestamp) {
                        const newPic = {
                          base64: data.tempBase64,
                          timestamp: data.tempTimestamp,
                          caption,
                          weight,
                          pump,
                          likes: 0,
                          comments: [],
                          visibility: (data.tempIsPublic ? 'public' : 'private') as 'public' | 'private',
                          linkedWorkoutTime: selectedWorkoutTime ? parseInt(selectedWorkoutTime) : undefined
                        };
                        const newProgressPics = [...data.progressPics, newPic];

                        setData((prev: DataType) => ({
                          ...prev,
                          progressPics: newProgressPics,
                          tempBase64: null,
                          tempTimestamp: null,
                          activeModal: null
                        }));

                        requestAnimationFrame(() => {
                          setData((prev: DataType) => ({
                            ...prev,
                            activeTab: 'progress-tab'
                          }));
                        });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'var(--accent-gradient)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Share Progress
                  </button>

                  <button
                    onClick={closeModal}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--text-muted)';
                      e.currentTarget.style.color = 'var(--text)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              // Upload button when no photo selected
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px',
                textAlign: 'center',
              }}>
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e: Event) => {
                      const target = e.target as HTMLInputElement;
                      if (target.files && target.files[0]) {
                        const file = target.files[0];
                        const reader = new FileReader();
                        reader.onload = (event: ProgressEvent<FileReader>) => {
                          if (event.target?.result) {
                            setData(prev => ({
                              ...prev,
                              tempBase64: event.target!.result as string,
                              tempTimestamp: Date.now(),
                            }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  style={{
                    padding: '16px 32px',
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Choose Photo
                </button>
                <p style={{
                  marginTop: '16px',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                }}>
                  Select a photo from your gallery
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div id="settings-modal" className={`modal ${activeModal === 'settings-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '400px',
          background: 'var(--bg-dark)',
          borderRadius: '0',
          padding: '0',
          overflow: 'hidden',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div className="settings-header" style={{
            padding: '15px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <button
              onClick={closeModal}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                fontSize: '1.2em',
                cursor: 'pointer',
                padding: '0',
                minHeight: 'auto',
                width: '30px',
              }}
            >
              ✕
            </button>
            <h2 style={{ margin: 0, fontSize: '1.1em', flex: 1, textAlign: 'center' }}>Settings</h2>
            <div style={{ width: '30px' }}></div>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {/* APPEARANCE Section */}
            <div style={{ padding: '20px 20px 10px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{
                margin: '0 0 15px 0',
                fontSize: '0.8em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                APPEARANCE
              </h3>

              <div
                onClick={() => setData((prev: DataType) => ({
                  ...prev,
                  activeModal: 'theme-select-modal',
                  previousModal: 'settings-modal'
                }))}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '1em' }}>Theme</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '0.9em' }}>
                    {data.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>›</span>
                </div>
              </div>

              <div
                onClick={() => setData((prev: DataType) => ({
                  ...prev,
                  activeModal: 'weight-unit-modal',
                  previousModal: 'settings-modal'
                }))}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '1em' }}>Weight Unit</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '0.9em' }}>
                    {data.weightUnit || 'lbs'}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>›</span>
                </div>
              </div>
            </div>

            {/* SOCIAL Section - SEPARATE from Appearance */}
            <div style={{ padding: '20px 20px 10px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{
                margin: '0 0 15px 0',
                fontSize: '0.8em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                SOCIAL
              </h3>

              <div
                onClick={() => setData((prev: DataType) => ({
                  ...prev,
                  activeModal: 'find-friends-modal',
                  previousModal: 'settings-modal'
                }))}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1em' }}>Find Friends</span>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>›</span>
              </div>

              <div
                onClick={() => setData((prev: DataType) => ({
                  ...prev,
                  activeModal: 'friends-modal',
                  previousModal: 'settings-modal'
                }))}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1em' }}>My Friends</span>
                  <span style={{
                    background: 'var(--accent-primary)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75em',
                    fontWeight: '600',
                  }}>
                    {data.friends.length}
                  </span>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>›</span>
              </div>
            </div>

            {/* UNITS Section - Remove Weight Unit from here since it's in APPEARANCE */}
            <div style={{ padding: '20px 20px 10px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{
                margin: '0 0 15px 0',
                fontSize: '0.8em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                UNITS
              </h3>

              <div
                onClick={() => setData((prev: DataType) => ({
                  ...prev,
                  activeModal: 'distance-unit-modal',
                  previousModal: 'settings-modal'
                }))}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '1em' }}>Distance Unit</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '0.9em' }}>
                    {data.distanceUnit || 'miles'}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>›</span>
                </div>
              </div>

              <div
                onClick={() => setData((prev: DataType) => ({
                  ...prev,
                  activeModal: 'intensity-metric-modal',
                  previousModal: 'settings-modal'
                }))}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '1em' }}>Intensity Metric</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '0.9em' }}>
                    {data.intensityMetric.toUpperCase()}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>›</span>
                </div>
              </div>
            </div>

            {/* ACCOUNT Section */}
            <div style={{ padding: '20px' }}>
              <h3 style={{
                margin: '0 0 15px 0',
                fontSize: '0.8em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                ACCOUNT
              </h3>

              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                style={{
                  width: '100%',
                  background: 'var(--bg-lighter)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.9em',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-primary)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-lighter)';
                  e.currentTarget.style.color = 'var(--text)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                Log Out
              </button>

              <button
                className="delete-account-btn"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  }
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#FF3B30',
                  border: '1px solid #FF3B30',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.9em',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Theme Selection Modal */}
      <div id="theme-select-modal" className={`modal ${activeModal === 'theme-select-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '350px',
          background: 'var(--bg-dark)',
          borderRadius: '16px',
          padding: '0',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <button
              onClick={() => setData((prev: DataType) => ({ ...prev, activeModal: 'settings-modal' }))}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                fontSize: '1.2em',
                cursor: 'pointer',
                padding: '0',
                minHeight: 'auto',
              }}
            >
              ‹
            </button>
            <h2 style={{ margin: 0, fontSize: '1.1em', flex: 1, textAlign: 'center' }}>Theme</h2>
            <div style={{ width: '30px' }}></div>
          </div>

          <div style={{ padding: '10px' }}>
            <div
              onClick={() => {
                setData((prev: DataType) => ({ ...prev, theme: 'dark', activeModal: 'settings-modal' }));
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                cursor: 'pointer',
                borderRadius: '8px',
                background: data.theme === 'dark' ? 'var(--bg-lighter)' : 'transparent',
              }}
            >
              <span>🌙 Dark</span>
              {data.theme === 'dark' && <span style={{ color: 'var(--accent-primary)' }}>✓</span>}
            </div>

            <div
              onClick={() => {
                setData((prev: DataType) => ({ ...prev, theme: 'light', activeModal: 'settings-modal' }));
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                cursor: 'pointer',
                borderRadius: '8px',
                background: data.theme === 'light' ? 'var(--bg-lighter)' : 'transparent',
              }}
            >
              <span>☀️ Light</span>
              {data.theme === 'light' && <span style={{ color: 'var(--accent-primary)' }}>✓</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Weight Unit Modal */}
      <div id="weight-unit-modal" className={`modal ${activeModal === 'weight-unit-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '350px',
          background: 'var(--bg-dark)',
          borderRadius: '16px',
          padding: '0',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <button
              onClick={() => setData((prev: DataType) => ({ ...prev, activeModal: 'settings-modal' }))}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                fontSize: '1.2em',
                cursor: 'pointer',
                padding: '0',
                minHeight: 'auto',
              }}
            >
              ‹
            </button>
            <h2 style={{ margin: 0, fontSize: '1.1em', flex: 1, textAlign: 'center' }}>Weight Unit</h2>
            <div style={{ width: '30px' }}></div>
          </div>

          <div style={{ padding: '10px' }}>
            <div
              onClick={() => {
                setData((prev: DataType) => ({ ...prev, weightUnit: 'kg', activeModal: 'settings-modal' }));
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                cursor: 'pointer',
                borderRadius: '8px',
                background: data.weightUnit === 'kg' ? 'var(--bg-lighter)' : 'transparent',
              }}
            >
              <span>Metric (kg)</span>
              {data.weightUnit === 'kg' && <span style={{ color: 'var(--accent-primary)' }}>✓</span>}
            </div>

            <div
              onClick={() => {
                setData((prev: DataType) => ({ ...prev, weightUnit: 'lbs', activeModal: 'settings-modal' }));
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                cursor: 'pointer',
                borderRadius: '8px',
                background: (data.weightUnit === 'lbs' || !data.weightUnit) ? 'var(--bg-lighter)' : 'transparent',
              }}
            >
              <span>US/Imperial (lbs)</span>
              {(data.weightUnit === 'lbs' || !data.weightUnit) && <span style={{ color: 'var(--accent-primary)' }}>✓</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Distance Unit Modal */}
      <div id="distance-unit-modal" className={`modal ${activeModal === 'distance-unit-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '350px',
          background: 'var(--bg-dark)',
          borderRadius: '16px',
          padding: '0',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <button
              onClick={() => setData((prev: DataType) => ({ ...prev, activeModal: 'settings-modal' }))}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                fontSize: '1.2em',
                cursor: 'pointer',
                padding: '0',
                minHeight: 'auto',
              }}
            >
              ‹
            </button>
            <h2 style={{ margin: 0, fontSize: '1.1em', flex: 1, textAlign: 'center' }}>Distance Unit</h2>
            <div style={{ width: '30px' }}></div>
          </div>

          <div style={{ padding: '10px' }}>
            <div
              onClick={() => {
                setData((prev: DataType) => ({ ...prev, distanceUnit: 'km', activeModal: 'settings-modal' }));
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                cursor: 'pointer',
                borderRadius: '8px',
                background: data.distanceUnit === 'km' ? 'var(--bg-lighter)' : 'transparent',
              }}
            >
              <span>Metric (m/km)</span>
              {data.distanceUnit === 'km' && <span style={{ color: 'var(--accent-primary)' }}>✓</span>}
            </div>

            <div
              onClick={() => {
                setData((prev: DataType) => ({ ...prev, distanceUnit: 'miles', activeModal: 'settings-modal' }));
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                cursor: 'pointer',
                borderRadius: '8px',
                background: (data.distanceUnit === 'miles' || !data.distanceUnit) ? 'var(--bg-lighter)' : 'transparent',
              }}
            >
              <span>US/Imperial (ft/miles)</span>
              {(data.distanceUnit === 'miles' || !data.distanceUnit) && <span style={{ color: 'var(--accent-primary)' }}>✓</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Intensity Metric Modal */}
      <div id="intensity-metric-modal" className={`modal ${activeModal === 'intensity-metric-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '350px',
          background: 'var(--bg-dark)',
          borderRadius: '16px',
          padding: '0',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <button
              onClick={() => setData((prev: DataType) => ({ ...prev, activeModal: 'settings-modal' }))}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                fontSize: '1.2em',
                cursor: 'pointer',
                padding: '0',
                minHeight: 'auto',
              }}
            >
              ‹
            </button>
            <h2 style={{ margin: 0, fontSize: '1.1em', flex: 1, textAlign: 'center' }}>Intensity Metric</h2>
            <div style={{ width: '30px' }}></div>
          </div>

          <div style={{ padding: '10px' }}>
            <div
              onClick={() => {
                setData((prev: DataType) => ({ ...prev, intensityMetric: 'rpe', activeModal: 'settings-modal' }));
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                cursor: 'pointer',
                borderRadius: '8px',
                background: data.intensityMetric === 'rpe' ? 'var(--bg-lighter)' : 'transparent',
              }}
            >
              <span>RPE (Rate of Perceived Exertion)</span>
              {data.intensityMetric === 'rpe' && <span style={{ color: 'var(--accent-primary)' }}>✓</span>}
            </div>

            <div
              onClick={() => {
                setData((prev: DataType) => ({ ...prev, intensityMetric: 'rir', activeModal: 'settings-modal' }));
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                cursor: 'pointer',
                borderRadius: '8px',
                background: data.intensityMetric === 'rir' ? 'var(--bg-lighter)' : 'transparent',
              }}
            >
              <span>RIR (Reps in Reserve)</span>
              {data.intensityMetric === 'rir' && <span style={{ color: 'var(--accent-primary)' }}>✓</span>}
            </div>
          </div>
        </div>
      </div>
      <div id="photo-menu-modal" className={`modal ${activeModal === 'photo-menu-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '300px',
          background: '#1a1a1a',
          borderRadius: '16px',
          padding: '8px',
        }}>
          <div
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.15s',
              fontSize: '0.9em',
              color: 'white',
            }}
            onClick={() => {
              // Get the selected photo data
              const selectedPhoto = data.progressPics.find((p: any) => p.base64 === data.tempBase64);
              if (selectedPhoto) {
                setData((prev: DataType) => ({
                  ...prev,
                  activeModal: 'edit-progress-photo-modal',
                  editingPhotoData: selectedPhoto,
                }));
              }
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Edit
          </div>
          <div
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.15s',
              fontSize: '0.9em',
              color: '#ef4444',
            }}
            onClick={() => {
              const selectedPhotoData = data.tempBase64;
              const pics = data.progressPics;
              const photoToDelete = pics.find((p: any) => p.base64 === selectedPhotoData);

              if (photoToDelete && window.confirm("Are you sure you want to delete this photo?")) {
                // Remove from local state
                const newPics = pics.filter((p: any) => p.id !== photoToDelete.id);
                setData((prev: DataType) => ({
                  ...prev,
                  progressPics: newPics,
                  activeModal: null,
                  tempBase64: null,
                  tempTimestamp: null,
                }));
              }
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Delete
          </div>
          <div
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.15s',
              fontSize: '0.9em',
              color: 'var(--text-muted)',
            }}
            onClick={() => setData((prev: DataType) => ({ ...prev, activeModal: 'progress-photo-modal' }))}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Cancel
          </div>
        </div>
      </div>

      <div id="progress-menu-modal" className={`modal ${activeModal === 'progress-menu-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '300px',
          background: '#1a1a1a',
          borderRadius: '16px',
          padding: '8px',
        }}>
          <div
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.15s',
              fontSize: '0.9em',
              color: '#ef4444',
            }}
            onClick={() => {
              if (data.currentProgName && window.confirm("Are you sure you want to remove this program from progress?")) {
                const newCompletedPrograms = { ...data.completedPrograms };
                delete newCompletedPrograms[data.currentProgName];
                setData((prev: DataType) => ({
                  ...prev,
                  completedPrograms: newCompletedPrograms,
                  activeModal: null,
                }));
              }
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Remove from Progress
          </div>
          <div
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.15s',
              fontSize: '0.9em',
              color: 'var(--text-muted)',
            }}
            onClick={closeModal}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Cancel
          </div>
        </div>
      </div>

      {/* Add this new modal after the progress-menu-modal */}
      <div id="edit-progress-photo-modal" className={`modal ${activeModal === 'edit-progress-photo-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '400px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(135deg, var(--bg-dark), var(--bg-light))',
          borderRadius: '24px',
          padding: '0',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.3em',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #fff, #e0e0e0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}>Edit Progress Photo</h2>
          </div>

          <div style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
            WebkitOverflowScrolling: 'touch',
          }}>
            {data.editingPhotoData && (
              <>
                {/* Photo Preview */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  marginBottom: '20px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, var(--bg-lighter), var(--bg-dark))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}>
                  <img
                    src={data.editingPhotoData.base64}
                    alt="Edit preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                    }}
                  />
                </div>

                {/* Caption Input */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: 'var(--text-muted)',
                    fontSize: '0.85em',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Caption
                  </label>
                  <textarea
                    id="edit-progress-caption"
                    placeholder="Write a caption..."
                    defaultValue={data.editingPhotoData.caption || ''}
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '14px 16px',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.05))',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'var(--text)',
                      fontSize: '15px',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent-primary)';
                      e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.08))';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.05))';
                    }}
                  />
                </div>

                {/* Weight Input */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: 'var(--text-muted)',
                    fontSize: '0.85em',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Weight
                  </label>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.05))',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    transition: 'all 0.3s ease',
                  }}>
                    <input
                      type="number"
                      id="edit-progress-weight"
                      placeholder="0"
                      defaultValue={data.editingPhotoData.weight || ''}
                      style={{
                        width: '60px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text)',
                        fontSize: '15px',
                        outline: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield',
                        textAlign: 'center',
                      }}
                    />
                    <span style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.9em',
                      fontWeight: '500',
                    }}>
                      {data.weightUnit || 'lbs'}
                    </span>
                  </div>
                </div>

                {/* Pump Rating */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    color: 'var(--text-muted)',
                    fontSize: '0.85em',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Pump Rating
                  </label>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.05))',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '20px',
                    backdropFilter: 'blur(10px)',
                  }}>
                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                      <input
                        type="range"
                        id="edit-progress-pump"
                        min="0"
                        max="100"
                        defaultValue={data.editingPhotoData.pump || 50}
                        style={{
                          width: '100%',
                          height: '40px',
                          WebkitAppearance: 'none',
                          appearance: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          position: 'relative',
                          zIndex: 2,
                        }}
                        onChange={(e) => {
                          const value = e.target.value;
                          const label = document.getElementById('edit-pump-value');
                          if (label) label.textContent = value;

                          const percent = (parseInt(value) / 100) * 100;
                          const track = document.getElementById('edit-pump-track-fill');
                          if (track) track.style.width = `${percent}%`;
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '3px',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        overflow: 'hidden',
                      }}>
                        <div
                          id="edit-pump-track-fill"
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: '100%',
                            width: `${data.editingPhotoData.pump || 50}%`,
                            background: 'var(--accent-gradient)',
                            borderRadius: '3px',
                            transition: 'width 0.2s ease',
                          }}
                        />
                      </div>
                    </div>
                    <div style={{
                      textAlign: 'center',
                      fontSize: '1.5em',
                      fontWeight: '700',
                      background: 'var(--accent-gradient)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginTop: '8px',
                    }}>
                      <span id="edit-pump-value">{data.editingPhotoData.pump || 50}</span>
                      <span style={{ fontSize: '0.6em', opacity: 0.8 }}>/100</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}>
                  <button
                    onClick={() => {
                      const caption = (document.getElementById('edit-progress-caption') as HTMLTextAreaElement)?.value || '';
                      const weight = (document.getElementById('edit-progress-weight') as HTMLInputElement)?.value || '';
                      const pump = parseInt((document.getElementById('edit-progress-pump') as HTMLInputElement)?.value || '50');

                      if (data.editingPhotoData) {
                        const photoIndex = data.progressPics.findIndex((p: ProgressPhoto) =>
                          p.base64 === data.editingPhotoData!.base64 &&
                          p.timestamp === data.editingPhotoData!.timestamp
                        );

                        if (photoIndex !== -1) {
                          const updatedPics = [...data.progressPics];
                          updatedPics[photoIndex] = {
                            ...updatedPics[photoIndex],
                            caption,
                            weight,
                            pump,
                          };

                          setData((prev: DataType) => ({
                            ...prev,
                            progressPics: updatedPics,
                            activeModal: 'progress-photo-modal',
                            editingPhotoData: null,
                          }));
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'var(--accent-gradient)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1em',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Save Changes
                  </button>

                  <button
                    onClick={() => setData((prev: DataType) => ({
                      ...prev,
                      activeModal: 'photo-menu-modal',
                      editingPhotoData: null,
                    }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      fontSize: '0.9em',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div id="update-modal" className={`modal ${activeModal === 'update-modal' ? 'active' : ''}`}>
        <div className="modal-content">
          <h2>Update Available</h2>
          <p>A new version of Pump Inc. is available!</p>
          <button className="update-button" onClick={() => window.location.reload()}>Update Now</button>
          <button className="secondary" onClick={closeModal}>Later</button>
        </div>
      </div>
      {/* Friends List Modal */}
      <div id="friends-modal" className={`modal ${activeModal === 'friends-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '400px',
          maxHeight: '80vh',
          overflowY: 'auto',
          background: 'var(--bg-dark)',
          borderRadius: '20px',
          padding: '0',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <button
              onClick={() => {
                const previousModal = data.previousModal;
                if (previousModal === 'profile-tab') {
                  // If came from profile, just close the modal
                  setData((prev: DataType) => ({
                    ...prev,
                    activeModal: null,
                    previousModal: undefined
                  }));
                } else {
                  // Otherwise go back to settings
                  setData((prev: DataType) => ({
                    ...prev,
                    activeModal: 'settings-modal',
                    previousModal: undefined
                  }));
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                fontSize: '1.2em',
                cursor: 'pointer',
                padding: '0',
                minHeight: 'auto',
              }}
            >
              ‹
            </button>
            <h2 style={{ margin: 0, fontSize: '1.2em', fontWeight: '600', flex: 1, textAlign: 'center' }}>
              Friends
            </h2>      <div style={{ width: '30px' }}></div>
          </div>          <div style={{ padding: '20px' }}>
            {data.friendRequests.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1em', marginBottom: '12px', color: 'var(--text-muted)' }}>
                  Friend Requests ({data.friendRequests.length})
                </h3>
                {data.friendRequests.map((request: any) => (
                  <div key={request.id} style={{
                    padding: '12px',
                    background: 'var(--bg-lighter)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--bg-dark)',
                        backgroundImage: request.sender.profile_pic ? `url(${request.sender.profile_pic})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }} />
                      <div>
                        <div style={{ fontWeight: '600' }}>
                          {request.sender.first_name} {request.sender.last_name}
                        </div>
                        <div style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
                          @{request.sender.username}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={async () => {
                          try {
                            await DatabaseService.acceptFriendRequest(request.id, dbUser.id);
                            // Refresh friends and requests
                            const [friends, friendRequests] = await Promise.all([
                              DatabaseService.getFriends(dbUser.id),
                              DatabaseService.getPendingFriendRequests(dbUser.id)
                            ]);
                            setData(prev => ({ ...prev, friends, friendRequests }));
                          } catch (error) {
                            console.error('Error accepting friend request:', error);
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          background: 'var(--accent-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.85em',
                          cursor: 'pointer',
                        }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await DatabaseService.rejectFriendRequest(request.id, dbUser.id);
                            const friendRequests = await DatabaseService.getPendingFriendRequests(dbUser.id);
                            setData(prev => ({ ...prev, friendRequests }));
                          } catch (error) {
                            console.error('Error rejecting friend request:', error);
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          background: 'transparent',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '0.85em',
                          cursor: 'pointer',
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{ fontSize: '1em', marginBottom: '12px', color: 'var(--text-muted)' }}>
              Your Friends ({data.friends.length})
            </h3>
            {data.friends.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                No friends yet. Find friends to see their progress!
              </div>
            ) : (
              data.friends.map((friend: any) => (
                <div key={friend.id} style={{
                  padding: '12px',
                  background: 'var(--bg-lighter)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--bg-dark)',
                      backgroundImage: friend.profile_pic ? `url(${friend.profile_pic})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }} />
                    <div>
                      <div style={{ fontWeight: '600' }}>
                        {friend.first_name} {friend.last_name}
                      </div>
                      <div style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
                        @{friend.username}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Remove ${friend.username} from friends?`)) {
                        try {
                          await DatabaseService.removeFriend(dbUser.id, friend.id);
                          const friends = await DatabaseService.getFriends(dbUser.id);
                          setData(prev => ({ ...prev, friends }));
                        } catch (error) {
                          console.error('Error removing friend:', error);
                        }
                      }
                    }}
                    style={{
                      padding: '6px',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      border: 'none',
                      fontSize: '0.85em',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Find Friends Modal */}
      <div id="find-friends-modal" className={`modal ${activeModal === 'find-friends-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '400px',
          background: 'var(--bg-dark)',
          borderRadius: '0',
          padding: '0',
          overflow: 'hidden',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '15px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <button
              onClick={() => setData((prev: DataType) => ({
                ...prev,
                activeModal: data.previousModal || 'settings-modal'
              }))}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                fontSize: '1.2em',
                cursor: 'pointer',
                padding: '0',
                minHeight: 'auto',
              }}
            >
              ‹
            </button>
            <h2 style={{ margin: 0, fontSize: '1.1em', flex: 1, textAlign: 'center' }}>Find Friends</h2>
            <div style={{ width: '30px' }}></div>
          </div>

          <div style={{ flex: 1, padding: '20px' }}>
            <div style={{
              background: 'var(--bg-lighter)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <input
                type="text"
                id="friend-search-input"
                placeholder="Enter username to send friend request"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--bg-dark)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'var(--text)',
                  fontSize: '16px',
                  marginBottom: '12px',
                }}
              />
              <button
                onClick={async () => {
                  const username = (document.getElementById('friend-search-input') as HTMLInputElement)?.value;
                  if (username && username.trim()) {
                    try {
                      await DatabaseService.sendFriendRequest(dbUser.id, username.trim());
                      alert('Friend request sent!');
                      (document.getElementById('friend-search-input') as HTMLInputElement).value = '';
                    } catch (error: any) {
                      alert(error.message || 'Failed to send friend request');
                    }
                  }
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1em',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                Send Friend Request
              </button>
            </div>

            <div style={{
              marginTop: '30px',
              padding: '20px',
              background: 'var(--bg-lighter)',
              borderRadius: '16px',
              textAlign: 'center',
            }}>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.9em',
                lineHeight: '1.5',
                margin: 0,
              }}>
                Connect with friends to share workouts, track progress together, and stay motivated on your fitness journey.
              </p>
</div>
          </div>
        </div>
      </div>

      {/* View Workout Modal */}
      <div id="view-workout-modal" className={`modal ${activeModal === 'view-workout-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <h2 style={{ marginBottom: '20px' }}>
            {data.viewingWorkoutUser?.firstName}'s Workout
          </h2>
          {data.viewingWorkout && (
            <div>
              <h3 style={{ fontSize: '1.1em', marginBottom: '10px' }}>
                {data.viewingWorkout.name}
              </h3>
              <p style={{ fontSize: '0.9em', color: 'var(--text-muted)', marginBottom: '20px' }}>
                {new Date(data.viewingWorkout.startTime).toLocaleDateString()} • 
                Duration: {Math.floor(data.viewingWorkout.duration / 60000)} mins
              </p>
              
              {data.viewingWorkout.exercises.map((ex: any, idx: number) => (
                <div key={idx} style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>
                    {ex.name} {ex.subtype ? `(${ex.subtype})` : ''}
                  </h4>
                  <div style={{ fontSize: '0.9em' }}>
                    {ex.sets?.filter((s: any) => s.completed).map((set: any, setIdx: number) => (
                      <div key={setIdx} style={{ marginBottom: '4px' }}>
                        Set {setIdx + 1}: {set.weight} {data.weightUnit} × {set.reps} reps
                        {set.rpe && ` @ RPE ${set.rpe}`}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {data.viewingWorkout.pump && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '12px', 
                  background: 'var(--subtle-gradient)',
                  borderRadius: '8px' 
                }}>
                  <strong>Pump Rating:</strong> {data.viewingWorkout.pump}/100
                </div>
              )}
            </div>
          )}
          
          <button onClick={() => setData(prev => ({ ...prev, activeModal: null }))} 
            className="modal-btn">
            Close
          </button>
        </div>
      </div>
    </>
  );
};
export default Modals;