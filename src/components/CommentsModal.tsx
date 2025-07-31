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

  useEffect(() => {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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
    const commentToDelete = comments[idx];
    if (!dbUser || commentToDelete.user_id !== dbUser.id) return;

    try {
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end',
    }} onClick={onClose}>
      <div 
        style={{
          width: '100%',
          maxHeight: '85vh',
          background: 'var(--bg-dark)',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1em', fontWeight: '600' }}>
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
              padding: '4px',
            }}
          >
            ×
          </button>
        </div>

        {/* Comments list */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
        }}>
          {comments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)',
            }}>
              <p style={{ marginBottom: '8px' }}>No comments yet</p>
              <p style={{ fontSize: '0.85em' }}>Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment: any, idx: number) => (
              <div key={idx} style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '16px',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--bg-lighter)',
                  backgroundImage: comment.user_profile_pic 
                    ? `url(${comment.user_profile_pic})` 
                    : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  flexShrink: 0,
                }} />
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                  }}>
                    <span style={{ fontWeight: '600', fontSize: '0.9em' }}>
                      {comment.user_name}
                    </span>
                    <span style={{ 
                      fontSize: '0.75em', 
                      color: 'var(--text-muted)' 
                    }}>
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {editingIdx === idx ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
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
                          padding: '6px 12px',
                          color: 'var(--text)',
                          fontSize: '0.9em',
                        }}
                      />
                      <button
                        onClick={saveEdit}
                        style={{
                          background: 'var(--accent-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '0.85em',
                          cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingIdx(null);
                          setEditText('');
                        }}
                        style={{
                          background: 'var(--bg-lighter)',
                          color: 'var(--text)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '0.85em',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.9em',
                      lineHeight: '1.5',
                    }}>
                      {comment.text}
                      {comment.edited && (
                        <span style={{ 
                          fontSize: '0.8em', 
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
                      onClick={() => setShowMenu(showMenu === idx ? null : idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        fontSize: '1.2em',
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
                        minWidth: '100px',
                        zIndex: 10,
                      }}>
                        <button
                          onClick={() => handleEditComment(idx)}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '8px 16px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text)',
                            fontSize: '0.9em',
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(idx)}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '8px 16px',
                            background: 'none',
                            border: 'none',
                            borderTop: '1px solid var(--border)',
                            color: '#ef4444',
                            fontSize: '0.9em',
                            textAlign: 'left',
                            cursor: 'pointer',
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

        {/* Comment input */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border)',
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
            padding: '8px 16px',
            border: '1px solid var(--border)',
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
              }}
            />
            <button
              onClick={handleAddComment}
              disabled={!comment.trim()}
              style={{
                background: comment.trim() ? 'var(--accent-primary)' : 'var(--bg-darker)',
                color: comment.trim() ? 'white' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '14px',
                padding: '6px 16px',
                fontSize: '0.85em',
                fontWeight: '600',
                cursor: comment.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
              }}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;