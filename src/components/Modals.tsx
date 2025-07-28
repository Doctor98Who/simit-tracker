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
        subtype: string;
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

  const openModal = (id: string) => setData((prev: DataType) => ({ ...prev, activeModal: id }));
  const closeModal = () => setData((prev: DataType) => ({ ...prev, activeModal: null }));

  const goBack = () => {
    if (activeModal === 'day-modal') openModal('week-modal');
    else if (activeModal === 'week-modal') openModal('program-weeks-modal');
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
      if (!isNaN(length)) {
        setData((prev: DataType) => ({
          ...prev,
          currentProgram: {
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
      const programData: Template = {
        name,
        mesocycleLength: weeksLength,
        weeks: data.currentProgram.weeks,
        lastUsed: Date.now(),
      };
      const existingIndex = data.templates.findIndex((t: Template) => t.name === name);
      const newTemplates = [...data.templates];
      if (existingIndex > -1) {
        newTemplates[existingIndex] = programData;
      } else {
        newTemplates.push(programData);
      }
      setData((prev: DataType) => ({ ...prev, templates: newTemplates }));
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
    closeModal();
  };

  const addExerciseToDay = () => {
    setExerciseSelectMode('program');
    openModal('exercise-select-modal');
  };

  const saveDayToWeek = () => {
    const input = document.getElementById('day-name') as HTMLInputElement | null;
    if (input && data.currentWeekIndex !== null && data.currentDayIndex !== null) {
      const name = input.value;
      if (name && data.currentDayExercises.length > 0) {
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
    
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    if (filtered.length === 0 && query) {
      return [<div key="no-results" className="feed-placeholder" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No exercises found containing "{query}"</div>];
    }

    let currentLetter = '';
    const list: React.ReactNode[] = [];
    
    filtered.forEach((ex: Exercise | ExerciseFromDatabase) => {
      const firstLetter = ex.name[0].toUpperCase();
      if (firstLetter !== currentLetter) {
        list.push(<div key={firstLetter} className="letter-header" style={{ 
          fontSize: '1.2em',
          color: 'var(--accent-primary)',
          marginTop: currentLetter ? '20px' : '0',
          marginBottom: '10px',
          padding: '10px 16px',
          background: 'linear-gradient(to right, var(--bg-dark), var(--bg-light))',
          borderRadius: '8px',
        }}>{firstLetter}</div>);
        currentLetter = firstLetter;
      }
      
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
          }))
        }
      >
        Week {index + 1}
        <div>Days: {data.currentProgram.weeks[index].days.length}</div>
      </div>
    ));
  }, [data.currentProgram.weeks]);

  const renderWeekDays = useMemo(() => {
    if (data.currentWeekIndex === null) return null;
    const week = data.currentProgram.weeks[data.currentWeekIndex];
    if (!week) return null;
    return week.days.map((day: Day, index: number) => (
      <div
        key={index}
        className="program-day-card"
        onClick={() => {
          if (isSimitProgram) {
            // For Simit programs, start the workout directly
            const simitDay = (data.currentProgram as any).weeks[data.currentWeekIndex!].days[index];
            const preFilledExercises: Exercise[] = simitDay.exercises.map((ex: any) => {
              // Find the full exercise data from exerciseDatabase
              const fullExercise = exerciseDatabase.find((dbEx: any) => 
                dbEx.name === ex.name && dbEx.subtype === ex.subtype
              ) || { muscles: '', instructions: '', equipment: '' };
              
              return {
                name: ex.name,
                subtype: ex.subtype,
                muscles: fullExercise.muscles,
                instructions: fullExercise.instructions,
                equipment: fullExercise.equipment,
                sets: Array.from({ length: ex.numSets || 3 }, () => ({
                  weight: '',
                  reps: '',
                  rpe: '',
                  completed: false,
                })),
              };
            });
            const newWorkout = {
              name: simitDay.name,
              exercises: preFilledExercises,
              startTime: Date.now(),
              duration: 0,
            };
            setData((prev: DataType) => ({
              ...prev,
              currentWorkout: newWorkout,
              activeModal: 'workout-modal',
            }));
          } else {
            // For custom programs, open day modal for editing
            setData((prev: DataType) => ({
              ...prev,
              currentDayIndex: index,
              currentDayExercises: day.exercises || [],
              activeModal: 'day-modal',
            }));
          }
        }}
      >
        {day.name || (data.currentProgram as any).weeks?.[data.currentWeekIndex!]?.days?.[index]?.name}
        <div>Exercises: {day.exercises?.length || (data.currentProgram as any).weeks?.[data.currentWeekIndex!]?.days?.[index]?.exercises?.length || 0}</div>
      </div>
    ));
  }, [data.currentWeekIndex, data.currentProgram.weeks, isSimitProgram]);

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
          }))
        }
      >
        Week {index + 1}
        <div>Days: {program.weeks[index].days.length}</div>
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
        exercises: historyWorkout.exercises.map(ex => ({
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
    const muscles = (document.getElementById('custom-exercise-muscles') as HTMLInputElement)?.value;
    const instructions = (document.getElementById('custom-exercise-instructions') as HTMLTextAreaElement)?.value;
    const equipment = (document.getElementById('custom-exercise-equipment') as HTMLInputElement)?.value;

    if (name && muscles) {
      const newExercise: Exercise = {
        name,
        subtype: subtype || '',
        muscles,
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
      setData(prev => ({ ...prev, activeModal: 'workout-modal' }));
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
        <div className="modal-content" style={{ maxHeight: '80vh', overflow: 'auto' }}>
          <h2>Create Program</h2>
          <input 
            type="text" 
            id="program-name" 
            placeholder="Program Name (e.g., PUSH PULL LEGS)" 
            style={{ marginBottom: '20px' }}
          />
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9em', marginBottom: '8px', display: 'block' }}>
              Number of Weeks
            </label>
            <input
              type="number"
              id="mesocycle-length"
              placeholder="Mesocycle Length"
              min="1"
              max="52"
              defaultValue="8"
              onInput={generateWeeks}
              style={{ marginBottom: '10px' }}
            />
          </div>
          <div id="program-weeks" style={{ marginBottom: '20px' }}>
            {renderProgramWeeks}
          </div>
          <button onClick={saveProgram} style={{ background: 'var(--accent-primary)' }}>
            Save Program
          </button>
          <button className="secondary" onClick={closeModal}>Cancel</button>
        </div>
      </div>
      
      <div id="program-weeks-modal" className={`modal ${activeModal === 'program-weeks-modal' ? 'active' : ''}`}>
        <div className="modal-content">
          <h2>{(data.currentProgram as any)?.name || 'Program'}</h2>
          <div id="program-weeks">{isSimitProgram ? renderSimitProgramWeeks : renderProgramWeeks}</div>
          <button className="secondary" onClick={closeModal}>Cancel</button>
        </div>
      </div>
      
      <div id="week-modal" className={`modal ${activeModal === 'week-modal' ? 'active' : ''}`}>
        <div className="modal-content">
          <span className="back-button" onClick={goBack}>←</span>
          <h2>{isSimitProgram ? 'View Week' : 'Edit Week'} {data.currentWeekIndex !== null ? data.currentWeekIndex + 1 : ''}</h2>
          {!isSimitProgram && <button onClick={addDayToWeek}>Add Day</button>}
          <div id="week-days">{renderWeekDays}</div>
          {!isSimitProgram && <button onClick={saveWeek}>Save Week</button>}
          <button className="secondary" onClick={closeModal}>Cancel</button>
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
            <button
              onClick={() => {
                setData((prev: DataType) => ({ 
                  ...prev, 
                  activeModal: 'custom-exercise-modal',
                  returnModal: 'exercise-select-modal'
                }));
              }}
              style={{
                background: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.85em',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '10px',
              }}
            >
              + Create Custom Exercise
            </button>
          </div>
          <div className="exercise-select-search">
            <input
              type="text"
              className="search-bar"
              id="exercise-search-select"
              placeholder="Search exercises..."
              value={selectSearchQuery}
              onChange={(e) => setSelectSearchQuery(e.target.value)}
            />
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
            padding: '8px 16px 70px',
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
                {data.currentWorkout?.exercises.map((ex, idx) => (
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
                      {ex.sets.map((set, sIdx) => (
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
        <div className="modal-content">
          <h2>Workout Options</h2>
          <button onClick={startWorkoutFromHistory}>Start Workout</button>
          <button className="secondary" onClick={deleteHistoryEntry}>Delete</button>
          <button onClick={closeModal}>Cancel</button>
        </div>
      </div>
      
      <div id="edit-profile-modal" className={`modal ${activeModal === 'edit-profile-modal' ? 'active' : ''}`}>
        <div className="modal-content">
          <h2>Edit Profile</h2>
          <label htmlFor="cover-photo-upload" id="cover-photo-label">Upload Cover Photo</label>
          <input type="file" id="cover-photo-upload" accept="image/*" onChange={handleCoverPhotoUpload} />
          <input type="text" id="edit-first-name" placeholder="First Name" defaultValue={data.firstName} />
          <input type="text" id="edit-last-name" placeholder="Last Name" defaultValue={data.lastName} />
          <input type="text" id="edit-username" placeholder="Username" defaultValue={data.username} />
          <textarea id="edit-bio" placeholder="Bio" defaultValue={data.bio}></textarea>
          <input type="email" id="edit-email" placeholder="Email" defaultValue={data.email} />
          <select id="edit-country" defaultValue={data.country}>
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="Other">Other</option>
          </select>
          <input type="text" id="edit-state" placeholder="State/Province" defaultValue={data.state} />
          <button onClick={saveProfile}>Save</button>
          <button className="secondary" onClick={closeModal}>Cancel</button>
          <div className="delete-account">Delete Account</div>
        </div>
      </div>
      
      <div id="custom-exercise-modal" className={`modal ${activeModal === 'custom-exercise-modal' ? 'active' : ''}`}>
        <div className="modal-content">
          <h2>Create Custom Exercise</h2>
          <input type="text" id="custom-exercise-name" placeholder="Exercise Name" />
          <input type="text" id="custom-exercise-subtype" placeholder="Subtype (optional)" />
          <input type="text" id="custom-exercise-muscles" placeholder="Muscles Worked" />
          <textarea id="custom-exercise-instructions" placeholder="Instructions (optional)"></textarea>
          <input type="text" id="custom-exercise-equipment" placeholder="Equipment (optional)" />
          <button onClick={saveCustomExercise}>Save</button>
          <button className="secondary" onClick={closeModal}>Cancel</button>
        </div>
      </div>
      
      <div id="custom-menu-modal" className={`modal ${activeModal === 'custom-menu-modal' ? 'active' : ''}`}>
        <div className="modal-content">
          <h2>Custom Exercise Options</h2>
          <button className="secondary" onClick={deleteCustomExercise}>Delete</button>
          <button onClick={closeModal}>Cancel</button>
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
                  setData((prev: DataType) => ({
                    ...prev,
                    currentProgram: program,
                    activeModal: 'program-modal',
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
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  background: 'var(--bg-lighter)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '16px',
                  resize: 'vertical',
                  marginBottom: '16px',
                }}
              />
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
                  Weight (optional)
                </label>
                <input 
                  type="number" 
                  id="progress-weight" 
                  placeholder="Enter weight in lbs"
                  style={{ fontSize: '16px' }}
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
                    width: '100%',
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
              
              <button onClick={() => {
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
                  setData((prev: DataType) => ({
                    ...prev,
                    progressPics: [...prev.progressPics, newPic],
                    tempBase64: null,
                    tempTimestamp: null,
                    activeModal: null,
                  }));
                }
              }}>
                Share
              </button>
              <button 
                className="secondary" 
                onClick={() => setData(prev => ({ ...prev, tempBase64: null, tempTimestamp: null }))}
              >
                Choose Different Photo
              </button>
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
                          EXIF.getData(img as any, function() {
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
                            setData(prev => ({ 
                              ...prev, 
                              tempBase64: base64, 
                              tempTimestamp: timestamp 
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
              <button className="secondary" onClick={closeModal}>Cancel</button>
            </>
          )}
        </div>
      </div>

      <div id="settings-modal" className={`modal ${activeModal === 'settings-modal' ? 'active' : ''}`}>
        <div className="modal-content" style={{
          maxWidth: '350px',
          background: 'var(--bg-dark)',
          borderRadius: '16px',
          padding: '20px',
        }}>
          <h2>Settings</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.9em' }}>
              Intensity Metric
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setData(prev => ({ ...prev, intensityMetric: 'rpe' }))}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: data.intensityMetric === 'rpe' ? 'var(--accent-primary)' : 'var(--bg-lighter)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9em',
                  cursor: 'pointer',
                }}
              >
                RPE
              </button>
              <button
                onClick={() => setData(prev => ({ ...prev, intensityMetric: 'rir' }))}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: data.intensityMetric === 'rir' ? 'var(--accent-primary)' : 'var(--bg-lighter)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9em',
                  cursor: 'pointer',
                }}
              >
                RIR
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.9em' }}>
              Theme
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setData(prev => ({ ...prev, theme: 'dark' }))}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: data.theme === 'dark' ? 'var(--accent-primary)' : 'var(--bg-lighter)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9em',
                  cursor: 'pointer',
                }}
              >
                🌙 Dark
              </button>
              <button
                onClick={() => setData(prev => ({ ...prev, theme: 'light' }))}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: data.theme === 'light' ? 'var(--accent-primary)' : 'var(--bg-lighter)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9em',
                  cursor: 'pointer',
                }}
              >
                ☀️ Light
              </button>
            </div>
          </div>
          
          <button onClick={closeModal} style={{ width: '100%' }}>Done</button>
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
              const index = pics.findIndex(p => p.base64 === selectedPhotoData);
              if (index !== -1 && window.confirm("Are you sure you want to delete this photo?")) {
                const newPics = [...pics];
                newPics.splice(index, 1);
                setData((prev: DataType) => ({
                  ...prev,
                  progressPics: newPics,
                  activeModal: 'progress-photo-modal',
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
            onClick={() => setData(prev => ({ ...prev, activeModal: 'progress-photo-modal' }))}
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