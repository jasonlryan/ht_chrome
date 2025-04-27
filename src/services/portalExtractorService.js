import api from "./api";
import errorMonitoringService from "./errorMonitoringService";

/**
 * Portal Extractor Service for HomeTruth
 * Handles property data extraction using MCP approach
 * Focused on UK property portals
 */
class PortalExtractorService {
  constructor() {
    // List of supported UK property portals
    this.supportedPortals = [
      "rightmove.co.uk",
      "zoopla.co.uk",
      "onthemarket.com",
      "primelocation.com",
    ];

    // MCP extraction endpoint
    this.extractionEndpoint = "/mcp/extract-property";
  }

  /**
   * Identify portal from URL
   * @param {string} url - Property listing URL
   * @returns {string|null} Portal identifier or null if not supported
   */
  identifyPortal(url) {
    try {
      const { hostname } = new URL(url);

      if (hostname.includes("rightmove.co.uk")) return "rightmove";
      if (hostname.includes("zoopla.co.uk")) return "zoopla";
      if (hostname.includes("onthemarket.com")) return "onthemarket";
      if (hostname.includes("primelocation.com")) return "primelocation";

      return null;
    } catch (error) {
      errorMonitoringService.reportExtractionError(error, {
        url,
        extractionStage: "portal_identification",
      });
      return null;
    }
  }

  /**
   * Check if a URL is a property detail page
   * @param {string} url - URL to check
   * @returns {boolean} True if URL is a property detail page
   */
  isPropertyPage(url) {
    try {
      const { pathname } = new URL(url);
      const portal = this.identifyPortal(url);

      switch (portal) {
        case "rightmove":
          return pathname.match(/\/properties\/[0-9]+/) !== null;
        case "zoopla":
          return pathname.match(/\/for-sale\/details\/[0-9]+/) !== null;
        case "onthemarket":
          return pathname.match(/\/details\/[a-zA-Z0-9]+/) !== null;
        case "primelocation":
          return (
            pathname.match(/\/property-for-sale\/property-[0-9]+/) !== null
          );
        default:
          return false;
      }
    } catch (error) {
      errorMonitoringService.reportExtractionError(error, {
        url,
        extractionStage: "property_page_check",
      });
      return false;
    }
  }

  /**
   * Generate a unique property ID from URL and portal
   * @param {string} url - Property URL
   * @param {string} portal - Portal identifier
   * @returns {string|null} Unique property ID
   */
  generatePropertyId(url, portal) {
    try {
      const { pathname } = new URL(url);

      switch (portal) {
        case "rightmove":
          const rmMatch = pathname.match(/\/properties\/([0-9]+)/);
          return rmMatch ? `${portal}-${rmMatch[1]}` : null;
        case "zoopla":
          const zpMatch = pathname.match(/\/for-sale\/details\/([0-9]+)/);
          return zpMatch ? `${portal}-${zpMatch[1]}` : null;
        case "onthemarket":
          const otmMatch = pathname.match(/\/details\/([a-zA-Z0-9]+)/);
          return otmMatch ? `${portal}-${otmMatch[1]}` : null;
        case "primelocation":
          const plMatch = pathname.match(
            /\/property-for-sale\/property-([0-9]+)/
          );
          return plMatch ? `${portal}-${plMatch[1]}` : null;
        default:
          return null;
      }
    } catch (error) {
      errorMonitoringService.reportExtractionError(error, {
        url,
        portal,
        extractionStage: "property_id_generation",
      });
      return null;
    }
  }

  /**
   * Extract property data from URL using MCP
   * @param {string} url - Property URL
   * @returns {Promise<Object>} Extracted property data
   */
  async extractPropertyFromUrl(url) {
    try {
      const portal = this.identifyPortal(url);

      if (!portal) {
        throw new Error(`Unsupported portal for URL: ${url}`);
      }

      const propertyId = this.generatePropertyId(url, portal);

      if (!propertyId) {
        throw new Error(`Could not generate property ID for URL: ${url}`);
      }

      // Call MCP API to extract property data
      const response = await api.post(this.extractionEndpoint, {
        url,
        portal,
      });

      if (!response || !response.data) {
        throw new Error("MCP extraction failed: Empty response");
      }

      // Process and standardize extracted data
      const processedData = this.processExtractedData(
        response.data,
        portal,
        propertyId,
        url
      );

      // Log successful extraction
      errorMonitoringService.captureMessage(
        `Property extracted successfully: ${propertyId}`,
        { portal, propertyId, url },
        "info"
      );

      return processedData;
    } catch (error) {
      errorMonitoringService.reportExtractionError(error, {
        url,
        portal: this.identifyPortal(url),
        extractionStage: "full_extraction",
        extractionMethod: "mcp_url",
      });

      throw error;
    }
  }

