import React, { useState, useContext, useEffect } from 'react';
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
  
  // Get initial photo from context
  const getPhotoFromContext = () => {
    return isOwn 
      ? data.progressPics.find(p => p.id === photo.id) || photo
      : data.friendsFeed.find(p => p.id === photo.id) || photo;
  };
  
  // Use local state for immediate updates
  const [localPhoto, setLocalPhoto] = useState(getPhotoFromContext());
  
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editCaption, setEditCaption] = useState(localPhoto.caption || '');
  const [comment, setComment] = useState('');
  
  // Debug logs
  console.log('PhotoModal rendered with localPhoto:', localPhoto);
  
  const handleLike = async () => {
    console.log('handleLike called');
    
    if (!dbUser) {
      console.log('No dbUser found!');
      return;
    }
    
    try {
      // Optimistically update UI before API call
      const optimisticUpdate = {
        ...localPhoto,
        likes: localPhoto.userHasLiked 
          ? Math.max((localPhoto.likes || 0) - 1, 0)
          : (localPhoto.likes || 0) + 1,
        userHasLiked: !localPhoto.userHasLiked
      };
      
      // Update local state immediately
      setLocalPhoto(optimisticUpdate);
      
      // Then make API call
      const result = await DatabaseService.likePhoto(dbUser.id, localPhoto.id);
      console.log('Like result:', result);
      
      // Update context for persistence
      if (isOwn) {
        setData(prev => ({
          ...prev,
          progressPics: prev.progressPics.map(p =>
            p.id === localPhoto.id ? optimisticUpdate : p
          )
        }));
      } else {
        setData(prev => ({
          ...prev,
          friendsFeed: prev.friendsFeed.map(item =>
            item.id === localPhoto.id ? optimisticUpdate : item
          )
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setLocalPhoto(getPhotoFromContext());
    }
  };
  
  const handleComment = async () => {
    console.log('handleComment called');
    
    if (!dbUser || !comment.trim()) {
      console.log('No dbUser or empty comment!');
      return;
    }
    
    try {
      const newComment = {
        user_id: dbUser.id,
        user_name: `${data.firstName} ${data.lastName}`,
        text: comment,
        timestamp: Date.now()
      };
      
      // Optimistically update UI
      const optimisticUpdate = {
        ...localPhoto,
        comments: [...(localPhoto.comments || []), newComment]
      };
      
      // Update local state immediately
      setLocalPhoto(optimisticUpdate);
      setComment(''); // Clear input immediately
      
      // Then make API call
      await DatabaseService.addComment(dbUser.id, localPhoto.id, comment);
      
      // Update context for persistence
      if (isOwn) {
        setData(prev => ({
          ...prev,
          progressPics: prev.progressPics.map(p =>
            p.id === localPhoto.id ? optimisticUpdate : p
          )
        }));
      } else {
        setData(prev => ({
          ...prev,
          friendsFeed: prev.friendsFeed.map(item =>
            item.id === localPhoto.id ? optimisticUpdate : item
          )
        }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      // Don't revert comments on error - they're already saved
    }
  };
  const saveEditedCaption = () => {
    if (!isOwn) return;
   
    const newPics = [...data.progressPics];
    const index = data.progressPics.findIndex((p: any) =>
      p.id === localPhoto.id
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
            {isOwn ? 'Your Photo' : `${localPhoto.user?.first_name || 'User'}'s Photo`}
          </span>
          {isOwn && (
            <button
              onClick={() => setData(prev => ({ 
                ...prev, 
                activeModal: 'photo-menu-modal',
                tempBase64: localPhoto.base64,
                tempTimestamp: localPhoto.timestamp
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
            src={localPhoto.base64} 
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
    color: localPhoto.userHasLiked ? '#ef4444' : 'var(--text)',
    fontSize: '1.8em',
    cursor: 'pointer',
    padding: 0,
    minHeight: 'auto',
    transition: 'all 0.2s ease',
  }}
  onClick={() => {
    console.log('Like button clicked!');
    console.log('dbUser:', dbUser);
    console.log('photo.id:', localPhoto.id);
  
    handleLike();
  }}
>
  {localPhoto.userHasLiked ? '❤️' : '🤍'}
</button>
  <span style={{ fontSize: '0.95em', fontWeight: '500' }}>
    {localPhoto.likes || 0} {localPhoto.likes === 1 ? 'like' : 'likes'}
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
                    setEditCaption(localPhoto.caption || '');
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
            localPhoto.caption && (
              <p style={{ 
                margin: '0 0 16px 0',
                fontSize: '0.95em',
                lineHeight: '1.5',
                cursor: isOwn ? 'pointer' : 'default',
              }}
              onClick={() => isOwn && setIsEditingCaption(true)}
              >
                {localPhoto.caption}
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
            <span>📅 {new Date(localPhoto.timestamp).toLocaleDateString()}</span>
            {localPhoto.weight && (
              <span>⚖️ {localPhoto.weight} {data.weightUnit || 'lbs'}</span>
            )}
            {localPhoto.pump && (
              <span>💪 Pump: {localPhoto.pump}/100</span>
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
              {(localPhoto.comments || []).map((comment: any, idx: number) => (
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