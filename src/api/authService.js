// src/api/authService.js
export const authService = {
    // Login (updated to handle JWT)
    login: async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await handleResponse(response);

        // Store the token in localStorage
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    },

    // Get current user with token check
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!user || !token) return null;
        return JSON.parse(user);
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Check if the token is still valid
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
    }
};