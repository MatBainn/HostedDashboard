import React from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import HandymanVerification from "./pages/HandymanVerification";
import UserVerification from "./pages/UserVerification";
import UserManagement from "./pages/UserManagement";
import JobManagement from "./pages/JobManagement";
import ServiceAnalytics from "./pages/ServiceAnalytics";
import UserEngagement from "./pages/UserEngagement";
import AdminSettings from "./pages/AdminSettings";
import SupportFeedback from "./pages/SupportFeedback";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

import FirebaseTest from "./pages/FirebaseTest";

// State Management
import { UserProvider } from "./context/UserContext";



function App() {
  return (
    <UserProvider>

      <Routes>
        {/* Login Page - Root Route */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />


        {/* Firebase Test Route (for testing only) */}
        <Route path="/firebase-test" element={<FirebaseTest />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <div className="d-flex">
              <Sidebar />
              <div className="flex-grow-1">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/handyman-verification" element={<HandymanVerification />} />
                  <Route path="/user-verification" element={<UserVerification />} />
                  <Route path="/user-management" element={<UserManagement />} />
                  <Route path="/job-management" element={<JobManagement />} />
                  <Route path="/service-analytics" element={<ServiceAnalytics />} />
                  <Route path="/user-engagement" element={<UserEngagement />} />
                  <Route path="/admin-settings" element={<AdminSettings />} />
                  <Route path="/support-feedback" element={<SupportFeedback />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </UserProvider>

  );
}

export default App;
