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

  const sortedProgressPics = useMemo(() => [...data.progressPics].sort((a: ProgressPic, b: ProgressPic) => b.timestamp - a.timestamp), [data.progressPics]);

  const openPhotoModal = (pic: ProgressPic) => {
    setSelectedPhoto(pic);
    setData(prev => ({ ...prev, activeModal: 'progress-photo-modal' }));
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
    setData(prev => ({ ...prev, activeModal: null }));
  };

  const uploadProgressPic = () => {
    setData(prev => ({ ...prev, activeModal: 'progress-upload-modal' }));
  };

  const deleteProgressPic = (index: number) => {
    if (window.confirm("Are you sure you want to delete this progress pic?")) {
      const newPics = [...data.progressPics];
      const actualIndex = data.progressPics.indexOf(sortedProgressPics[index]);
      newPics.splice(actualIndex, 1);
      setData(prev => ({ ...prev, progressPics: newPics }));
      closePhotoModal();
    }
  };

  const renderedProgressPics = useMemo(() => sortedProgressPics.map((pic: ProgressPic, index: number) => (
    <div 
      key={index} 
      className="progress-pic"
      onClick={() => openPhotoModal(pic)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        aspectRatio: '1',
        overflow: 'hidden',
        background: 'var(--bg-lighter)',
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
    </div>
  )), [sortedProgressPics]);

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5em' }}>Progress</h1>
        <button 
          onClick={uploadProgressPic}
          style={{
            background: 'var(--accent-primary)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            padding: '8px 16px',
            fontSize: '0.9em',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          + Add Photo
        </button>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2px',
        padding: '2px',
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
              padding: '16px',
              borderBottom: '1px solid var(--border)',
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
                }}
              >
                ✕
              </button>
              <span style={{ fontSize: '1.1em', fontWeight: '600' }}>Progress Photo</span>
              <button
                onClick={() => {
                  const index = sortedProgressPics.indexOf(selectedPhoto);
                  if (index !== -1) deleteProgressPic(index);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '1em',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                🗑️
              </button>
            </div>

            {/* Image */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'black',
              overflow: 'hidden',
            }}>
              <img 
                src={selectedPhoto.base64} 
                alt="Progress"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* Details */}
            <div style={{
              padding: '16px',
              borderTop: '1px solid var(--border)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '12px',
              }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text)',
                    fontSize: '1.5em',
                    cursor: 'pointer',
                    padding: 0,
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
                >
                  {selectedPhoto.likes ? '❤️' : '🤍'}
                </button>
                <span style={{ fontSize: '0.9em' }}>
                  {selectedPhoto.likes || 0} likes
                </span>
              </div>

              {selectedPhoto.caption && (
                <p style={{ margin: '0 0 8px 0' }}>{selectedPhoto.caption}</p>
              )}

              <div style={{
                display: 'flex',
                gap: '16px',
                fontSize: '0.85em',
                color: 'var(--text-muted)',
              }}>
                <span>📅 {new Date(selectedPhoto.timestamp).toLocaleDateString()}</span>
                {selectedPhoto.weight && <span>⚖️ {selectedPhoto.weight} lbs</span>}
                {selectedPhoto.pump && <span>💪 Pump: {selectedPhoto.pump}/100</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTab;