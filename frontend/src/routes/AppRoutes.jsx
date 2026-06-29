import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import { PageSkeleton } from '../components/LoadingSkeleton';

// Lazy load pages for code splitting
const Dashboard      = lazy(() => import('../pages/DashBoard'));
const EquipmentPage  = lazy(() => import('../pages/EquipmentPage'));
const BookingPage    = lazy(() => import('../pages/BookingPage'));
const MandiPage      = lazy(() => import('../pages/MandiPage'));
const PaymentPage    = lazy(() => import('../pages/PaymentPage'));
const DisputePage    = lazy(() => import('../pages/DisputePage'));
const MapPage        = lazy(() => import('../pages/MapPage'));
const UserPage       = lazy(() => import('../pages/UserPage'));
const NotificationPage = lazy(() => import('../pages/NotificationPage'));
const TripPage       = lazy(() => import('../pages/TripPage'));
const HelpDeskPage   = lazy(() => import('../pages/HelpDeskPage'));
const AdminPage      = lazy(() => import('../pages/AdminPage'));
const ProfilePage    = lazy(() => import('../pages/ProfilePage'));
const ForgotPassword = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPassword  = lazy(() => import('../pages/ResetPasswordPage'));
const NotFound       = lazy(() => import('../pages/NotFound'));

const Loading = () => (
  <AppLayout>
    <PageSkeleton />
  </AppLayout>
);

const AppRoutes = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      {/* ── Dashboard ── */}
      <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />

      {/* ── Auth / Profile ── */}
      <Route path="/user"            element={<AppLayout><UserPage /></AppLayout>} />
      <Route path="/profile"         element={<AppLayout><ProfilePage /></AppLayout>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      {/* ── Equipment ── */}
      <Route path="/equipment" element={<AppLayout><EquipmentPage /></AppLayout>} />

      {/* ── Bookings ── */}
      <Route path="/booking"          element={<AppLayout><BookingPage /></AppLayout>} />
      <Route path="/booking/:type/:id" element={<AppLayout><BookingPage /></AppLayout>} />

      {/* ── Mandi Pool ── */}
      <Route path="/mandi"     element={<AppLayout><MandiPage /></AppLayout>} />
      <Route path="/trip/:id"  element={<AppLayout><TripPage /></AppLayout>} />

      {/* ── Payments ── */}
      <Route path="/payment" element={<AppLayout><PaymentPage /></AppLayout>} />

      {/* ── Disputes ── */}
      <Route path="/dispute" element={<AppLayout><DisputePage /></AppLayout>} />

      {/* ── Map ── */}
      <Route path="/map" element={<AppLayout><MapPage /></AppLayout>} />

      {/* ── Notifications ── */}
      <Route path="/notifications" element={<AppLayout><NotificationPage /></AppLayout>} />

      {/* ── Help Desk ── */}
      <Route path="/help" element={<AppLayout><HelpDeskPage /></AppLayout>} />

      {/* ── Admin ── */}
      <Route path="/admin" element={<AppLayout><AdminPage /></AppLayout>} />

      {/* ── 404 ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;