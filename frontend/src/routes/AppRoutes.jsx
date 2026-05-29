import { Routes, Route } from "react-router-dom";

import AppLayout from "../layout/AppLayout";

import Dashboard from "../pages/Dashboard";
import EquipmentPage from "../pages/EquipmentPage";
import BookingPage from "../pages/BookingPage";
import MandiPage from "../pages/MandiPage";
import PaymentPage from "../pages/PaymentPage";
import DisputePage from "../pages/DisputePage";
import MapPage from "../pages/MapPage";
import UserPage from "../pages/UserPage";
import NotificationPage from "../pages/NotificationPage";
import TripPage from "../pages/TripPage";
import HelpDeskPage from "../pages/HelpDeskPage";

const AppRoutes = () => {
  return (
    <Routes>

      {/* ================= DASHBOARD ================= */}
      <Route
        path="/"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      />

      {/* ================= USERS ================= */}
      <Route
        path="/user"
        element={
          <AppLayout>
            <UserPage />
          </AppLayout>
        }
      />

      {/* ================= EQUIPMENT ================= */}
      <Route
        path="/equipment"
        element={
          <AppLayout>
            <EquipmentPage />
          </AppLayout>
        }
      />

      {/* ================= BOOKING ================= */}
      <Route
        path="/booking"
        element={
          <AppLayout>
            <BookingPage />
          </AppLayout>
        }
      />

      {/* ================= MANDI ================= */}
      <Route
        path="/mandi"
        element={
          <AppLayout>
            <MandiPage />
          </AppLayout>
        }
      />

       <Route path="/booking/:type/:id" element={<BookingPage />} />

      <Route path="/trip/:id" element={<AppLayout><TripPage /></AppLayout>} />    

      {/* ================= PAYMENT ================= */}
      <Route
        path="/payment"
        element={
          <AppLayout>
            <PaymentPage />
          </AppLayout>
        }
      />

      {/* ================= DISPUTE ================= */}
      <Route
        path="/dispute"
        element={
          <AppLayout>
            <DisputePage />
          </AppLayout>
        }
      />

      {/* ================= MAP ================= */}
      <Route
        path="/map"
        element={
          <AppLayout>
            <MapPage />
          </AppLayout>
        }
      />

      {/* ================= NOTIFICATIONS (NEW FIX) ================= */}
      <Route
        path="/notifications"
        element={
          <AppLayout>
            <NotificationPage />
          </AppLayout>
        }
      />
      <Route
  path="/help"
  element={
    <AppLayout>
      <HelpDeskPage />
    </AppLayout>
  }
/>

      

    </Routes>
  );
};

export default AppRoutes;