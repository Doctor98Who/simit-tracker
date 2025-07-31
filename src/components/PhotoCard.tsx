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
      borderRadius: '12px',
      marginBottom: '16px',
      overflow: 'hidden',
      border: '1px solid var(--border)',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'var(--bg-lighter)',
          backgroundImage: (isOwn ? data.profilePic : item.user?.profile_pic) 
            ? `url(${isOwn ? data.profilePic : item.user.profile_pic})` 
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600' }}>
            {isOwn 
              ? `${data.firstName} ${data.lastName}`
              : `${item.user.first_name} ${item.user.last_name}`
            }
          </div>
          <div style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
            {isOwn 
              ? `@${data.username}` 
              : `@${item.user.username}`
            } • {new Date(item.timestamp).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      {/* Image */}
      <div style={{
        width: '100%',
        aspectRatio: '1',
        background: '#000',
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
      
      {/* Action buttons */}
      <div style={{
        display: 'flex',
        gap: '16px',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <button
          onClick={handleLike}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: userHasLiked ? '#ef4444' : 'var(--text)',
            fontSize: '1.2em',
            padding: '4px 0',
            transition: 'color 0.2s',
          }}
        >
          <span>{userHasLiked ? '❤️' : '🤍'}</span>
          <span style={{ fontSize: '0.75em' }}>{likes}</span>
        </button>
        
        <button
          onClick={onOpenComments}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text)',
            fontSize: '1.2em',
            padding: '4px 0',
          }}
        >
          <span>💬</span>
          <span style={{ fontSize: '0.75em' }}>
            {(item.comments || []).length}
          </span>
        </button>
      </div>
      
      {/* Details */}
      <div style={{ padding: '16px' }}>
        {item.caption && (
          <p style={{ margin: '0 0 12px 0', fontSize: '0.95em' }}>
            <span style={{ fontWeight: '600' }}>
              {isOwn ? data.username : item.user.username}
            </span>{' '}
            {item.caption}
          </p>
        )}
        
        {/* Show preview of comments */}
        {(item.comments || []).length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            {item.comments.slice(0, 2).map((comment: any, idx: number) => (
              <p key={idx} style={{ 
                margin: '4px 0', 
                fontSize: '0.9em',
                color: 'var(--text-muted)'
              }}>
                <span style={{ fontWeight: '600', color: 'var(--text)' }}>
                  {comment.user_name.split(' ')[0]}
                </span>{' '}
                {comment.text.length > 50 
                  ? comment.text.substring(0, 50) + '...' 
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
                  fontSize: '0.85em',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                View all {item.comments.length} comments
              </button>
            )}
          </div>
        )}
        
        {/* Additional info */}
        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '0.85em',
          color: 'var(--text-muted)',
        }}>
          {item.weight && (
            <span>⚖️ {item.weight} {data.weightUnit || 'lbs'}</span>
          )}
          {item.pump && (
            <span>💪 Pump: {item.pump}/100</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;