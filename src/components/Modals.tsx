import React, { useContext, useState, useEffect, useMemo, useRef } from 'react';
import { DataContext, DataType, Exercise } from '../DataContext';
import WorkoutModal from './WorkoutModal';
import EXIF from 'exif-js';

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

interface Template {
  name: string;
  mesocycleLength: number;
  weeks: Week[];
  lastUsed: number;
}

interface ExerciseFromDatabase {
  name: string;
  subtype?: string;
  muscles: string;
  instructions?: string;
  equipment?: string;
}

const Modals = () => {
  const { data, setData, exerciseDatabase, simitPrograms } = useContext(DataContext);
  const activeModal = data.activeModal;
  const [exerciseSelectMode, setExerciseSelectMode] = useState<'workout' | 'program' | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const [minimizedDragY, setMinimizedDragY] = useState(0);
  const [isDraggingMinimized, setIsDraggingMinimized] = useState(false);
  const minimizedStartY = useRef(0);

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
    if (activeModal === 'day-modal') openModal('week-modal');
    else if (activeModal === 'week-modal') openModal('program-weeks-modal');
    else if (activeModal === 'program-modal') openModal('start-workout-tab');
    else closeModal();
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
        isEditingProgram: false  // Add this line
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
    const newExercise = {
      ...exercise,
      sets: Array.from({ length: 3 }, () => ({
        weight: '',
        reps: '',
        rpe: '',
        completed: false,
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

  const deleteHistoryEntry = () => {
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
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setData((prev: DataType) => ({ ...prev, coverPhoto: base64 }));
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
      const newExercise: Exercise = {
        name,
        subtype: subtype || '',
        muscles: finalMuscles,
        instructions: instructions || '',
        equipment: equipment || '',
        sets: []
      };

      // Add to custom exercises database
      const updatedCustomExercises = [...data.customExercises, newExercise];

      // If we came from exercise select modal during workout, add to workout too
      if (data.returnModal === 'exercise-select-modal' && data.isWorkoutSelect && data.currentWorkout) {
        const workoutExercise = {
          ...newExercise,
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
          maxHeight: '80vh',
          overflow: 'auto',
          background: 'var(--bg-dark)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <span className="back-button" onClick={goBack} style={{
              marginRight: '16px',
              fontSize: '1.4em',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'color 0.2s ease',
            }}>←</span>
            <h2 style={{
              margin: 0,
              flex: 1,
              fontSize: '1.8em',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Create Program</h2>
          </div>
          <input
            type="text"
            id="program-name"
            placeholder="Program Name (e.g., PUSH PULL LEGS)"
            style={{
              marginBottom: '24px',
              background: 'var(--bg-lighter)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '14px 16px',
              fontSize: '1em',
              width: 'calc(100% - 32px)',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              color: 'var(--text-muted)',
              fontSize: '0.9em',
              marginBottom: '12px',
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '600',
            }}>
              Number of Weeks
            </label>
            <input
              type="number"
              id="mesocycle-length"
              placeholder="# weeks"
              min="1"
              max="52"
              onInput={generateWeeks}
              style={{
                marginBottom: '12px',
                background: 'var(--bg-lighter)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '14px 16px',
                fontSize: '1em',
                width: '120px',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div id="program-weeks" style={{ marginBottom: '20px' }}>
            {renderProgramWeeks}
          </div>
          <button onClick={addWeek} style={{
            background: 'var(--bg-lighter)',
            color: 'var(--text)',
            marginBottom: '12px',
            width: '100%',
            borderRadius: '12px',
            padding: '14px',
            border: '1px solid var(--border)',
            transition: 'all 0.2s ease',
          }}>
            + Add Week
          </button>
          <button onClick={saveProgram} style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
            width: '100%',
            borderRadius: '12px',
            padding: '14px',
            fontWeight: '600',
            fontSize: '1em',
          }}>
            Save Program
          </button>
          <button className="secondary" onClick={closeModal} style={{
            background: 'transparent',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'rgba(239, 68, 68, 0.8)',
            width: '100%',
            marginTop: '8px',
          }}>Cancel</button>
        </div>
      </div>

      <div id="program-weeks-modal" className={`modal ${activeModal === 'program-weeks-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          background: 'var(--bg-dark)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>
          <h2 style={{
            fontSize: '1.8em',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>{(data.currentProgram as any)?.name || 'Program'}</h2>
          <div id="program-weeks">{isSimitProgram ? renderSimitProgramWeeks : renderProgramWeeks}</div>
          <button className="secondary" onClick={closeModal} style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            width: '100%',
            marginTop: '12px',
          }}>Cancel</button>
        </div>
      </div>

      <div id="week-modal" className={`modal ${activeModal === 'week-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          background: 'var(--bg-dark)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <span className="back-button" onClick={goBack} style={{
              marginRight: '16px',
              fontSize: '1.4em',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'color 0.2s ease',
            }}>←</span>
            <h2 style={{
              margin: 0,
              flex: 1,
              fontSize: '1.6em',
            }}>{data.isEditingProgram ? 'Edit' : 'View'} Week {data.currentWeekIndex !== null ? data.currentWeekIndex + 1 : ''}</h2>
          </div>
          {!isSimitProgram && data.isEditingProgram && (
            <button onClick={addDayToWeek} style={{
              background: 'var(--bg-lighter)',
              color: 'var(--text)',
              width: '100%',
              marginBottom: '16px',
              borderRadius: '12px',
              padding: '14px',
              border: '1px solid var(--border)',
            }}>
              + Add Day
            </button>
          )}
          <div id="week-days">{renderWeekDays}</div>
          {!isSimitProgram && data.isEditingProgram && (
            <button onClick={saveWeek} style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
              width: '100%',
              borderRadius: '12px',
              padding: '14px',
              fontWeight: '600',
              fontSize: '1em',
              marginTop: '16px',
            }}>
              Save Week
            </button>
          )}
          <button className="secondary" onClick={closeModal} style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            width: '100%',
            marginTop: '8px',
          }}>Cancel</button>
        </div>
      </div>
      <div id="day-modal" className={`modal ${activeModal === 'day-modal' ? 'active' : ''}`}>
        <div className="modal-content">
          <span className="back-button" onClick={goBack}>←</span>
          <h2>Edit Day</h2>
          <input
            type="text"
            id="day-name"
            placeholder="Day Name (e.g., Push Day)"
            onBlur={(e) => {
              // Save day name on blur to prevent losing it
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
          <button onClick={addExerciseToDay}>Add Exercise</button>
          <div id="day-exercises">{renderDayExercises}</div>
          <button onClick={saveDayToWeek}>Save Day</button>
          <button className="secondary" onClick={closeModal}>Cancel</button>
        </div>
      </div>

      <div id="exercise-select-modal" className={`modal exercise-select-modal ${activeModal === 'exercise-select-modal' ? 'active' : ''}`} style={{ alignItems: 'stretch' }}>
        <div className="modal-content exercise-select-content" style={{
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
          margin: 0,
          width: '100%',
          maxWidth: '100%',
        }}>
          <div className="exercise-select-header">
            <h2>Select Exercise</h2>
          </div>
          <div className="exercise-select-search">
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
                marginBottom: '8px',
                fontSize: '16px',
                color: 'var(--text)',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => {
                setData((prev: DataType) => ({
                  ...prev,
                  activeModal: 'custom-exercise-modal',
                  returnModal: 'exercise-select-modal'
                }));
              }}
              style={{
                background: 'var(--bg-lighter)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.85em',
                fontWeight: '500',
                cursor: 'pointer',
                width: '100%',
              }}            >
              + Create Custom Exercise
            </button>
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
            padding: '8px 16px 50px',
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
            background: 'rgba(255,255,255,0.4)',
            borderRadius: '2px'
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
          <h2>Create Custom Exercise</h2>
          <input type="text" id="custom-exercise-name" placeholder="Exercise Name" />
          <input type="text" id="custom-exercise-subtype" placeholder="Subtype (optional)" />
          <select id="custom-exercise-muscles" onChange={(e) => {
            const customInput = document.getElementById('custom-muscle-input');
            if (customInput) {
              customInput.style.display = e.target.value === 'Other' ? 'block' : 'none';
            }
          }}>
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
          <textarea id="custom-exercise-instructions" placeholder="Instructions (optional)" />
          <input type="text" id="custom-exercise-equipment" placeholder="Equipment (optional)" />
          <button onClick={saveCustomExercise}>Save Exercise</button>
          <button className="secondary" onClick={() => {
            setData((prev: DataType) => ({
              ...prev,
              activeModal: prev.returnModal || null,
              returnModal: null
            }));
          }}>Cancel</button>
        </div>
      </div>

      <div id="edit-profile-modal" className={`modal ${activeModal === 'edit-profile-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '400px',
          maxHeight: '90vh',
          background: 'var(--bg-dark)',
          borderRadius: '20px',
          padding: '0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h2 style={{ margin: 0, fontSize: '1.2em', fontWeight: '600' }}>Edit Profile</h2>
            <button
              onClick={closeModal}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.2em',
                cursor: 'pointer',
                padding: '0',
                minHeight: 'auto',
                width: '24px',
                height: '24px',
              }}
            >
              ×
            </button>
          </div>

          <div style={{
            padding: '20px',
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                id="edit-first-name"
                placeholder="First Name"
                defaultValue={data.firstName}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: 'var(--bg-lighter)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '16px',
                }}
              />
              <input
                type="text"
                id="edit-last-name"
                placeholder="Last Name"
                defaultValue={data.lastName}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: 'var(--bg-lighter)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '16px',
                }}
              />
            </div>

            <input
              type="text"
              id="edit-username"
              placeholder="Username"
              defaultValue={data.username}
              style={{
                width: 'calc(100% - 24px)',
                padding: '10px 12px',
                marginBottom: '16px',
                background: 'var(--bg-lighter)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
            />
            <textarea
              id="edit-bio"
              placeholder="Bio (optional)"
              defaultValue={data.bio}
              style={{
                width: 'calc(100% - 24px)',
                padding: '10px 12px',
                marginBottom: '16px',
                background: 'var(--bg-lighter)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '16px',
                minHeight: '80px',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            <input
              type="email"
              id="edit-email"
              placeholder="Email (optional)"
              defaultValue={data.email}
              style={{
                width: 'calc(100% - 24px)',
                padding: '10px 12px',
                marginBottom: '16px',
                background: 'var(--bg-lighter)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <select
                id="edit-country"
                defaultValue={data.country}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: 'var(--bg-lighter)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '16px',
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

              <input
                type="text"
                id="edit-state"
                placeholder="State/Province"
                defaultValue={data.state}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: 'var(--bg-lighter)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '16px',
                }}
              />
            </div>

            <label style={{
              display: 'block',
              padding: '10px 12px',
              marginBottom: '20px',
              background: 'var(--bg-lighter)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: '0.9em',
              color: 'var(--text-muted)',
            }}>
              <input
                type="file"
                id="cover-photo-upload"
                accept="image/*"
                onChange={handleCoverPhotoUpload}
                style={{ display: 'none' }}
              />
              Upload Cover Photo
            </label>

            <button
              onClick={saveProfile}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9em',
                fontWeight: '600',
                cursor: 'pointer',
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
        <div className="modal-content" style={{ maxWidth: '400px' }}>
          <h2>New Progress Photo</h2>

          {data.tempBase64 ? (
            <>
              <div style={{
                width: '100%',
                height: '300px',
                marginBottom: '16px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'var(--bg-lighter)',
              }}>
                <img
                  src={data.tempBase64}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>

              <textarea
                id="progress-caption"
                placeholder="Write a caption..."
                style={{
                  width: 'calc(100% - 24px)',
                  minHeight: '80px',
                  padding: '12px',
                  background: 'var(--bg-lighter)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '16px',
                  resize: 'vertical',
                  marginBottom: '16px',
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
                  Weight (optional)
                </label>
                <input
                  type="number"
                  id="progress-weight"
                  placeholder="Weight"
                  style={{
                    fontSize: '16px',
                    width: '120px',
                    padding: '10px 12px',
                    background: 'var(--bg-lighter)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
                  Pump Rating
                </label>
                <input
                  type="range"
                  id="progress-pump"
                  min="0"
                  max="100"
                  defaultValue="50"
                  style={{
                    width: 'calc(100% - 24px)',
                    marginBottom: '8px',
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    const label = document.getElementById('pump-value');
                    if (label) label.textContent = value;
                  }}
                />
                <div style={{ textAlign: 'center', fontSize: '1.2em', fontWeight: '600' }}>
                  <span id="pump-value">50</span>/100
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '20px'
              }}>
                <button
                  onClick={() => {
                    const caption = (document.getElementById('progress-caption') as HTMLTextAreaElement)?.value || '';
                    const weight = (document.getElementById('progress-weight') as HTMLInputElement)?.value || '';
                    const pump = parseInt((document.getElementById('progress-pump') as HTMLInputElement)?.value || '50');

                    if (data.tempBase64 && data.tempTimestamp) {
                      const newPic = {
                        base64: data.tempBase64,
                        timestamp: data.tempTimestamp,
                        caption,
                        weight,
                        pump,
                        likes: 0,
                        comments: [],
                      };
                      // Close modal first, then update data
                      document.body.style.overflow = '';
                      document.body.style.position = '';
                      document.body.style.width = '';

                      setData((prev: DataType) => ({
                        ...prev,
                        progressPics: [...prev.progressPics, newPic],
                        tempBase64: null,
                        tempTimestamp: null,
                        activeModal: null,
                      }));

                      // Switch to progress tab
                      const progressTab = document.querySelector('[data-tab-id="progress-tab"]') as HTMLElement;
                      if (progressTab) {
                        progressTab.click();
                      } else {
                        // Fallback: directly set the active tab
                        setData((prev: DataType) => ({
                          ...prev,
                          activeTab: 'progress-tab',
                        }));
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9em',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}>
                  Post
                </button>

                <button
                  onClick={() => setData((prev: DataType) => ({
                    ...prev,
                    tempBase64: null,
                    tempTimestamp: null,
                    activeModal: 'progress-upload-modal'
                  }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'transparent',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '0.85em',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Choose Different Photo
                </button>

                <button
                  onClick={closeModal}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'transparent',
                    color: 'rgba(239, 68, 68, 0.8)',
                    border: '1px dashed rgba(239, 68, 68, 0.4)',
                    borderRadius: '8px',
                    fontSize: '0.85em',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: '12px',
                  padding: '40px',
                  textAlign: 'center',
                  marginBottom: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
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
                        const base64 = event.target?.result as string;
                        const img = new Image();
                        img.src = base64;
                        img.onload = () => {
                          EXIF.getData(img as any, function () {
                            let exifDate = EXIF.getTag(img, 'DateTimeOriginal');
                            let timestamp = Date.now();
                            if (exifDate) {
                              const parts = exifDate.split(' ');
                              const datePart = parts[0].replace(/:/g, '-');
                              const timePart = parts[1];
                              const dt = new Date(`${datePart}T${timePart}`);
                              if (!isNaN(dt.getTime())) {
                                timestamp = dt.getTime();
                              }
                            }
                            setData((prev: DataType) => ({
                              ...prev,
                              tempBase64: base64,
                              tempTimestamp: timestamp,
                              activeModal: 'progress-upload-modal'
                            }));
                          });
                        };
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ fontSize: '3em', marginBottom: '16px' }}>📸</div>
                <div style={{ fontSize: '1.1em', fontWeight: '600', marginBottom: '8px' }}>
                  Choose a photo
                </div>
                <div style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>
                  Tap to select from your gallery
                </div>
              </div>

              <button
                onClick={closeModal}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'transparent',
                  color: 'rgba(239, 68, 68, 0.8)',
                  border: '1px dashed rgba(239, 68, 68, 0.4)',
                  borderRadius: '8px',
                  fontSize: '0.85em',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </>
          )}
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
                    {data.theme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>›</span>
                </div>
              </div>
            </div>

            {/* UNITS Section */}
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

            {/* Account Section */}
            <div style={{ padding: '20px' }}>
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
                  marginTop: '20px',
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
              // TODO: Implement edit functionality
              alert('Edit functionality coming soon!');
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
              const index = pics.findIndex((p: any) => p.base64 === selectedPhotoData);
              if (index !== -1 && window.confirm("Are you sure you want to delete this photo?")) {
                const newPics = [...pics];
                newPics.splice(index, 1);
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

      <div id="update-modal" className={`modal ${activeModal === 'update-modal' ? 'active' : ''}`}>
        <div className="modal-content">
          <h2>Update Available</h2>
          <p>A new version of Pump Inc. is available!</p>
          <button className="update-button" onClick={() => window.location.reload()}>Update Now</button>
          <button className="secondary" onClick={closeModal}>Later</button>
        </div>
      </div>
    </>
  );
};

export default Modals;