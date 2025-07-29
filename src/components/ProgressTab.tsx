import React, { useContext, useMemo, useState } from 'react';
import EXIF from 'exif-js';
import { DataContext } from '../DataContext';

interface ProgressPic {
  base64: string;
  timestamp: number;
  weight?: string;
  caption?: string;
  pump?: number;
  likes?: number;
  comments?: { user: string; text: string; timestamp: number }[];
}

const ProgressTab = () => {
  const { data, setData } = useContext(DataContext);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPic | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editCaption, setEditCaption] = useState('');

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
  
  // Ensure clean state
  setData(prev => ({ 
    ...prev, 
    activeModal: 'progress-upload-modal',
    tempBase64: null,
    tempTimestamp: null,
    activeTab: 'progress-tab' // Ensure we're on right tab
  }));
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

  const renderedProgressPics = useMemo(() => sortedProgressPics.map((pic: ProgressPic, index: number) => (
    <div 
      key={index} 
      className="progress-pic"
      onClick={() => openPhotoModal(pic, index)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        aspectRatio: '1',
        overflow: 'hidden',
        background: 'var(--bg-lighter)',
        borderRadius: '2px',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(0.95)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <img 
        src={pic.base64} 
        alt="Progress" 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      {pic.pump && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '4px 8px',
          fontSize: '0.7em',
          color: 'white',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          💪 {pic.pump}
        </div>
      )}
    </div>
  )), [sortedProgressPics]);

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
        gap: '2px',
        padding: '2px',
        background: 'var(--bg-dark)',
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
              <span style={{ fontSize: '1.1em', fontWeight: '600' }}>Progress Photo</span>
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

            {/* Details */}
            <div style={{
              padding: '20px',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-dark)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px',
              }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text)',
                    fontSize: '1.8em',
                    cursor: 'pointer',
                    padding: 0,
                    minHeight: 'auto',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => {
                    const newPics = [...data.progressPics];
                    const index = data.progressPics.indexOf(selectedPhoto);
                    if (index !== -1) {
                      newPics[index] = {
                        ...newPics[index],
                        likes: (newPics[index].likes || 0) + 1,
                      };
                      setData(prev => ({ ...prev, progressPics: newPics }));
                      setSelectedPhoto({ ...selectedPhoto, likes: (selectedPhoto.likes || 0) + 1 });
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {selectedPhoto.likes ? '❤️' : '🤍'}
                </button>
                <span style={{ fontSize: '0.95em', fontWeight: '500' }}>
                  {selectedPhoto.likes || 0} likes
                </span>
              </div>

              {isEditingCaption ? (
                <div style={{ marginBottom: '16px' }}>
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--bg-lighter)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text)',
                      fontSize: '16px',
                      resize: 'vertical',
                      minHeight: '80px',
                    }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={saveEditedCaption}
                      style={{
                        padding: '8px 16px',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.85em',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingCaption(false);
                        setEditCaption(selectedPhoto.caption || '');
                      }}
                      style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '0.85em',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                selectedPhoto.caption && (
                  <p style={{ 
                    margin: '0 0 16px 0',
                    fontSize: '0.95em',
                    lineHeight: '1.5',
                    cursor: 'pointer',
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