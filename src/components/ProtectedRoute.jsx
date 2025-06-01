// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../api/authService';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const user = authService.getCurrentUser();
            const tokenValid = await authService.checkTokenValidity();

            // Check if user exists, token is valid, and role is appropriate
            const isAuthorized = user && tokenValid &&
                (!requiredRole || user.role === requiredRole);

            setAuthorized(isAuthorized);
            setLoading(false);
        };

        checkAuth();
    }, [requiredRole]);

    if (loading) return <div>Loading...</div>;

    return authorized ? children : <Navigate to="/signin" />;
};

export default ProtectedRoute;