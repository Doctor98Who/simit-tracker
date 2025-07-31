import React, { useState, useContext } from 'react';
import { DataContext } from '../DataContext';
import PhotoCard from './PhotoCard';
import CommentsModal from './CommentsModal';

const CommunityTab = () => {
  const { data } = useContext(DataContext);
  const [activeSubTab, setActiveSubTab] = useState('feed');
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [showComments, setShowComments] = useState(false);
  
  const tabs = [
    { id: 'feed', label: 'Feed' },
    { id: 'popular', label: 'Popular' },
    { id: 'groups', label: 'Groups' },
  ];

  const openComments = (photo: any, isOwn: boolean) => {
    setSelectedPhoto({ ...photo, isOwn });
    setShowComments(true);
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
          {data.friendsFeed.length === 0 && data.progressPics.filter((p: any) => p.visibility === 'public').length === 0 ? (           
            <div className="feed-placeholder">
              {data.friends.length === 0 
                ? "Add friends to see their progress!" 
                : "No posts yet. Share your progress or wait for friends to post!"}
            </div>
          ) : (
            <div style={{ padding: '16px' }}>
              {/* Show user's own public posts */}
              {data.progressPics
                .filter((pic: any) => pic.visibility === 'public')
                .map((pic: any, index: number) => (
                  <PhotoCard
                    key={`own-${index}`}
                    item={pic}
                    isOwn={true}
                    onOpenComments={() => openComments(pic, true)}
                  />
                ))}
              
              {/* Friends' posts */}
              {data.friendsFeed.map((item: any, index: number) => (
                <PhotoCard
                  key={`friend-${index}`}
                  item={item}
                  isOwn={false}
                  onOpenComments={() => openComments(item, false)}
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
      
      {/* Comments Modal */}
      {showComments && selectedPhoto && (
        <CommentsModal
          photo={selectedPhoto}
          isOwn={selectedPhoto.isOwn}
          onClose={() => {
            setShowComments(false);
            setSelectedPhoto(null);
          }}
        />
      )}
    </div>
  );
};

export default CommunityTab;