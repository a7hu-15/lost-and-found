import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import { HowItWorks } from './pages/HowItWorks';
import { AdminDashboard } from './pages/AdminDashboard';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col justify-between bg-[#09090b] text-slate-100 font-sans">
          <Navbar />
          
          <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
            <Routes>
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
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/claims" element={<Claims />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
