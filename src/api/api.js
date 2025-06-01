// Base API URL - use environment variable for production or fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get authentication headers
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
    },

    // Added for offline support
    // Bulk operations for syncing offline data
    bulkSync: async (operations) => {
        const response = await fetch(`${API_URL}/concerts/bulk`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ operations }),
        });
        return handleResponse(response);
    },

    // Check server health
    checkHealth: async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(`${API_URL}/concerts/health`, {
                signal: controller.signal,
                headers: getAuthHeaders()
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
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