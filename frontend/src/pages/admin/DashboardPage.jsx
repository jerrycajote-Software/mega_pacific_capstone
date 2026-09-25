import React from 'react';
import BuildIcon from '@mui/icons-material/Build';

const DashboardPage = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '70vh', 
      color: 'var(--text-muted)' 
    }}>
      <BuildIcon sx={{ fontSize: 64, color: 'var(--border-light)', marginBottom: '1rem' }} />
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Admin Technical Support Portal
      </h2>
      <p style={{ textAlign: 'center', maxWidth: '500px', lineHeight: 1.6 }}>
        Welcome to the technical support interface. From here, you can manage user accounts, 
        configure system settings, and assist other staff members with their access. 
        Sales and product data are managed in their respective dedicated portals.
      </p>
    </div>
  );
};

export default DashboardPage;
