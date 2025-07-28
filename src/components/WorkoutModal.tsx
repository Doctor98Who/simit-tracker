import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react';
import { useDrag, useDrop, DragSourceMonitor } from 'react-dnd';
import { DataContext, type Set } from '../DataContext';

const ItemType = 'EXERCISE';

interface Exercise {
  name: string;
  subtype?: string;
  muscles?: string;
  sets: Set[];
  previousSets?: { weight: string; reps: string }[];
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
  intensityMetric: 'rpe' | 'rir';
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
      background: 'var(--bg-dark)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      zIndex: 2000,
      minWidth: '280px',
      border: '1px solid var(--border)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1em', color: 'var(--text)' }}>Rest Timer</h3>
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
  onDragEnd,
  intensityMetric
}) => {
  const { data } = useContext(DataContext);
  const ref = useRef<HTMLDivElement>(null);
  const [isHolding, setIsHolding] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [localIsDragging, setLocalIsDragging] = useState(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  
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
      return { index: idx };
    },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isHolding,
    end: () => {
      setIsHolding(false);
      onDragEnd();
    },
  });

  // Set up custom drag preview - use empty image to hide default preview
  useEffect(() => {
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    preview(img, { captureDraggingState: false });
  }, [preview]);

  // Enable drag when holding
  useEffect(() => {
    if (isHolding && !localIsDragging) {
      drag(drop(ref));
    } else if (!isHolding) {
      drop(ref);
    }
  }, [isHolding, drag, drop, localIsDragging]);

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
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    }, 500); // Reduced to 500ms for better UX
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStartPos.current || !longPressTimer.current) return;
    
    const touch = 'touches' in e ? e.touches[0] : e;
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);
    
    // If user moves finger more than 10px before long press, cancel
    if (deltaX > 10 || deltaY > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStartPos.current = null;
    if (!isDragging) {
      setIsHolding(false);
    }
  };

  const toggleCompleted = (setIdx: number) => {
    updateSet(idx, setIdx, 'completed', !ex.sets[setIdx].completed);
  };

  const toggleSetType = (setIdx: number) => {
    const currentSet = ex.sets[setIdx];
    
    // Cycle through: S (undefined) -> W -> D -> S
    let newType: 'W' | 'D' | 'S' | undefined;
    if (!currentSet.type || currentSet.type === 'S') {
      newType = 'W';
    } else if (currentSet.type === 'W') {
      newType = 'D';
    } else {
      newType = 'S';
    }
    
    updateSet(idx, setIdx, 'type', newType);
  };

  const getSetLabel = (set: Set, setIdx: number, allSets: Set[]) => {
    if (set.type === 'W') return 'W';
    if (set.type === 'D') return 'D';
    
    // Count only regular sets before this one
    let regularSetNumber = 1;
    for (let i = 0; i < setIdx; i++) {
      if (!allSets[i].type || allSets[i].type === 'S') {
        regularSetNumber++;
      }
    }
    return regularSetNumber.toString();
  };

  // Collapsed state when any exercise is being dragged
  const isCollapsed = isGlobalDragging && !isDragging;

  return (
    <div 
      ref={ref}
      className={`exercise-item ${isDragging ? 'dragging' : ''} ${isCollapsed ? 'collapsed' : ''} ${isHolding ? 'holding' : ''}`} 
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(1.02) rotate(2deg)' : isHolding ? 'scale(0.98)' : isOver ? 'translateY(-2px)' : 'scale(1)',
        boxShadow: isDragging ? '0 16px 32px rgba(59, 130, 246, 0.5)' : isHolding ? '0 4px 12px rgba(59, 130, 246, 0.2)' : isOver ? '0 4px 16px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        height: isCollapsed ? '36px' : 'auto',
        overflow: 'hidden',
        background: isDragging ? 'rgba(59, 130, 246, 0.1)' : isHolding ? 'var(--bg-lighter)' : isOver ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-lighter)',
        border: isDragging ? '2px solid var(--accent-primary)' : isOver ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--border)',
        marginBottom: isOver ? '16px' : '6px',
        borderRadius: '10px',
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: isDragging ? 1000 : 'auto',
      }} 
      data-handler-id={handlerId}
    >
      {isOver && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
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
          padding: '10px 12px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
          <div className="exercise-name" style={{ 
            fontSize: '1.2em', 
            fontWeight: '600',
            color: isDragging ? 'var(--accent-primary)' : 'var(--accent-blue)',
            letterSpacing: '-0.3px',
            
          }}>
            {ex.name} 
            {ex.subtype && <span style={{ 
              color: isDragging ? 'var(--accent-primary)' : 'var(--text-muted)', 
              fontSize: '0.85em', 
              marginLeft: '4px',
              fontWeight: '400',
            }}>({ex.subtype})</span>}
          </div>
        </div>
        {!isCollapsed && (
          <span className="exercise-menu" onClick={(e) => {
            e.stopPropagation();
            openExerciseMenu(idx, e.currentTarget);
          }} style={{ 
            fontSize: '1em', 
            padding: '2px 4px', 
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}>⋯</span>
        )}
      </div>
      {!isCollapsed && (
        <div style={{ padding: '0 12px 10px' }}>
          <div className="set-table-header" style={{ 
            display: 'grid',
            gridTemplateColumns: '24px 1fr 48px 48px 48px 22px',
            gap: '6px',
            marginBottom: '8px',
            fontSize: '0.6em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: '600',
            alignItems: 'center',
            paddingLeft: '2px',
          }}>
            <div>Set</div>
            <div style={{ textAlign: 'center' }}>Previous</div>
            <div style={{ textAlign: 'center' }}>Weight</div>
            <div style={{ textAlign: 'center' }}>Reps</div>
            <div style={{ textAlign: 'center' }}>{intensityMetric.toUpperCase()}</div>
            <div></div>
          </div>
          {ex.sets.map((s, sIdx) => {
            return (
              <div key={sIdx} className={`set-row ${s.completed ? 'completed-row' : ''}`} style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr 48px 48px 48px 22px',
                gap: '6px',
                marginBottom: '6px',
                alignItems: 'center',
                borderRadius: '6px',
                background: s.completed 
                  ? 'rgba(34, 197, 94, 0.08)' 
                  : 'transparent',
                padding: '4px 2px',
                transition: 'all 0.2s ease',
              }}>
                <div 
                  style={{ 
                    fontWeight: '600',
                    color: s.completed ? '#22C55E' : s.type === 'W' ? '#FFB800' : s.type === 'D' ? '#FF6B6B' : 'var(--text-muted)',
                    fontSize: '0.7em',
                    paddingLeft: '4px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => toggleSetType(sIdx)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-lighter)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {getSetLabel(s, sIdx, ex.sets)}
                </div>
                <div style={{ 
                  textAlign: 'center',
                  fontSize: '0.65em', 
                  color: 'var(--text-muted)',
                  fontWeight: '500',
                }}>
                  {ex.previousSets?.[sIdx]?.weight && ex.previousSets?.[sIdx]?.reps 
                    ? `${ex.previousSets[sIdx].weight}×${ex.previousSets[sIdx].reps}` 
                    : '—'}
                </div>
                <input 
                  value={s.weight || ex.previousSets?.[sIdx]?.weight || ''} 
                  onChange={(e) => updateSet(idx, sIdx, 'weight', e.target.value)}
                  type="number"
                  inputMode="decimal"
                  placeholder={ex.previousSets?.[sIdx]?.weight || "0"}
                  style={{
                    background: 'var(--bg-dark)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '0.75em',
                    fontWeight: '600',
                    color: s.completed ? '#22C55E' : 'var(--text)',
                    padding: '5px 2px',
                    height: '28px',
                    width: '100%',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent-primary)';
                    e.target.style.background = 'rgba(59, 130, 246, 0.08)';
                    // Auto-populate weight from previous if empty
                    if (!s.weight && ex.previousSets?.[sIdx]?.weight) {
                      updateSet(idx, sIdx, 'weight', ex.previousSets[sIdx].weight);
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.background = 'var(--bg-dark)';
                  }}
                />
                <div style={{ position: 'relative' }}>
                  <input 
                    value={s.reps} 
                    onChange={(e) => updateSet(idx, sIdx, 'reps', e.target.value)}
                    type="number"
                    inputMode="numeric"
                    placeholder={ex.previousSets?.[sIdx]?.reps || "0"}
                    style={{
                      background: 'var(--bg-dark)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: '0.75em',
                      fontWeight: '600',
                      color: s.completed ? '#22C55E' : 'var(--text)',
                      padding: '5px 2px',
                      height: '28px',
                      width: '100%',
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent-primary)';
                      e.target.style.background = 'rgba(59, 130, 246, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.background = 'var(--bg-dark)';
                    }}
                  />
                  {!s.reps && ex.previousSets?.[sIdx]?.reps && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '0.65em',
                      color: 'var(--text-muted)',
                      pointerEvents: 'none',
                    }}>
                      {ex.previousSets[sIdx].reps}
                    </div>
                  )}
                </div>
                <input 
                  value={s[intensityMetric] || ''} 
                  onChange={(e) => updateSet(idx, sIdx, intensityMetric, e.target.value)}
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min={intensityMetric === 'rir' ? "0" : "1"}
                  max={intensityMetric === 'rir' ? "10" : "10"}
                  placeholder="0"
                  style={{
                    background: 'var(--bg-dark)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '0.7em',
                    color: s.completed ? '#22C55E' : 'var(--text)',
                    padding: '5px 2px',
                    height: '28px',
                    width: '100%',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent-primary)';
                    e.target.style.background = 'rgba(59, 130, 246, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.background = 'var(--bg-dark)';
                  }}
                />
                <div 
                  className={`log-square ${s.completed ? 'completed' : ''}`} 
                  onClick={() => toggleCompleted(sIdx)}
                  style={{
                    width: '22px',
                    height: '22px',
                    margin: '0 auto',
                    borderRadius: '5px',
                    border: s.completed ? 'none' : '1.5px solid var(--border)',
                    background: s.completed 
                      ? '#22C55E' 
                      : 'var(--bg-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '10px',
                    color: 'white',
                    fontWeight: 'bold',
                    transition: 'all 0.15s ease',
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
              marginTop: '8px',
              background: 'transparent',
              border: '1px dashed var(--border)',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '6px',
              fontSize: '0.7em',
              fontWeight: '600',
              width: '100%',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              height: '30px',
              letterSpacing: '-0.2px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-dark)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-muted)';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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

  // Scroll to top when modal opens
  useEffect(() => {
    if (data.activeModal === 'workout-modal' && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [data.activeModal]);

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
      // Immediately reset to show all exercises expanded
      setIsGlobalDragging(false);
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
    newExercises[exIdx].sets = [...newExercises[exIdx].sets, { weight: '', reps: '', rpe: '', completed: false, type: undefined }];
    setData(prev => ({ ...prev, currentWorkout: { ...prev.currentWorkout!, exercises: newExercises } }));
  }, [currentWorkout, setData]);

  const getPreviousSets = useCallback((ex: Exercise): { weight: string; reps: string }[] => {
    const previous: { weight: string; reps: string }[] = [];
    for (let i = data.history.length - 1; i >= 0; i--) {
      const workout = data.history[i];
      const matchingEx = workout.exercises.find(e => e.name === ex.name && (e.subtype || '') === (ex.subtype || ''));
      if (matchingEx && matchingEx.sets) {
        matchingEx.sets.forEach(s => previous.push({ 
          weight: s.weight || '0', 
          reps: s.reps || '0' 
        }));
        return previous;
      }
    }
    return Array(ex.sets.length).fill({ weight: '', reps: '' });
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
        intensityMetric={data.intensityMetric}
      />
    ));
  }, [currentWorkout, getPreviousSets, moveExercise, openExerciseMenu, updateSet, addSet, isGlobalDragging, handleDragStart, handleDragEnd, data.intensityMetric]);

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
          background: 'var(--bg-dark)',
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
            padding: '6px',
            cursor: 'grab',
            background: 'var(--bg-dark)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div className="drag-indicator" style={{
            width: '32px',
            height: '3px',
            background: 'var(--border)',
            borderRadius: '2px',
            margin: '0 auto',
          }}></div>
        </div>
        
        <div 
          ref={scrollContainerRef}
          style={{ 
            flex: 1,
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '0 10px 80px',
            overscrollBehavior: 'contain',
          }}
        >
          <div className="workout-header" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            gap: '8px',
            padding: '0 4px',
            position: 'sticky',
            top: 0,
            background: 'var(--bg-dark)',
            zIndex: 5,
            paddingTop: '10px',
            paddingBottom: '10px',
          }}>
            <div 
              className="timer-button" 
              onClick={() => setShowRestTimer(true)}
              style={{
                fontSize: '18px',
                padding: '6px',
                borderRadius: '50%',
                background: 'var(--bg-lighter)',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: 'none',
                color: 'var(--text)',
                minWidth: '34px',
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
                fontSize: '2em',
                fontWeight: '700',
                textAlign: 'center',
                flex: 1,
                padding: '0',
                color: 'var(--text)',
                letterSpacing: '-0.3px',
                marginTop: '10px',
              }}
            />
            <button 
              className="finish" 
              onClick={finishWorkout}
              style={{
                background: '#22C55E',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                padding: '6px 14px',
                fontSize: '0.8em',
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: '60px',
                letterSpacing: '-0.2px',
              }}
            >
              Finish
            </button>
          </div>
          
          <div className="workout-info" style={{
            display: 'flex',
            gap: '14px',
            marginBottom: '16px',
            fontSize: '0.8em',
            color: 'var(--text-muted)',
            paddingLeft: '4px',
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
              padding: '10px',
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px dashed var(--border)',
              borderRadius: '8px',
              fontSize: '0.8em',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '10px',
              marginBottom: '8px',
              transition: 'all 0.2s ease',
              letterSpacing: '-0.3px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-lighter)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            + Add Exercise
          </button>
          <button 
            className="cancel-workout" 
            onClick={cancelWorkout}
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              color: 'rgba(239, 68, 68, 0.8)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              fontSize: '0.8em',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '-0.3px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.color = 'rgba(239, 68, 68, 0.8)';
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
              background: 'var(--bg-dark)',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              padding: '4px',
              zIndex: 1000,
              minWidth: '140px',
              border: '1px solid var(--border)',
            }}
          >
            <div 
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'background 0.15s',
                fontSize: '0.8em',
                color: 'var(--text)',
              }}
              onClick={deleteExercise}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-lighter)'}
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
                color: 'var(--text)',
              }}
              onClick={deleteLastSet}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-lighter)'}
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
        
        /* Hide default drag preview */
        .react-dnd-drag-layer {
          opacity: 0 !important;
        }
      `}</style>
    </>
  );
};

export default WorkoutModal;