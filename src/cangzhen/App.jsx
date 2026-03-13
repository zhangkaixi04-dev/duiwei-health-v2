// src/cangzhen/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Museum from './pages/Museum';
import Record from './pages/Record';
import Review from './pages/Review';
import Login from './pages/Login';
import { authService } from '../services/authService';

// Placeholder components until full implementation
const Profile = () => <div className="p-6 text-center">我的 (Building...)</div>;

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser('cangzhen').then(u => {
      setUser(u);
      setLoading(false);
    });
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }, 'cangzhen');
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <div className="text-cangzhen-text-secondary">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/cangzhen/login" replace />;
  }

  return children;
};

const CangzhenApp = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="museum" element={
          <ProtectedRoute>
            <Museum />
          </ProtectedRoute>
        } />
        <Route path="record" element={
          <ProtectedRoute>
            <Record />
          </ProtectedRoute>
        } />
        <Route path="review" element={
          <ProtectedRoute>
            <Review />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="" replace />} />
      </Route>
    </Routes>
  );
};

export default CangzhenApp;
