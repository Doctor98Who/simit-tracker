import React, { useContext, useState, useMemo, useCallback } from 'react';
import { DataContext } from '../DataContext';
import type { DataType } from '../DataContext';

interface Workout {
  name: string;
  exercises: Exercise[];
  startTime: number;
  duration: number;
  pump?: string;
  soreness?: string;
  workload?: string;
  suggestion?: string;
}

interface Exercise {
  name: string;
  subtype?: string;
  muscles: string;
  instructions?: string;
  equipment?: string;
  sets?: { weight: string; reps: string; rpe: string; rir?: string; completed: boolean; type?: 'W' | 'D' | 'S' }[];
}

const ProfileTab = () => {
  const { data, setData } = useContext(DataContext);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<number[]>([]);

  const toggleHistorySection = () => {
    setShowHistory(!showHistory);
  };

  const toggleHistoryItem = (index: number) => {
    setExpandedHistoryItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const editProfilePic = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          if (event.target && event.target.result) {
            const base64Result = event.target.result as string;
            setData((prev: DataType) => ({ ...prev, profilePic: base64Result }));
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const openEditProfileModal = () => {
    setData((prev: DataType) => ({ ...prev, activeModal: 'edit-profile-modal' }));
  };

  const openHistoryMenu = useCallback((sortedIndex: number) => {
  // Find the actual index in the unsorted history array
  const sortedHistory = [...data.history].sort((a: Workout, b: Workout) => b.startTime - a.startTime);
  const workout = sortedHistory[sortedIndex];
  const actualIndex = data.history.findIndex((w: Workout) => w.startTime === workout.startTime);
  setData((prev: DataType) => ({ ...prev, currentHistoryIdx: actualIndex, activeModal: 'history-menu-modal' }));
}, [setData, data.history]);

  // Calculate total volume lifted
  const totalVolume = useMemo(() => {
    let total = 0;
    data.history.forEach((workout: Workout) => {
      workout.exercises.forEach(ex => {
        ex.sets?.forEach(set => {
          if (set.completed && set.weight && set.reps) {
            total += parseFloat(set.weight) * parseFloat(set.reps);
          }
        });
      });
    });
    return total;
  }, [data.history]);

  const sortedHistory = useMemo(() => [...data.history].sort((a: Workout, b: Workout) => b.startTime - a.startTime), [data.history]);

  const getSetLabel = (set: any, setIdx: number, allSets: any[]) => {
  if (set.type === 'W') return 'W';
  if (set.type === 'D') return 'D';
  if (set.isDropSet) return 'DS';
  
  // Count only non-drop sets before this one
  let regularSetNumber = 1;
  for (let i = 0; i < setIdx; i++) {
    if (!allSets[i].isDropSet && (!allSets[i].type || allSets[i].type === 'S')) {
      regularSetNumber++;
    }
  }
  return regularSetNumber;
};

  const renderedHistory = useMemo(() => {
    if (sortedHistory.length === 0) {
      return <div className="feed-placeholder">No workouts completed yet.</div>;
    }
    return sortedHistory.map((entry: Workout, index: number) => {
      let volume = 0;
      entry.exercises.forEach(ex => {
        ex.sets?.forEach((s: { weight?: string; reps?: string; completed?: boolean }) => {
          if (s.completed && s.weight && s.reps) {
            volume += parseFloat(s.weight || '0') * parseFloat(s.reps || '0');
          }
        });
      });
      const isExpanded = expandedHistoryItems.includes(index);
      
      return (
        <div key={index} className={`history-item ${isExpanded ? 'expanded' : ''}`} style={{
          background: 'var(--bg-dark)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid var(--border)',
          transition: 'all 0.3s ease',
        }}>
          <div className="history-summary" onClick={(e: React.MouseEvent) => {
            if (!(e.target as HTMLElement).classList.contains('exercise-menu')) {
              toggleHistoryItem(index);
            }
          }} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
          }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '1.1em', marginBottom: '4px' }}>{entry.name}</div>
              <div style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
                {new Date(entry.startTime).toLocaleDateString()} • {volume.toFixed(0)} {data.weightUnit || 'lbs'}
              </div>
            </div>
            <span className="exercise-menu" onClick={() => openHistoryMenu(index)}>⋯</span>
          </div>
          {isExpanded && (
            <div className="history-details" style={{ marginTop: '20px' }}>
              {entry.exercises.map((ex, exIdx) => (
                <div key={exIdx} className="exercise-row" style={{
                  background: 'var(--bg-lighter)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                }}>
                  <div className="exercise-name" style={{ 
                    fontWeight: '600', 
                    fontSize: '1em', 
                    marginBottom: '12px',
                    color: 'var(--accent-blue)'
                  }}>{ex.name} {ex.subtype ? `(${ex.subtype})` : ''}</div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 60px 60px 60px',
                    gap: '12px',
                    fontSize: '0.85em',
                  }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Set</div>
                    <div style={{ textAlign: 'center', fontWeight: '600', color: 'var(--text-muted)' }}>{data.weightUnit || 'lbs'}</div>
                    <div style={{ textAlign: 'center', fontWeight: '600', color: 'var(--text-muted)' }}>Reps</div>
                    <div style={{ textAlign: 'center', fontWeight: '600', color: 'var(--text-muted)' }}>{ex.sets?.[0]?.rir !== undefined ? 'RIR' : 'RPE'}</div>
                    {ex.sets?.map((s: any, sIdx: number) => (
                      <React.Fragment key={sIdx}>
                        <div style={{ 
                          fontWeight: '500',
                          color: s.type === 'W' ? '#FFB800' : s.type === 'D' ? '#FF6B6B' : 'var(--text)'
                        }}>{getSetLabel(s, sIdx, ex.sets || [])}</div>
                        <div style={{ textAlign: 'center' }}>{s.weight}</div>
                        <div style={{ textAlign: 'center' }}>{s.reps}</div>
                        <div style={{ textAlign: 'center' }}>{s.rir !== undefined ? s.rir : s.rpe}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
              {entry.suggestion && (
                <div style={{
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginTop: '16px',
                  color: 'white',
                  fontSize: '0.9em',
                }}>
                  <strong>Recommendation:</strong> {entry.suggestion === 'increase' ? 'Increase volume next time' : entry.suggestion === 'decrease' ? 'Reduce volume next time' : 'Maintain current volume'}
                </div>
              )}
            </div>
          )}
        </div>
      );
    });
  }, [sortedHistory, expandedHistoryItems, openHistoryMenu, data.weightUnit]);

const openSettingsModal = () => {
  setData((prev: DataType) => ({ ...prev, activeModal: 'settings-modal' }));
};

const clearAppCache = () => {
  if (window.confirm('Clear app cache? This will fix display issues but keep your workout data.')) {
    // Keep user data
    const userData = {
      templates: data.templates,
      history: data.history,
      progressPics: data.progressPics,
      profilePic: data.profilePic,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      bio: data.bio,
      email: data.email,
      country: data.country,
      state: data.state,
      coverPhoto: data.coverPhoto,
      completedPrograms: data.completedPrograms,
      customExercises: data.customExercises,
      theme: data.theme,
      intensityMetric: data.intensityMetric,
      weightUnit: data.weightUnit,
      distanceUnit: data.distanceUnit,
    };
    
    // Clear everything
    localStorage.clear();
    sessionStorage.clear();
    
    // Restore user data
    Object.entries(userData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });
    
    // Set data version
    localStorage.setItem('dataVersion', '1.0.1');
    
    // Reload
    window.location.reload();
  }
};

return (
  <div>
    <div className="profile-header" id="profile-cover" style={{
      backgroundImage: data.coverPhoto ? `url('${data.coverPhoto}')` : 'none',
      position: 'relative',
      overflow: 'visible',
    }}>
      <div
        className="settings-icon"
        onClick={openSettingsModal}
        style={{
          position: 'absolute',
          top: '80px',
          right: '20px',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '18px',
          zIndex: 100,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        ⚙️
      </div>        
      <div className="profile-pic" style={{ backgroundImage: `url('${data.profilePic}')` }} onClick={editProfilePic}></div>
      <div className="profile-name" id="profile-fullname">{data.firstName} {data.lastName}</div>
      <div className="profile-username">@{data.username}</div>
      <div className="profile-location" id="profile-location">{data.country}{data.state ? ', ' + data.state : ''}</div>
    </div>
    <div className="profile-stats">
      <div className="stat-box">
        <div className="stat-number" id="total-workouts">{data.history.length}</div>
        <div className="stat-label">Workouts</div>
      </div>
      <div className="stat-box">
        <div className="stat-number" id="total-friends">0</div>
        <div className="stat-label">Friends</div>
      </div>
    </div>
    <div className="profile-actions" style={{
      display: 'flex',
      gap: '8px',
      padding: '0 20px',
      marginBottom: '20px',
    }}>        
    <button
          onClick={openEditProfileModal}
          style={{
            background: 'transparent',
            color: 'var(--text-muted)',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '0.85em',
            fontWeight: '500',
            flex: 1,
            textAlign: 'center',
            border: '1px solid var(--border)',
            transition: 'all 0.2s ease',
          }}
        >
          Edit
        </button>
        
        <div
          style={{
            background: 'transparent',
            color: 'var(--text)',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '0.85em',
            fontWeight: '500',
            flex: 1,
            textAlign: 'center',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          <div style={{ fontSize: '0.75em', color: 'var(--text-muted)' }}>Total {data.weightUnit || 'lbs'}</div>
          <div style={{ fontWeight: '600' }}>{totalVolume.toLocaleString()}</div>
        </div>
        
        <button
          onClick={toggleHistorySection}
          style={{
            background: 'transparent',
            color: 'var(--text-muted)',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '0.85em',
            fontWeight: '500',
            flex: 1,
            textAlign: 'center',
            border: '1px solid var(--border)',
            transition: 'all 0.2s ease',
          }}
        >
          History
        </button>
      </div>
      <div id="profile-history-section" className={showHistory ? '' : 'hidden'} style={{ padding: '0 20px' }}>
        <div id="history-list">{renderedHistory}</div>
      </div>
    </div>
  );
};

export default ProfileTab;