import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import OwnerLogin from './pages/OwnerLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import BookingPage from './pages/BookingPage';
import EditProfile from './pages/EditProfile';
import MyOrders from './pages/MyOrders';
import BillBookingPage from './pages/BillBookingPage';
import BookingSuccess from './pages/BookingSuccess';
import AdminMovies from './components/admin/AdminMovies';
import AdminPartners from './components/admin/AdminPartners';
import AdminAnalytics from './components/admin/AdminAnalytics';
import AdminStats from './components/admin/AdminStats';
import PartnerPerformance from './components/admin/PartnerPerformance';
import UserReports from './components/admin/UserReports';
import UserReportDetails from './components/admin/UserReportDetails';
import PartnerReports from './components/admin/PartnerReports';
import PartnerReportDetails from './components/admin/PartnerReportDetails';
import PartnerMovies from './components/partner/PartnerMovies';
import PartnerScreens from './components/partner/PartnerScreens';
import PartnerStats from './components/partner/PartnerStats';
import PartnerAnalytics from './components/partner/PartnerAnalytics';
import PartnerReport from './components/partner/PartnerReport';
import AuthContext from './context/AuthContext';

import PrivateRoute from './components/PrivateRoute';
import MovieReviews from './pages/MovieReviews';
import TicketDetails from './pages/TicketDetails';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { CityProvider } from './context/CityContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CityProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/owner/login" element={<OwnerLogin />} />
            <Route path="/register" element={<Register />} />

            <Route path="/admin/dashboard" element={
              <PrivateRoute allowedRoles={['admin']}>
                <Dashboard />
              </PrivateRoute>
            }>
              <Route index element={<AdminStats />} />
              <Route path="stats" element={<AdminStats />} />
              <Route path="add-movies" element={<AdminMovies />} />
              <Route path="partners" element={<AdminPartners />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="performance" element={<PartnerPerformance />} />
              <Route path="reports" element={<UserReports />} />
              <Route path="reports/:id" element={<UserReportDetails />} />
              <Route path="partner-reports" element={<PartnerReports />} />
              <Route path="partner-reports/:id" element={<PartnerReportDetails />} />
            </Route>

            <Route path="/partner/dashboard" element={
              <PrivateRoute allowedRoles={['partner']}>
                <PartnerDashboard />
              </PrivateRoute>
            }>
              <Route index element={<PartnerStats />} />
              <Route path="stats" element={<PartnerStats />} />
              <Route path="movies" element={<PartnerMovies />} />
              <Route path="screens" element={<PartnerScreens />} />
              <Route path="analytics" element={<PartnerAnalytics />} />
              <Route path="report" element={<PartnerReport />} />
            </Route>

            <Route
              path="/profile/edit"
              element={
                <PrivateRoute allowedRoles={['user', 'admin', 'partner']}>
                  <EditProfile />
                </PrivateRoute>
              }
            />

            <Route
              path="/my-orders"
              element={
                <PrivateRoute allowedRoles={['user', 'admin', 'partner']}>
                  <MyOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <PrivateRoute allowedRoles={['user', 'admin', 'partner']}>
                  <TicketDetails />
                </PrivateRoute>
              }
            />

            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/movie/:id/reviews" element={<MovieReviews />} />
            <Route path="/book/:screenId/:showtimeId" element={<BookingPage />} />
            <Route path="/bill-summary" element={<BillBookingPage />} />
            <Route path="/booking-success" element={<BookingSuccess />} />

            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />

            <Route path="/" element={<Home />} />

            <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </CityProvider>
      </AuthProvider >
    </Router >
  );
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const config = {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          };
          const res = await axios.get('/api/auth/me', config);
          setUser(res.data);
        } catch (error) {
          console.error('Failed to fetch user', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default App;
