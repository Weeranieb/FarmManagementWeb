import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/home/HomePage'
import FarmsPage from './pages/farms/FarmsPage'
import Login from './pages/login/LoginPage'
import ActivityPage from './pages/activity/ActivityPage'
import Feed from './pages/feed/FeedPage'
import Bill from './pages/bill/BillPage'
import Worker from './pages/worker/WorkerPage'
import DailyFeed from './pages/dailyfeed/DailyFeedPage'
import OnePond from './pages/onepond/OnePond'
import PrivateRoute from './components/PrivateRoute'

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
                {/* <Route path='/' element={<HomePage />} /> */}
                {/* <Route path='/farms' element={<FarmsPage />} /> */}
                {/* <Route path='/activity' element={<ActivityPage />} />
                <Route path='/feed' element={<Feed />} />
                <Route path='bill' element={<Bill />} />
                <Route path='worker' element={<Worker />} />
                <Route path='dailyFeed' element={<DailyFeed />} />
                <Route path='pond/:id' element={<OnePond />} /> */}

                <Route element={<PrivateRoute />}>
                  <Route path='/' element={<HomePage />} />
                  <Route path='/farms' element={<FarmsPage />} />
                  <Route path='/activity' element={<ActivityPage />} />
                  <Route path='/feed' element={<Feed />} />
                  <Route path='bill' element={<Bill />} />
                  <Route path='worker' element={<Worker />} />
                  <Route path='dailyFeed' element={<DailyFeed />} />
                  <Route path='pond/:id' element={<OnePond />} />
                </Route>
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
