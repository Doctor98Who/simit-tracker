import React from 'react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav = ({ activeTab, setActiveTab }: BottomNavProps) => {
  const tabs = [
    { id: 'profile-tab', icon: '👤', label: 'Profile' },
    { id: 'community-tab', icon: '👥', label: 'Community' },
    { id: 'start-workout-tab', icon: '➕', label: 'Start Workout' },
    { id: 'exercises-tab', icon: '🏋️', label: 'Exercises' },
    { id: 'progress-tab', icon: '📸', label: 'Progress' },
  ];

  return (
    <div className="bottom-nav">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <div className="nav-icon">{tab.icon}</div> {tab.label}
        </div>
      ))}
    </div>
  );
};

export default BottomNav;