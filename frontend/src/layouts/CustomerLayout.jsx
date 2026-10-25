import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomerHeader from '../components/CustomerHeader';
import Footer from '../components/Footer';
import CustomerBottomNav from '../components/CustomerBottomNav';
import CustomerServiceWidget from '../components/CustomerServiceWidget';
import ErrorBoundary from '../components/ErrorBoundary';
import { usePreventBackToLogin } from '../hooks/usePreventBackToLogin';
import {
  Box,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { io } from 'socket.io-client';

const CustomerLayoutContent = () => {
  usePreventBackToLogin();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pickupNotification, setPickupNotification] = useState(null);
  const [refundNotification, setRefundNotification] = useState(null);

  React.useEffect(() => {
    if (!user?.id) return;
    const API_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(API_URL, {
      auth: { user }
    });

    socket.emit('join_room', `user_${user.id}`);

    socket.on('order_ready_for_pickup', (data) => {
      setPickupNotification(data);
    });

    socket.on('order_refunded', (data) => {
      setRefundNotification(data);
    });

    return () => socket.close();
  }, [user?.id]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <CustomerHeader />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 1.5, sm: 2.5, md: 4 },
          pt: { xs: 2, md: 3 },
          pb: { xs: 10, md: 4 },
        }}
      >
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Box>

      <Footer />

      <Snackbar
        open={Boolean(pickupNotification)}
        autoHideDuration={12000}
        onClose={() => setPickupNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: { xs: 7, sm: 8 } }}
      >
        <Alert
          onClose={() => setPickupNotification(null)}
          severity="success"
          variant="filled"
          icon={<i className="fi fi-rr-shop" style={{ fontSize: 20 }} />}
          sx={{
            width: '100%',
            maxWidth: 580,
            borderRadius: 3,
            bgcolor: '#7c3aed',
            color: '#ffffff',
            boxShadow: '0 12px 32px rgba(124, 58, 237, 0.4)',
            fontWeight: 600,
            alignItems: 'center'
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                const oid = pickupNotification?.orderId;
                setPickupNotification(null);
                if (oid) navigate(`/orders/${oid}`);
                else navigate('/orders');
              }}
              sx={{ fontWeight: 800, textTransform: 'none', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
            >
              View Pick-up Pass
            </Button>
          }
        >
          <div>
            <strong>Signal Received: Order Ready for Pick-up!</strong>
            <div style={{ fontSize: '0.8rem', opacity: 0.95 }}>
              {pickupNotification?.message || 'Your roofing order is Ready to Pick-Up.'}
            </div>
          </div>
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(refundNotification)}
        autoHideDuration={14000}
        onClose={() => setRefundNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: { xs: 7, sm: 8 } }}
      >
        <Alert
          onClose={() => setRefundNotification(null)}
          severity="success"
          variant="filled"
          icon={<i className="fi fi-sr-shield-check" style={{ fontSize: 20 }} />}
          sx={{
            width: '100%',
            maxWidth: 620,
            borderRadius: 3,
            bgcolor: '#047857',
            color: '#ffffff',
            boxShadow: '0 12px 32px rgba(4, 120, 87, 0.4)',
            fontWeight: 600,
            alignItems: 'center'
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                const oid = refundNotification?.orderId;
                setRefundNotification(null);
                if (oid) navigate(`/orders/${oid}`);
                else navigate('/orders');
              }}
              sx={{ fontWeight: 800, textTransform: 'none', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
            >
              View Order
            </Button>
          }
        >
          <div>
            <strong>Payment Refunded Successfully!</strong>
            <div style={{ fontSize: '0.8rem', opacity: 0.95, marginTop: 2 }}>
              {refundNotification?.message || 'Your refund has been disbursed by our Finance department.'}
            </div>
            {refundNotification?.transactionReference && (
              <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: 2 }}>
                Ref ID: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{refundNotification.transactionReference}</span>
              </div>
            )}
          </div>
        </Alert>
      </Snackbar>

      <CustomerServiceWidget />
      <CustomerBottomNav />

    </Box>
  );
};

const CustomerLayout = () => (
  <ErrorBoundary>
    <CustomerLayoutContent />
  </ErrorBoundary>
);

export default CustomerLayout;
