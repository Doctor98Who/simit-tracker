import React, { useContext, useMemo, useCallback, useEffect } from 'react';
import { DataContext } from '../DataContext';

interface Program {
  name: string;
  mesocycleLength: number;
  weeks: any[];
  lastUsed?: number;
}

interface SimitProgram {
  name: string;
  mesocycleLength: number;
  weeks: any[];
}

const StartWorkoutTab = () => {
  const { data, setData, simitPrograms } = useContext(DataContext);

  // Clean up any lingering modal states on mount
  useEffect(() => {
    // Reset body styles in case they were left from previous session
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    
    // Clear any active modal if there's no workout
    if (!data.currentWorkout && data.activeModal === 'workout-modal') {
      setData(prev => ({ ...prev, activeModal: null }));
    }
  }, []);

  const startEmptyWorkout = () => {
    const newWorkout = { 
      name: 'New Workout', 
      exercises: [], 
      startTime: Date.now(), 
      duration: 0 
    };
    setData(prev => ({ 
      ...prev, 
      currentWorkout: newWorkout, 
      activeModal: 'workout-modal',
      isWorkoutSelect: false,
      returnModal: null,
      currentDayExercises: [],
      currentDayIndex: null,
      currentWeekIndex: null
    }));
  };

  const createProgram = () => {
    const newProgram = { weeks: [] };
    setData(prev => ({ 
      ...prev, 
      currentProgram: newProgram, 
      activeModal: 'program-modal',
      isWorkoutSelect: false,
      returnModal: null,
      currentDayExercises: []
    }));
  };

  const showProgramWeeks = useCallback((program: Program | SimitProgram) => {
    setData(prev => ({ 
      ...prev, 
      currentProgram: program, 
      activeModal: 'program-weeks-modal',
      isWorkoutSelect: false,
      returnModal: null
    }));
  }, [setData]);

  const openProgramMenu = useCallback((index: number, programName: string) => {
    setData(prev => ({ 
      ...prev, 
      currentProgName: programName, 
      activeModal: 'program-menu-modal' 
    }));
  }, [setData]);

  const renderedProgramsInProgress = useMemo(() => {
    const completedProgramNames = Object.keys(data.completedPrograms);
    if (completedProgramNames.length === 0) {
      return <div className="feed-placeholder">No programs in progress</div>;
    }
    
    return completedProgramNames.map((programName) => {
      const program = data.templates.find((t: Program) => t.name === programName) || 
                     simitPrograms.find((s: SimitProgram) => s.name === programName);
      if (!program) return null;
      
      const progress = data.completedPrograms[programName];
      const totalDays = program.weeks.reduce((acc: number, week: any) => acc + week.days.length, 0);
      const completedDays = Object.keys(progress).length;
      
      return (
        <div key={programName} className="program-card" onClick={() => showProgramWeeks(program)}>
          <div className="program-name">{programName}</div>
          <div className="program-details">Progress: {completedDays}/{totalDays} days</div>
        </div>
      );
    }).filter(Boolean);
  }, [data.completedPrograms, data.templates, simitPrograms, showProgramWeeks]);

  const renderedTemplates = useMemo(() => {
    if (data.templates.length === 0) {
      return <div className="feed-placeholder">No custom programs yet</div>;
    }
    
    return data.templates.map((program: Program, index: number) => (
      <div key={index} className="program-card" onClick={(e: React.MouseEvent) => {
        if (!(e.target as HTMLElement).classList.contains('exercise-menu')) {
          showProgramWeeks(program);
        }
      }}>
        <div className="program-name">{program.name}</div>
        <div className="program-details">{program.weeks[0]?.days?.length || 0} days</div>
        <div className="program-date">{program.mesocycleLength} weeks</div>
        <span className="exercise-menu" onClick={() => openProgramMenu(index, program.name)}>⋯</span>
      </div>
    ));
  }, [data.templates, showProgramWeeks, openProgramMenu]);

  const renderedSimitPrograms = useMemo(() => simitPrograms.map((program: SimitProgram, index: number) => (
    <div key={index} className="program-card" onClick={() => showProgramWeeks(program)}>
      <div className="program-name">{program.name}</div>
      <div className="program-details">{program.weeks[0].days.length} days</div>
      <div className="program-date">{program.mesocycleLength} weeks</div>
    </div>
  )), [simitPrograms, showProgramWeeks]);

  return (
    <div>
      <h2>Quick Start</h2>
      <div className="quick-start" onClick={startEmptyWorkout}>Start an Empty Workout</div>
      <h3>Programs in Progress</h3>
      <div id="programs-in-progress">{renderedProgramsInProgress}</div>
      <div className="programs-header">
        <h3>My Programs</h3>
        <div className="add-program" onClick={createProgram}>+ Program</div>
      </div>
      <div id="my-programs">{renderedTemplates}</div>
      <h3>Simit Programs</h3>
      <div id="simit-programs">{renderedSimitPrograms}</div>
    </div>
  );
};

export default StartWorkoutTab;