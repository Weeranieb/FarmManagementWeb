import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/home/HomePage'
import FarmsPage from './pages/farms/FarmsPage'
import Login from './pages/login/LoginPage'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route
          path='/*'
          element={
            <Layout>
              <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/farms' element={<FarmsPage />} />
                {/* Add more routes as needed */}
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
