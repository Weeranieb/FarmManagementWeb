import React, { useEffect } from 'react'
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
import {
  ACCESS_TOKEN_NAME,
  EXPIRED_DATE,
} from './constants/localStorageConstants'
import { setToken, setUserData } from './redux/reducers/user'
import { useDispatch } from 'react-redux'
import { getUserApi } from './services/user.service'
import { checkIsTokenValid } from './utils/token'

const App: React.FC = () => {
  const dispatch = useDispatch()

  const getUser = async () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_NAME)
    const expiredAt = localStorage.getItem(EXPIRED_DATE)
    if (accessToken && expiredAt && checkIsTokenValid()) {
      dispatch(setToken({ accessToken, expiredAt }))
      const user = await getUserApi()
      if (user.result) {
        dispatch(setUserData(user.data))
      }
    }
  }

  useEffect(() => {
    getUser()
  })

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
