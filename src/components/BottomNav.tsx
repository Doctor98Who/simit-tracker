import React from 'react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav = ({ activeTab, setActiveTab }: BottomNavProps) => {
  // Helper function to detect PWA standalone mode
  const isPWAStandalone = () => {
    return (window.navigator as any).standalone === true || 
           window.matchMedia('(display-mode: standalone)').matches;
  };

  const tabs = [
    { 
      id: 'profile-tab', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ), 
      label: 'Profile' 
    },
    { 
      id: 'community-tab', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ), 
      label: 'Community' 
    },
    { 
      id: 'start-workout-tab', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h4l3 9 4-18 3 9h4"/>
        </svg>
      ), 
      label: 'Start Workout' 
    },
    { 
      id: 'exercises-tab', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11H3"/>
          <path d="M21 11h-6"/>
          <rect x="10" y="7" width="4" height="14" rx="1"/>
          <rect x="4" y="9" width="4" height="10" rx="1"/>
          <rect x="16" y="9" width="4" height="10" rx="1"/>
        </svg>
      ), 
      label: 'Exercises' 
    },
    { 
      id: 'progress-tab', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="20" x2="12" y2="10"/>
          <line x1="18" y1="20" x2="18" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="16"/>
          <path d="M3 20h18"/>
        </svg>
      ), 
      label: 'Progress' 
    },
  ];

  return (
    <div 
      className="bottom-nav"
      style={{
        paddingBottom: isPWAStandalone() ? '25px' : '5px',
      }}
    >
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <div className="nav-icon">{tab.icon}</div>
          <span className="nav-label">{tab.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BottomNav;