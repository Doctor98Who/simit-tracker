import React, { useState, useContext, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './App.css';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import StartWorkoutTab from './components/StartWorkoutTab';
import ProfileTab from './components/ProfileTab';
import CommunityTab from './components/CommunityTab';
import ExercisesTab from './components/ExercisesTab';
import ProgressTab from './components/ProgressTab';
import Modals from './components/Modals';
import { Login } from './components/Login';
import { DataContext, DataProvider } from './DataContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import updateChecker from './services/UpdateChecker';
console.log('App.tsx loaded');
const AppContent = () => {
console.log('AppContent rendering');
const { data, setData, isLoading: isDataLoading } = useContext(DataContext);
console.log('DataContext loaded:', { data, isDataLoading });
const [activeTab, setActiveTab] = useState(data.activeTab || 'start-workout-tab');
const { isLoading, isAuthenticated, user } = useAuth0();  // ADD 'user' here
const [updateAvailable, setUpdateAvailable] = useState(false);

// ADD THIS DEBUG CODE
useEffect(() => {
  console.log('🔐 AUTH DEBUG:', {
    isAuthenticated,
    userEmail: user?.email,
    userSub: user?.sub,
    userName: user?.name
  });
}, [isAuthenticated, user]);
// END DEBUG CODE

// Sync activeTab from context
useEffect(() => {
  if (data.activeTab !== activeTab) {
    setActiveTab(data.activeTab);
  }
}, [data.activeTab, activeTab]);  // Request notification permission on app load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
// Start update checker
useEffect(() => {
  console.log('Current version:', process.env.REACT_APP_VERSION);  // Add this
  
  updateChecker.start(() => {
    setUpdateAvailable(true);
    
    // Show notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Update Available!', {
        body: 'A new version of Pump Inc. is ready. Tap to update.',
        icon: '/icon.png',
        badge: '/icon.png',
      });
    }
  });
  
  return () => {
    updateChecker.stop();
  };
}, []);
  // Handle update
  const handleUpdate = () => {
    setUpdateAvailable(false);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          reg.update().then(() => {
            window.location.reload();
          });
        } else {
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }
  };
 
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setData(prev => ({ ...prev, activeTab: tab }));
  };
  
  // Show loading screen
  if (isLoading || isDataLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-dark)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/logo-dark.png" alt="Loading" style={{ width: '60px', marginBottom: '20px' }} />
          <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
        </div>
      </div>
    );
  }
  
  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }
  
  // Show main app if authenticated
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-container">
        {/* Update Banner */}
        {updateAvailable && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
            color: 'white',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 9999,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}>
            <span style={{ fontSize: '0.9em', fontWeight: '500' }}>
              🎉 New update available!
            </span>
            <button
              onClick={handleUpdate}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.85em',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Update Now
            </button>
          </div>
        )}
        
        <Header />
        <div className={`content ${activeTab === 'start-workout-tab' ? '' : 'hidden'}`}>
          <StartWorkoutTab />
        </div>
        <div className={`content ${activeTab === 'profile-tab' ? '' : 'hidden'}`}>
          <ProfileTab />
        </div>
        <div className={`content ${activeTab === 'community-tab' ? '' : 'hidden'}`}>
          <CommunityTab />
        </div>
        <div className={`content ${activeTab === 'exercises-tab' ? '' : 'hidden'}`}>
          <ExercisesTab />
        </div>
        <div className={`content ${activeTab === 'progress-tab' ? '' : 'hidden'}`}>
          <ProgressTab />
        </div>
        <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />
        <Modals />
      </div>
    </DndProvider>
  );
};

const App = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;