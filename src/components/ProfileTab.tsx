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
  sets?: { weight: string; reps: string; rpe: string; completed: boolean }[];
}

const ProfileTab = () => {
  const { data, setData } = useContext(DataContext);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<number[]>([]);
  const [showTotalVolume, setShowTotalVolume] = useState(false);

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

  const openHistoryMenu = useCallback((index: number) => {
    setData((prev: DataType) => ({ ...prev, currentHistoryIdx: index, activeModal: 'history-menu-modal' }));
  }, [setData]);

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
        <div key={index} className={`history-item ${isExpanded ? 'expanded' : ''}`}>
          <div className="history-summary" onClick={(e: React.MouseEvent) => {
            if (!(e.target as HTMLElement).classList.contains('exercise-menu')) {
              toggleHistoryItem(index);
            }
          }}>
            <span>{entry.name} - {new Date(entry.startTime).toLocaleString()} - {volume.toFixed(0)} lbs</span>
            <span className="exercise-menu" onClick={() => openHistoryMenu(index)}>⋯</span>
          </div>
          <div className="history-details">
            {entry.exercises.map((ex, exIdx) => (
              <div key={exIdx} className="exercise-row">
                <div className="exercise-name">{ex.name} {ex.subtype ? `(${ex.subtype})` : ''}</div>
                <div className="set-table">
                  <header>Set</header>
                  <header>lbs</header>
                  <header>Reps</header>
                  <header>RPE</header>
                </div>
                {ex.sets?.map((s: { weight?: string; reps?: string; rpe?: string }, sIdx: number) => (
                  <div key={sIdx} className="set-row">
                    <div>{sIdx + 1}</div>
                    <div>{s.weight}</div>
                    <div>{s.reps}</div>
                    <div>{s.rpe}</div>
                  </div>
                ))}
              </div>
            ))}
            {entry.suggestion && <div><strong>Suggestion:</strong> {entry.suggestion}</div>}
          </div>
        </div>
      );
    });
  }, [sortedHistory, expandedHistoryItems, openHistoryMenu]);

  const openSettingsModal = () => {
    setData((prev: DataType) => ({ ...prev, activeModal: 'settings-modal' }));
  };

  return (
    <div>
      <div className="profile-header" id="profile-cover" style={{ backgroundImage: data.coverPhoto ? `url('${data.coverPhoto}')` : 'none', position: 'relative' }}>
        <div 
          className="settings-icon"
          onClick={openSettingsModal}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '18px',
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
      <div className="profile-actions">
        <div className="profile-action-btn" onClick={openEditProfileModal}>Edit</div>
        <div className="profile-action-btn" id="total-volume-btn" onClick={() => setShowTotalVolume(!showTotalVolume)}>
          {showTotalVolume ? `${totalVolume.toLocaleString()} lbs` : 'Total lbs Lifted'}
        </div>
        <div className="profile-action-btn" onClick={toggleHistorySection}>History</div>
      </div>
      <div id="profile-history-section" className={showHistory ? '' : 'hidden'}>
        <div id="history-list">{renderedHistory}</div>
      </div>
    </div>
  );
};

export default ProfileTab;