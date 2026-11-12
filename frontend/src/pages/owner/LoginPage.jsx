import React from 'react';
import StaffPortalLogin from '../../components/StaffPortalLogin';

const OwnerLoginPage = () => (
  <StaffPortalLogin
    portalId="owner"
    portalTitle="Owner Portal"
    portalSubtitle="Sign in with your owner account to continue."
    allowedRoles={['owner', 'super_admin', 'superadmin']}
    authenticatedRoles={['owner']}
    redirectPath="/owner/dashboard"
    accessDeniedMessage="Access denied. Owner portal requires owner privileges."
    signInButtonLabel="Sign In"
    signingInText="Authenticating…"
    accentTheme="amber"
  />
);

export default OwnerLoginPage;
