import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import Dashboard from './pages/auth/Dashboard'
import CarePage from './pages/CarePage'
import { useAuthStore } from './store/useAuthStore'
import { useEffect } from 'react'
import ProtectedRoute from './components/ProtectedRoutes'


const App = () => {
    const { isCheckingAuth, user, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, []);

    if (isCheckingAuth && !user) {
        return (
            <div className='flex items-center justify-center w-screen h-screen bg-[#121212]'>
                Loading...
            </div>
        );
    }

    return (
        <div className='w-screen'>
            <Routes>
                <Route path="/" element={user ? <Dashboard/> : <LoginPage/>} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                  } />
                <Route path="/carepage" element={
                  <ProtectedRoute>
                    <CarePage />
                  </ProtectedRoute>
                } />
            
            </Routes>
        </div>
    );
}
  

export default App