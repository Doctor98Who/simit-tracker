import React, { useState, useContext } from 'react';
import { DataContext } from '../DataContext';
import PhotoModal from './PhotoModal';  // Add this import

const CommunityTab = () => {
  const { data } = useContext(DataContext);
  const [activeSubTab, setActiveSubTab] = useState('feed');
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);  // Add this
  const [showPhotoModal, setShowPhotoModal] = useState(false);    // Add this
  const tabs = [
    { id: 'feed', label: 'Feed' },
    { id: 'popular', label: 'Popular' },
    { id: 'groups', label: 'Groups' },
  ];

  return (
    <div>
      <div className="community-sub-tabs" style={{ justifyContent: 'flex-start' }}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`community-tab ${activeSubTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveSubTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>
      {activeSubTab === 'feed' && (
        <div id="feed-content">
{data.friendsFeed.length === 0 && data.progressPics.filter(p => p.visibility === 'public').length === 0 ? (           
   <div className="feed-placeholder">
              {data.friends.length === 0 
                ? "Add friends to see their progress!" 
                : "No posts yet. Share your progress or wait for friends to post!"}
            </div>
          ) : (
            <div style={{ padding: '16px' }}>
              {/* Show user's own public posts */}
              {data.progressPics
               .filter(pic => pic.visibility === 'public')
                .map((pic: any, index: number) => (
                  <div key={`own-${index}`} style={{
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
                        backgroundImage: data.profilePic ? `url(${data.profilePic})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600' }}>
                          {data.firstName} {data.lastName} <span style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>(You)</span>
                        </div>
                        <div style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
                          @{data.username} • {new Date(pic.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
          {/* Image */}
<div style={{
  width: '100%',
  aspectRatio: '1',
  background: '#000',
  cursor: 'pointer',
}}
onClick={() => {  // Add this onClick
  setSelectedPhoto(pic);
  setShowPhotoModal(true);
}}
>
                      <img 
                        src={pic.base64} 
                        alt="Progress" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                    
                    {/* Details */}
                    <div style={{ padding: '16px' }}>
                      {pic.caption && (
                        <p style={{ margin: '0 0 12px 0', fontSize: '0.95em' }}>
                          {pic.caption}
                        </p>
                      )}
                      <div style={{
                        display: 'flex',
                        gap: '16px',
                        fontSize: '0.85em',
                        color: 'var(--text-muted)',
                      }}>
                        {pic.weight && (
                          <span>⚖️ {pic.weight} {data.weightUnit || 'lbs'}</span>
                        )}
                        {pic.pump && (
                          <span>💪 Pump: {pic.pump}/100</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              
              {/* Friends' posts */}
              {data.friendsFeed.map((item: any, index: number) => (
                <div key={`friend-${index}`} style={{
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
                      backgroundImage: item.user.profile_pic ? `url(${item.user.profile_pic})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>
                        {item.user.first_name} {item.user.last_name}
                      </div>
                      <div style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
                        @{item.user.username} • {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
{/* Image */}
<div style={{
  width: '100%',
  aspectRatio: '1',
  background: '#000',
  cursor: 'pointer',
}}
onClick={() => {  // Add this onClick
  setSelectedPhoto(item);
  setShowPhotoModal(true);
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
                  
                  {/* Details */}
                  <div style={{ padding: '16px' }}>
                    {item.caption && (
                      <p style={{ margin: '0 0 12px 0', fontSize: '0.95em' }}>
                        {item.caption}
                      </p>
                    )}
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
              ))}
            </div>
          )}
        </div>
      )}
      {activeSubTab === 'popular' && (
        <div id="popular-content">
          <div className="popular-placeholder">Popular Programs</div>
        </div>
      )}
      {activeSubTab === 'groups' && (
        <div id="groups-content">
          <div className="groups-placeholder">Join groups to discuss workouts!</div>
        </div>
      )}
      
      {/* Photo Modal */}
      {showPhotoModal && selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          isOwn={selectedPhoto.user ? false : true}
          onClose={() => {
            setShowPhotoModal(false);
            setSelectedPhoto(null);
          }}
        />
      )}
    </div>
  );
};

export default CommunityTab;