// Base API URL
const API_URL = 'http://localhost:3001/api';

// Get authentication headers
// const getAuthHeaders = () => {
//     const userString = localStorage.getItem('user');
//     const user = userString ? JSON.parse(userString) : {};
//     console.log('User from localStorage:', user);
//     return {
//         'Content-Type': 'application/json',
//         ...(user.id ? { 'Authorization': `Bearer ${user.id}` } : {})
//     };
// };

const getAuthHeaders = () => {
    return {
        'Content-Type': 'application/json'
        // Authorization header temporarily removed
    };
};

// Error handling helper
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    return response.json();
};

// Concert API
export const concertService = {
    // Get all concerts with optional filters
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.genre) params.append('genre', filters.genre);
        if (filters.search) params.append('search', filters.search);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortDir) params.append('sortDir', filters.sortDir);

        const queryString = params.toString();
        const url = `${API_URL}/concerts${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    // Get concert by ID
    getById: async (id) => {
        const response = await fetch(`${API_URL}/concerts/${id}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    // Create new concert
    create: async (concertData) => {
        const response = await fetch(`${API_URL}/concerts`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(concertData)
        });
        return handleResponse(response);
    },

    // Update concert
    update: async (id, concertData) => {
        const response = await fetch(`${API_URL}/concerts/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(concertData)
        });
        return handleResponse(response);
    },

    // Delete concert
    delete: async (id) => {
        const response = await fetch(`${API_URL}/concerts/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    }
};

// Authentication API
export const authService = {
    // Login
    login: async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        return handleResponse(response);
    },

    // Check if the user is logged in
    getCurrentUser: () => {
        const userString = localStorage.getItem('user');
        return userString ? JSON.parse(userString) : null;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('user');
    }
};