import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import Dashboard from './pages/auth/Dashboard'
import CarePage from './pages/CarePage'
import { useAuthStore } from './store/useAuthStore'
import { useEffect } from 'react'


const App = () => {
    const { isCheckingAuth, authUser, checkAuth } = useAuthStore();
  useEffect(() => {

    checkAuth();
  }, [checkAuth])
  if (isCheckingAuth && !authUser) {
    return (
      <div className='flex items-center justify-center w-screen h-screen bg-[#121212]'>
        Loading...
      </div>
    )
  }

  return (
    <div className='w-screen'>
        <Routes>
          
          <Route path="/" element={authUser ? <Dashboard/> : <LoginPage/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/signup" element={<SignupPage/>}/>
          <Route path="/dashboard" element={<Dashboard />}/>
          <Route path="/carepage" element={<CarePage/>}/>
        </Routes>
    </div>
  )
}

export default App