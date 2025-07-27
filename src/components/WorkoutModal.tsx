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

// Rest Timer Component
const RestTimer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const restOptions = [
    { label: '30s', value: 30 },
    { label: '45s', value: 45 },
    { label: '1m', value: 60 },
    { label: '1.5m', value: 90 },
    { label: '2m', value: 120 },
  ];

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            // Timer finished
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeLeft]);

  const startTimer = (seconds: number) => {
    setSelectedTime(seconds);
    setTimeLeft(seconds);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#1a1a1a',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      zIndex: 2000,
      minWidth: '280px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1em' }}>Rest Timer</h3>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '1.2em',
            cursor: 'pointer',
            padding: '4px',
            minHeight: 'auto',
          }}
        >
          ×
        </button>
      </div>
      
      {timeLeft === null ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {restOptions.map(option => (
            <button
              key={option.value}
              onClick={() => startTimer(option.value)}
              style={{
                padding: '12px 20px',
                background: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9em',
                fontWeight: '600',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '3em',
            fontWeight: '700',
            color: timeLeft <= 10 ? '#ef4444' : 'var(--accent-primary)',
            marginBottom: '20px',
          }}>
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => setTimeLeft(null)}
            style={{
              padding: '10px 24px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9em',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Stop
          </button>
        </div>
      )}
    </div>
  );
};

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
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDraggingTouch, setIsDraggingTouch] = useState(false);
  const [currentTouchY, setCurrentTouchY] = useState(0);
  
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
    canDrag: isHolding && !isDraggingTouch,
    end: () => {
      setIsHolding(false);
      onDragEnd();
    },
  });

  // Enable drag when holding
  useEffect(() => {
    if (isHolding && !localIsDragging && !isDraggingTouch) {
      drag(drop(ref));
    } else if (!isHolding) {
      drop(ref);
    }
  }, [isHolding, drag, drop, localIsDragging, isDraggingTouch]);

  // Handle drag state changes
  useEffect(() => {
    if (isDragging && !localIsDragging) {
      setLocalIsDragging(true);
      onDragStart();
    } else if (!isDragging && localIsDragging) {
      setLocalIsDragging(false);
      setIsHolding(false);
    }
  }, [isDragging, localIsDragging, onDragStart]);

  // Handle long press with movement threshold
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const touch = 'touches' in e ? e.touches[0] : e;
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    
    longPressTimer.current = setTimeout(() => {
      setIsHolding(true);
      setIsDraggingTouch(true);
      onDragStart();
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    }, 500); // Reduced to 500ms for better UX
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    const touch = 'touches' in e ? e.touches[0] : e;
    
    if (isDraggingTouch && touchStartPos.current) {
      // Move the element with the touch
      const deltaY = touch.clientY - touchStartPos.current.y;
      setCurrentTouchY(touch.clientY);
      
      // Check if we should swap with another element
      const elements = document.querySelectorAll('.exercise-item');
      elements.forEach((el, i) => {
        if (i !== idx && el instanceof HTMLElement) {
          const rect = el.getBoundingClientRect();
          if (touch.clientY > rect.top && touch.clientY < rect.bottom) {
            moveExercise(idx, i);
          }
        }
      });
    } else if (!touchStartPos.current || !longPressTimer.current) {
      return;
    } else {
      const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);
      
      // If user moves finger more than 10px before long press, cancel
      if (deltaX > 10 || deltaY > 10) {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStartPos.current = null;
    setDragOffset({ x: 0, y: 0 });
    setIsDraggingTouch(false);
    if (isDraggingTouch) {
      onDragEnd();
    }
    if (!isDragging) {
      setIsHolding(false);
    }
  };

  const toggleCompleted = (setIdx: number) => {
    updateSet(idx, setIdx, 'completed', !ex.sets[setIdx].completed);
  };

  // Collapsed state when any exercise is being dragged
  const isCollapsed = isGlobalDragging && !isDragging && !isDraggingTouch;

  return (
    <div 
      ref={ref}
      className={`exercise-item ${isDragging || isDraggingTouch ? 'dragging' : ''} ${isCollapsed ? 'collapsed' : ''} ${isHolding ? 'holding' : ''}`} 
      style={{ 
        opacity: isDragging || isDraggingTouch ? 0.9 : 1,
        transform: isDraggingTouch ? `translateY(${dragOffset.y}px) scale(1.05)` : isDragging ? 'scale(1.02) translateY(-2px)' : isHolding ? 'scale(0.98)' : isOver ? 'translateY(-2px)' : 'scale(1)',
        boxShadow: isDragging || isDraggingTouch ? '0 12px 24px rgba(59, 130, 246, 0.4)' : isHolding ? '0 4px 12px rgba(59, 130, 246, 0.2)' : isOver ? '0 4px 16px rgba(59, 130, 246, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.2)',
        height: isCollapsed ? '44px' : 'auto',
        overflow: 'hidden',
        background: isDragging || isDraggingTouch ? 'rgba(59, 130, 246, 0.15)' : isHolding ? 'rgba(255, 255, 255, 0.03)' : isOver ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)',
        border: isDragging || isDraggingTouch ? '1px solid var(--accent-primary)' : isOver ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: isOver ? '24px' : '12px',
        borderRadius: '12px',
        cursor: isDragging || isDraggingTouch ? 'grabbing' : 'grab',
        transition: isDraggingTouch ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: isDraggingTouch ? 1000 : 'auto',
      }} 
      data-handler-id={handlerId}
    >
      {isOver && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '2px',
          background: 'var(--accent-primary)',
          borderRadius: '1px',
          animation: 'pulse 1s infinite',
        }} />
      )}
      <div 
        className="exercise-header" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '14px 16px',
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
          <div className="exercise-name" style={{ 
            fontSize: '0.95em', 
            fontWeight: '600',
            color: isDragging || isDraggingTouch ? 'var(--accent-primary)' : 'white',
          }}>
            {ex.name} 
            {ex.subtype && <span style={{ 
              color: isDragging || isDraggingTouch ? 'var(--accent-primary)' : 'var(--accent-blue)', 
              fontSize: '0.85em', 
              marginLeft: '4px',
              opacity: 0.8,
            }}>({ex.subtype})</span>}
          </div>
        </div>
        {!isCollapsed && (
          <span className="exercise-menu" onClick={(e) => {
            e.stopPropagation();
            openExerciseMenu(idx, e.currentTarget);
          }} style={{ 
            fontSize: '1.1em', 
            padding: '4px 8px', 
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}>⋯</span>
        )}
      </div>
      {!isCollapsed && (
        <div style={{ padding: '0 16px 16px' }}>
          <div className="set-table-header" style={{ 
            display: 'grid',
            gridTemplateColumns: '35px 1fr 65px 65px 50px 35px',
            gap: '10px',
            marginBottom: '12px',
            fontSize: '0.7em',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: '600',
            alignItems: 'center',
            padding: '0 4px',
          }}>
            <div>Set</div>
            <div style={{ textAlign: 'center' }}>Previous</div>
            <div style={{ textAlign: 'center' }}>Weight</div>
            <div style={{ textAlign: 'center' }}>Reps</div>
            <div style={{ textAlign: 'center' }}>RPE</div>
            <div></div>
          </div>
          {ex.sets.map((s, sIdx) => {
            return (
              <div key={sIdx} className={`set-row ${s.completed ? 'completed-row' : ''}`} style={{
                display: 'grid',
                gridTemplateColumns: '35px 1fr 65px 65px 50px 35px',
                gap: '10px',
                marginBottom: '10px',
                alignItems: 'center',
                borderRadius: '8px',
                background: s.completed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                padding: '8px 4px',
                border: s.completed ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
              }}>
                <div style={{ 
                  fontWeight: '700',
                  color: s.completed ? '#22C55E' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.8em',
                  paddingLeft: '8px',
                }}>
                  {sIdx + 1}
                </div>
                <div style={{ 
                  textAlign: 'center',
                  fontSize: '0.75em', 
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontWeight: '500',
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
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '0.85em',
                    fontWeight: '600',
                    color: s.completed ? '#22C55E' : 'white',
                    padding: '8px 4px',
                    height: '36px',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield',
                    transition: 'all 0.2s ease',
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
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '0.85em',
                    fontWeight: '600',
                    color: s.completed ? '#22C55E' : 'white',
                    padding: '8px 4px',
                    height: '36px',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield',
                    transition: 'all 0.2s ease',
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
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '0.8em',
                    color: s.completed ? '#22C55E' : 'white',
                    padding: '8px 4px',
                    height: '36px',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield',
                    transition: 'all 0.2s ease',
                  }}
                />
                <div 
                  className={`log-square ${s.completed ? 'completed' : ''}`} 
                  onClick={() => toggleCompleted(sIdx)}
                  style={{
                    width: '26px',
                    height: '26px',
                    margin: '0 auto',
                    borderRadius: '6px',
                    border: s.completed ? 'none' : '2px solid rgba(255, 255, 255, 0.2)',
                    background: s.completed ? '#22C55E' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '12px',
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
              padding: '8px',
              borderRadius: '6px',
              fontSize: '0.75em',
              fontWeight: '600',
              width: '100%',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              height: '36px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
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
  const [showRestTimer, setShowRestTimer] = useState(false);

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
      document.body.classList.add('modal-open');
      document.body.style.top = `-${scrollY}px`;
      
      return () => {
        document.body.classList.remove('modal-open');
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
      // Delay to allow for smooth animation
      setTimeout(() => {
        setIsGlobalDragging(false);
      }, 300);
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
      setModalTransform(0);
      return;
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
        left: rect.left - modalRect.left - 140,
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
    <>
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
            padding: '8px',
            cursor: 'grab',
            background: '#0A0A0A',
          }}
        >
          <div className="drag-indicator" style={{
            width: '32px',
            height: '3px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '2px',
            margin: '0 auto',
          }}></div>
        </div>
        
        <div style={{ 
          flex: 1,
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '0 10px 80px',
        }}>
          <div className="workout-header" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            gap: '8px',
          }}>
            <div 
              className="timer-button" 
              onClick={() => setShowRestTimer(true)}
              style={{
                fontSize: '20px',
                padding: '6px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: 'none',
                color: 'white',
                minWidth: '36px',
              }}
            >
              ⏱
            </div>
            <input
              type="text"
              id="workout-name-input"
              value={currentWorkout?.name || ''}
              onChange={(e) => setData(prev => ({ ...prev, currentWorkout: { ...prev.currentWorkout!, name: e.target.value } }))}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1em',
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
                borderRadius: '16px',
                padding: '6px 16px',
                fontSize: '0.85em',
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: '65px',
              }}
            >
              Finish
            </button>
          </div>
          
          <div className="workout-info" style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '16px',
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
              padding: '12px',
              background: 'rgba(59, 130, 246, 0.08)',
              color: '#3B82F6',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.85em',
              fontWeight: '500',
              cursor: 'pointer',
              marginTop: '12px',
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
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#EF4444',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.85em',
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
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              padding: '4px',
              zIndex: 1000,
              minWidth: '140px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div 
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'background 0.15s',
                fontSize: '0.8em',
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
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'background 0.15s',
                fontSize: '0.8em',
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
      
      {/* Rest Timer Overlay */}
      {showRestTimer && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1999,
            }}
            onClick={() => setShowRestTimer(false)}
          />
          <RestTimer onClose={() => setShowRestTimer(false)} />
        </>
      )}
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
};

export default WorkoutModal;