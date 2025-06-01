// src/api/authService.js
import { API_URL } from './api';

export const authService = {
    // Add this new method
    register: async (name, email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            // Get the response text first
            const responseText = await response.text();

            // Try to parse as JSON if possible
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Non-JSON response:', responseText);
                throw new Error(`Registration failed: ${response.status}`);
            }

            // Check for error in the response
            if (!response.ok) {
                const errorMessage = data.error || data.message || 'Registration failed';
                console.error('Server error:', data);
                throw new Error(errorMessage);
            }

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    login: async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        if (data.token && !data.requireTwoFactor) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    checkTokenValidity: async () => {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok;
        } catch {
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};