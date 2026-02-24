import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Search from './components/Search';
import Notifications from './components/Notifications';
import SignupPage from './components/SignupPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <LoginPage onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/search" element={<Search />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/signup" element={<SignupPage />} />

      </Routes>
  );
}

export default App;