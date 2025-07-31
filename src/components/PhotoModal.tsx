import React, { useState, useContext } from 'react';
import { DataContext } from '../DataContext';
import { DatabaseService } from '../services/database';

interface PhotoModalProps {
  photo: any;
  isOwn: boolean;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  showNavigation?: boolean;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ 
  photo, 
  isOwn, 
  onClose, 
  onNavigate,
  showNavigation = false 
}) => {
  const { data, setData, dbUser } = useContext(DataContext);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editCaption, setEditCaption] = useState(photo.caption || '');
  const [comment, setComment] = useState('');

const handleLike = async () => {
  if (!dbUser) return;
  
  try {
    // Toggle like in database
    const result = await DatabaseService.likePhoto(dbUser.id, photo.id);
    
    // Update local state
    const updatedPhoto = { 
      ...photo, 
      likes: result.liked ? (photo.likes || 0) + 1 : Math.max((photo.likes || 0) - 1, 0),
      userHasLiked: result.liked
    };
    
    // Update in local data
    if (isOwn) {
      const newPics = data.progressPics.map(p => 
        p.id === photo.id ? updatedPhoto : p
      );
      setData(prev => ({ ...prev, progressPics: newPics }));
    } else {
      const newFeed = data.friendsFeed.map(item => 
        item.id === photo.id ? updatedPhoto : item
      );
      setData(prev => ({ ...prev, friendsFeed: newFeed }));
    }
  } catch (error) {
    console.error('Error toggling like:', error);
  }
};

  const handleComment = async () => {
    if (!dbUser || !comment.trim()) return;
    
    try {
      const newComment = {
        user_id: dbUser.id,
        user_name: `${data.firstName} ${data.lastName}`,
        text: comment,
        timestamp: Date.now()
      };
      
      // Update in database
      await DatabaseService.addComment(dbUser.id, photo.id, comment);
      
      // Update local state
      const updatedPhoto = { 
        ...photo, 
        comments: [...(photo.comments || []), newComment] 
      };
      
      if (isOwn) {
        const newPics = data.progressPics.map(p => 
          p.id === photo.id ? updatedPhoto : p
        );
        setData(prev => ({ ...prev, progressPics: newPics }));
      } else {
        const newFeed = data.friendsFeed.map(item => 
          item.id === photo.id ? updatedPhoto : item
        );
        setData(prev => ({ ...prev, friendsFeed: newFeed }));
      }
      
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const saveEditedCaption = () => {
    if (!isOwn) return;
    
    const newPics = [...data.progressPics];
    const index = data.progressPics.findIndex((p: any) => 
      p.id === photo.id
    );
    if (index !== -1) {
      newPics[index] = { ...newPics[index], caption: editCaption };
      setData(prev => ({ ...prev, progressPics: newPics }));
    }
    setIsEditingCaption(false);
  };

  return (
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
            onClick={onClose}
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
          <span style={{ fontSize: '1.1em', fontWeight: '600' }}>
            {isOwn ? 'Your Photo' : `${photo.user?.first_name || 'User'}'s Photo`}
          </span>
          {isOwn && (
            <button
              onClick={() => setData(prev => ({ 
                ...prev, 
                activeModal: 'photo-menu-modal',
                tempBase64: photo.base64,
                tempTimestamp: photo.timestamp
              }))}
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
          )}
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
          {showNavigation && onNavigate && (
            <>
              <button
                onClick={() => onNavigate('prev')}
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
              <button
                onClick={() => onNavigate('next')}
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
            </>
          )}
          
          <img 
            src={photo.base64} 
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
          padding: '20px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-dark)',
          maxHeight: '40%',
          overflowY: 'auto',
        }}>
{/* Like button */}
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
      color: photo.userHasLiked ? '#ef4444' : 'var(--text)',
      fontSize: '1.8em',
      cursor: 'pointer',
      padding: 0,
      minHeight: 'auto',
      transition: 'all 0.2s ease',
    }}
    onClick={handleLike}
  >
    {photo.userHasLiked ? '❤️' : '🤍'}
  </button>
  <span style={{ fontSize: '0.95em', fontWeight: '500' }}>
    {photo.likes || 0} {photo.likes === 1 ? 'like' : 'likes'}
  </span>
</div>
          {/* Caption */}
          {isEditingCaption && isOwn ? (
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
                    setEditCaption(photo.caption || '');
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
            photo.caption && (
              <p style={{ 
                margin: '0 0 16px 0',
                fontSize: '0.95em',
                lineHeight: '1.5',
                cursor: isOwn ? 'pointer' : 'default',
              }}
              onClick={() => isOwn && setIsEditingCaption(true)}
              >
                {photo.caption}
              </p>
            )
          )}

          {/* Photo details */}
          <div style={{
            display: 'flex',
            gap: '20px',
            fontSize: '0.85em',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            marginBottom: '16px',
          }}>
            <span>📅 {new Date(photo.timestamp).toLocaleDateString()}</span>
            {photo.weight && (
              <span>⚖️ {photo.weight} {data.weightUnit || 'lbs'}</span>
            )}
            {photo.pump && (
              <span>💪 Pump: {photo.pump}/100</span>
            )}
          </div>

          {/* Comments section */}
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1em' }}>Comments</h4>
            
            {/* Comment input */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Add a comment..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'var(--bg-lighter)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={handleComment}
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
                Post
              </button>
            </div>

            {/* Comments list */}
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {(photo.comments || []).map((comment: any, idx: number) => (
                <div key={idx} style={{
                  marginBottom: '12px',
                  padding: '8px',
                  background: 'var(--bg-lighter)',
                  borderRadius: '8px',
                }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9em', marginBottom: '4px' }}>
                    {comment.user_name}
                  </div>
                  <div style={{ fontSize: '0.9em' }}>{comment.text}</div>
                  <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(comment.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;