  /**
   * Extract property data from HTML content using MCP
   * @param {string} html - HTML content
   * @param {string} url - Source URL for context
   * @returns {Promise<Object>} Extracted property data
   */
  async extractPropertyFromHtml(html, url) {
    try {
      const portal = this.identifyPortal(url);

      if (!portal) {
        throw new Error(`Unsupported portal for URL: ${url}`);
      }

      const propertyId = this.generatePropertyId(url, portal);

      // Call MCP API to extract property data from HTML
      const response = await api.post("/mcp/extract-from-html", {
        html,
        url,
        portal,
      });

      if (!response || !response.data) {
        throw new Error("MCP extraction from HTML failed: Empty response");
      }

      // Process and standardize extracted data
      const processedData = this.processExtractedData(
        response.data,
        portal,
        propertyId,
        url
      );

      return processedData;
    } catch (error) {
      errorMonitoringService.reportExtractionError(error, {
        url,
        portal: this.identifyPortal(url),
        extractionStage: "html_extraction",
        extractionMethod: "mcp_html",
      });

      throw error;
    }
  }

  /**
   * Process and standardize property data
   * @param {Object} data - Raw property data
   * @param {string} portal - Portal identifier
   * @param {string} propertyId - Unique property ID
   * @param {string} url - Source URL
   * @returns {Object} Standardized property data
   */
  processExtractedData(data, portal, propertyId, url) {
    try {
      // Create standardized property object
      const property = {
        id: propertyId,
        portal,
        url,
        price: this.extractPrice(data),
        address: this.extractAddress(data),
        propertyType: this.extractPropertyType(data),
        bedrooms: this.extractBedrooms(data),
        bathrooms: this.extractBathrooms(data),
        receptionRooms: this.extractReceptionRooms(data),
        description: this.extractDescription(data),
        tenure: this.extractTenure(data),
        leaseholdYears: this.extractLeaseholdYears(data),
        groundRent: this.extractGroundRent(data),
        serviceCharge: this.extractServiceCharge(data),
        epcRating: this.extractEpcRating(data),
        councilTaxBand: this.extractCouncilTaxBand(data),
        features: this.extractFeatures(data),
        floorArea: this.extractFloorArea(data),
        listedStatus: this.extractListedStatus(data),
        conservationArea: this.extractConservationArea(data),
        agent: this.extractAgent(data),
        rawData: data, // Store raw data for reference
      };

      return property;
    } catch (error) {
      errorMonitoringService.reportExtractionError(error, {
        portal,
        propertyId,
        url,
        extractionStage: "data_processing",
        extractionMethod: "mcp",
      });

      // Return partial data with error flag
      return {
        id: propertyId,
        portal,
        url,
        extractionError: true,
        errorMessage: error.message,
        rawData: data,
      };
    }
  }

  /**
   * Extract price from property data
   * @param {Object} data - Property data
   * @returns {number|null} Price in GBP
   */
  extractPrice(data) {
    if (data.price) {
      // Convert string price to number
      if (typeof data.price === "string") {
        const priceStr = data.price.replace(/[£,]/g, "");
        return parseInt(priceStr, 10) || null;
      }
      return data.price;
    }
    return null;
  }

  /**
   * Extract address from property data
   * @param {Object} data - Property data
   * @returns {string|null} Property address
   */
  extractAddress(data) {
    return data.address || null;
  }

  /**
   * Extract property type from data
   * @param {Object} data - Property data
   * @returns {string|null} Property type
   */
  extractPropertyType(data) {
    return data.propertyType || null;
  }

  /**
   * Extract number of bedrooms
   * @param {Object} data - Property data
   * @returns {number|null} Number of bedrooms
   */
  extractBedrooms(data) {
    if (data.bedrooms) {
      return typeof data.bedrooms === "string"
        ? parseInt(data.bedrooms, 10)
        : data.bedrooms;
    }
    return null;
  }

  /**
   * Extract number of bathrooms
   * @param {Object} data - Property data
   * @returns {number|null} Number of bathrooms
   */
  extractBathrooms(data) {
    if (data.bathrooms) {
      return typeof data.bathrooms === "string"
        ? parseInt(data.bathrooms, 10)
        : data.bathrooms;
    }
    return null;
  }

  /**
   * Extract number of reception rooms
   * @param {Object} data - Property data
   * @returns {number|null} Number of reception rooms
   */
  extractReceptionRooms(data) {
    if (data.receptionRooms) {
      return typeof data.receptionRooms === "string"
        ? parseInt(data.receptionRooms, 10)
        : data.receptionRooms;
    }
    return null;
  }

  /**
   * Extract property description
   * @param {Object} data - Property data
   * @returns {string|null} Property description
   */
  extractDescription(data) {
    return data.description || null;
  }

