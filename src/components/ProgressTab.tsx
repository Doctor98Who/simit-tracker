import React, { useContext, useMemo, useState } from 'react';
import { DataContext } from '../DataContext';

interface ProgressPic {
  base64: string;
  timestamp: number;
  weight?: string;
  caption?: string;
  pump?: number;
  likes?: number;
  comments?: { user: string; text: string; timestamp: number }[];
  isPublic?: boolean;
  id?: string;
}
const ProgressTab = () => {
  const { data, setData, dbUser } = useContext(DataContext);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPic | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editCaption, setEditCaption] = useState('');
    const isPWAStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches;
  };
  const sortedProgressPics = useMemo(() => [...data.progressPics].sort((a: ProgressPic, b: ProgressPic) => b.timestamp - a.timestamp), [data.progressPics]);

  const openPhotoModal = (pic: ProgressPic, index: number) => {
    setSelectedPhoto(pic);
    setSelectedPhotoIndex(index);
    setEditCaption(pic.caption || '');
    setIsEditingCaption(false);
    setData(prev => ({
      ...prev,
      activeModal: 'progress-photo-modal',
      tempBase64: pic.base64,
      tempTimestamp: pic.timestamp
    }));
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    let newIndex = selectedPhotoIndex;
    if (direction === 'prev' && selectedPhotoIndex > 0) {
      newIndex = selectedPhotoIndex - 1;
    } else if (direction === 'next' && selectedPhotoIndex < sortedProgressPics.length - 1) {
      newIndex = selectedPhotoIndex + 1;
    }
    setSelectedPhotoIndex(newIndex);
    const newPhoto = sortedProgressPics[newIndex];
    setSelectedPhoto(newPhoto);
    setEditCaption(newPhoto.caption || '');
    setIsEditingCaption(false);
    setData(prev => ({
      ...prev,
      tempBase64: newPhoto.base64,
      tempTimestamp: newPhoto.timestamp
    }));
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
    setIsEditingCaption(false);
    setData(prev => ({
      ...prev,
      activeModal: null,
      tempBase64: null,
      tempTimestamp: null
    }));
  };

const uploadProgressPic = () => {
    // Clean up any stuck states
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';

    // Create and trigger file input immediately
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
  const result = event.target?.result;
  if (result && typeof result === 'string') {
    // Now open the modal with the photo already loaded
    setData(prev => ({
      ...prev,
      activeModal: 'progress-upload-modal',
      tempBase64: result,
      tempTimestamp: Date.now(),
      activeTab: 'progress-tab',
      tempIsPublic: false
    }));
  }
};
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };
  const saveEditedCaption = () => {
    if (selectedPhoto) {
      const newPics = [...data.progressPics];
      const index = data.progressPics.findIndex((p: ProgressPic) =>
        p.base64 === selectedPhoto.base64 && p.timestamp === selectedPhoto.timestamp
      );
      if (index !== -1) {
        newPics[index] = { ...newPics[index], caption: editCaption };
        setData(prev => ({ ...prev, progressPics: newPics }));
        setSelectedPhoto({ ...selectedPhoto, caption: editCaption });
      }
    }
    setIsEditingCaption(false);
  };

