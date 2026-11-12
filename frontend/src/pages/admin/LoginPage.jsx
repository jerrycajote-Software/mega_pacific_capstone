import React from 'react';
import StaffPortalLogin from '../../components/StaffPortalLogin';

const LoginPage = () => (
  <StaffPortalLogin
    portalId="admin"
    portalTitle="Admin Portal"
    portalSubtitle="Sign in with your administrator account to continue."
    allowedRoles={['admin', 'owner', 'super_admin', 'superadmin']}
    authenticatedRoles={['admin', 'sales']}
    redirectPath="/admin/dashboard"
    accessDeniedMessage="Access denied. Admin portal requires administrator privileges."
    signInButtonLabel="Sign In"
    accentTheme="green"
  />
);

export default LoginPage;