  /**
   * Extract tenure information
   * @param {Object} data - Property data
   * @returns {string|null} Tenure type
   */
  extractTenure(data) {
    if (data.tenure) {
      return data.tenure.toLowerCase();
    }

    // Look for tenure in description or features
    const tenureKeywords = {
      freehold: ["freehold"],
      leasehold: ["leasehold"],
      shareOfFreehold: ["share of freehold", "share freehold"],
    };

    // Check description for tenure keywords
    if (data.description) {
      const description = data.description.toLowerCase();

      for (const [tenure, keywords] of Object.entries(tenureKeywords)) {
        if (keywords.some((keyword) => description.includes(keyword))) {
          return tenure;
        }
      }
    }

    // Check features for tenure keywords
    if (data.features && Array.isArray(data.features)) {
      const featuresText = data.features.join(" ").toLowerCase();

      for (const [tenure, keywords] of Object.entries(tenureKeywords)) {
        if (keywords.some((keyword) => featuresText.includes(keyword))) {
          return tenure;
        }
      }
    }

    return null;
  }

  /**
   * Extract leasehold years remaining
   * @param {Object} data - Property data
   * @returns {number|null} Years remaining on lease
   */
  extractLeaseholdYears(data) {
    if (data.leaseholdYears) {
      return typeof data.leaseholdYears === "string"
        ? parseInt(data.leaseholdYears, 10)
        : data.leaseholdYears;
    }

    // Only relevant for leasehold properties
    if (this.extractTenure(data) !== "leasehold") {
      return null;
    }

    return null;
  }

  /**
   * Extract ground rent information
   * @param {Object} data - Property data
   * @returns {Object|null} Ground rent information
   */
  extractGroundRent(data) {
    if (data.groundRent) {
      return data.groundRent;
    }
    return null;
  }

  /**
   * Extract service charge information
   * @param {Object} data - Property data
   * @returns {Object|null} Service charge information
   */
  extractServiceCharge(data) {
    if (data.serviceCharge) {
      return data.serviceCharge;
    }
    return null;
  }

  /**
   * Extract EPC rating
   * @param {Object} data - Property data
   * @returns {Object|null} EPC rating information
   */
  extractEpcRating(data) {
    if (data.epcRating) {
      return data.epcRating;
    }

    // Try to construct from separate current and potential fields
    if (data.epcCurrent || data.epcPotential) {
      return {
        current: data.epcCurrent || null,
        potential: data.epcPotential || null,
      };
    }

    return null;
  }

  /**
   * Extract council tax band
   * @param {Object} data - Property data
   * @returns {string|null} Council tax band
   */
  extractCouncilTaxBand(data) {
    if (data.councilTaxBand) {
      return data.councilTaxBand.toUpperCase();
    }
    return null;
  }

  /**
   * Extract property features
   * @param {Object} data - Property data
   * @returns {Array|null} Property features
   */
  extractFeatures(data) {
    if (data.features && Array.isArray(data.features)) {
      return data.features;
    }
    return null;
  }

  /**
   * Extract floor area information
   * @param {Object} data - Property data
   * @returns {Object|null} Floor area information
   */
  extractFloorArea(data) {
    if (data.floorArea) {
      return data.floorArea;
    }

    // Try to construct from separate fields
    if (data.floorAreaMetric || data.floorAreaImperial) {
      return {
        metric: data.floorAreaMetric || null,
        imperial: data.floorAreaImperial || null,
      };
    }

    return null;
  }

  /**
   * Extract listed building status
   * @param {Object} data - Property data
   * @returns {boolean|null} Listed building status
   */
  extractListedStatus(data) {
    if (typeof data.listedStatus === "boolean") {
      return data.listedStatus;
    }

    if (typeof data.listedStatus === "string") {
      return (
        data.listedStatus.toLowerCase() === "yes" ||
        data.listedStatus.toLowerCase() === "true"
      );
    }

    return null;
  }

  /**
   * Extract conservation area status
   * @param {Object} data - Property data
   * @returns {boolean|null} Conservation area status
   */
  extractConservationArea(data) {
    if (typeof data.conservationArea === "boolean") {
      return data.conservationArea;
    }

    if (typeof data.conservationArea === "string") {
      return (
        data.conservationArea.toLowerCase() === "yes" ||
        data.conservationArea.toLowerCase() === "true"
      );
    }

    return null;
  }

  /**
   * Extract agent information
   * @param {Object} data - Property data
   * @returns {Object|null} Agent information
   */
  extractAgent(data) {
    if (data.agent) {
      return data.agent;
    }
    return null;
  }
}

// Singleton pattern
const portalExtractorService = new PortalExtractorService();
export default portalExtractorService;
