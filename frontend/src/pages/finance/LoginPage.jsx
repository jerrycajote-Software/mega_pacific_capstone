import React from 'react';
import StaffPortalLogin from '../../components/StaffPortalLogin';

const LoginPage = () => (
  <StaffPortalLogin
    portalId="finance"
    portalTitle="Finance Portal"
    portalSubtitle="Sign in with your finance staff account to continue."
    allowedRoles={['finance']}
    authenticatedRoles={['finance']}
    redirectPath="/finance/dashboard"
    accessDeniedMessage="Access denied. Finance portal requires finance privileges."
    signInButtonLabel="Sign In"
    accentTheme="green"
  />
);

export default LoginPage;
