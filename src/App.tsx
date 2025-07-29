import React, { useState, useContext } from 'react';
import './App.css';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import StartWorkoutTab from './components/StartWorkoutTab';
import ProfileTab from './components/ProfileTab';
import CommunityTab from './components/CommunityTab';
import ExercisesTab from './components/ExercisesTab';
import ProgressTab from './components/ProgressTab';
import Modals from './components/Modals';
import { DataContext, DataProvider } from './DataContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const AppContent = () => {
  const { data, setData } = useContext(DataContext);
  const [activeTab, setActiveTab] = useState(data.activeTab || 'start-workout-tab');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setData(prev => ({ ...prev, activeTab: tab }));
  };

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