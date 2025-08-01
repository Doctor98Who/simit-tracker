import React, { useState, useContext } from 'react';
import { DataContext } from '../DataContext';
import PhotoCard from './PhotoCard';

const CommunityTab = () => {
const { data, setData, dbUser } = useContext(DataContext);  
const [activeSubTab, setActiveSubTab] = useState('feed');

  
  const tabs = [
    { id: 'feed', label: 'Feed' },
    { id: 'popular', label: 'Popular' },
    { id: 'groups', label: 'Groups' },
  ];

  const openComments = (photo: any, isOwn: boolean) => {
    console.log('Opening comments for photo:', photo);
    setData(prev => ({ 
      ...prev, 
      selectedPhoto: { ...photo, isOwn },
      showComments: true 
    }));
  };

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
        No posts in feed yet
      </div>
    ) : (
      <div style={{ padding: '0', margin: '0 calc(-1 * var(--content-padding, 20px))' }}>
        {data.friendsFeed
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((item: any, index: number) => (
            <PhotoCard
              key={item.id || index}
              item={item}
              isOwn={item.user?.id === dbUser?.id}
              onOpenComments={() => openComments(item, item.user?.id === dbUser?.id)}
            />
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