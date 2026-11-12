import React from 'react';
import StaffPortalLogin from '../../components/StaffPortalLogin';

const LoginPage = () => (
  <StaffPortalLogin
    portalId="logistic"
    portalTitle="Logistic Portal"
    portalSubtitle="Sign in with your logistics staff account to continue."
    allowedRoles={['logistic']}
    authenticatedRoles={['logistic']}
    redirectPath="/logistic/dashboard"
    accessDeniedMessage="Access denied. Logistic portal requires logistic privileges."
    signInButtonLabel="Sign In"
    accentTheme="green"
  />
);

export default LoginPage;
