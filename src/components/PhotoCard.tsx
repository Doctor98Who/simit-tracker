import React, { useState, useContext } from 'react';
import { DataContext } from '../DataContext';
import { DatabaseService } from '../services/database';

interface PhotoCardProps {
  item: any;
  isOwn: boolean;
  onOpenComments: () => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ item, isOwn, onOpenComments }) => {
  const { data, setData, dbUser } = useContext(DataContext);
  const [userHasLiked, setUserHasLiked] = useState(item.userHasLiked || false);
  const [likes, setLikes] = useState(item.likes || 0);
  const [lastTap, setLastTap] = useState(0);
  const imageRef = React.useRef<HTMLDivElement>(null);

  const handleLike = async () => {
    if (!dbUser) return;
    
    try {
      // Optimistic update
      setUserHasLiked(!userHasLiked);
      setLikes(userHasLiked ? Math.max(likes - 1, 0) : likes + 1);
      
      // API call
      await DatabaseService.likePhoto(dbUser.id, item.id);
      
      // Update context to persist the change
      if (isOwn) {
        setData((prev: any) => ({
          ...prev,
          progressPics: prev.progressPics.map((p: any) =>
            p.id === item.id 
              ? { ...p, userHasLiked: !userHasLiked, likes: userHasLiked ? Math.max(likes - 1, 0) : likes + 1 }
              : p
          )
        }));
      } else {
        setData((prev: any) => ({
          ...prev,
          friendsFeed: prev.friendsFeed.map((feedItem: any) =>
            feedItem.id === item.id 
              ? { ...feedItem, userHasLiked: !userHasLiked, likes: userHasLiked ? Math.max(likes - 1, 0) : likes + 1 }
              : feedItem
          )
        }));
      }
    } catch (error) {
      console.error('Error liking photo:', error);
      // Revert on error
      setUserHasLiked(userHasLiked);
      setLikes(likes);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // It's a double tap!
      if (!userHasLiked) {
        handleLike();
      }
    }
    setLastTap(now);
  };

  return (
    <div style={{
      background: 'var(--bg-dark)',
      marginBottom: '8px',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--bg-lighter)',
          backgroundImage: (isOwn ? data.profilePic : item.user?.profile_pic)
            ? `url(${isOwn ? data.profilePic : item.user.profile_pic})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flexShrink: 0,
        }} />
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: '600',
            fontSize: '0.95em',
            lineHeight: '1.2',
          }}>
            {isOwn
              ? `${data.firstName} ${data.lastName}`
              : `${item.user.first_name} ${item.user.last_name}`
            }
          </div>
          <div style={{
            fontSize: '0.8em',
            color: 'var(--text-muted)',
            lineHeight: '1.2',
          }}>
            {new Date(item.timestamp).toLocaleDateString()}
          </div>
        </div>
        
        {/* Three dots menu for own posts */}
        {isOwn && (
          <button
            onClick={() => {
              setData((prev: any) => ({
                ...prev,
                activeModal: 'photo-menu-modal',
                currentProgressIdx: data.progressPics.findIndex((p: any) => 
                  p.base64 === item.base64 && p.timestamp === item.timestamp
                )
              }));
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: 'var(--text-muted)',
              fontSize: '1.2em',
              lineHeight: 1,
            }}
          >
            ⋮
          </button>
        )}
      </div>
      
      {/* Image - Full width */}
      <div 
        ref={imageRef}
        onClick={handleDoubleTap}
        style={{
          width: '100%',
          aspectRatio: '1',
          background: '#000',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <img
          src={item.base64}
          alt="Progress"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      
      {/* Actions + Pump Rating Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 8px',
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}>
          <button
            onClick={handleLike}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text)',
              padding: '8px',
              minWidth: '40px',
              minHeight: '40px',
              transition: 'all 0.2s',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={userHasLiked ? '#ef4444' : 'none'}
              stroke={userHasLiked ? '#ef4444' : 'currentColor'}
              strokeWidth="2"
              style={{ transition: 'all 0.2s ease' }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span style={{
              fontSize: '0.9em',
              fontWeight: '500',
            }}>
              {likes}
            </span>
          </button>
          
          <button
            onClick={onOpenComments}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text)',
              padding: '8px',
              minWidth: '40px',
              minHeight: '40px',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span style={{
              fontSize: '0.9em',
              fontWeight: '500',
            }}>
              {(item.comments || []).length}
            </span>
          </button>
        </div>
        
        {/* Right side - Pump rating */}
        {item.pump && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
            borderRadius: '20px',
            fontSize: '0.85em',
          }}>
            <span style={{ fontWeight: '600' }}>💪</span>
            <span style={{ fontWeight: '500' }}>{item.pump}/100</span>
          </div>
        )}
      </div>
      
      {/* Like count text */}
      {likes > 0 && (
        <div style={{
          padding: '0 16px 8px',
          fontSize: '0.9em',
          fontWeight: '600',
        }}>
          {likes} {likes === 1 ? 'like' : 'likes'}
        </div>
      )}
      
      {/* Caption and Comments Preview */}
      <div style={{ padding: '0 16px 16px' }}>
        {item.caption && (
          <p style={{ 
            margin: '0 0 8px 0', 
            fontSize: '0.95em',
            lineHeight: '1.4',
          }}>
            <span style={{ fontWeight: '600' }}>
              {isOwn ? data.username : item.user.username}
            </span>{' '}
            {item.caption}
          </p>
        )}
        
        {/* Comments preview */}
        {(item.comments || []).length > 0 && (
          <div>
            {item.comments.slice(0, 2).map((comment: any, idx: number) => (
              <p key={idx} style={{ 
                margin: '4px 0', 
                fontSize: '0.9em',
                lineHeight: '1.4',
              }}>
                <span style={{ fontWeight: '600' }}>
                  {comment.user_name.split(' ')[0]}
                </span>{' '}
                {comment.text.length > 60 
                  ? comment.text.substring(0, 60) + '...' 
                  : comment.text
                }
              </p>
            ))}
            {(item.comments || []).length > 2 && (
              <button
                onClick={onOpenComments}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.9em',
                  cursor: 'pointer',
                  padding: '4px 0',
                  marginTop: '4px',
                }}
              >
                View all {item.comments.length} comments
              </button>
            )}
          </div>
        )}
        
        {/* Weight info if present */}
        {item.weight && (
          <div style={{
            marginTop: '8px',
            fontSize: '0.85em',
            color: 'var(--text-muted)',
          }}>
            ⚖️ {item.weight} {data.weightUnit || 'lbs'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoCard;