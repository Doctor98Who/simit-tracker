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
  const query = searchQuery.toLowerCase().trim();
  const combinedDatabase: Exercise[] = [...(exerciseDatabase as Exercise[]), ...data.customExercises];
  
  let filtered = combinedDatabase;
  
  if (query) {
    filtered = combinedDatabase.filter(ex => {
      const name = ex.name.toLowerCase();
      const subtype = (ex.subtype || '').toLowerCase();
      const muscles = ex.muscles.toLowerCase();
      
      return name.includes(query) || subtype.includes(query) || muscles.includes(query);
    });
  }
  
  // Group by primary muscle group
  const muscleGroups: Record<string, Exercise[]> = {};
  
  filtered.forEach((ex: Exercise) => {
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
  
  const muscleGroupOrder = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body'];
  
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
    
    const exercises = muscleGroups[muscleGroup].sort((a, b) => a.name.localeCompare(b.name));
    
    exercises.forEach((ex: Exercise) => {
      const isCustom = data.customExercises.some((c: Exercise) => c.name === ex.name && c.subtype === ex.subtype);
      
      list.push(
        <div
          key={`${ex.name}-${ex.subtype || ''}-${Math.random()}`}
          className="exercise-item"
          onClick={(e) => {
            if (!(e.target as HTMLElement).classList.contains('exercise-menu')) {
              showExerciseDetail(ex);
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
          }}>
            {ex.name}
            {isCustom && <span className="exercise-menu" onClick={() => openCustomMenu(ex.name, ex.subtype || '', data.customExercises.findIndex((c: Exercise) => c.name === ex.name && c.subtype === ex.subtype))} style={{ pointerEvents: 'auto', float: 'right' }}>⋯</span>}
          </div>
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

  if (filtered.length === 0 && query) {
    list.push(<div key="no-results" className="feed-placeholder" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No exercises found containing "{query}"</div>);
  }

  return list;
}, [searchQuery, exerciseDatabase, data.customExercises, showExerciseDetail, openCustomMenu]);

return (
  <div>
    <h2 style={{
      margin: '0 0 16px 0',
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
/>
<div 
  onClick={openCustomExerciseModal}
  style={{
    color: 'var(--accent-primary)',
    fontSize: '1em',
    cursor: 'pointer',
    textAlign: 'right',
    marginBottom: '16px',
    fontWeight: '500',
    background: 'transparent',
    border: 'none',
    padding: '0',
  }}
>
  + Exercise
</div>
<div id="exercise-list">{renderedExercises}</div>
    </div>
  );
};

export default ExercisesTab;