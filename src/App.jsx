import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyCard from './pages/MyCard';
import Students from './pages/Students';
import Elections from './pages/Elections';
import Government from './pages/Government';
import Announcements from './pages/Announcements';
import Events from './pages/Events';
import Alumni from './pages/Alumni';
import Admin from './pages/Admin';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Channels */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Gated Application Layout Wrapper */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="my-card" element={<MyCard />} />
            <Route path="students" element={<Students />} />
            <Route path="elections" element={<Elections />} />
            <Route path="government" element={<Government />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="events" element={<Events />} />
            <Route path="alumni" element={<Alumni />} />
            <Route path="admin" element={<Admin />} />
          </Route>

          {/* Wildcard Fallback Redirects */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
