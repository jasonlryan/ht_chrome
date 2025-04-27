/**
 * MCP Service
 * Provides interface for interacting with Meta's Content Platform API
 */
import ApiService from "./api";
import errorMonitoringService from "./errorMonitoringService";

class McpService {
  constructor() {
    this.apiService = ApiService;
    this.extractionStatus = {
      NOT_STARTED: "NOT_STARTED",
      IN_PROGRESS: "IN_PROGRESS",
      COMPLETED: "COMPLETED",
      FAILED: "FAILED",
    };
  }

  /**
   * Initialize MCP extraction
   * @param {Object} params - Extraction parameters
   * @param {String} params.portalType - Type of portal (e.g., 'whatsapp', 'facebook')
   * @param {String} params.userId - User identifier
   * @param {Object} params.metadata - Additional metadata for extraction
   * @returns {Promise<Object>} Extraction response with session ID
   */
  async initializeExtraction(params) {
    try {
      const response = await this.apiService.postMcp(
        "/extraction/initialize",
        params
      );
      return response.data;
    } catch (error) {
      errorMonitoringService.reportMcpError(error, {
        operation: "initializeExtraction",
        params: params,
      });
      throw error;
    }
  }

  /**
   * Update extraction status
   * @param {String} sessionId - Extraction session ID
   * @param {String} status - Current status
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Updated extraction data
   */
  async updateExtractionStatus(sessionId, status, metadata = {}) {
    try {
      const response = await this.apiService.postMcp("/extraction/status", {
        sessionId,
        status,
        metadata,
      });
      return response.data;
    } catch (error) {
      errorMonitoringService.reportMcpError(error, {
        operation: "updateExtractionStatus",
        sessionId,
        status,
      });
      throw error;
    }
  }

  /**
   * Submit extracted data to MCP
   * @param {String} sessionId - Extraction session ID
   * @param {Object} data - Extracted data
   * @returns {Promise<Object>} Submission response
   */
  async submitExtractedData(sessionId, data) {
    try {
      const response = await this.apiService.postMcp("/extraction/submit", {
        sessionId,
        data,
      });
      return response.data;
    } catch (error) {
      errorMonitoringService.reportMcpError(error, {
        operation: "submitExtractedData",
        sessionId,
        dataSize: JSON.stringify(data).length,
      });
      throw error;
    }
  }

  /**
   * Complete extraction session
   * @param {String} sessionId - Extraction session ID
   * @param {Object} summary - Extraction summary
   * @returns {Promise<Object>} Completion response
   */
  async completeExtraction(sessionId, summary = {}) {
    try {
      const response = await this.apiService.postMcp("/extraction/complete", {
        sessionId,
        summary,
      });
      return response.data;
    } catch (error) {
      errorMonitoringService.reportMcpError(error, {
        operation: "completeExtraction",
        sessionId,
      });
      throw error;
    }
  }

  /**
   * Get extraction session status
   * @param {String} sessionId - Extraction session ID
   * @returns {Promise<Object>} Session status
   */
  async getExtractionStatus(sessionId) {
    try {
      const response = await this.apiService.getMcp(
        `/extraction/status/${sessionId}`
      );
      return response.data;
    } catch (error) {
      errorMonitoringService.reportMcpError(error, {
        operation: "getExtractionStatus",
        sessionId,
      });
      throw error;
    }
  }

  /**
   * Report extraction error
   * @param {String} sessionId - Extraction session ID
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   * @returns {Promise<Object>} Error report response
   */
  async reportExtractionError(sessionId, error, context = {}) {
    // Track error in monitoring service
    const errorId = errorMonitoringService.reportExtractionError(error, {
      sessionId,
      ...context,
    });

    try {
      // Report to backend
      const response = await this.apiService.postMcp("/extraction/error", {
        sessionId,
        error: {
          message: error.message,
          stack: error.stack,
          errorId,
        },
        context,
      });
      return response.data;
    } catch (reportError) {
      // If reporting fails, log but don't throw (to avoid loops)
      errorMonitoringService.reportMcpError(reportError, {
        operation: "reportExtractionError",
        sessionId,
        originalErrorId: errorId,
      });
      return { success: false, errorId };
    }
  }

  /**
   * Get WhatsApp messages for a specific chat
   * @param {String} sessionId - Extraction session ID
   * @param {String} chatId - Chat identifier
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Messages data
   */
  async getWhatsAppMessages(sessionId, chatId, options = {}) {
    try {
      const response = await this.apiService.getMcp(
        `/whatsapp/messages/${chatId}`,
        {
          params: {
            sessionId,
            limit: options.limit || 100,
            offset: options.offset || 0,
            startDate: options.startDate,
            endDate: options.endDate,
          },
        }
      );
      return response.data;
    } catch (error) {
      errorMonitoringService.reportMcpError(error, {
        operation: "getWhatsAppMessages",
        sessionId,
        chatId,
      });
      throw error;
    }
  }

  /**
   * Get WhatsApp chats list
   * @param {String} sessionId - Extraction session ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Chats data
   */
  async getWhatsAppChats(sessionId, options = {}) {
    try {
      const response = await this.apiService.getMcp("/whatsapp/chats", {
        params: {
          sessionId,
          limit: options.limit || 100,
          offset: options.offset || 0,
        },
      });
      return response.data;
    } catch (error) {
      errorMonitoringService.reportMcpError(error, {
        operation: "getWhatsAppChats",
        sessionId,
      });
      throw error;
    }
  }

  /**
   * Get WhatsApp contacts
   * @param {String} sessionId - Extraction session ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Contacts data
   */
  async getWhatsAppContacts(sessionId, options = {}) {
    try {
      const response = await this.apiService.getMcp("/whatsapp/contacts", {
        params: {
          sessionId,
          limit: options.limit || 100,
          offset: options.offset || 0,
          query: options.query || "",
        },
      });
      return response.data;
    } catch (error) {
      errorMonitoringService.reportMcpError(error, {
        operation: "getWhatsAppContacts",
        sessionId,
      });
      throw error;
    }
  }

  /**
   * Get user consent status
   * @param {String} userId - User identifier
   * @returns {Promise<Object>} User consent data
   */
  async getUserConsentStatus(userId) {
    try {
      const response = await this.apiService.getMcp(`/user/consent/${userId}`);
      return response.data;
    } catch (error) {
      errorMonitoringService.reportMcpError(error, {
        operation: "getUserConsentStatus",
        userId,
      });
      throw error;
    }
  }

  /**
   * Update user consent
   * @param {String} userId - User identifier
   * @param {Object} consentData - Consent information
   * @returns {Promise<Object>} Updated consent data
   */
  async updateUserConsent(userId, consentData) {
    try {
      const response = await this.apiService.postMcp(
        `/user/consent/${userId}`,
        consentData
      );
      return response.data;
    } catch (error) {
      errorMonitoringService.reportMcpError(error, {
        operation: "updateUserConsent",
        userId,
      });
      throw error;
    }
  }

  /**
   * Check MCP service health
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const response = await this.apiService.getMcp("/health");
      return response.data;
    } catch (error) {
      errorMonitoringService.reportMcpError(error, {
        operation: "checkHealth",
      });
      // Return a structured error response rather than throwing
      return {
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Export singleton instance
const mcpService = new McpService();
export default mcpService;
