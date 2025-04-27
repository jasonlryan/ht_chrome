import axios from "axios";
import errorMonitoringService from "./errorMonitoringService";

/**
 * API Service for HomeTruth
 * Handles communication with backend services including MCP
 */
class ApiService {
  constructor() {
    // Base URLs for different environments
    this.baseUrls = {
      development: "http://localhost:8080/api",
      staging: "https://staging-api.hometruth.co.uk/api",
      production: "https://api.hometruth.co.uk/api",
    };

    // Default timeout in milliseconds
    this.timeout = 30000;

    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: this.getBaseUrl(),
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => this.addAuthToken(config),
      (error) => this.handleRequestError(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleResponseError(error)
    );
  }

  /**
   * Get base URL based on environment
   * @returns {string} Base URL for API requests
   */
  getBaseUrl() {
    const env = process.env.NODE_ENV || "development";
    return this.baseUrls[env] || this.baseUrls.development;
  }

  /**
   * Add authentication token to request if available
   * @param {Object} config - Axios request config
   * @returns {Object} Updated config
   */
  async addAuthToken(config) {
    try {
      // Get auth token from storage
      const token = await this.getAuthToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Get authentication token from storage
   * @returns {Promise<string|null>} Auth token
   */
  async getAuthToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["authToken"], (result) => {
        resolve(result.authToken || null);
      });
    });
  }

  /**
   * Handle request errors
   * @param {Error} error - Request error
   * @returns {Promise} Rejected promise with error
   */
  handleRequestError(error) {
    errorMonitoringService.reportApiError(error, {
      stage: "request",
      request: error.config,
    });

    return Promise.reject(error);
  }

  /**
   * Handle response errors
   * @param {Error} error - Response error
   * @returns {Promise} Rejected promise with error
   */
  handleResponseError(error) {
    // Create standardized error object
    const errorData = {
      message: error.message || "Unknown error",
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      endpoint: error.config?.url,
      method: error.config?.method?.toUpperCase(),
    };

    // Report error to monitoring service
    errorMonitoringService.reportApiError(error, {
      stage: "response",
      response: errorData,
    });

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 401) {
        // Handle unauthorized error
        this.handleUnauthorized();
      }
    } else if (error.request) {
      // Request made but no response received
      errorData.message = "No response received from server";
    }

    return Promise.reject(errorData);
  }

  /**
   * Handle unauthorized errors (401)
   */
  handleUnauthorized() {
    // Clear auth token from storage
    chrome.storage.local.remove(["authToken"], () => {
      // Dispatch event to notify about unauthorized access
      const event = new CustomEvent("ht:unauthorized");
      window.dispatchEvent(event);
    });
  }

  /**
   * Make GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {Object} config - Additional Axios config
   * @returns {Promise} API response
   */
  async get(endpoint, params = {}, config = {}) {
    try {
      return await this.client.get(endpoint, {
        params,
        ...config,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} config - Additional Axios config
   * @returns {Promise} API response
   */
  async post(endpoint, data = {}, config = {}) {
    try {
      return await this.client.post(endpoint, data, config);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} config - Additional Axios config
   * @returns {Promise} API response
   */
  async put(endpoint, data = {}, config = {}) {
    try {
      return await this.client.put(endpoint, data, config);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} config - Additional Axios config
   * @returns {Promise} API response
   */
  async patch(endpoint, data = {}, config = {}) {
    try {
      return await this.client.patch(endpoint, data, config);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} config - Additional Axios config
   * @returns {Promise} API response
   */
  async delete(endpoint, config = {}) {
    try {
      return await this.client.delete(endpoint, config);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make request to MCP endpoint
   * @param {string} endpoint - MCP endpoint
   * @param {Object} data - Request payload
   * @param {Object} config - Additional Axios config
   * @returns {Promise} API response
   */
  async mcpRequest(endpoint, data = {}, config = {}) {
    try {
      // Add MCP-specific headers or configuration
      const mcpConfig = {
        ...config,
        headers: {
          ...config.headers,
          "x-ht-client": "chrome-extension",
          "x-ht-client-version": chrome.runtime.getManifest().version,
        },
      };

      // Use full MCP endpoint path
      const mcpEndpoint = `/mcp${
        endpoint.startsWith("/") ? endpoint : `/${endpoint}`
      }`;

      return await this.post(mcpEndpoint, data, mcpConfig);
    } catch (error) {
      // Add MCP-specific context to error
      errorMonitoringService.reportApiError(error, {
        service: "mcp",
        endpoint,
        data,
      });

      throw error;
    }
  }
}

// Singleton pattern
const apiService = new ApiService();
export default apiService;
