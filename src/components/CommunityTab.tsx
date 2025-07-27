import React, { useState } from 'react';

const CommunityTab = () => {
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
          <div className="feed-placeholder">No posts yet. Finish a workout to share!</div>
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