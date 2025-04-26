/**
 * HomeTruth Extension Configuration
 * Main configuration file for the HomeTruth Chrome extension
 */

const EXTENSION_CONFIG = {
  // Core settings
  version: "1.2.1",
  environment: "production", // 'development', 'staging', 'production'

  // Regional settings
  region: "UK", // Primary region for the extension
  currency: "£",
  metrics: {
    distance: "miles",
    area: "sq ft", // Also support sq m as alternative
    temperature: "C",
  },

  // API Configuration
  api: {
    baseUrl: "https://api.hometruth.uk/v1",
    timeout: 30000, // ms
    retryAttempts: 3,
    cacheExpiry: 3600, // seconds
  },

  // Supported property portals
  supportedPortals: [
    {
      name: "Rightmove",
      domain: "rightmove.co.uk",
      selectors: {
        propertyContainer: ".property-header",
        priceElement: ".agent-header-price .agent-header-price",
        addressElement: ".property-header-title h1",
        descriptionElement: ".agent-content",
        imagesContainer: ".gallery-canvas",
      },
    },
    {
      name: "Zoopla",
      domain: "zoopla.co.uk",
      selectors: {
        propertyContainer: ".dp-sidebar-wrapper",
        priceElement: ".dp-price__main",
        addressElement: ".dp-header-title",
        descriptionElement: ".dp-description__text",
        imagesContainer: ".dp-gallery",
      },
    },
    {
      name: "OnTheMarket",
      domain: "onthemarket.com",
      selectors: {
        propertyContainer: ".property-details",
        priceElement: ".details-price",
        addressElement: ".details-address",
        descriptionElement: ".description",
        imagesContainer: ".gallery",
      },
    },
    {
      name: "PrimeLocation",
      domain: "primelocation.com",
      selectors: {
        propertyContainer: ".property-header",
        priceElement: ".property-header-price",
        addressElement: ".property-header-title",
        descriptionElement: ".property-description",
        imagesContainer: ".images",
      },
    },
  ],

  // Data providers
  dataProviders: [
    {
      name: "HM Land Registry",
      endpoint: "/data/land-registry",
      description: "Property transaction history and ownership data",
    },
    {
      name: "UK Planning Portal",
      endpoint: "/data/planning",
      description: "Planning applications and permissions",
    },
    {
      name: "Environment Agency",
      endpoint: "/data/environment",
      description: "Flood risk, pollution, and environmental factors",
    },
    {
      name: "Local Councils",
      endpoint: "/data/local-council",
      description: "Council tax bands and local authority information",
    },
    {
      name: "Transport for London",
      endpoint: "/data/transport/london",
      description: "Transport links and connectivity in London",
    },
    {
      name: "National Transport",
      endpoint: "/data/transport/national",
      description: "Transport links across the UK",
    },
    {
      name: "Ofsted",
      endpoint: "/data/schools",
      description: "School ratings and educational facilities",
    },
    {
      name: "UK Crime Statistics",
      endpoint: "/data/crime",
      description: "Local crime rates and safety information",
    },
  ],

  // Feature flags
  features: {
    trustScore: true,
    priceHistory: true,
    floodRisk: true,
    schoolInfo: true,
    transportLinks: true,
    crimeStats: true,
    airQuality: true,
    councilTax: true,
    stampDuty: true,
    leaseInfo: true,
    developmentPotential: true,
    chatAssistant: true,
    propertyComparison: true,
  },

  // Pricing tiers
  pricingTiers: {
    free: {
      name: "Free",
      features: [
        "Basic property insights",
        "Trust Score",
        "Limited saved properties (5)",
        "Basic price history",
      ],
    },
    premium: {
      name: "Premium",
      price: {
        monthly: 7.99,
        annual: 79.99,
      },
      features: [
        "All Free features",
        "Detailed property reports",
        "Complete price history",
        "Unlimited saved properties",
        "Environmental risk assessment",
        "School catchment areas",
        "Planning permission history",
        "Leasehold analysis",
        "Development potential",
        "Premium support",
      ],
    },
  },

  // UK-specific calculations
  calculations: {
    stampDuty: {
      // Current SDLT rates for England and Northern Ireland (as of 2023)
      england: [
        { threshold: 0, rate: 0, firstTimeBuyer: true },
        { threshold: 425000, rate: 0.05, firstTimeBuyer: true },
        { threshold: 625000, rate: 0.05, firstTimeBuyer: false },
        { threshold: 0, rate: 0, firstTimeBuyer: false },
        { threshold: 250000, rate: 0.05, firstTimeBuyer: false },
        { threshold: 925000, rate: 0.1, firstTimeBuyer: false },
        { threshold: 1500000, rate: 0.12, firstTimeBuyer: false },
      ],
      additionalProperty: 0.03, // Additional 3% for second homes
      // LTT rates for Wales
      wales: [
        { threshold: 0, rate: 0 },
        { threshold: 225000, rate: 0.06 },
        { threshold: 400000, rate: 0.075 },
        { threshold: 750000, rate: 0.1 },
        { threshold: 1500000, rate: 0.12 },
      ],
      // LBTT rates for Scotland
      scotland: [
        { threshold: 0, rate: 0 },
        { threshold: 145000, rate: 0.02 },
        { threshold: 250000, rate: 0.05 },
        { threshold: 325000, rate: 0.1 },
        { threshold: 750000, rate: 0.12 },
      ],
    },

    // Leasehold calculations
    leasehold: {
      extensionThreshold: 80, // Years - flag leases with less than this remaining
      marriageValue: 0.5, // Marriage value factor for short leases
      baseExtensionCost: 0.1, // Base cost as percentage of property value
    },

    // Mortgage calculations
    mortgage: {
      defaultTerm: 25, // years
      defaultInterestRate: 0.0499, // 4.99%
      defaultDeposit: 0.1, // 10%
      stressTestRate: 0.07, // 7% - used for affordability calculations
    },
  },

  // User preferences defaults
  defaultPreferences: {
    displayCurrency: "£",
    distanceUnit: "miles",
    areaUnit: "sq ft",
    temperatureUnit: "C",
    maxCommuteDuration: 45, // minutes
    notificationFrequency: "daily",
    savedSearchRadius: 5, // miles
    darkMode: "system", // 'light', 'dark', 'system'
  },

  // Extension UI Settings
  ui: {
    theme: {
      primary: "#0052CC",
      secondary: "#00875A",
      error: "#DE350B",
      warning: "#FF991F",
      info: "#0065FF",
      success: "#36B37E",
      background: "#FFFFFF",
      surface: "#F4F5F7",
      text: "#172B4D",
      lightText: "#5E6C84",
    },
    fonts: {
      primary: "Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      size: {
        small: "12px",
        regular: "14px",
        large: "16px",
        heading: "18px",
      },
    },
    animation: {
      duration: 300, // ms
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    layout: {
      sidebarWidth: 320, // px
      contentPadding: 16, // px
      borderRadius: 4, // px
    },
  },

  // Analytics and tracking
  analytics: {
    enabled: true,
    anonymizedData: true,
    sessionTimeout: 1800, // seconds
    trackEvents: [
      "pageView",
      "propertyView",
      "trustScoreView",
      "reportGenerated",
      "propertySaved",
      "featureUsage",
      "search",
      "signup",
      "upgrade",
    ],
  },

  // Developer settings
  developer: {
    debug: false,
    logLevel: "error", // 'debug', 'info', 'warn', 'error'
    showDevTools: false,
  },
};

// Export configuration
export default EXTENSION_CONFIG;
