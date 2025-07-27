import React from 'react';

interface HeaderProps {
  version?: string; // Optional prop for dynamic version
}

const Header: React.FC<HeaderProps> = ({ version = 'v0.0.11' }) => (
  <div className="header">
    <img src="/icon.png" alt="Simit Tracker Logo" />
    Simit Tracker
    <span id="app-version">{version}</span>
  </div>
);

export default Header;