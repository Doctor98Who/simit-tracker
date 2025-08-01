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
  console.log('Current friend requests:', data.friendRequests);
console.log('Current friends:', data.friends);
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
        
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image is too large. Please choose an image under 5MB.');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          if (event.target && event.target.result) {
            const base64Result = event.target.result as string;
            
            // Create image to resize if needed
            const img = new Image();
            img.src = base64Result;
            
            img.onload = () => {
              const maxSize = 400; // Smaller size for profile pics
              let width = img.width;
              let height = img.height;
              
              if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
              }
              
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                
                // Update profile pic - this will trigger sync with Supabase
                setData((prev: DataType) => ({ ...prev, profilePic: resizedBase64 }));
              }
            };
            
            img.onerror = () => {
              alert('Failed to process image. Please try another photo.');
            };
          }
        };
        reader.onerror = () => {
          alert('Failed to read image. Please try again.');
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
  
  // Count only non-warmup, non-drop sets before and including this one
  let regularSetNumber = 0;
  for (let i = 0; i <= setIdx; i++) {
    if (!allSets[i].isDropSet && allSets[i].type !== 'W') {
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
<div style={{ textAlign: 'center', fontWeight: '600', color: 'var(--text-muted)' }}>{data.intensityMetric.toUpperCase()}</div>
{ex.sets?.map((s: any, sIdx: number) => (
  <React.Fragment key={sIdx}>
    <div style={{
      fontWeight: '500',
      color: s.type === 'W' ? '#FFB800' : s.type === 'D' ? '#FF6B6B' : 'var(--text)'
    }}>{getSetLabel(s, sIdx, ex.sets || [])}</div>
    <div style={{ textAlign: 'center' }}>{s.weight}</div>
    <div style={{ textAlign: 'center' }}>{s.reps}</div>
    <div style={{ textAlign: 'center' }}>{data.intensityMetric === 'rpe' ? s.rpe : s.rir}</div>
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
          background: 'rgba(0, 0, 0, 0.5)',
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
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>        
      <div className="profile-pic" style={{ backgroundImage: `url('${data.profilePic}')` }} onClick={editProfilePic}></div>
      <div className="profile-name" id="profile-fullname">{data.firstName} {data.lastName}</div>
      <div className="profile-username">@{data.username}</div>
      <div className="profile-location" id="profile-location">{data.country}{data.state ? ', ' + data.state : ''}</div>
    </div>
<div className="profile-info" style={{
  padding: '0 20px',
  marginTop: '-30px',
  position: 'relative',
  zIndex: 10,
}}>
  <h1 style={{
    fontSize: '24px',
    fontWeight: '700',
    margin: '12px 0 4px 0',
    color: 'var(--text)',
  }}>{data.username || 'User'}</h1>
  
  {data.bio && (
    <p style={{
      fontSize: '14px',
      color: 'var(--text-muted)',
      margin: '0 0 16px 0',
      lineHeight: '1.4',
    }}>{data.bio}</p>
  )}
  // Replace the stats section in ProfileTab.tsx with this:

{/* Modern Stats Cards */}
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '8px',
  marginBottom: '16px',
  marginTop: '16px',
}}>
  <div style={{
    textAlign: 'center',
    padding: '12px 8px',
    background: 'var(--bg-lighter)',
    borderRadius: '12px',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      fontSize: '24px',
      fontWeight: '700',
      color: 'var(--text)',
      lineHeight: '1',
    }}>
      {data.history.length}
    </div>
    <div style={{
      fontSize: '11px',
      color: 'var(--text-muted)',
      fontWeight: '500',
      marginTop: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      Workouts
    </div>
  </div>

  <div 
    onClick={() => setData((prev: DataType) => ({ 
      ...prev, 
      activeModal: 'friends-modal',
      previousModal: 'profile-tab'
    }))}
    style={{
      textAlign: 'center',
      padding: '12px 8px',
      background: 'var(--bg-lighter)',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.02)';
      e.currentTarget.style.background = 'var(--bg-medium)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.background = 'var(--bg-lighter)';
    }}
  >
    <div style={{
      fontSize: '24px',
      fontWeight: '700',
      color: 'var(--text)',
      lineHeight: '1',
    }}>
      {data.friends.length}
    </div>
    <div style={{
      fontSize: '11px',
      color: 'var(--text-muted)',
      fontWeight: '500',
      marginTop: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      Friends
    </div>
  </div>

  <div style={{
    textAlign: 'center',
    padding: '12px 8px',
    background: 'var(--bg-lighter)',
    borderRadius: '12px',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      fontSize: '24px',
      fontWeight: '700',
      color: 'var(--text)',
      lineHeight: '1',
    }}>
      {Math.round(totalVolume / 1000)}K
    </div>
    <div style={{
      fontSize: '11px',
      color: 'var(--text-muted)',
      fontWeight: '500',
      marginTop: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      Total {data.weightUnit || 'lbs'}
    </div>
  </div>
</div>

{/* Modern Action Buttons */}
<div style={{
  display: 'flex',
  gap: '8px',
  marginBottom: '20px',
}}>
  <button
    onClick={openEditProfileModal}
    style={{
      flex: 1,
      background: 'var(--bg-lighter)',
      color: 'var(--text)',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--bg-medium)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'var(--bg-lighter)';
    }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
    Edit Profile
  </button>

  <button
    onClick={toggleHistorySection}
    style={{
      flex: 1,
      background: showHistory ? 'var(--accent-primary)' : 'var(--bg-lighter)',
      color: showHistory ? 'white' : 'var(--text)',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
    }}
    onMouseEnter={(e) => {
      if (!showHistory) {
        e.currentTarget.style.background = 'var(--bg-medium)';
      }
    }}
    onMouseLeave={(e) => {
      if (!showHistory) {
        e.currentTarget.style.background = 'var(--bg-lighter)';
      }
    }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
    <span>{showHistory ? 'Hide' : 'View'} History</span>
    {data.history.length > 0 && (
      <span style={{
        background: showHistory ? 'rgba(255,255,255,0.2)' : 'var(--bg-dark)',
        padding: '2px 6px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '700',
      }}>
        {data.history.length}
      </span>
    )}
  </button>
</div>
</div> 
    <div id="profile-history-section" className={showHistory ? '' : 'hidden'} style={{ padding: '0 20px' }}>
      <div id="history-list">{renderedHistory}</div>
    </div>
  </div>
);
};
export default ProfileTab;