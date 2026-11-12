import React from 'react';
import StaffPortalLogin from '../../components/StaffPortalLogin';

const LoginPage = () => (
  <StaffPortalLogin
    portalId="sales"
    portalTitle="Sales Portal"
    portalSubtitle="Sign in with your sales staff account to continue."
    allowedRoles={['sales']}
    authenticatedRoles={['sales']}
    redirectPath="/sales/dashboard"
    accessDeniedMessage="Access denied. Sales portal requires sales privileges."
    signInButtonLabel="Sign In"
    accentTheme="green"
  />
);

export default LoginPage;
