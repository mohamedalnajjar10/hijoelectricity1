/**
 * API Client Module
 * Centralized API communication with DRY request handling
 */

const API_BASE_URL = '/api';

/**
 * Base request function - eliminates duplicate fetch logic
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Response data
 */
const request = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = { ...options.headers };

    // Add auth header if token exists and not explicitly skipped
    if (token && !options.skipAuth) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Add JSON content type for POST/PUT/PATCH with body
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(url, { ...options, headers });
        const data = await response.json();

        if (!response.ok) {
            // Handle specific error cases
            if (response.status === 401) {
                // Token expired or invalid - clear storage
                if (!options.skipAuth) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('admin');
                }
            }
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error (${url}):`, error.message);
        throw error;
    }
};

/**
 * API Object - Organized by resource
 */
const API = {
    BASE_URL: window.location.origin,

    // ========== Authentication ==========
    auth: {
        /**
         * Admin login
         * @param {Object} credentials - { username, password }
         */
        login: (credentials) => request(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials),
            skipAuth: true
        }),

        /**
         * Verify current token
         * @param {string} token - JWT token
         */
        verify: (token) => request(`${API_BASE_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
    },

    // ========== Projects ==========
    projects: {
        /**
         * Get all projects
         */
        getAll: async () => {
            const response = await request(`${API_BASE_URL}/projects`, { skipAuth: true });
            return response.data;
        },

        /**
         * Get project by ID
         * @param {number} id - Project ID
         */
        getById: async (id) => {
            const response = await request(`${API_BASE_URL}/projects/${id}`, { skipAuth: true });
            return response.data;
        },

        /**
         * Create new project
         * @param {FormData} formData - Project data with image
         */
        create: (formData) => request(`${API_BASE_URL}/projects`, {
            method: 'POST',
            body: formData
        }),

        /**
         * Update project
         * @param {number} id - Project ID
         * @param {FormData} formData - Updated project data
         */
        update: (id, formData) => request(`${API_BASE_URL}/projects/${id}`, {
            method: 'PUT',
            body: formData
        }),

        /**
         * Delete project
         * @param {number} id - Project ID
         */
        delete: (id) => request(`${API_BASE_URL}/projects/${id}`, {
            method: 'DELETE'
        })
    },

    // ========== Contact ==========
    contact: {
        /**
         * Submit contact form (public)
         * @param {Object} contactData - Contact form data
         */
        send: (contactData) => request(`${API_BASE_URL}/contact`, {
            method: 'POST',
            body: JSON.stringify(contactData),
            skipAuth: true
        }),

        /**
         * Get all contacts (admin)
         */
        getAll: async () => {
            const response = await request(`${API_BASE_URL}/contact`);
            return response.data;
        },

        /**
         * Get contact by ID (admin)
         * @param {number} id - Contact ID
         */
        getById: async (id) => {
            const response = await request(`${API_BASE_URL}/contact/${id}`);
            return response.data;
        },

        /**
         * Delete contact (admin)
         * @param {number} id - Contact ID
         */
        delete: (id) => request(`${API_BASE_URL}/contact/${id}`, {
            method: 'DELETE'
        }),

        /**
         * Update contact status (admin)
         * @param {number} id - Contact ID
         * @param {string} status - New status ('read', 'unread', 'replied')
         */
        updateStatus: (id, status) => request(`${API_BASE_URL}/contact/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        }),

        /**
         * Get unread contacts count (admin)
         */
        getUnreadCount: async () => {
            const response = await request(`${API_BASE_URL}/contact/unread/count`);
            return response.data.count;
        }
    }
};

// Make API available globally
window.API = API;