import React, { useContext, useState, useEffect, useMemo, useRef } from 'react';
import { DataContext, DataType, Exercise } from '../DataContext';
import WorkoutModal from './WorkoutModal';

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
        
        // Check if either name or subtype starts with the query
        return name.startsWith(query) || subtype.startsWith(query);
      });
    }
    
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    if (filtered.length === 0 && query) {
      return [<div key="no-results" className="feed-placeholder" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No exercises found starting with "{query}"</div>];
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
      setData((prev: DataType) => ({
        ...prev,
        customExercises: [...prev.customExercises, newExercise],
        activeModal: null,
      }));
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
    const pump = (document.getElementById('pump-select') as HTMLSelectElement)?.value || '';
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
      setData((prev: DataType) => ({
        ...prev,
        history: [...prev.history, finishedWorkout],
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
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    minimizedStartY.current = clientY;
    setIsDraggingMinimized(true);
  };

  const handleMinimizedTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingMinimized) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = minimizedStartY.current - clientY;
    
    // Only allow upward drag
    if (deltaY > 0) {
      setMinimizedDragY(-deltaY);
    }
  };

  const handleMinimizedTouchEnd = () => {
    if (!isDraggingMinimized) return;
    setIsDraggingMinimized(false);
    
    const deltaY = -minimizedDragY;
    
    // If dragged up more than 50px, maximize
    if (deltaY > 50) {
      setData(prev => ({ ...prev, activeModal: 'workout-modal' }));
    }
    
    // Reset transform
    setMinimizedDragY(0);
  };

  return (
    <>
      <div id="program-modal" className={`modal ${activeModal === 'program-modal' ? 'active' : ''}`}>
        <div className="modal-content">
          <h2>Create Program</h2>
          <input type="text" id="program-name" placeholder="Program Name (e.g., PUSH PULL LEGS)" />
          <input
            type="number"
            id="mesocycle-length"
            placeholder="Mesocycle Length (weeks)"
            min="4"
            max="12"
            onInput={generateWeeks}
          />
          <button onClick={addWeek}>Add Week</button>
          <div id="program-weeks">{renderProgramWeeks}</div>
          <button onClick={saveProgram}>Save</button>
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
          <input type="text" id="day-name" placeholder="Day Name (e.g., Push Day)" />
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
      
      <div id="minimized-workout" 
        className={`minimized-workout ${data.currentWorkout && activeModal !== 'workout-modal' ? '' : 'hidden'}`}
        style={{
          position: 'fixed',
          bottom: '60px',
          left: '0',
          right: '0',
          width: '100%',
          maxWidth: '428px',
          margin: '0 auto',
          background: 'var(--bg-light)',
          borderRadius: '16px 16px 0 0',
          padding: '12px 16px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
          borderTop: '1px solid var(--border)',
          cursor: 'grab',
          transition: isDraggingMinimized ? 'none' : 'transform 0.3s ease',
          transform: `translateY(${minimizedDragY}px)`,
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
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
          margin: '0 auto 4px', 
          width: '40px', 
          height: '4px', 
          background: 'rgba(255,255,255,0.3)', 
          borderRadius: '2px' 
        }}></div>
        <div style={{
          fontSize: '0.9em',
          fontWeight: '600',
          color: 'white',
          textAlign: 'center',
        }}>
          {data.currentWorkout?.name || 'Workout in Progress'}
        </div>
        <div style={{
          fontSize: '0.8em',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}>
          Swipe up to resume
        </div>
      </div>
      
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
          <select id="pump-select" className="feedback-select">
            <option value="">Pump?</option>
            <option value="1">1 - None</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5 - Insane</option>
          </select>
          <select id="soreness-select" className="feedback-select">
            <option value="">Soreness?</option>
            <option value="1">1 - None</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5 - Very Sore</option>
          </select>
          <select id="workload-select" className="feedback-select">
            <option value="">Workload?</option>
            <option value="1">1 - Very Easy</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5 - Very Hard</option>
          </select>
          <select id="suggestion-select" className="feedback-select">
            <option value="">Next Time?</option>
            <option value="increase">Increase Weight/Reps</option>
            <option value="maintain">Keep Same</option>
            <option value="decrease">Decrease Weight/Reps</option>
          </select>
          <button onClick={finishWorkout}>Finish</button>
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
        <div className="modal-content">
          <h2>Program Options</h2>
          <button className="secondary" onClick={() => {
            if (data.currentProgName && window.confirm("Are you sure you want to delete this program?")) {
              const newTemplates = data.templates.filter((t: Template) => t.name !== data.currentProgName);
              setData((prev: DataType) => ({
                ...prev,
                templates: newTemplates,
                activeModal: null,
              }));
            }
          }}>Delete Program</button>
          <button onClick={closeModal}>Cancel</button>
        </div>
      </div>
      
      <div id="update-modal" className={`modal ${activeModal === 'update-modal' ? 'active' : ''}`}>
        <div className="modal-content">
          <h2>Update Available</h2>
          <p>A new version of Simit Tracker is available!</p>
          <button className="update-button" onClick={() => window.location.reload()}>Update Now</button>
          <button className="secondary" onClick={closeModal}>Later</button>
        </div>
      </div>
    </>
  );
};

export default Modals;