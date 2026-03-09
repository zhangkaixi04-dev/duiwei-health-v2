// src/cangzhen/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Museum from './pages/Museum';
import Record from './pages/Record';
import Review from './pages/Review';

// Placeholder components until full implementation
const Profile = () => <div className="p-6 text-center">我的 (Building...)</div>;

const CangzhenApp = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="museum" element={<Museum />} />
        <Route path="record" element={<Record />} />
        <Route path="review" element={<Review />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Route>
    </Routes>
  );
};

export default CangzhenApp;
