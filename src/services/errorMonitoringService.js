import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";

/**
 * Error Monitoring Service for HomeTruth
 * Handles error tracking, reporting, and categorization
 * Integrates with Sentry for UK property extraction monitoring
 */
class ErrorMonitoringService {
  constructor() {
    this.initialized = false;
    this.environment = process.env.NODE_ENV || "development";
    this.enabledInDev = false; // Set to true to enable in development
    this.config = {
      enabled: true,
      sentryDsn: process.env.SENTRY_DSN || "",
      userId: null,
      version: chrome.runtime.getManifest().version,
      errorSampleRate: 1.0, // Sample rate for error reporting (1.0 = 100%)
      maxStackSize: 50, // Maximum number of errors to keep in local history
    };

    // Initialize error stack for local tracking
    this.errorStack = [];

    // Initialize Sentry if available
    this.initializeSentry();

    // Get user information
    this.loadUserInfo();
  }

  /**
   * Initialize Sentry with environment-specific configuration
   */
  initialize() {
    if (this.initialized) return;

    // Only initialize in production or if specifically enabled in development
    if (this.environment === "production" || this.enabledInDev) {
      Sentry.init({
        dsn: this.config.sentryDsn,
        integrations: [new BrowserTracing()],
        tracesSampleRate: 0.2,
        environment: this.environment,
        beforeSend: (event) => this.beforeSendHandler(event),
        // UK region specific configuration
        defaultIntegrations: true,
        allowUrls: [
          // Approved UK property portal origins
          /rightmove\.co\.uk/,
          /zoopla\.co\.uk/,
          /onthemarket\.com/,
          /primelocation\.com/,
        ],
      });

      this.initialized = true;
      console.log(
        `Error monitoring initialized in ${this.environment} environment`
      );
    }
  }

  /**
   * Initialize Sentry SDK if available
   */
  async initializeSentry() {
    if (!this.config.enabled || !this.config.sentryDsn) {
      console.warn("[ErrorMonitoring] Sentry integration disabled");
      return;
    }

    try {
      // Dynamic import of Sentry SDK
      const Sentry = await import("@sentry/browser");

      // Initialize Sentry with configuration
      Sentry.init({
        dsn: this.config.sentryDsn,
        environment: this.environment,
        release: `hometruth-extension@${this.config.version}`,
        tracesSampleRate: 0.1, // Adjust as needed
        beforeSend: (event) => this.filterSensitiveData(event),
      });

      this.sentry = Sentry;

      console.log("[ErrorMonitoring] Sentry initialized successfully");
    } catch (error) {
      console.error("[ErrorMonitoring] Failed to initialize Sentry:", error);
    }
  }

  /**
   * Load user information from storage
   */
  async loadUserInfo() {
    try {
      await new Promise((resolve) => {
        chrome.storage.local.get(["userId", "userEmail"], (result) => {
          if (result.userId) {
            this.config.userId = result.userId;

            // Set user context in Sentry if available
            if (this.sentry) {
              this.sentry.setUser({
                id: result.userId,
                email: result.userEmail || undefined,
              });
            }
          }
          resolve();
        });
      });
    } catch (error) {
      console.error("[ErrorMonitoring] Failed to load user info:", error);
    }
  }

  /**
   * Process events before sending to Sentry
   * Filters sensitive data and categorizes errors
   */
  beforeSendHandler(event) {
    // Don't send events in development unless explicitly enabled
    if (this.environment === "development" && !this.enabledInDev) {
      return null;
    }

    // Remove PII from error events
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }

    // Scrub UK postcodes and addresses from the error
    this.scrubSensitiveData(event);

