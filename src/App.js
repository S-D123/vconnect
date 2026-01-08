import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import HomePage from './HomePage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <LoginPage onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/home" element={<HomePage />}
        />
      </Routes>
  );
}

export default App;