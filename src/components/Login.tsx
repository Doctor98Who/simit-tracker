import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export const Login: React.FC = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      padding: '20px',
    }}>
      <img 
        src="/logo-dark.png" 
        alt="Pump Inc" 
        style={{ 
          width: '120px', 
          marginBottom: '40px' 
        }} 
      />
      <h1 style={{ 
        fontSize: '2.5em', 
        marginBottom: '20px',
        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Welcome to Pump Inc
      </h1>
      <p style={{ 
        marginBottom: '40px', 
        textAlign: 'center',
        color: 'var(--text-muted)' 
      }}>
        Track your workouts, monitor progress, and achieve your fitness goals
      </p>
      <button
        onClick={() => loginWithRedirect()}
        style={{
          background: 'var(--accent-gradient)',
          color: 'white',
          border: 'none',
          padding: '16px 32px',
          borderRadius: '12px',
          fontSize: '1.1em',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        Sign In / Sign Up
      </button>
    </div>
  );
};