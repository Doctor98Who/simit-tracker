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
  const { data, setData } = useContext(DataContext);
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
    }}
  >
    <div className="modal-content" style={{
      width: '100%',
      maxWidth: '100%',
      height: '100%',
      background: 'var(--bg-dark)',
      padding: 0,
      borderRadius: 0,
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: isPWAStandalone() ? 'env(safe-area-inset-bottom)' : '0', // Fix for PWA bottom
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-dark)',
        backdropFilter: 'blur(10px)',
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
        
        {/* Profile pic and username instead of "Progress Photo" */}
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

      {/* Image with navigation */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'black',
        overflow: 'hidden',
        position: 'relative',
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
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            ‹
          </button>
        )}

        <img
          src={selectedPhoto.base64}
          alt="Progress"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            backgroundColor: 'black',
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
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            ›
          </button>
        )}
      </div>

      {/* Photo details */}
      <div style={{
        padding: '20px',
        background: 'var(--bg-dark)',
        borderTop: '1px solid var(--border)',
        paddingBottom: isPWAStandalone() ? `calc(20px + 80px + env(safe-area-inset-bottom))` : '20px', // Extra padding in PWA
      }}>
        {isEditingCaption ? (
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '15px',
            alignItems: 'flex-end',
          }}>
            <input
              type="text"
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                background: 'var(--bg-lighter)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '0.95em',
              }}
              autoFocus
            />
            <button
              onClick={saveEditedCaption}
              style={{
                padding: '10px 20px',
                background: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9em',
                fontWeight: '600',
              }}
            >
              Save
            </button>
          </div>
        ) : (
          selectedPhoto.caption && (
            <p
              style={{
                margin: '0 0 15px 0',
                fontSize: '0.95em',
                color: 'var(--text)',
                cursor: 'pointer',
                padding: '8px',
                background: 'var(--bg-lighter)',
                borderRadius: '8px',
              }}
              onClick={() => setIsEditingCaption(true)}
            >
              {selectedPhoto.caption}
            </p>
          )
        )}

        <div style={{
          display: 'flex',
          gap: '20px',
          fontSize: '0.85em',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            📅 {new Date(selectedPhoto.timestamp).toLocaleDateString()}
          </span>
          {selectedPhoto.weight && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚖️ {selectedPhoto.weight} {data.weightUnit || 'lbs'}
            </span>
          )}
          {selectedPhoto.pump && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              💪 Pump: {selectedPhoto.pump}/100
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ProgressTab;