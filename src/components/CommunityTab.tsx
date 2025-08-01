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
  const [activeSubTab, setActiveSubTab] = useState<'following' | 'personal'>('following');

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
      {/* Sub-tabs */}
      <div className="community-sub-tabs" style={{
        display: 'flex',
        gap: '16px',
        padding: '20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <button
          onClick={() => setActiveSubTab('following')}
          style={{
            background: 'none',
            border: 'none',
            color: activeSubTab === 'following' ? 'var(--text)' : 'var(--text-muted)',
            fontSize: '1.1em',
            fontWeight: activeSubTab === 'following' ? '600' : '400',
            cursor: 'pointer',
            padding: '0',
          }}
        >
          Following
        </button>
        <button
          onClick={() => setActiveSubTab('personal')}
          style={{
            background: 'none',
            border: 'none',
            color: activeSubTab === 'personal' ? 'var(--text)' : 'var(--text-muted)',
            fontSize: '1.1em',
            fontWeight: activeSubTab === 'personal' ? '600' : '400',
            cursor: 'pointer',
            padding: '0',
          }}
        >
          Personal
        </button>
      </div>

      <div style={{ 
        padding: '0',
        margin: '0 calc(-1 * var(--content-padding, 20px))'
      }}>
        {activeSubTab === 'following' ? (
          <>
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
          </>
        ) : (
          <div style={{ 
            padding: '40px 20px', 
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}>
            Personal feed coming soon...
          </div>
        )}
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