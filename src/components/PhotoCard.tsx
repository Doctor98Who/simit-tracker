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

  const handleLike = async () => {
    if (!dbUser) return;

    try {
      // Optimistic update
      setUserHasLiked(!userHasLiked);
      setLikes(userHasLiked ? Math.max(likes - 1, 0) : likes + 1);

      // API call
      await DatabaseService.likePhoto(dbUser.id, item.id);

      // Update context
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
          friendsFeed: prev.friendsFeed.map((p: any) =>
            p.id === item.id 
              ? { ...p, userHasLiked: !userHasLiked, likes: userHasLiked ? Math.max(likes - 1, 0) : likes + 1 }
              : p
          )
        }));
      }
    } catch (error) {
      // Revert on error
      setUserHasLiked(userHasLiked);
      setLikes(likes);
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div style={{
      background: 'var(--bg-dark)',
      marginBottom: '2px',
      overflow: 'hidden',
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
      </div>
      
      {/* Image - Full width */}
      <div style={{
        width: '100%',
        aspectRatio: '1',
        background: '#000',
        position: 'relative',
      }}>
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
        {/* Left side - Like and Comment buttons */}
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
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: 'all 0.2s ease' }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
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
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        {/* Right side - Pump Rating */}
        {item.pump && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
            borderRadius: '20px',
            color: 'white',
            fontSize: '0.85em',
            fontWeight: '600',
            marginRight: '8px',
          }}>
            <span style={{ fontSize: '1.1em' }}>💪</span>
            <span>{item.pump}/100</span>
          </div>
        )}
      </div>

      {/* Likes count */}
      {likes > 0 && (
        <div style={{
          padding: '0 16px',
          fontSize: '0.95em',
          fontWeight: '600',
          marginBottom: '8px',
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