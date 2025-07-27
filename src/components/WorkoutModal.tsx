import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react';
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

interface WorkoutExerciseItemProps {
  ex: Exercise;
  idx: number;
  moveExercise: (dragIndex: number, hoverIndex: number) => void;
  openExerciseMenu: (idx: number, element: HTMLElement) => void;
  updateSet: (exIdx: number, setIdx: number, field: keyof Set, value: any) => void;
  addSet: (exIdx: number) => void;
  isReordering: boolean;
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
  addSet,
  isReordering
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState<number | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const { setData } = useContext(DataContext);
  
  // Long press handling
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      // Trigger reordering mode in parent
      setData(prev => ({ ...prev, isReordering: true }));
    }, 500); // 500ms for long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setIsLongPress(false);
  };

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

      if (hoverClientY < hoverMiddleY && dragIndex !== hoverIndex - 1) {
        setPlaceholderIndex(hoverIndex);
      } else if (hoverClientY >= hoverMiddleY && dragIndex !== hoverIndex + 1) {
        setPlaceholderIndex(hoverIndex + 1);
      }

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
    canDrag: isReordering,
  });

  preview(drop(ref));

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
    if (dragHandleRef.current && isReordering) {
      drag(dragHandleRef.current);
    }
  }, [drag, isReordering]);

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
        className={`exercise-item ${isDragging ? 'dragging' : ''} ${isReordering ? 'collapsed' : ''} ${isLongPress ? 'long-press' : ''}`} 
        style={{ 
          opacity: isDragging ? 0.5 : 1,
          transition: isDragging ? 'none' : 'all 0.2s ease-out',
          transform: isDragging ? 'scale(1.05)' : isLongPress ? 'scale(1.02)' : 'scale(1)',
          boxShadow: isLongPress ? '0 8px 24px rgba(0,0,0,0.4)' : undefined,
        }} 
        data-handler-id={handlerId}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
      >
        <div className="exercise-name">
          {isReordering && (
            <div ref={dragHandleRef} style={{ cursor: 'grab', marginRight: '10px', display: 'inline-block' }}>☰</div>
          )}
          {ex.name} {ex.subtype && `(${ex.subtype})`}
          {!isReordering && (
            <span className="exercise-menu" onClick={(e) => openExerciseMenu(idx, e.currentTarget)}>⋯</span>
          )}
        </div>
        {!isReordering && (
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
                <input 
                  value={s.weight} 
                  onChange={(e) => updateSet(idx, sIdx, 'weight', e.target.value)}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <input 
                  value={s.reps} 
                  onChange={(e) => updateSet(idx, sIdx, 'reps', e.target.value)}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <input 
                  value={s.rpe} 
                  onChange={(e) => updateSet(idx, sIdx, 'rpe', e.target.value)}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
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
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [modalTransform, setModalTransform] = useState(0);
  const isReordering = data.isReordering || false;

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

  // Handle drag to minimize
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setCurrentY(clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setCurrentY(clientY);
    const deltaY = clientY - startY;
    
    // Only allow downward drag
    if (deltaY > 0) {
      setModalTransform(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const deltaY = currentY - startY;
    
    // If dragged more than 100px, minimize
    if (deltaY > 100) {
      setData(prev => ({ ...prev, activeModal: null }));
    }
    
    // Reset transform
    setModalTransform(0);
  };

  // Stop reordering when clicking Done
  const stopReordering = () => {
    setData(prev => ({ ...prev, isReordering: false }));
  };

  const moveExercise = useCallback((dragIndex: number, hoverIndex: number) => {
    if (!currentWorkout) return;
    const draggedExercise = currentWorkout.exercises[dragIndex];
    const newExercises = [...currentWorkout.exercises];
    newExercises.splice(dragIndex, 1);
    newExercises.splice(hoverIndex, 0, draggedExercise);
    setData(prev => ({ ...prev, currentWorkout: { ...prev.currentWorkout!, exercises: newExercises } }));
  }, [currentWorkout, setData]);

  const openExerciseMenu = (idx: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const modalContent = element.closest('.modal-content');
    const modalRect = modalContent?.getBoundingClientRect();
    
    if (modalRect) {
      setInlineMenuPosition({
        top: rect.top - modalRect.top + rect.height,
        left: rect.left - modalRect.left - 150,
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

  const updateSet = useCallback((exIdx: number, setIdx: number, field: keyof Set, value: any) => {
    if (!currentWorkout) return;
    const newExercises = [...currentWorkout.exercises];
    const newSets = [...newExercises[exIdx].sets];
    newSets[setIdx] = { ...newSets[setIdx], [field]: value };
    newExercises[exIdx] = { ...newExercises[exIdx], sets: newSets };
    setData(prev => ({ ...prev, currentWorkout: { ...prev.currentWorkout!, exercises: newExercises } }));
  }, [currentWorkout, setData]);

  const addSet = useCallback((exIdx: number) => {
    if (!currentWorkout) return;
    const newExercises = [...currentWorkout.exercises];
    newExercises[exIdx].sets = [...newExercises[exIdx].sets, { weight: '', reps: '', rpe: '', completed: false }];
    setData(prev => ({ ...prev, currentWorkout: { ...prev.currentWorkout!, exercises: newExercises } }));
  }, [currentWorkout, setData]);

  const getPreviousSets = useCallback((ex: Exercise): string[] => {
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
  }, [data.history]);

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
        isReordering={isReordering}
      />
    ));
  }, [currentWorkout, getPreviousSets, moveExercise, openExerciseMenu, updateSet, addSet, isReordering]);

  const cancelWorkout = () => {
    if (window.confirm("Are you sure you want to cancel this workout?")) {
      setData(prev => ({ ...prev, currentWorkout: null, activeModal: null, isWorkoutSelect: false, returnModal: null, isReordering: false }));
    }
  };
  
  const finishWorkout = () => setData(prev => ({ ...prev, activeModal: 'feedback-modal', isReordering: false }));
  const addExerciseToWorkout = () => setData(prev => ({ ...prev, isWorkoutSelect: true, activeModal: 'exercise-select-modal' }));

  if (!currentWorkout) return null;

  return (
    <div 
      className="modal-content workout-modal-content" 
      ref={modalRef}
      style={{ 
        position: 'relative',
        transform: `translateY(${modalTransform}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
      }}
    >
      <div 
        className="drag-handle"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        <div className="drag-indicator"></div>
      </div>
      
      <div className="workout-header">
        <span className="back-button" onClick={cancelWorkout}>←</span>
        <input
          type="text"
          id="workout-name-input"
          value={currentWorkout?.name || ''}
          onChange={(e) => setData(prev => ({ ...prev, currentWorkout: { ...prev.currentWorkout!, name: e.target.value } }))}
        />
        {isReordering ? (
          <button className="done" onClick={stopReordering}>Done</button>
        ) : (
          <button className="finish" onClick={finishWorkout}>Finish</button>
        )}
      </div>
      
      <div className="workout-info">
        <div className="workout-date">📅 {new Date().toLocaleDateString()}</div>
        <div className="workout-timer">⏱ {formattedTime}</div>
      </div>
      
      <div id="workout-exercises" style={{ transition: 'all 0.2s ease-out' }}>
        {renderedExercises}
      </div>
      
      {!isReordering && (
        <>
          <button className="add-exercise" onClick={addExerciseToWorkout}>Add Exercise</button>
          <button className="cancel-workout" onClick={cancelWorkout}>Cancel Workout</button>
        </>
      )}
      
      {/* Inline Exercise Menu */}
      {inlineMenuPosition && !isReordering && (
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