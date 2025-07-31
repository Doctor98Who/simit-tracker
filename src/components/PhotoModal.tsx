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
  
  const handleLike = async () => {
    if (!dbUser) return;
    
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
    if (!dbUser || !comment.trim()) return;
    
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
      className="modal active"
      style={{
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        height: '90vh',
        background: 'var(--bg-dark)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: window.innerWidth > 768 ? 'row' : 'column',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Image Section */}
        <div style={{
          flex: window.innerWidth > 768 ? '1.5' : '1',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          minHeight: window.innerWidth > 768 ? 'auto' : '50vh',
        }}>
          {/* Close button for mobile */}
          {window.innerWidth <= 768 && (
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.2em',
                cursor: 'pointer',
                zIndex: 20,
              }}
            >
              ✕
            </button>
          )}
          
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
                  transition: 'all 0.2s ease',
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
                  transition: 'all 0.2s ease',
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

        {/* Details Section */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-dark)',
          minWidth: window.innerWidth > 768 ? '380px' : 'auto',
          maxWidth: window.innerWidth > 768 ? '420px' : '100%',
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--bg-lighter)',
                backgroundImage: isOwn 
                  ? (data.profilePic ? `url(${data.profilePic})` : 'none')
                  : (localPhoto.user?.profile_pic ? `url(${localPhoto.user.profile_pic})` : 'none'),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }} />
              <div>
                <div style={{ fontWeight: '600', fontSize: '1em' }}>
                  {isOwn ? `${data.firstName} ${data.lastName}` : `${localPhoto.user?.first_name || ''} ${localPhoto.user?.last_name || ''}`}
                </div>
                <div style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
                  @{isOwn ? data.username : localPhoto.user?.username}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
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
                    color: 'var(--text-muted)',
                    fontSize: '1.2em',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  ⋯
                </button>
              )}
              {window.innerWidth > 768 && (
                <button
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '1.2em',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Content Section - Scrollable */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Actions & Info */}
            <div style={{ padding: '20px' }}>
              {/* Like & Share Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '16px',
              }}>
                <button
                  onClick={handleLike}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: localPhoto.userHasLiked ? '#ef4444' : 'var(--text)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '1.5em' }}>
                    {localPhoto.userHasLiked ? '❤️' : '🤍'}
                  </span>
                  <span style={{ fontSize: '0.95em', fontWeight: '500' }}>
                    {localPhoto.likes || 0}
                  </span>
                </button>
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
                      fontSize: '14px',
                      resize: 'vertical',
                      minHeight: '60px',
                      fontFamily: 'inherit',
                    }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={saveEditedCaption}
                      style={{
                        padding: '6px 16px',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
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
                        padding: '6px 16px',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        fontSize: '0.85em',
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

              {/* Photo metadata */}
              <div style={{
                display: 'flex',
                gap: '16px',
                fontSize: '0.85em',
                color: 'var(--text-muted)',
                flexWrap: 'wrap',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border)',
              }}>
                <span>{new Date(localPhoto.timestamp).toLocaleDateString()}</span>
                {localPhoto.weight && (
                  <span>⚖️ {localPhoto.weight} {data.weightUnit || 'lbs'}</span>
                )}
                {localPhoto.pump && (
                  <span>💪 Pump: {localPhoto.pump}/100</span>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div style={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '0 20px 20px',
            }}>
              <h4 style={{ 
                margin: '0 0 16px 0', 
                fontSize: '0.9em',
                fontWeight: '600',
                color: 'var(--text-muted)',
              }}>
                Comments ({(localPhoto.comments || []).length})
              </h4>
              
              {/* Comments List */}
              <div style={{ 
                flex: 1,
                overflowY: 'auto',
                marginBottom: '12px',
                minHeight: '100px',
              }}>
                {(localPhoto.comments || []).length === 0 ? (
                  <p style={{
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.9em',
                    padding: '20px',
                  }}>
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  (localPhoto.comments || []).map((comment: any, idx: number) => (
                    <div key={idx} style={{
                      marginBottom: '12px',
                      display: 'flex',
                      gap: '10px',
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--bg-lighter)',
                        flexShrink: 0,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          background: 'var(--bg-lighter)',
                          borderRadius: '12px',
                          padding: '8px 12px',
                        }}>
                          <div style={{ 
                            fontWeight: '600', 
                            fontSize: '0.85em', 
                            marginBottom: '2px' 
                          }}>
                            {comment.user_name}
                          </div>
                          <div style={{ fontSize: '0.9em' }}>{comment.text}</div>
                        </div>
                        <div style={{ 
                          fontSize: '0.75em', 
                          color: 'var(--text-muted)', 
                          marginTop: '4px',
                          paddingLeft: '12px',
                        }}>
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Fixed Comment Input */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-dark)',
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Add a comment..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: 'var(--bg-lighter)',
                  border: '1px solid var(--border)',
                  borderRadius: '24px',
                  color: 'var(--text)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleComment}
                disabled={!comment.trim()}
                style={{
                  padding: '10px 20px',
                  background: comment.trim() ? 'var(--accent-primary)' : 'var(--bg-lighter)',
                  color: comment.trim() ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '24px',
                  fontSize: '0.85em',
                  fontWeight: '600',
                  cursor: comment.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                }}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;