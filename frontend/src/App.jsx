import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import Dashboard from './pages/auth/Dashboard';
import CarePage from './pages/CarePage';
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from 'react-hot-toast';
import CarbonFootprintTracker from './pages/CarbonFootprint';
import ProtectedRoute from './components/auth/ProtectedRoutes';
import WaterQualityFrontendWrapper from './pages/WaterMap';



import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import Dashboard from './pages/auth/Dashboard'
import CarePage from './pages/CarePage'
import WaterMapPage from './pages/WaterMapPage'  // Add this import

const App = () => {
  const { isCheckingAuth, user, checkAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    console.log(user)
  }, []);

  if (isCheckingAuth && !user) {
    return (
      <div className='flex items-center justify-center w-screen h-screen bg-[#121212]'>
        Loading...
      </div>
    );
  }

  const noNavbarRoutes = ['/login', '/signup'];
  const showNavbar = !noNavbarRoutes.includes(location.pathname);

  return (
    <div className='w-screen'>
      <Toaster position="top-right" reverseOrder={false}/>
      {showNavbar && <Navbar />}
      <Routes>
                <Route path="/" element={user ? <Dashboard/> : <LoginPage/>} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/carepage" element={<CarePage />} />
                <Route path="/carbonfootprint" element={<CarbonFootprintTracker />} />
                <Route path="/watermap" element={<WaterQualityFrontendWrapper />} />
            </Routes>
        <Routes>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/signup" element={<SignupPage/>}/>
          <Route path="/dashboard" element={<Dashboard />}/>
          <Route path="/carepage" element={<CarePage/>}/>
          <Route path="/watermap" element={<WaterMapPage/>}/>  {/* Add this route */}
        </Routes>
    </div>
  );
};

export default App;