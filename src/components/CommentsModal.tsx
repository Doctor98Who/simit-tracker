import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../DataContext';
import { DatabaseService } from '../services/database';

interface CommentsModalProps {
  photo: any;
  isOwn: boolean;
  onClose: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ photo, isOwn, onClose }) => {
  const { data, setData, dbUser } = useContext(DataContext);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(photo.comments || []);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [showMenu, setShowMenu] = useState<number | null>(null);

// Prevent background scrolling when modal is open
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);
  useEffect(() => {
    setComments(photo.comments || []);
  }, [photo.comments]);
  const handleAddComment = async () => {

    if (!dbUser || !comment.trim()) return;
    try {
      const newComment = {
        user_id: dbUser.id,
        user_name: `${data.firstName} ${data.lastName}`,
        user_profile_pic: data.profilePic,
        text: comment,
        timestamp: Date.now()
      };
      // Optimistic update
      setComments([...comments, newComment]);
      setComment('');
      // API call
      await DatabaseService.addComment(dbUser.id, photo.id, comment);
      // Update context
      const updatePhoto = (p: any) =>
        p.id === photo.id ? { ...p, comments: [...comments, newComment] } : p;
      if (isOwn) {
        setData((prev: any) => ({
          ...prev,
          progressPics: prev.progressPics.map(updatePhoto)
        }));
      } else {
        setData((prev: any) => ({
          ...prev,
          friendsFeed: prev.friendsFeed.map(updatePhoto)
        }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
const handleDeleteComment = async (idx: number) => {
  console.log('handleDeleteComment called with idx:', idx);
  const commentToDelete = comments[idx];
  console.log('commentToDelete:', commentToDelete);
  console.log('dbUser:', dbUser);
  
  if (!dbUser || commentToDelete.user_id !== dbUser.id) {
    console.log('Returning early - user check failed');
    return;
  }
  try {
    // API call to delete from database FIRST
    if (commentToDelete.id) {
await DatabaseService.deleteCommentByIndex(dbUser.id, photo.id, idx);
    }

    // Then update local state
    const updatedComments = comments.filter((_: any, i: number) => i !== idx);
    setComments(updatedComments);
    setShowMenu(null);

    // Update context
    const updatePhoto = (p: any) => 
      p.id === photo.id ? { ...p, comments: updatedComments } : p;

    if (isOwn) {
      setData((prev: any) => ({
        ...prev,
        progressPics: prev.progressPics.map(updatePhoto)
      }));
    } else {
      setData((prev: any) => ({
        ...prev,
        friendsFeed: prev.friendsFeed.map(updatePhoto)
      }));
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    // Revert on error by resetting to photo's comments
    setComments(photo.comments || []);
  }
};
  const handleEditComment = (idx: number) => {
    setEditingIdx(idx);
    setEditText(comments[idx].text);
    setShowMenu(null);
  };
  const saveEdit = () => {
    if (editingIdx === null || !editText.trim()) return;
    const updatedComments = [...comments];
    updatedComments[editingIdx] = {
      ...updatedComments[editingIdx],
      text: editText,
      edited: true
    };
    setComments(updatedComments);
    setEditingIdx(null);
    setEditText('');
    // Update context
    const updatePhoto = (p: any) =>
      p.id === photo.id ? { ...p, comments: updatedComments } : p;
    if (isOwn) {
      setData((prev: any) => ({
        ...prev,
        progressPics: prev.progressPics.map(updatePhoto)
      }));
    } else {
      setData((prev: any) => ({
        ...prev,
        friendsFeed: prev.friendsFeed.map(updatePhoto)
      }));
    }
  };
  return (
    <div 
      className="modal active" 
      id="comments-modal"
      onClick={onClose} 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
<div 
  className="modal-content"
  style={{
    width: '100%',
    maxWidth: '100%',
    height: '85vh',
    maxHeight: '85vh',
    borderRadius: '20px 20px 0 0',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-dark)',
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    transform: 'translateZ(0)', // Force GPU acceleration
    WebkitTransform: 'translateZ(0)', // Safari prefix
     backfaceVisibility: 'hidden', // Prevent flickering
    WebkitBackfaceVisibility: 'hidden', // Safari prefix
    willChange: 'transform', // Optimize for animations
  }}
  onClick={(e) => e.stopPropagation()}
>
            {/* Drag handle */}
        <div style={{
          width: '40px',
          height: '4px',
          background: 'var(--text-muted)',
          borderRadius: '2px',
          margin: '8px auto',
          opacity: 0.5,
        }} />
        
        {/* Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.1em', 
            fontWeight: '600',
            color: 'var(--text)',
          }}>
            Comments
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5em',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              minHeight: '40px',
            }}
          >
            ×
          </button>
        </div>

        {/* Comments list */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '16px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {comments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)',
            }}>
              <p style={{ marginBottom: '8px', fontSize: '16px' }}>No comments yet</p>
              <p style={{ fontSize: '14px' }}>Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment: any, idx: number) => (
              <div key={idx} style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '16px',
                paddingRight: '8px',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--bg-lighter)',
                  backgroundImage: comment.user_profile_pic 
                    ? `url(${comment.user_profile_pic})` 
                    : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  flexShrink: 0,
                }} />
                
                <div style={{ 
                  flex: 1,
                  minWidth: 0,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                    flexWrap: 'wrap',
                  }}>
                    <span style={{ 
                      fontWeight: '600', 
                      fontSize: '14px',
                      color: 'var(--text)',
                    }}>
                      {comment.user_name}
                    </span>
                    <span style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-muted)',
                    }}>
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {editingIdx === idx ? (
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px',
                      marginTop: '8px',
                    }}>
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        style={{
                          flex: 1,
                          background: 'var(--bg-lighter)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: 'var(--text)',
                          fontSize: '14px',
                          outline: 'none',
                          minWidth: 0,
                        }}
                        autoFocus
                      />
                      <button
                        onClick={saveEdit}
                        style={{
                          background: 'var(--accent-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          minHeight: '36px',
                        }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p style={{ 
                      margin: 0, 
                      fontSize: '14px',
                      lineHeight: '1.5',
                      color: 'var(--text)',
                      wordBreak: 'break-word',
                    }}>
                      {comment.text}
                      {comment.edited && (
                        <span style={{ 
                          fontSize: '12px', 
                          color: 'var(--text-muted)',
                          marginLeft: '8px',
                        }}>
                          (edited)
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {comment.user_id === dbUser?.id && editingIdx !== idx && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(showMenu === idx ? null : idx);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '8px',
                        fontSize: '20px',
                        minWidth: '44px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ⋯
                    </button>
                    
                    {showMenu === idx && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        background: 'var(--bg-dark)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        minWidth: '120px',
                        zIndex: 10,
                        overflow: 'hidden',
                      }}>
                        <button
                          onClick={() => handleEditComment(idx)}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '12px 16px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text)',
                            fontSize: '14px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            minHeight: '44px',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(idx)}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '12px 16px',
                            background: 'none',
                            border: 'none',
                            borderTop: '1px solid var(--border)',
                            color: '#ef4444',
                            fontSize: '14px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            minHeight: '44px',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Comment input - fixed at bottom */}
        <div style={{
          padding: '12px 16px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-dark)',
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--bg-lighter)',
              backgroundImage: data.profilePic ? `url(${data.profilePic})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexShrink: 0,
            }} />
            
            <div style={{
              flex: 1,
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              background: 'var(--bg-lighter)',
              borderRadius: '20px',
              padding: '8px 12px',
              border: '1px solid var(--border)',
              minHeight: '44px',
            }}>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment..."
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text)',
                  fontSize: '14px',
                  outline: 'none',
                  minWidth: 0,
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!comment.trim()}
                style={{
                  background: comment.trim() ? 'var(--accent-primary)' : 'var(--bg-darker)',
                  color: comment.trim() ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '6px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: comment.trim() ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  minHeight: '32px',
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

export default CommentsModal;