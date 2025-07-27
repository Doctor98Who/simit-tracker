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
        
        // Check if either name or subtype starts with the query
        return name.startsWith(query) || subtype.startsWith(query);
      });
    }
    
    // Sort alphabetically by name
    filtered.sort((a: Exercise, b: Exercise) => a.name.localeCompare(b.name));

    let currentLetter = '';
    const list: React.ReactNode[] = [];
    
    filtered.forEach((ex: Exercise) => {
      const firstLetter = ex.name[0].toUpperCase();
      if (firstLetter !== currentLetter) {
        list.push(<div key={firstLetter} className="letter-header">{firstLetter}</div>);
        currentLetter = firstLetter;
      }
      
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