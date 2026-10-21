import React from 'react';
import ConstructionIcon from '@mui/icons-material/Construction';

const MaintenancePage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a',
      color: 'white',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'rgba(245,158,11,0.1)',
        padding: '2rem',
        borderRadius: '50%',
        marginBottom: '2rem',
        border: '1px solid rgba(245,158,11,0.2)'
      }}>
        <ConstructionIcon sx={{ fontSize: 80, color: '#f59e0b' }} />
      </div>
      
      <h1 style={{ 
        fontSize: '3rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem',
        background: 'linear-gradient(to right, #f59e0b, #fbbf24)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        System Offline
      </h1>
      
      <p style={{ 
        fontSize: '1.2rem', 
        color: '#9ca3af', 
        maxWidth: '600px',
        lineHeight: 1.6
      }}>
        This portal is currently down for scheduled maintenance or updates. 
        Please check back later. We apologize for the inconvenience.
      </p>
    </div>
  );
};

export default MaintenancePage;
