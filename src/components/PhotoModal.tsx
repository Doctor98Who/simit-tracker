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

  const handleDeleteComment = async (commentIdx: number) => {
    if (!dbUser) return;
    
    const commentToDelete = localPhoto.comments[commentIdx];
    if (!commentToDelete || commentToDelete.user_id !== dbUser.id) return;
    
    try {
      // Optimistically update UI
      const updatedComments = localPhoto.comments.filter((_: any, idx: number) => idx !== commentIdx);
      const optimisticUpdate = {
        ...localPhoto,
        comments: updatedComments
      };
      
      // Update local state immediately
      setLocalPhoto(optimisticUpdate);
      
      // For now, we'll just update locally since we don't have comment IDs
      // In a real implementation, you'd call DatabaseService.deleteComment(commentId)
      
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
      console.error('Error deleting comment:', error);
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
        alignItems: 'flex-start', // Changed from center to flex-start
        justifyContent: 'center',
        paddingTop: '0', // Remove any top padding
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
              backgroundImage: isOwn 
                ? (data.profilePic ? `url(${data.profilePic})` : 'none')
                : (localPhoto.user?.profile_pic ? `url(${localPhoto.user.profile_pic})` : 'none'),
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }} />
            <span style={{ fontSize: '1em', fontWeight: '600' }}>
              {isOwn ? data.username : localPhoto.user?.username || 'User'}
            </span>
          </div>
          
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'black',
          overflow: 'hidden',
          position: 'relative',
          width: '100%',
          // Let image determine its own height
          flexShrink: 0, // Prevent shrinking
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
              width: '100%',
              height: 'auto',
              maxHeight: '50vh',
              objectFit: 'contain',
              display: 'block', // Remove any inline spacing
            }}
          />              
        </div>

        {/* Details */}
        <div style={{
          flex: 1, // Take remaining space
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-dark)',
          overflow: 'hidden', // Prevent outer scroll
        }}>
          {/* Like button and stats in one row */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
              }}>
                {/* Like button */}
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={handleLike}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={localPhoto.userHasLiked ? '#ef4444' : 'none'}
                    stroke={localPhoto.userHasLiked ? '#ef4444' : 'currentColor'}
                    strokeWidth="2"
                    style={{ transition: 'all 0.2s ease' }}
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span style={{ 
                    fontSize: '0.95em', 
                    fontWeight: '500',
                    color: 'var(--text)',
                  }}>
                    {localPhoto.likes || 0}
                  </span>
                </button>

                {/* Date */}
                <span style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
                  {new Date(localPhoto.timestamp).toLocaleDateString()}
                </span>

                {/* Weight */}
                {localPhoto.weight && (
                  <span style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
                    ⚖️ {localPhoto.weight} {data.weightUnit || 'lbs'}
                  </span>
                )}

                {/* Pump */}
                {localPhoto.pump && (
                  <span style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
                    💯 {localPhoto.pump}/100
                  </span>
                )}
              </div>
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
          </div>

          {/* Comments section - takes remaining space */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '0 20px 20px',
            minHeight: 0, // Important for flex children with overflow
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1em' }}>
              Comments {(localPhoto.comments || []).length > 0 && `(${localPhoto.comments.length})`}
            </h4>
            
            {/* Comments list - takes remaining space */}
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              marginBottom: '12px',
              minHeight: '100px', // Ensure minimum visible height
            }}>
              {(localPhoto.comments || []).length === 0 ? (
                <p style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: '0.9em',
                  textAlign: 'center',
                  padding: '20px',
                }}>
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                (localPhoto.comments || []).map((comment: any, idx: number) => (
                <div key={idx} style={{
                  marginBottom: '12px',
                  padding: '8px',
                  background: 'var(--bg-lighter)',
                  borderRadius: '8px',
                  position: 'relative',
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9em', marginBottom: '4px' }}>
                        {comment.user_name}
                      </div>
                      <div style={{ fontSize: '0.9em' }}>{comment.text}</div>
                      <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    {dbUser && comment.user_id === dbUser.id && (
                      <button
                        onClick={() => handleDeleteComment(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          fontSize: '0.8em',
                          opacity: 0.7,
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))
              )}
            </div>
            
            {/* Comment input - fixed at bottom */}
            <div style={{ display: 'flex', gap: '8px' }}>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;