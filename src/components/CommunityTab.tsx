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
        {data.friends.length === 0
          ? "Add friends to see their progress!"
          : "No posts yet. Share your progress or wait for friends to post!"}
      </div>
    ) : (
      <div style={{ padding: '0', margin: '0 calc(-1 * var(--content-padding, 20px))'  }}>
        {/* Sort all posts by timestamp */}
        {data.friendsFeed
          .map((item: any) => ({ 
            ...item, 
            isOwn: item.user.id === dbUser?.id 
          }))
          .sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first
          .map((item, index) => (
            <PhotoCard
              key={`${item.isOwn ? 'own' : 'friend'}-${index}`}
              item={item}
              isOwn={item.isOwn}
              onOpenComments={() => openComments(item, item.isOwn)}
            />
          ))
        }
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