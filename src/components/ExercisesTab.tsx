import React, { useContext, useState, useMemo, useCallback } from 'react';
import { DataContext } from '../DataContext';

interface Exercise {
  name: string;
  subtype?: string;
  muscles: string;
  instructions?: string;
  equipment?: string;
  sets?: { weight: string; reps: string; rpe: string; completed: boolean }[];
  numSets?: number;
}

const ExercisesTab = () => {
  const { data, setData, exerciseDatabase } = useContext(DataContext);
  const [searchQuery, setSearchQuery] = useState('');

  const openCustomExerciseModal = () => {
    setData(prev => ({ ...prev, activeModal: 'custom-exercise-modal' }));
  };

  const showExerciseDetail = useCallback((ex: Exercise) => {
    setData(prev => ({ ...prev, currentExercise: { ...ex, sets: ex.sets || [] }, activeModal: 'exercise-detail-modal' }));
  }, [setData]);

  const openCustomMenu = useCallback((name: string, subtype: string, idx: number) => {
    if (idx === -1) return;
    setData(prev => ({ ...prev, currentCustomName: name, currentCustomSubtype: subtype, currentCustomIdx: idx, activeModal: 'custom-menu-modal' }));
  }, [setData]);

const renderedExercises = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const combinedDatabase: Exercise[] = [...(exerciseDatabase as Exercise[]), ...data.customExercises];
    
    let filtered = combinedDatabase;
    
    // If there's a search query, filter by name OR subtype starting with the query
    if (query) {
      filtered = combinedDatabase.filter((ex: Exercise) => {
        const name = ex.name.toLowerCase();
        const subtype = (ex.subtype || '').toLowerCase();
        const muscles = ex.muscles.toLowerCase();
        
        // Check if name, subtype, or muscles contain the query
        return name.includes(query) || subtype.includes(query) || muscles.includes(query);
      });
    }
    
    // Group by primary muscle group
    const muscleGroups: Record<string, Exercise[]> = {};
    
    filtered.forEach((ex: Exercise) => {
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
    const list: React.ReactNode[] = [];
    
    sortedMuscleGroups.forEach((muscleGroup) => {
      // Add muscle group header
      list.push(
        <div key={`muscle-${muscleGroup}`} className="muscle-group-header" style={{
          fontSize: '1.1em',
          fontWeight: '700',
          color: 'var(--text)',
          marginTop: list.length > 0 ? '24px' : '0',
          marginBottom: '16px',
          padding: '12px 16px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
          borderRadius: '12px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
        }}>
          {muscleGroup}
        </div>
      );
      
      // Sort exercises alphabetically within muscle group
      const exercises = muscleGroups[muscleGroup].sort((a, b) => a.name.localeCompare(b.name));
      
      exercises.forEach((ex: Exercise) => {
        const isCustom = data.customExercises.some((c: Exercise) => c.name === ex.name && c.subtype === ex.subtype);
        
        list.push(
          <div key={`${ex.name}-${ex.subtype || ''}-${Math.random()}`} 
            className="exercise-item" 
            onClick={(e: React.MouseEvent) => {
              if (!(e.target as HTMLElement).classList.contains('exercise-menu')) {
                showExerciseDetail(ex);
              }
            }}
            style={{
              background: 'var(--bg-dark)',
              borderRadius: '16px',
              padding: '18px',
              marginBottom: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid var(--border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <div className="exercise-name" style={{
              fontWeight: '600',
              fontSize: '1.1em',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'var(--text)',
            }}>
              <span>{ex.name}</span>
              {isCustom && <span className="exercise-menu" onClick={() => openCustomMenu(ex.name, ex.subtype || '', data.customExercises.findIndex((c: Exercise) => c.name === ex.name && c.subtype === ex.subtype))}>⋯</span>}
            </div>
            {ex.subtype && (
              <div className="exercise-subtype" style={{
                color: 'var(--accent-primary)',
                fontSize: '0.9em',
                fontWeight: '500',
              }}>{ex.subtype}</div>
            )}
            <div className="exercise-muscles" style={{
              color: 'var(--text-muted)',
              fontSize: '0.85em',
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
            }}>
              {ex.muscles.split(',').map((muscle, idx) => (
                <span key={idx} style={{
                  background: 'var(--bg-lighter)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.8em',
                }}>
                  {muscle.trim()}
                </span>
              ))}
            </div>
          </div>
        );
      });
    });
    
    if (filtered.length === 0 && query) {
      list.push(<div key="no-results" className="feed-placeholder">No exercises found matching "{query}"</div>);
    }
    
    return list;
  }, [searchQuery, exerciseDatabase, data.customExercises, showExerciseDetail, openCustomMenu]);

  return (
    <div>
<h2 style={{
  margin: '0 0 20px 0',
  fontSize: '1.3em',
  textAlign: 'center',
  fontWeight: '600',
  color: 'var(--text)',
}}>Exercises</h2>
<input 
  type="text" 
  className="search-bar" 
  id="exercise-search" 
  placeholder="Search exercises..." 
  value={searchQuery} 
  onChange={(e) => setSearchQuery(e.target.value)}
  style={{
    background: 'var(--bg-lighter)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '14px 16px',
    marginBottom: '8px',          fontSize: '16px',
          color: 'var(--text)',
          transition: 'all 0.3s ease',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--accent-primary)';
          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border)';
          e.target.style.boxShadow = 'none';
        }}
      />
<button
  onClick={openCustomExerciseModal}
  style={{
    width: '100%',
    padding: '8px',
    fontSize: '0.85em',
    background: 'var(--bg-lighter)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    marginBottom: '16px',
    cursor: 'pointer',
    fontWeight: '500',
  }}
>
  + Create Custom Exercise
</button>      
<div id="exercise-list">{renderedExercises}</div>
    </div>
  );
};

export default ExercisesTab;