import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import Dashboard from './pages/auth/Dashboard'
import CarePage from './pages/CarePage'
import WaterMapPage from './pages/WaterMapPage'  // Add this import

const App = () => {
  return (
    <div className='w-screen'>
        <Routes>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/signup" element={<SignupPage/>}/>
          <Route path="/dashboard" element={<Dashboard />}/>
          <Route path="/carepage" element={<CarePage/>}/>
          <Route path="/watermap" element={<WaterMapPage/>}/>  {/* Add this route */}
        </Routes>
    </div>
  )
}

export default App;
