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
      ? data.progressPics.find((p: any) => p.id === photo.id) || photo
      : data.friendsFeed.find((p: any) => p.id === photo.id) || photo;
  };

  // Use local state for immediate updates
  const [localPhoto, setLocalPhoto] = useState(getPhotoFromContext());

  // Update local photo when photo prop changes (for navigation between photos)
  useEffect(() => {
    const newPhoto = getPhotoFromContext();
    setLocalPhoto(newPhoto);
    setEditCaption(newPhoto.caption || '');
  }, [photo.id, isOwn]);

  // Prevent background scrolling with better mobile support
  useEffect(() => {
    // Store the original position
    const scrollY = window.scrollY;

    // Prevent body scroll when modal is open
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      // Re-enable body scroll when modal closes
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editCaption, setEditCaption] = useState(localPhoto.caption || '');
  const [comment, setComment] = useState('');
  const [editingCommentIdx, setEditingCommentIdx] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [showCommentMenu, setShowCommentMenu] = useState<number | null>(null);

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
        setData((prev: any) => ({
          ...prev,
          progressPics: prev.progressPics.map((p: any) =>
            p.id === localPhoto.id ? optimisticUpdate : p
          )
        }));
      } else {
        setData((prev: any) => ({
          ...prev,
          friendsFeed: prev.friendsFeed.map((item: any) =>
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
        user_profile_pic: data.profilePic,
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
        setData((prev: any) => ({
          ...prev,
          progressPics: prev.progressPics.map((p: any) =>
            p.id === localPhoto.id ? optimisticUpdate : p
          )
        }));
      } else {
        setData((prev: any) => ({
          ...prev,
          friendsFeed: prev.friendsFeed.map((item: any) =>
            item.id === localPhoto.id ? optimisticUpdate : item
          )
        }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = (idx: number) => {
    const comment = localPhoto.comments[idx];
    setEditingCommentIdx(idx);
    setEditingCommentText(comment.text);
    setShowCommentMenu(null);
  };

  const saveEditedComment = () => {
    if (editingCommentIdx === null || !editingCommentText.trim()) return;

    const updatedComments = [...localPhoto.comments];
    updatedComments[editingCommentIdx] = {
      ...updatedComments[editingCommentIdx],
      text: editingCommentText,
      edited: true,
      editedAt: Date.now()
    };

    const optimisticUpdate = {
      ...localPhoto,
      comments: updatedComments
    };

    setLocalPhoto(optimisticUpdate);
    setEditingCommentIdx(null);
    setEditingCommentText('');

    // Update context
    if (isOwn) {
      setData((prev: any) => ({
        ...prev,
        progressPics: prev.progressPics.map((p: any) =>
          p.id === localPhoto.id ? optimisticUpdate : p
        )
      }));
    } else {
      setData((prev: any) => ({
        ...prev,
        friendsFeed: prev.friendsFeed.map((item: any) =>
          item.id === localPhoto.id ? optimisticUpdate : item
        )
      }));
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
      setShowCommentMenu(null);

      // Update context for persistence
      if (isOwn) {
        setData((prev: any) => ({
          ...prev,
          progressPics: prev.progressPics.map((p: any) =>
            p.id === localPhoto.id ? optimisticUpdate : p
          )
        }));
      } else {
        setData((prev: any) => ({
          ...prev,
          friendsFeed: prev.friendsFeed.map((item: any) =>
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
      setData((prev: any) => ({ ...prev, progressPics: newPics }));
      setLocalPhoto({ ...localPhoto, caption: editCaption });
    }
    setIsEditingCaption(false);
  };

  // Click outside to close comment menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showCommentMenu !== null) {
        setShowCommentMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showCommentMenu]);

  return (
    <div
      className="modal active progress-photo-modal"
      style={{
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="modal-content" style={{
        width: '100%',
        maxWidth: '800px',
        minHeight: '100vh',
        background: 'var(--bg-dark)',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
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
          position: 'sticky',
          top: 0,
          zIndex: 10,
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
              onClick={() => setData((prev: any) => ({
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
          position: 'relative',
          width: '100%',
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
              maxHeight: '60vh',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        {/* Details section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-dark)',
        }}>
          {/* Like button and stats */}
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

          {/* Comments section - simplified */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-darker)',
            borderTop: '1px solid var(--border)',
            paddingBottom: '40px',
          }}>
            {/* Comments header */}
            <div style={{
              padding: '16px 20px 12px',
            }}>
              <h4 style={{
                margin: 0,
                fontSize: '1.1em',
                fontWeight: '600',
                color: 'var(--text)',
              }}>
                Comments {(localPhoto.comments || []).length > 0 && (
                  <span style={{
                    fontSize: '0.9em',
                    fontWeight: '400',
                    color: 'var(--text-muted)',
                    marginLeft: '8px',
                  }}>
                    ({localPhoto.comments.length})
                  </span>
                )}
              </h4>
            </div>

            {/* Comment input box */}
            <div style={{
              padding: '0 20px 12px',
            }}>
              <div style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--bg-lighter)',
                  backgroundImage: (comment as any)?.user_profile_pic ? `url(${(comment as any).user_profile_pic})` : 'none',
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
                  padding: '6px 12px',
                  border: '1px solid var(--border)',
                }}>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment()}
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
                    onClick={handleComment}
                    disabled={!comment.trim()}
                    style={{
                      background: comment.trim() ? 'var(--accent-primary)' : 'var(--bg-darker)',
                      color: comment.trim() ? 'white' : 'var(--text-muted)',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '4px 14px',
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

            {/* Comments list - no scroll, just flows */}
            <div style={{
              padding: '0 20px 20px',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {(localPhoto.comments || []).length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                }}>
                  <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.9em',
                    marginBottom: '8px',
                  }}>
                    No comments yet
                  </p>
                  <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85em',
                  }}>
                    Be the first to share your thoughts!
                  </p>
                </div>
              ) : (
                (localPhoto.comments || []).map((comment: any, idx: number) => (
                  
                  <div key={idx} style={{
                    marginBottom: '16px',
                    display: 'flex',
                    gap: '12px',
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--bg-lighter)',
                      backgroundImage: (comment && typeof comment === 'object' && comment.user_profile_pic)
                        ? `url(${comment.user_profile_pic})`
                        : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      {editingCommentIdx === idx ? (
                        <div style={{
                          background: 'var(--bg-lighter)',
                          borderRadius: '12px',
                          padding: '12px',
                        }}>
                          <textarea
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            style={{
                              width: '100%',
                              background: 'var(--bg-darker)',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              color: 'var(--text)',
                              fontSize: '14px',
                              resize: 'vertical',
                              minHeight: '60px',
                              outline: 'none',
                            }}
                            autoFocus
                          />
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: '8px',
                            justifyContent: 'flex-end',
                          }}>
                            <button
                              onClick={saveEditedComment}
                              style={{
                                padding: '6px 16px',
                                background: 'var(--accent-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.8em',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingCommentIdx(null);
                                setEditingCommentText('');
                              }}
                              style={{
                                padding: '6px 16px',
                                background: 'transparent',
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                fontSize: '0.8em',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          background: 'var(--bg-lighter)',
                          borderRadius: '12px',
                          padding: '12px',
                          position: 'relative',
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '4px',
                          }}>
                            <div style={{
                              fontWeight: '600',
                              fontSize: '0.9em',
                            }}>
                              {comment.user_name}
                              <span style={{
                                fontSize: '0.85em',
                                color: 'var(--text-muted)',
                                fontWeight: '400',
                                marginLeft: '8px',
                              }}>
                                {new Date(comment.timestamp).toLocaleDateString()}
                                {comment.edited && ' (edited)'}
                              </span>
                            </div>
{dbUser && comment.user_id === dbUser.id && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      setShowCommentMenu(showCommentMenu === idx ? null : idx);
    }}
    onTouchEnd={(e) => {
      e.stopPropagation();
      e.preventDefault();
    }}
    style={{
      background: 'none',
      border: 'none',
      color: 'var(--text-muted)',
      cursor: 'pointer',
      padding: '8px',
      fontSize: '1.2em',
      lineHeight: '0.5',
      position: 'relative',
      minHeight: '44px',
      minWidth: '44px',
    }}
  >
    ⋯
    {showCommentMenu === idx && (
      <div style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        background: 'var(--bg-dark)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        minWidth: '120px',
        zIndex: 100,
        overflow: 'hidden',
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEditComment(idx);
          }}
          style={{
            display: 'block',
            width: '100%',
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            color: 'var(--text)',
            fontSize: '0.9em',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-lighter)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteComment(idx);
          }}
          style={{
            display: 'block',
            width: '100%',
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderTop: '1px solid var(--border)',
            color: '#ef4444',
            fontSize: '0.9em',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          Delete
        </button>
      </div>
    )}
  </button>
)}                         
 </div>
                          <div style={{ fontSize: '0.9em', lineHeight: '1.5' }}>
                            {comment.text}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;