import { auth } from "../boot/firebase";

// Base URL for API
const API_BASE_URL = "https://us-central1-mytodo-39458.cloudfunctions.net/api";

/**
 * Get authentication token for current user
 *
 * @returns {Promise<string|null>} Auth token or null if not authenticated
 */
const getAuthToken = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return null;
  }

  return await currentUser.getIdToken();
};

/**
 * Make an API request
 *
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise<Object>} Response data
 */
const apiRequest = async (endpoint, options = {}, requiresAuth = false) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    // Set default headers
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add auth token if required
    if (requiresAuth) {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      headers.Authorization = `Bearer ${token}`;
    }

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parse response
    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      throw new Error(data.error || "Unknown error occurred");
    }

    return data;
  } catch (error) {
    console.error(`API request error (${endpoint}):`, error);
    throw error;
  }
};

/**
 * Make a GET request
 *
 * @param {string} endpoint - API endpoint
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise<Object>} Response data
 */
export const get = (endpoint, requiresAuth = false) => {
  return apiRequest(endpoint, { method: "GET" }, requiresAuth);
};

/**
 * Make a POST request
 *
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise<Object>} Response data
 */
export const post = (endpoint, data, requiresAuth = false) => {
  return apiRequest(
    endpoint,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    requiresAuth
  );
};

/**
 * Make a PUT request
 *
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise<Object>} Response data
 */
export const put = (endpoint, data, requiresAuth = false) => {
  return apiRequest(
    endpoint,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    requiresAuth
  );
};

/**
 * Make a PATCH request
 *
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise<Object>} Response data
 */
export const patch = (endpoint, data, requiresAuth = false) => {
  return apiRequest(
    endpoint,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    requiresAuth
  );
};

/**
 * Make a DELETE request
 *
 * @param {string} endpoint - API endpoint
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise<Object>} Response data
 */
export const del = (endpoint, requiresAuth = false) => {
  return apiRequest(endpoint, { method: "DELETE" }, requiresAuth);
};
