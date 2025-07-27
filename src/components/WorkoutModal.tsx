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
  isGlobalDragging: boolean;
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
  isGlobalDragging
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHolding, setIsHolding] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [localIsDragging, setLocalIsDragging] = useState(false);
  
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

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveExercise(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemType,
    item: () => {
      setLocalIsDragging(true);
      return { index: idx };
    },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      setLocalIsDragging(false);
    },
  });

  preview(drop(ref));

  // Apply drag to entire element
  useEffect(() => {
    if (ref.current) {
      drag(ref.current);
    }
  }, [drag]);

  const toggleCompleted = (setIdx: number) => {
    updateSet(idx, setIdx, 'completed', !ex.sets[setIdx].completed);
  };

  // Determine if this item should be minimized
  const isMinimized = isGlobalDragging || isHolding;

  // Orange "W" indicators for warm-up sets
  const warmupSets = ex.sets.filter(s => parseFloat(s.weight) < parseFloat(ex.sets.find(set => parseFloat(set.weight) > 0)?.weight || '0') * 0.9).length;

  return (
    <div 
      ref={ref} 
      className={`exercise-item ${isDragging ? 'dragging' : ''} ${isMinimized ? 'collapsed' : ''}`} 
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.15s ease-out',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isDragging ? '0 8px 24px rgba(59, 130, 246, 0.3)' : undefined,
        cursor: isGlobalDragging ? 'grab' : 'default',
        height: isMinimized ? '50px' : 'auto',
        overflow: 'hidden',
        padding: isMinimized ? '12px 15px' : '12px',
      }} 
      data-handler-id={handlerId}
    >
      <div className="exercise-name" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        height: isMinimized ? '26px' : 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {ex.name} {ex.subtype && <span style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>({ex.subtype})</span>}
        </div>
        {!isMinimized && (
          <span className="exercise-menu" onClick={(e) => openExerciseMenu(idx, e.currentTarget)}>⋯</span>
        )}
      </div>
      {!isMinimized && (
        <>
          <div className="set-table" style={{ marginTop: '12px' }}>
            <header>Set</header>
            <header>Previous</header>
            <header>lbs</header>
            <header>Reps</header>
            <header style={{ fontSize: '0.8em' }}>RPE</header>
            <header></header>
          </div>
          {ex.sets.map((s, sIdx) => {
            const isWarmup = sIdx < warmupSets;
            return (
              <div key={sIdx} className={`set-table ${s.completed ? 'completed-row' : ''}`}>
                <div style={{ 
                  fontWeight: '600',
                  color: isWarmup ? '#FF9500' : 'var(--text)',
                  fontSize: isWarmup ? '1.1em' : '1em',
                }}>
                  {isWarmup ? 'W' : sIdx + 1}
                </div>
                <div className="previous-set" style={{ fontSize: '0.85em', opacity: 0.7 }}>
                  {ex.previousSets?.[sIdx] || '—'}
                </div>
                <input 
                  value={s.weight} 
                  onChange={(e) => updateSet(idx, sIdx, 'weight', e.target.value)}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '1em',
                    fontWeight: '500',
                  }}
                />
                <input 
                  value={s.reps} 
                  onChange={(e) => updateSet(idx, sIdx, 'reps', e.target.value)}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '1em',
                    fontWeight: '500',
                  }}
                />
                <input 
                  value={s.rpe} 
                  onChange={(e) => updateSet(idx, sIdx, 'rpe', e.target.value)}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '0.9em',
                  }}
                />
                <div 
                  className={`log-square ${s.completed ? 'completed' : ''}`} 
                  onClick={() => toggleCompleted(sIdx)}
                  style={{
                    width: '28px',
                    height: '28px',
                    lineHeight: '28px',
                    fontSize: '1.1em',
                    border: s.completed ? 'none' : '2px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {s.completed ? '✓' : ''}
                </div>
              </div>
            );
          })}
          <button 
            className="add" 
            onClick={() => addSet(idx)}
            style={{
              marginTop: '12px',
              background: 'transparent',
              border: '1px dashed rgba(255, 255, 255, 0.3)',
              color: 'var(--text-muted)',
              padding: '8px',
              borderRadius: '8px',
              fontSize: '0.9em',
              fontWeight: '400',
              width: '100%',
            }}
          >
            + Add Set
          </button>
        </>
      )}
    </div>
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
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);

  useEffect(() => {
    if (currentWorkout) {
      const interval = setInterval(() => {
        setDuration(Date.now() - currentWorkout.startTime);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentWorkout]);

  // Monitor global drag state
  useEffect(() => {
    const handleDragStart = () => setIsGlobalDragging(true);
    const handleDragEnd = () => setIsGlobalDragging(false);
    
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    document.addEventListener('drop', handleDragEnd);
    
    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
      document.removeEventListener('drop', handleDragEnd);
    };
  }, []);

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
        isGlobalDragging={isGlobalDragging}
      />
    ));
  }, [currentWorkout, getPreviousSets, moveExercise, openExerciseMenu, updateSet, addSet, isGlobalDragging]);

  const cancelWorkout = () => {
    if (window.confirm("Are you sure you want to cancel this workout?")) {
      setData(prev => ({ ...prev, currentWorkout: null, activeModal: null, isWorkoutSelect: false, returnModal: null }));
    }
  };
  
  const finishWorkout = () => setData(prev => ({ ...prev, activeModal: 'feedback-modal' }));
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
        maxWidth: '100%',
        background: '#000',
        padding: '0',
        borderRadius: '20px 20px 0 0',
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
        style={{
          padding: '12px',
          cursor: 'grab',
        }}
      >
        <div className="drag-indicator" style={{
          width: '40px',
          height: '4px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '2px',
          margin: '0 auto',
        }}></div>
      </div>
      
      <div style={{ padding: '0 20px 20px' }}>
        <div className="workout-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          gap: '10px',
        }}>
          <span 
            className="back-button" 
            onClick={cancelWorkout}
            style={{
              fontSize: '1.2em',
              padding: '8px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            ←
          </span>
          <input
            type="text"
            id="workout-name-input"
            value={currentWorkout?.name || ''}
            onChange={(e) => setData(prev => ({ ...prev, currentWorkout: { ...prev.currentWorkout!, name: e.target.value } }))}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.3em',
              fontWeight: '600',
              textAlign: 'center',
              flex: 1,
              padding: '0',
              color: 'white',
            }}
          />
          <button 
            className="finish" 
            onClick={finishWorkout}
            style={{
              background: '#22C55E',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '10px 20px',
              fontSize: '1em',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Finish
          </button>
        </div>
        
        <div className="workout-info" style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          fontSize: '0.9em',
          color: 'rgba(255,255,255,0.6)',
        }}>
          <div className="workout-date">📅 {new Date().toLocaleDateString()}</div>
          <div className="workout-timer">⏱ {formattedTime}</div>
        </div>
        
        <div id="workout-exercises" style={{ marginBottom: '20px' }}>
          {renderedExercises}
        </div>
        
        <button 
          className="add-exercise" 
          onClick={addExerciseToWorkout}
          style={{
            width: '100%',
            padding: '15px',
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1em',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          Add Exercises
        </button>
        <button 
          className="cancel-workout" 
          onClick={cancelWorkout}
          style={{
            width: '100%',
            padding: '15px',
            background: '#DC2626',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1em',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Cancel Workout
        </button>
      </div>
      
      {/* Inline Exercise Menu */}
      {inlineMenuPosition && !isGlobalDragging && (
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