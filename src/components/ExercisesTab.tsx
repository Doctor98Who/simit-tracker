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
      const primaryMuscle = ex.muscles.split(',')[0].trim();
      
      if (!muscleGroups[primaryMuscle]) {
        muscleGroups[primaryMuscle] = [];
      }
      muscleGroups[primaryMuscle].push(ex);
    });
    
    // Sort muscle groups with most common ones first
    const muscleGroupOrder = [
      'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
      'Quads', 'Hamstrings', 'Glutes', 'Calves',
      'Abdominals', 'Core', 'Full Body'
    ];
    
    const sortedMuscleGroups = Object.keys(muscleGroups).sort((a, b) => {
      const indexA = muscleGroupOrder.findIndex(m => a.includes(m));
      const indexB = muscleGroupOrder.findIndex(m => b.includes(m));
      
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
          fontSize: '1.2em',
          fontWeight: '600',
          color: 'var(--accent-primary)',
          marginTop: list.length > 0 ? '24px' : '0',
          marginBottom: '12px',
          padding: '8px 12px',
          background: 'var(--subtle-gradient)',
          borderRadius: '8px',
          borderLeft: '4px solid var(--accent-primary)',
        }}>
          {muscleGroup}
        </div>
      );
      
      // Sort exercises alphabetically within muscle group
      const exercises = muscleGroups[muscleGroup].sort((a, b) => a.name.localeCompare(b.name));
      
      exercises.forEach((ex: Exercise) => {
        const isCustom = data.customExercises.some((c: Exercise) => c.name === ex.name && c.subtype === ex.subtype);
        
        list.push(
          <div key={`${ex.name}-${ex.subtype || ''}-${Math.random()}`} className="exercise-item" onClick={(e: React.MouseEvent) => {
            if (!(e.target as HTMLElement).classList.contains('exercise-menu')) {
              showExerciseDetail(ex);
            }
          }}>
            <div className="exercise-name">
              {ex.name}
              {isCustom && <span className="exercise-menu" onClick={() => openCustomMenu(ex.name, ex.subtype || '', data.customExercises.findIndex((c: Exercise) => c.name === ex.name && c.subtype === ex.subtype))}>⋯</span>}
            </div>
            {ex.subtype && <div className="exercise-subtype">{ex.subtype}</div>}
            <div className="exercise-muscles">{ex.muscles}</div>
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
      <h1 className="section-title">Exercises</h1>
      <input 
        type="text" 
        className="search-bar" 
        id="exercise-search" 
        placeholder="Search exercises..." 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)} 
      />
      <div className="add-custom-exercise" onClick={openCustomExerciseModal}>+ Exercise</div>
      <div id="exercise-list">{renderedExercises}</div>
    </div>
  );
};

export default ExercisesTab;