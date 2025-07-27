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
  onDragStart: () => void;
  onDragEnd: () => void;
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
  isGlobalDragging,
  onDragStart,
  onDragEnd
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

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: () => {
      return { index: idx };
    },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Enable drag when holding
  useEffect(() => {
    if (isHolding) {
      drag(drop(ref));
    } else {
      drop(ref);
    }
  }, [isHolding, drag, drop]);

  // Handle drag state changes
  useEffect(() => {
    if (isDragging && !localIsDragging) {
      setLocalIsDragging(true);
      onDragStart();
    } else if (!isDragging && localIsDragging) {
      setLocalIsDragging(false);
      setIsHolding(false);
      onDragEnd();
    }
  }, [isDragging, localIsDragging, onDragStart, onDragEnd]);

  // Handle long press
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    longPressTimer.current = setTimeout(() => {
      setIsHolding(true);
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }, 500); // 500ms hold time
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    if (!isDragging) {
      setIsHolding(false);
    }
  };

  const toggleCompleted = (setIdx: number) => {
    updateSet(idx, setIdx, 'completed', !ex.sets[setIdx].completed);
  };

  // Count warm-up sets
  const maxWeight = Math.max(...ex.sets.map(s => parseFloat(s.weight) || 0));
  const warmupSets = ex.sets.filter(s => (parseFloat(s.weight) || 0) < maxWeight * 0.9).length;

  // Collapsed state when any exercise is being dragged
  const isCollapsed = isGlobalDragging && !isDragging;

  return (
    <div 
      ref={ref}
      className={`exercise-item ${isDragging ? 'dragging' : ''} ${isCollapsed ? 'collapsed' : ''} ${isHolding ? 'holding' : ''}`} 
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(1.05)' : isHolding ? 'scale(0.98)' : 'scale(1)',
        boxShadow: isDragging ? '0 8px 32px rgba(59, 130, 246, 0.5)' : isHolding ? '0 4px 16px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: isCollapsed ? 'all 0.3s ease' : 'all 0.2s ease',
        height: isCollapsed ? '60px' : 'auto',
        overflow: 'hidden',
        background: isDragging ? 'rgba(59, 130, 246, 0.1)' : isHolding ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.02)',
        border: isDragging ? '2px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
      }} 
      data-handler-id={handlerId}
    >
      <div 
        className="exercise-header" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '12px 16px',
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div className="exercise-name" style={{ fontSize: '1.1em', fontWeight: '600' }}>
            {ex.name} 
            {ex.subtype && <span style={{ color: 'var(--accent-blue)', fontSize: '0.9em', marginLeft: '8px' }}>({ex.subtype})</span>}
          </div>
        </div>
        {!isCollapsed && (
          <span className="exercise-menu" onClick={(e) => {
            e.stopPropagation();
            openExerciseMenu(idx, e.currentTarget);
          }} style={{ fontSize: '1.2em', padding: '8px', color: 'var(--text-muted)' }}>⋯</span>
        )}
      </div>
      {!isCollapsed && (
        <div style={{ padding: '0 16px 16px' }}>
          <div className="set-table-header" style={{ 
            display: 'grid',
            gridTemplateColumns: '40px 80px 60px 50px 40px 40px',
            gap: '8px',
            marginBottom: '12px',
            fontSize: '0.7em',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: '600',
            paddingLeft: '4px',
          }}>
            <div>Set</div>
            <div style={{ textAlign: 'center' }}>Previous</div>
            <div style={{ textAlign: 'center' }}>lbs</div>
            <div style={{ textAlign: 'center' }}>Reps</div>
            <div style={{ textAlign: 'center' }}>RPE</div>
            <div></div>
          </div>
          {ex.sets.map((s, sIdx) => {
            const isWarmup = sIdx < warmupSets;
            return (
              <div key={sIdx} className={`set-row ${s.completed ? 'completed-row' : ''}`} style={{
                display: 'grid',
                gridTemplateColumns: '40px 80px 60px 50px 40px 40px',
                gap: '8px',
                marginBottom: '8px',
                alignItems: 'center',
                padding: '2px 4px',
                borderRadius: '8px',
                background: s.completed ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
              }}>
                <div style={{ 
                  fontWeight: '700',
                  color: isWarmup ? '#FF9500' : s.completed ? '#22C55E' : 'white',
                  fontSize: '0.9em',
                }}>
                  {isWarmup ? 'W' : sIdx - warmupSets + 1}
                </div>
                <div style={{ 
                  textAlign: 'center',
                  fontSize: '0.75em', 
                  color: 'rgba(255, 255, 255, 0.4)',
                }}>
                  {ex.previousSets?.[sIdx] || '—'}
                </div>
                <input 
                  value={s.weight} 
                  onChange={(e) => updateSet(idx, sIdx, 'weight', e.target.value)}
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '0.85em',
                    fontWeight: '500',
                    color: 'white',
                    padding: '6px 2px',
                    minHeight: '32px',
                  }}
                />
                <input 
                  value={s.reps} 
                  onChange={(e) => updateSet(idx, sIdx, 'reps', e.target.value)}
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '0.85em',
                    fontWeight: '500',
                    color: 'white',
                    padding: '6px 2px',
                    minHeight: '32px',
                  }}
                />
                <input 
                  value={s.rpe} 
                  onChange={(e) => updateSet(idx, sIdx, 'rpe', e.target.value)}
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder="0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '0.85em',
                    color: 'white',
                    padding: '6px 2px',
                    minHeight: '32px',
                  }}
                />
                <div 
                  className={`log-square ${s.completed ? 'completed' : ''}`} 
                  onClick={() => toggleCompleted(sIdx)}
                  style={{
                    width: '28px',
                    height: '28px',
                    margin: '0 auto',
                    borderRadius: '8px',
                    border: s.completed ? 'none' : '2px solid rgba(255, 255, 255, 0.2)',
                    background: s.completed ? '#22C55E' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: 'white',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {s.completed ? '✓' : ''}
                </div>
              </div>
            );
          })}
          <button 
            className="add-set-btn" 
            onClick={() => addSet(idx)}
            style={{
              marginTop: '12px',
              background: 'transparent',
              border: '1px dashed rgba(255, 255, 255, 0.2)',
              color: 'rgba(255, 255, 255, 0.5)',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '0.85em',
              fontWeight: '500',
              width: '100%',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minHeight: '36px',
            }}
          >
            + Add Set
          </button>
        </div>
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
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [modalTransform, setModalTransform] = useState(0);
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    if (currentWorkout) {
      const interval = setInterval(() => {
        setDuration(Date.now() - currentWorkout.startTime);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentWorkout]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (data.activeModal === 'workout-modal' && currentWorkout) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [data.activeModal, currentWorkout]);

  // Handle drag start/end
  const handleDragStart = useCallback(() => {
    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setIsGlobalDragging(true);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setTimeout(() => {
        setIsGlobalDragging(false);
      }, 100);
    }
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
    const modalContent = element.closest('.workout-modal-content');
    const modalRect = modalContent?.getBoundingClientRect();
    
    if (modalRect) {
      setInlineMenuPosition({
        top: rect.top - modalRect.top + rect.height + 4,
        left: rect.left - modalRect.left - 120,
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
        matchingEx.sets.forEach(s => previous.push(`${s.weight || '0'}×${s.reps || '0'}`));
        return previous;
      }
    }
    return Array(ex.sets.length).fill('—');
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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />
    ));
  }, [currentWorkout, getPreviousSets, moveExercise, openExerciseMenu, updateSet, addSet, isGlobalDragging, handleDragStart, handleDragEnd]);

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
      ref={modalContentRef}
      style={{ 
        position: 'relative',
        transform: `translateY(${modalTransform}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        maxWidth: '100%',
        width: '100%',
        height: '100vh',
        background: '#0A0A0A',
        padding: '0',
        borderRadius: '20px 20px 0 0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
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
          background: '#0A0A0A',
        }}
      >
        <div className="drag-indicator" style={{
          width: '36px',
          height: '5px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '3px',
          margin: '0 auto',
        }}></div>
      </div>
      
      <div style={{ 
        flex: 1,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '0 16px 100px',
      }}>
        <div className="workout-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          gap: '12px',
        }}>
          <button 
            className="back-button" 
            onClick={cancelWorkout}
            style={{
              fontSize: '24px',
              padding: '8px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
              color: 'white',
            }}
          >
            ←
          </button>
          <input
            type="text"
            id="workout-name-input"
            value={currentWorkout?.name || ''}
            onChange={(e) => setData(prev => ({ ...prev, currentWorkout: { ...prev.currentWorkout!, name: e.target.value } }))}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.2em',
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
              borderRadius: '24px',
              padding: '12px 24px',
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
          marginBottom: '24px',
          fontSize: '0.9em',
          color: 'rgba(255,255,255,0.5)',
        }}>
          <div className="workout-date">📅 {new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</div>
          <div className="workout-timer">⏱ {formattedTime}</div>
        </div>
        
        <div id="workout-exercises">
          {renderedExercises}
        </div>
        
        <button 
          className="add-exercise" 
          onClick={addExerciseToWorkout}
          style={{
            width: '100%',
            padding: '16px',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#3B82F6',
            border: 'none',
            borderRadius: '16px',
            fontSize: '1em',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '20px',
            marginBottom: '16px',
          }}
        >
          Add Exercises
        </button>
        <button 
          className="cancel-workout" 
          onClick={cancelWorkout}
          style={{
            width: '100%',
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            border: 'none',
            borderRadius: '16px',
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
            background: '#1a1a1a',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            padding: '8px',
            zIndex: 1000,
            minWidth: '160px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div 
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.2s',
              fontSize: '0.9em',
              color: 'white',
            }}
            onClick={deleteExercise}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Delete Exercise
          </div>
          <div 
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.2s',
              fontSize: '0.9em',
              color: 'white',
            }}
            onClick={deleteLastSet}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
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