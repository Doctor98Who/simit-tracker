import React, { useContext, useState } from 'react';
import { DataContext } from '../DataContext';
import PhotoCard from './PhotoCard';
import PhotoModal from './PhotoModal';
import CommentsModal from './CommentsModal';
import { ProgressPhoto, FeedItem } from '../DataContext';

const CommunityTab = () => {
  const { data, dbUser } = useContext(DataContext);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [isOwnPhoto, setIsOwnPhoto] = useState(false);

  const handleOpenComments = (photo: any, isOwn: boolean) => {
    setSelectedPhoto(photo);
    setIsOwnPhoto(isOwn);
    setShowCommentsModal(true);
  };

  const handlePhotoClick = (photo: any, isOwn: boolean) => {
    setSelectedPhoto(photo);
    setIsOwnPhoto(isOwn);
    setShowPhotoModal(true);
  };

  return (
    <div style={{ paddingTop: '0' }}>
      {/* Original sub-tabs */}
      <div className="community-sub-tabs" style={{
        display: 'flex',
        gap: '16px',
        padding: '20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{
          color: 'var(--text)',
          fontSize: '1.1em',
          fontWeight: '600',
        }}>
          Feed
        </span>
        <span style={{
          color: 'var(--text-muted)',
          fontSize: '1.1em',
          cursor: 'pointer',
        }}>
          Popular
        </span>
        <span style={{
          color: 'var(--text-muted)',
          fontSize: '1.1em',
          cursor: 'pointer',
        }}>
          Groups
        </span>
      </div>

      <div style={{ 
        padding: '0',
        margin: '0 calc(-1 * var(--content-padding, 20px))'
      }}>
        {/* Combine and sort all posts by timestamp */}
        {[
          // User's own public posts
          ...data.progressPics
            .filter((pic: ProgressPhoto) => pic.visibility === 'public')
            .map((pic: ProgressPhoto) => ({
              ...pic,
              user: {
                id: dbUser?.id,
                username: data.username,
                first_name: data.firstName,
                last_name: data.lastName,
                profile_pic: data.profilePic
              },
              isOwn: true
            })),
          // Friends' posts
          ...data.friendsFeed.map((item: FeedItem) => ({
            ...item,
            isOwn: false
          }))
        ]
          .sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first
          .map((item) => (
            <PhotoCard 
              key={item.id || `${item.timestamp}-${item.base64?.substring(0, 10)}`}
              item={item}
              isOwn={item.isOwn}
              onOpenComments={() => handleOpenComments(item, item.isOwn)}
            />
          ))
        }
      </div>

      {/* Photo Modal */}
      {showPhotoModal && selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          isOwn={isOwnPhoto}
          onClose={() => {
            setShowPhotoModal(false);
            setSelectedPhoto(null);
          }}
        />
      )}

      {/* Comments Modal */}
      {showCommentsModal && selectedPhoto && (
        <CommentsModal
          photo={selectedPhoto}
          isOwn={isOwnPhoto}
          onClose={() => {
            setShowCommentsModal(false);
            setSelectedPhoto(null);
          }}
        />
      )}
    </div>
  );
};

export default CommunityTab;