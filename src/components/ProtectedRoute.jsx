// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const user = authService.getCurrentUser();
            const tokenValid = await authService.checkTokenValidity();

            // Check if user exists, token is valid, and role is appropriate
            const isAuthorized = user && tokenValid &&
                (!requiredRole || user.role === requiredRole);

            setAuthorized(isAuthorized);
            setLoading(false);

            // If not authorized, redirect immediately
            if (!isAuthorized && !loading) {
                navigate('/');
            }
        };

        checkAuth();

        // Set up periodic token checking
        const tokenCheckInterval = setInterval(async () => {
            const tokenValid = await authService.checkTokenValidity();
            if (!tokenValid) {
                // Token expired, log out and redirect
                authService.logout();
                navigate('/');
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(tokenCheckInterval);
    }, [requiredRole, navigate]);

    if (loading) return <div>Loading...</div>;

    // This return handles the initial check
    return authorized ? children : <Navigate to="/" />;
};

export default ProtectedRoute;