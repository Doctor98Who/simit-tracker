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

const AppContent = () => {
  const { data, setData, isLoading: isDataLoading } = useContext(DataContext);
  const [activeTab, setActiveTab] = useState(data.activeTab || 'start-workout-tab');
  const { isLoading, isAuthenticated } = useAuth0();
  
  // Sync activeTab from context
  useEffect(() => {
    if (data.activeTab !== activeTab) {
      setActiveTab(data.activeTab);
    }
  }, [data.activeTab, activeTab]);
  
  // Request notification permission on app load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
 
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