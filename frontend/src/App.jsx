import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import Dashboard from './pages/auth/Dashboard'
import CarePage from './pages/CarePage'



const App = () => {
  return (
    <div className='w-screen'>
        <Routes>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/signup" element={<SignupPage/>}/>
          <Route path="/dashboard" element={<Dashboard />}/>
          <Route path="/carepage" element={<CarePage/>}/>
        </Routes>
    </div>
  )
}

export default App;
