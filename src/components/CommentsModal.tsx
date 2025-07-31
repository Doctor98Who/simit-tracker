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
      zIndex: 99999,
      display: 'flex',
      alignItems: 'flex-end',
    }} onClick={onClose}>
      <div 
        style={{
          width: '100%',
          height: '85vh',
          background: '#1a1a1a',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 100000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#1a1a1a',
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.1em', 
            fontWeight: '600',
            color: '#ffffff' 
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
              color: '#ffffff',
              padding: '4px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
          background: '#1a1a1a',
        }}>
          {comments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#999999',
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
                  background: '#2a2a2a',
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
                    <span style={{ 
                      fontWeight: '600', 
                      fontSize: '0.9em',
                      color: '#ffffff' 
                    }}>
                      {comment.user_name}
                    </span>
                    <span style={{ 
                      fontSize: '0.75em', 
                      color: '#999999' 
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
                          background: '#2a2a2a',
                          border: '1px solid #3a3a3a',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          color: '#ffffff',
                          fontSize: '0.9em',
                        }}
                        autoFocus
                      />
                      <button
                        onClick={saveEdit}
                        style={{
                          background: '#4a9eff',
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
                          background: '#2a2a2a',
                          color: '#ffffff',
                          border: '1px solid #3a3a3a',
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
                      color: '#ffffff',
                    }}>
                      {comment.text}
                      {comment.edited && (
                        <span style={{ 
                          fontSize: '0.8em', 
                          color: '#999999',
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
                        color: '#999999',
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
                        background: '#2a2a2a',
                        border: '1px solid #3a3a3a',
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
                            color: '#ffffff',
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
                            borderTop: '1px solid #3a3a3a',
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
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          background: '#1a1a1a',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#2a2a2a',
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
            background: '#2a2a2a',
            borderRadius: '20px',
            padding: '8px 16px',
            border: '1px solid #3a3a3a',
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
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleAddComment}
              disabled={!comment.trim()}
              style={{
                background: comment.trim() ? '#4a9eff' : '#3a3a3a',
                color: comment.trim() ? 'white' : '#666666',
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