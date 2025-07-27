import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { useDrag, useDrop, DragSourceMonitor } from 'react-dnd';
import { DataContext } from '../DataContext';

const ItemType = 'EXERCISE';

interface Set {
  weight: string;
  reps: string;
  rpe: string;
  completed: boolean;
}

interface Exercise {
  name: string;
  subtype?: string;
  muscles?: string;
  sets: Set[];
  previousSets?: string[];
}

interface Workout {
  name: string;
  exercises: Exercise[];
  startTime: number;
  duration: number;
}

interface WorkoutExerciseItemProps {
  ex: Exercise;
  idx: number;
  moveExercise: (dragIndex: number, hoverIndex: number) => void;
  openExerciseMenu: (idx: number, element: HTMLElement) => void;
  updateSet: (exIdx: number, setIdx: number, field: keyof Set, value: any) => void;
  addSet: (exIdx: number) => void;
}

interface DragItem {
  index: number;
  type: string;
}

const WorkoutExerciseItem: React.FC<WorkoutExerciseItemProps> = ({ 
  ex, 
  idx, 
  moveExercise, 
  openExerciseMenu, 
  updateSet, 
  addSet
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState<number | null>(null);
  
  const [{ handlerId, isOver }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null; isOver: boolean }>({
    accept: ItemType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = idx;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

      // Determine placeholder position
      if (hoverClientY < hoverMiddleY && dragIndex !== hoverIndex - 1) {
        setPlaceholderIndex(hoverIndex);
      } else if (hoverClientY >= hoverMiddleY && dragIndex !== hoverIndex + 1) {
        setPlaceholderIndex(hoverIndex + 1);
      }

      // Only perform the move when the mouse has crossed half of the item's height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveExercise(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    drop() {
      setPlaceholderIndex(null);
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemType,
    item: () => {
      return { index: idx };
    },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Use preview for the drag preview and drag for the drag handle
  preview(drop(ref));

  // Clear placeholder when not hovering
  useEffect(() => {
    if (!isOver) {
      setPlaceholderIndex(null);
    }
  }, [isOver]);

  const toggleCompleted = (setIdx: number) => {
    updateSet(idx, setIdx, 'completed', !ex.sets[setIdx].completed);
  };

  const dragHandleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (dragHandleRef.current) {
      drag(dragHandleRef.current);
    }
  }, [drag]);

  return (
    <>
      {placeholderIndex === idx && isDragging && (
        <div style={{ 
          height: '60px', 
          background: 'var(--accent-primary)', 
          opacity: 0.2,
          borderRadius: '8px',
          marginBottom: '8px',
          transition: 'all 0.2s ease-out'
        }} />
      )}
      <div 
        ref={ref} 
        className={`exercise-item ${isDragging ? 'dragging collapsed' : ''}`} 
        style={{ 
          opacity: isDragging ? 0.5 : 1,
          transition: isDragging ? 'none' : 'all 0.2s ease-out',
          transform: isDragging ? 'scale(0.95)' : 'scale(1)',
        }} 
        data-handler-id={handlerId}
      >
        <div className="exercise-name">
          <div ref={dragHandleRef} style={{ cursor: isDragging ? 'grabbing' : 'grab', marginRight: '10px', display: 'inline-block' }}>☰</div>
          {ex.name} {ex.subtype && `(${ex.subtype})`}
          <span className="exercise-menu" onClick={(e) => openExerciseMenu(idx, e.currentTarget)}>⋯</span>
        </div>
        {!isDragging && (
          <>
            <div className="set-table">
              <header>Set</header>
              <header>Previous</header>
              <header>lbs</header>
              <header>Reps</header>
              <header>RPE</header>
              <header></header>
            </div>
            {ex.sets.map((s, sIdx) => (
              <div key={sIdx} className={`set-table ${s.completed ? 'completed-row' : ''}`}>
                <div>{sIdx + 1}</div>
                <div className="previous-set">{ex.previousSets?.[sIdx] || '-'}</div>
                <input value={s.weight} onChange={(e) => updateSet(idx, sIdx, 'weight', e.target.value)} />
                <input value={s.reps} onChange={(e) => updateSet(idx, sIdx, 'reps', e.target.value)} />
                <input value={s.rpe} onChange={(e) => updateSet(idx, sIdx, 'rpe', e.target.value)} />
                <div className={`log-square ${s.completed ? 'completed' : ''}`} onClick={() => toggleCompleted(sIdx)}>{s.completed ? '✔' : ''}</div>
              </div>
            ))}
            <button className="add" onClick={() => addSet(idx)}>Add Set</button>
          </>
        )}
      </div>
      {placeholderIndex === idx + 1 && isDragging && idx === (ref.current?.parentElement?.children.length ?? 0) - 1 && (
        <div style={{ 
          height: '60px', 
          background: 'var(--accent-primary)', 
          opacity: 0.2,
          borderRadius: '8px',
          marginTop: '8px',
          transition: 'all 0.2s ease-out'
        }} />
      )}
    </>
  );
};

const WorkoutModal: React.FC = () => {
  const { data, setData } = useContext(DataContext);
  const currentWorkout = data.currentWorkout;
  const [duration, setDuration] = useState<number>(0);
  const [inlineMenuPosition, setInlineMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [menuExerciseIdx, setMenuExerciseIdx] = useState<number | null>(null);

  useEffect(() => {
    if (currentWorkout) {
      const interval = setInterval(() => {
        setDuration(Date.now() - currentWorkout.startTime);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentWorkout]);

  // Close inline menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.inline-exercise-menu') && !target.classList.contains('exercise-menu')) {
        setInlineMenuPosition(null);
        setMenuExerciseIdx(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);



  const moveExercise = (dragIndex: number, hoverIndex: number) => {
    if (!currentWorkout) return;
    const draggedExercise = currentWorkout.exercises[dragIndex];
    const newExercises = [...currentWorkout.exercises];
    newExercises.splice(dragIndex, 1);
    newExercises.splice(hoverIndex, 0, draggedExercise);
    setData(prev => ({ ...prev, currentWorkout: { ...prev.currentWorkout!, exercises: newExercises } }));
  };

  const openExerciseMenu = (idx: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const modalContent = element.closest('.modal-content');
    const modalRect = modalContent?.getBoundingClientRect();
    
    if (modalRect) {
      setInlineMenuPosition({
        top: rect.top - modalRect.top + rect.height,
        left: rect.left - modalRect.left - 150, // Position to the left of the dots
      });
      setMenuExerciseIdx(idx);
    }
  };

  const deleteExercise = () => {
    if (menuExerciseIdx !== null && currentWorkout) {
      const newExercises = [...currentWorkout.exercises];
      newExercises.splice(menuExerciseIdx, 1);
      setData(prev => ({
        ...prev,
        currentWorkout: {
          ...prev.currentWorkout!,
          exercises: newExercises,
        },
      }));
      setInlineMenuPosition(null);
      setMenuExerciseIdx(null);
    }
  };

  const deleteLastSet = () => {
    if (menuExerciseIdx !== null && currentWorkout) {
      const newExercises = [...currentWorkout.exercises];
      if (newExercises[menuExerciseIdx].sets.length > 1) {
        newExercises[menuExerciseIdx].sets.pop();
        setData(prev => ({
          ...prev,
          currentWorkout: {
            ...prev.currentWorkout!,
            exercises: newExercises,
          },
        }));
      }
      setInlineMenuPosition(null);
      setMenuExerciseIdx(null);
    }
  };

  const updateSet = (exIdx: number, setIdx: number, field: keyof Set, value: any) => {
    if (!currentWorkout) return;
    const newExercises = [...currentWorkout.exercises];
    const newSets = [...newExercises[exIdx].sets];
    newSets[setIdx] = { ...newSets[setIdx], [field]: value };
    newExercises[exIdx] = { ...newExercises[exIdx], sets: newSets };
    setData(prev => ({ ...prev, currentWorkout: { ...prev.currentWorkout!, exercises: newExercises } }));
  };

  const addSet = (exIdx: number) => {
    if (!currentWorkout) return;
    const newExercises = [...currentWorkout.exercises];
    newExercises[exIdx].sets = [...newExercises[exIdx].sets, { weight: '', reps: '', rpe: '', completed: false }];
    setData(prev => ({ ...prev, currentWorkout: { ...prev.currentWorkout!, exercises: newExercises } }));
  };

  const getPreviousSets = (ex: Exercise): string[] => {
    const previous: string[] = [];
    for (let i = data.history.length - 1; i >= 0; i--) {
      const workout = data.history[i];
      const matchingEx = workout.exercises.find(e => e.name === ex.name && (e.subtype || '') === (ex.subtype || ''));
      if (matchingEx && matchingEx.sets) {
        matchingEx.sets.forEach(s => previous.push(`${s.weight || '-'} x ${s.reps || '-'} @ ${s.rpe || '-'}`));
        return previous;
      }
    }
    return Array(ex.sets.length).fill('-');
  };

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [duration]);

  const renderedExercises = useMemo(() => {
    if (!currentWorkout) return null;
    return currentWorkout.exercises.map((ex, idx) => (
      <WorkoutExerciseItem
        key={`${ex.name}-${ex.subtype}-${idx}`}
        ex={{ ...ex, previousSets: getPreviousSets(ex) }}
        idx={idx}
        moveExercise={moveExercise}
        openExerciseMenu={openExerciseMenu}
        updateSet={updateSet}
        addSet={addSet}
      />
    ));
  }, [currentWorkout, data.history]);

  const cancelWorkout = () => {
    if (window.confirm("Are you sure you want to cancel this workout?")) {
      setData(prev => ({ ...prev, currentWorkout: null, activeModal: null, isWorkoutSelect: false }));
    }
  };
  
  const finishWorkout = () => setData(prev => ({ ...prev, activeModal: 'feedback-modal' }));
  const minimizeWorkout = () => setData(prev => ({ ...prev, activeModal: null }));
  const addExerciseToWorkout = () => setData(prev => ({ ...prev, isWorkoutSelect: true, returnModal: 'workout-modal', activeModal: 'exercise-select-modal' }));

  if (!currentWorkout) return null;

  return (
    <div className="modal-content" style={{ position: 'relative' }}>
      <div className="workout-header">
        <span className="back-button" onClick={cancelWorkout}>←</span>
        <input
          type="text"
          id="workout-name-input"
          value={currentWorkout?.name || ''}
          onChange={(e) => setData(prev => ({ ...prev, currentWorkout: { ...prev.currentWorkout!, name: e.target.value } }))}
        />
        <button className="finish" onClick={finishWorkout}>Finish</button>
        <span className="minimize-button" onClick={minimizeWorkout}>▼</span>
      </div>
      <div className="workout-info">
        <div className="workout-date">📅 {new Date().toLocaleDateString()}</div>
        <div className="workout-timer">⏱ {formattedTime}</div>
      </div>
      <div id="workout-exercises" style={{ transition: 'all 0.2s ease-out' }}>
        {renderedExercises}
      </div>
      <button className="add-exercise" onClick={addExerciseToWorkout}>Add Exercise</button>
      <button className="cancel-workout" onClick={cancelWorkout}>Cancel Workout</button>
      
      {/* Inline Exercise Menu */}
      {inlineMenuPosition && (
        <div 
          className="inline-exercise-menu" 
          style={{
            position: 'absolute',
            top: `${inlineMenuPosition.top}px`,
            left: `${inlineMenuPosition.left}px`,
            background: 'var(--bg-lighter)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            padding: '8px',
            zIndex: 1000,
            minWidth: '150px',
          }}
        >
          <div 
            style={{
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.2s',
              fontSize: '0.9em',
            }}
            onClick={deleteExercise}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-light)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Delete Exercise
          </div>
          <div 
            style={{
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.2s',
              fontSize: '0.9em',
            }}
            onClick={deleteLastSet}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-light)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Delete Last Set
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutModal;