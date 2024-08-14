import { FC, useEffect } from 'react'
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
import SettingPage from './pages/setting/SettingPage'
import {
  ACCESS_TOKEN_NAME,
  EXPIRED_DATE,
} from './constants/localStorageConstants'
import { setToken, setUserData } from './redux/reducers/user'
import { useDispatch } from 'react-redux'
import { getUserApi } from './services/user.service'
import { checkIsTokenValid } from './utils/token'
import i18n from './i18n/i18n'

const App: FC = () => {
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

  // FIXME to use localStorage.getItem('lang') instead
  i18n.changeLanguage('th')

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
                <Route element={<PrivateRoute />}>
                  <Route path='/' element={<HomePage />} />
                  <Route path='/farms' element={<FarmsPage />} />
                  <Route path='/activity' element={<ActivityPage />} />
                  <Route path='/feed' element={<Feed />} />
                  <Route path='bill' element={<Bill />} />
                  <Route path='worker' element={<Worker />} />
                  <Route path='dailyFeed' element={<DailyFeed />} />
                  <Route path='pond/:id' element={<OnePond />} />
                  <Route path='setting' element={<SettingPage />} />
                  <Route path='setting' element={<SettingPage />}>
                    <Route path='general' element={<div>ทัวไป</div>} />
                    <Route path='farm-group' element={<div>กลุ่มฟาร์ม</div>} />
                    <Route
                      path='add-customer'
                      element={<div>เพิ่มลูกค้า</div>}
                    />
                    <Route
                      path='add-farm-pond'
                      element={<div>เพิ่มฟาร์มและบ่อปลา</div>}
                    />
                  </Route>
                </Route>
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
