
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Events from '../src/pages/Events.jsx'
import EventDetail from '../src/pages/EventDetail.jsx';
import './App.css';
import MainPage from '../src/pages/MainPage.jsx';
import SignIn from "./pages/SignIn.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import TwoFactorSetup from "./components/TwoFactorSetup.jsx";

// Add this to the top of your API service file or in your main component
console.log('=== ENVIRONMENT DEBUG ===');
console.log('NODE_ENV:', import.meta.env.MODE);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('All environment variables:', import.meta.env);
console.log('========================');

// Your API URL configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

console.log('BASE_URL:', BASE_URL);
console.log('Final API_URL:', API_URL);

// Test the environment variable directly
if (!import.meta.env.VITE_API_URL) {
    console.error('⚠️ VITE_API_URL is not set! Using localhost fallback.');
} else {
    console.log('✅ VITE_API_URL is set correctly');
}




function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/events" element={<Events />} />
                <Route path="/event/:eventSlug" element={<EventDetail />} />
                <Route path="/signin" element={<SignIn />} />

                {/* Protected routes */}
                <Route path="/admin" element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminPage />
                    </ProtectedRoute>
                } />

                <Route path="/profile/2fa-setup" element={
                    <ProtectedRoute>
                        <TwoFactorSetup />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;



//  <Route path="/" element={<Navigate to="/events" replace />} />