import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { LostItems } from './pages/LostItems';
import { ReportLost } from './pages/ReportLost';
import { FoundItems } from './pages/FoundItems';
import { ReportFound } from './pages/ReportFound';
import { Search } from './pages/Search';
import { Matches } from './pages/Matches';
import { Claims } from './pages/Claims';
import { TrackReport } from './pages/TrackReport';
import { RecoverReport } from './pages/RecoverReport';
import { Support } from './pages/Support';
import { HowItWorks } from './pages/HowItWorks';

// Admin Imports
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminLostItems } from './pages/admin/AdminLostItems';
import { AdminFoundItems } from './pages/admin/AdminFoundItems';
import { AdminClaims } from './pages/admin/AdminClaims';
import { AdminSupport } from './pages/admin/AdminSupport';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

// Public site layout wrapper with Navbar & Footer
const PublicLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col justify-between bg-[#09090b] text-slate-100 font-sans transition-colors duration-150">
    <Navbar />
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            
            {/* Standalone Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Private Admin Console */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminOverview />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/lost" element={<AdminLostItems />} />
                <Route path="/admin/found" element={<AdminFoundItems />} />
                <Route path="/admin/claims" element={<AdminClaims />} />
                <Route path="/admin/support" element={<AdminSupport />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/audit" element={<AdminAuditLogs />} />
              </Route>
            </Route>

            {/* Public App Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/lost" element={<LostItems />} />
              <Route path="/report-lost" element={<ReportLost />} />
              <Route path="/found" element={<FoundItems />} />
              <Route path="/report-found" element={<ReportFound />} />
              <Route path="/search" element={<Search />} />
              <Route path="/track" element={<TrackReport />} />
              <Route path="/report/:reportId" element={<TrackReport />} />
              <Route path="/recover" element={<RecoverReport />} />
              <Route path="/support" element={<Support />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/claims" element={<Claims />} />
            </Route>

          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
