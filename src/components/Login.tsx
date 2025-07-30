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
      <h2 style={{ 
        fontSize: '1.8em', 
        marginBottom: '20px',
        color: 'white',
        fontWeight: '400',
        letterSpacing: '-0.5px',
      }}>
        Welcome to
      </h2>
      
      <img 
        src="/logo-dark.png" 
        alt="Pump Inc" 
        style={{ 
          width: '200px', 
          marginBottom: '40px',
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))',
        }} 
      />
      
      <p style={{ 
        marginBottom: '40px', 
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '1.1em',
        letterSpacing: '-0.3px',
      }}>
        The only fitness app you will ever need
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
          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
        }}
      >
        Sign In / Sign Up
      </button>
    </div>
  );
};