    return event;
  }

  /**
   * Remove sensitive UK-specific data from error reports
   */
  scrubSensitiveData(event) {
    if (event.exception && event.exception.values) {
      event.exception.values.forEach((exception) => {
        if (exception.value) {
          // Scrub UK postcodes
          exception.value = exception.value.replace(
            /\b[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}\b/g,
            "[POSTCODE REDACTED]"
          );

          // Scrub property IDs
          exception.value = exception.value.replace(
            /(rightmove|zoopla|onthemarket|primelocation)-[0-9]+/g,
            "$1-[ID REDACTED]"
          );
        }
      });
    }
  }

  /**
   * Remove sensitive data from error reports
   * @param {Object} event - Sentry event
   * @returns {Object|null} Filtered event or null to drop the event
   */
  filterSensitiveData(event) {
    try {
      // Create a deep copy to avoid modifying the original event
      const filteredEvent = JSON.parse(JSON.stringify(event));

      // List of fields that might contain sensitive data
      const sensitiveFields = [
        "password",
        "pass",
        "secret",
        "token",
        "key",
        "auth",
        "credit",
        "card",
        "cvv",
        "ssn",
        "social",
        "dob",
        "birth",
      ];

      const sensitiveRegex = new RegExp(sensitiveFields.join("|"), "i");

      // Function to recursively scan and redact sensitive data
      const redactSensitiveData = (obj) => {
        if (!obj || typeof obj !== "object") return;

        Object.keys(obj).forEach((key) => {
          // Check if key matches sensitive pattern
          if (sensitiveRegex.test(key)) {
            obj[key] = "[REDACTED]";
          } else if (typeof obj[key] === "object") {
            // Recurse for nested objects
            redactSensitiveData(obj[key]);
          }
        });
      };

      // Apply redaction
      redactSensitiveData(filteredEvent);

      return filteredEvent;
    } catch (error) {
      // If something goes wrong during filtering, drop the event to be safe
      console.error("[ErrorMonitoring] Error filtering sensitive data:", error);
      return null;
    }
  }

  /**
   * Capture and report an error
   * @param {Error} error - The error to report
   * @param {Object} context - Additional context data
   */
  captureError(error, context = {}) {
    if (!this.initialized) this.initialize();

    if (this.initialized) {
      Sentry.withScope((scope) => {
        // Add UK property context tags
        if (context.portal) scope.setTag("portal", context.portal);
        if (context.propertyId) scope.setTag("property_id", context.propertyId);
        if (context.propertyType)
          scope.setTag("property_type", context.propertyType);
        if (context.tenure) scope.setTag("tenure", context.tenure);

        // Add extraction context
        if (context.extractionMethod)
          scope.setTag("extraction_method", context.extractionMethod);
        if (context.extractionStage)
          scope.setTag("extraction_stage", context.extractionStage);

        // Add operation context
        scope.setContext("operation", context);

        // Set error category
        if (context.category) scope.setTag("category", context.category);

        Sentry.captureException(error);
      });
    } else {
      // Fallback to console in development
      console.error("Error captured:", error, context);
    }
  }

  /**
   * Log a message with context to Sentry
   * @param {string} message - The message to log
   * @param {Object} context - Additional context data
   * @param {string} level - Severity level (info, warning, error)
   */
  captureMessage(message, context = {}, level = "info") {
    if (!this.initialized) this.initialize();

    if (this.initialized) {
      Sentry.withScope((scope) => {
        // Add context tags
        Object.entries(context).forEach(([key, value]) => {
          if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
          ) {
            scope.setTag(key, value);
          }
        });

        // Add full context
        scope.setContext("operation", context);

        Sentry.captureMessage(message, level);
      });
    } else {
      // Fallback to console in development
      console.log(`[${level}] ${message}`, context);
    }
  }

  /**
   * Set user context for error tracking
   * Only sets a unique ID, not personally identifiable information
   * @param {string} userId - Anonymous user identifier
   */
  setUser(userId) {
    if (!this.initialized) this.initialize();

    if (this.initialized && userId) {
      Sentry.setUser({ id: userId });
    }
  }

  /**
   * Clear user context when user logs out
   */
  clearUser() {
    if (this.initialized) {
      Sentry.configureScope((scope) => scope.setUser(null));
    }
  }

  /**
   * Categorized error reporting for extraction errors
   * @param {Error} error - Error object
   * @param {Object} context - Extraction context
   */
  reportExtractionError(error, context) {
    this.captureError(error, {
      ...context,
      category: "extraction_error",
      extractionMethod: context.extractionMethod || "mcp",
    });
  }

  /**
   * Report API errors with additional context
   * @param {Error} error - Error object
   * @param {Object} context - API request context
   */
  reportApiError(error, context) {
    this.captureError(error, {
      ...context,
      category: "api_error",
    });
  }

  /**
   * Report UI errors with additional context
   * @param {Error} error - Error object
   * @param {Object} context - UI context
   */
  reportUiError(error, context) {
    this.captureError(error, {
      ...context,
      category: "ui_error",
    });
  }

  /**
   * Report an error to monitoring service
   * @param {Error|string} error - Error object or message
   * @param {Object} context - Additional context information
   * @param {string} level - Error level (error, warning, info)
   * @returns {string} Error ID
   */
  reportError(error, context = {}, level = "error") {
    if (!this.config.enabled) return null;

    try {
      // Generate unique error ID
      const errorId = this.generateErrorId();

      // Create standardized error object
      const errorData = {
        id: errorId,
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
        context: {
          ...context,
          url: window.location.href,
          extensionVersion: this.config.version,
          userId: this.config.userId,
          browser: navigator.userAgent,
        },
        level,
      };

      // Add to local error stack
      this.addToErrorStack(errorData);

      // Report to Sentry if available
      this.reportToSentry(error, context, level);

      // Log to console based on level
      this.logToConsole(errorData);

      return errorId;
    } catch (reportingError) {
      // Fallback error handling
      console.error(
        "[ErrorMonitoring] Failed to report error:",
        reportingError
      );
      console.error("Original error:", error);
      return null;
    }
  }

  /**
   * Generate unique error ID
   * @returns {string} Unique error ID
   */
  generateErrorId() {
    // Generate RFC4122 compliant UUID v4
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  /**
   * Add error to local stack
   * @param {Object} errorData - Error data object
   */
  addToErrorStack(errorData) {
    // Add to beginning of stack for chronological ordering
    this.errorStack.unshift(errorData);

    // Trim stack to max size
    if (this.errorStack.length > this.config.maxStackSize) {
      this.errorStack = this.errorStack.slice(0, this.config.maxStackSize);
    }

    // Save to storage for persistence
    this.saveErrorStack();
  }

  /**
   * Save error stack to storage
   */
  saveErrorStack() {
    try {
      chrome.storage.local.set({
        errorStack: JSON.stringify(this.errorStack),
      });
    } catch (error) {
      console.error("[ErrorMonitoring] Failed to save error stack:", error);
    }
  }

  /**
   * Report error to Sentry if available
   * @param {Error|string} error - Error object or message
   * @param {Object} context - Additional context
   * @param {string} level - Error level
   */
  reportToSentry(error, context, level) {
    if (!this.sentry) return;

    try {
      // Skip reporting based on sample rate
      if (Math.random() > this.config.errorSampleRate) {
        return;
      }

      // Add context as tags and extra data
      const tags = {};
      const extras = {};

      // Separate context into tags and extras
      Object.entries(context).forEach(([key, value]) => {
        // Simple values become tags, complex values become extras
        if (value !== null && typeof value === "object") {
          extras[key] = value;
        } else {
          tags[key] = String(value);
        }
      });

      // Set tags and extras
      this.sentry.configureScope((scope) => {
        // Add tags (for search/filtering)
        Object.entries(tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });

        // Add extra context
        Object.entries(extras).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      });

      // Choose appropriate Sentry method based on level
      switch (level) {
        case "warning":
          this.sentry.captureMessage(
            error instanceof Error ? error.message : error,
            "warning"
          );
          break;
        case "info":
          this.sentry.captureMessage(
            error instanceof Error ? error.message : error,
            "info"
          );
          break;
        case "error":
        default:
          this.sentry.captureException(
            error instanceof Error ? error : new Error(String(error))
          );
          break;
      }
    } catch (sentryError) {
      console.error(
        "[ErrorMonitoring] Failed to report to Sentry:",
        sentryError
      );
    }
  }

  /**
   * Log error to console
   * @param {Object} errorData - Error data
   */
  logToConsole(errorData) {
    const consoleMethod =
      {
        error: console.error,
        warning: console.warn,
        info: console.info,
      }[errorData.level] || console.error;

    consoleMethod(`[ErrorMonitoring] ${errorData.message}`, {
      id: errorData.id,
      context: errorData.context,
    });

    // Log stack trace separately if available
    if (errorData.stack) {
      console.debug("[ErrorMonitoring] Stack trace:", errorData.stack);
    }
  }

  /**
   * Get error history
   * @param {number} limit - Maximum number of errors to retrieve
   * @returns {Array} Array of error objects
   */
  getErrorHistory(limit = 10) {
    return this.errorStack.slice(0, limit);
  }

  /**
   * Clear error history
   */
  clearErrorHistory() {
    this.errorStack = [];
    this.saveErrorStack();
  }
}

// Singleton pattern
const errorMonitoringService = new ErrorMonitoringService();
export default errorMonitoringService;