const renderedProgressPics = useMemo(() => sortedProgressPics.map((pic: ProgressPic, index: number) => {
  // Find matching photo from friendsFeed to get synced data
  const syncedPhoto = data.friendsFeed.find((item: any) => 
    item.base64 === pic.base64 && item.timestamp === pic.timestamp
  ) || pic;
  
  return (
    <div
      key={index}
      className="progress-pic"
      onClick={() => openPhotoModal(syncedPhoto, index)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        aspectRatio: '1',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      <img
        src={pic.base64}
        alt="Progress"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      {/* Show likes count if any */}
{(syncedPhoto.likes || 0) > 0 && (
          <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          padding: '4px 8px',
          fontSize: '11px',
          color: 'white',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          ❤️ {syncedPhoto.likes}
        </div>
      )}
      {pic.pump && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(147, 51, 234, 0.9))',
          backdropFilter: 'blur(8px)',
          borderRadius: '16px',
          padding: '4px 10px',
          fontSize: '11px',
          color: 'white',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.5 9.5L18.5 8.5C17.5 7.5 16 7 14.5 7C13 7 11.5 7.5 10.5 8.5L9.5 9.5L8.5 8.5C7.5 7.5 6 7 4.5 7C3 7 1.5 7.5 0.5 8.5L0.5 8.5C-0.5 9.5 -0.5 11 0.5 12L7.5 19C8.5 20 10 20.5 11.5 20.5C13 20.5 14.5 20 15.5 19L22.5 12C23.5 11 23.5 9.5 22.5 8.5C21.5 7.5 20.5 7.5 19.5 8.5V9.5Z"
              fill="white"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M15 3L17 5L15 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 3L7 5L9 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {pic.pump}
        </div>
      )}
    </div>
  );
}), [sortedProgressPics, data.friendsFeed]);

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        background: 'transparent',
        marginBottom: '20px',
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '1.2em',
          fontWeight: '600',
          color: 'var(--text)',
        }}>Progress Feed</h2>
        <div
          onClick={uploadProgressPic}
          style={{
            color: 'var(--accent-primary)',
            fontSize: '1em',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          + Add Photo
        </div>
      </div>
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '1px',
  background: data.theme === 'light' ? '#e0e0e0' : '#000',  // Light gray for light mode, black for dark
  margin: '0 -20px',  // Full width to edges
}}>
          {renderedProgressPics}
      </div>
{/* Photo Detail Modal */}
{selectedPhoto && data.activeModal === 'progress-photo-modal' && (
  <div
    className="modal active progress-photo-modal"
    style={{
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
    }}
  >
    <div className="modal-content" style={{
      width: '100%',
      maxWidth: '100%',
      height: '100vh',
      background: 'var(--bg-dark)',
      padding: 0,
      paddingTop: isPWAStandalone() ? 'env(safe-area-inset-top)' : '0',
      borderRadius: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-dark)',
        flexShrink: 0,
      }}>
        <button
          onClick={closePhotoModal}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text)',
            fontSize: '1.2em',
            cursor: 'pointer',
            padding: '4px',
            minHeight: 'auto',
          }}
        >
          ✕
        </button>
        
        {/* Profile pic and username */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flex: 1,
          justifyContent: 'center',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--bg-lighter)',
            backgroundImage: data.profilePic ? `url(${data.profilePic})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
          <span style={{ fontSize: '1em', fontWeight: '600' }}>
            {data.username}
          </span>
        </div>
        
        <button
          onClick={() => setData(prev => ({ ...prev, activeModal: 'photo-menu-modal' }))}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text)',
            fontSize: '1em',
            cursor: 'pointer',
            padding: '4px',
            minHeight: 'auto',
          }}
        >
          ⋯
        </button>
      </div>

      {/* Image container - NO FLEX:1 to prevent spacing */}
      <div style={{
        width: '100%',
        backgroundColor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
      }}>
        {selectedPhotoIndex > 0 && (
          <button
            onClick={() => navigatePhoto('prev')}
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.2em',
              color: 'white',
              zIndex: 10,
            }}
          >
            ‹
          </button>
        )}

        <img
          src={selectedPhoto.base64}
          alt="Progress"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            maxHeight: '60vh',
            objectFit: 'contain',
          }}
        />
        
        {selectedPhotoIndex < sortedProgressPics.length - 1 && (
          <button
            onClick={() => navigatePhoto('next')}
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.2em',
              color: 'white',
              zIndex: 10,
            }}
          >
            ›
          </button>
        )}
      </div>

      {/* Scrollable content section */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}>
        {/* Get synced data */}
{(() => {
  const syncedPhoto = data.friendsFeed.find((item: any) => 
    item.base64 === selectedPhoto.base64 && item.timestamp === selectedPhoto.timestamp
  ) || data.progressPics.find((item: any) => 
    item.base64 === selectedPhoto.base64 && item.timestamp === selectedPhoto.timestamp
  ) || selectedPhoto;

  // Local state for likes
  const [localLikes, setLocalLikes] = useState(syncedPhoto.likes || 0);
  const [userHasLiked, setUserHasLiked] = useState((syncedPhoto as any).userHasLiked || false);

  const handleLike = async () => {
    if (!dbUser) return;  // Now using dbUser instead of data.dbUser
    
    // Optimistic update
    setUserHasLiked(!userHasLiked);
    setLocalLikes(userHasLiked ? Math.max(localLikes - 1, 0) : localLikes + 1);
    
    try {
      // API call would go here
      // await DatabaseService.likePhoto(dbUser.id, syncedPhoto.id);
    } catch (error) {
      // Revert on error
      setUserHasLiked(userHasLiked);
      setLocalLikes(localLikes);
    }
  };
          return (
            <>
              {/* Actions section */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                }}>
                  {/* Like button */}
                  <button
                    onClick={handleLike}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text)',
                      padding: '4px',
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill={userHasLiked ? '#ef4444' : 'none'}
                      stroke={userHasLiked ? '#ef4444' : 'currentColor'}
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span style={{ fontSize: '0.9em', fontWeight: '500' }}>
                      {localLikes}
                    </span>
                  </button>

                  {/* Comment button */}
                  <button
                    onClick={() => {
                      setData(prev => ({
                        ...prev,
                        selectedPhoto: syncedPhoto,
                        showComments: true,
                        activeModal: null
                      }));
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text)',
                      padding: '4px',
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span style={{ fontSize: '0.9em', fontWeight: '500' }}>
                      {(syncedPhoto.comments || []).length}
                    </span>
                  </button>
                </div>

                {/* Pump rating */}
                {syncedPhoto.pump && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
                    borderRadius: '20px',
                    fontSize: '0.85em',
                  }}>
                    <span style={{ fontWeight: '600' }}>💪</span>
                    <span style={{ fontWeight: '500' }}>{syncedPhoto.pump}/100</span>
                  </div>
                )}
              </div>

              {/* Photo details section */}
              <div style={{
                padding: '16px 20px',
                paddingBottom: isPWAStandalone() ? `calc(16px + 80px + env(safe-area-inset-bottom))` : '16px',
              }}>
                {/* Like count */}
                {localLikes > 0 && (
                  <div style={{
                    fontSize: '0.9em',
                    fontWeight: '600',
                    marginBottom: '8px',
                  }}>
                    {localLikes} {localLikes === 1 ? 'like' : 'likes'}
                  </div>
                )}

                {/* Caption */}
                {syncedPhoto.caption && (
                  <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '0.95em',
                    lineHeight: '1.4',
                  }}>
                    <span style={{ fontWeight: '600' }}>
                      {data.username}
                    </span>{' '}
                    {syncedPhoto.caption}
                  </p>
                )}

                {/* Comments preview */}
                {syncedPhoto.comments && syncedPhoto.comments.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    {syncedPhoto.comments.slice(0, 2).map((comment: any, idx: number) => (
                      <p key={idx} style={{ 
                        margin: '4px 0', 
                        fontSize: '0.9em',
                        lineHeight: '1.4',
                      }}>
                        <span style={{ fontWeight: '600' }}>
                          {comment.user_name.split(' ')[0]}
                        </span>{' '}
                        {comment.text.length > 60 
                          ? comment.text.substring(0, 60) + '...' 
                          : comment.text
                        }
                      </p>
                    ))}
                    {syncedPhoto.comments.length > 2 && (
                      <button
                        onClick={() => {
                          setData(prev => ({
                            ...prev,
                            selectedPhoto: syncedPhoto,
                            showComments: true,
                            activeModal: null
                          }));
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '0.9em',
                          cursor: 'pointer',
                          padding: '4px 0',
                          marginTop: '4px',
                        }}
                      >
                        View all {syncedPhoto.comments.length} comments
                      </button>
                    )}
                  </div>
                )}

                {/* Photo metadata */}
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  fontSize: '0.85em',
                  color: 'var(--text-muted)',
                  flexWrap: 'wrap',
                  marginTop: '12px',
                }}>
                  <span>📅 {new Date(syncedPhoto.timestamp).toLocaleDateString()}</span>
                  {syncedPhoto.weight && (
                    <span>⚖️ {syncedPhoto.weight} {data.weightUnit || 'lbs'}</span>
                  )}
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  </div>
)}    </div>
  );
};

export default ProgressTab;