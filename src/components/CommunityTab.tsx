import React, { useState, useContext } from 'react';
import { DataContext } from '../DataContext';

const CommunityTab = () => {
  const { data } = useContext(DataContext);
  const [activeSubTab, setActiveSubTab] = useState('feed');

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
          {data.friendsFeed.length === 0 ? (
            <div className="feed-placeholder">
              {data.friends.length === 0 
                ? "Add friends to see their progress!" 
                : "No posts yet. Your friends haven't shared any progress photos."}
            </div>
          ) : (
            <div style={{ padding: '16px' }}>
              {data.friendsFeed.map((item: any, index: number) => (
                <div key={index} style={{
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
    </div>
  );
};

export default CommunityTab;