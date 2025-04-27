# HomeTruth Developer Guide

## Overview

This guide outlines development practices for the HomeTruth Chrome extension, with specific focus on UK property market integration requirements.

## Environment Setup

1. **Prerequisites**

   - Node.js (v16+)
   - npm or yarn
   - Chrome browser
   - Git

2. **Installation**

   ```bash
   git clone https://github.com/hometruth/ht-chrome.git
   cd ht-chrome
   npm install
   ```

3. **Development Commands**
   - `npm run dev` - Builds for development with watch mode
   - `npm run build` - Builds production version
   - `npm run test` - Runs test suite
   - `npm run lint` - Lints codebase

## Project Structure

```
ht_chrome/
├── src/                  # Source code
│   ├── api/              # API communication
│   ├── components/       # UI components
│   ├── content/          # Content scripts
│   ├── portals/          # Portal integration logic
│   ├── background/       # Background scripts
│   ├── services/         # Service layer
│   ├── popup/            # Extension popup UI
│   └── utils/            # Utility functions
├── public/               # Static assets
├── tests/                # Test suite
└── docs/                 # Documentation
```

## UK Property Portal Integration

HomeTruth supports the following UK property portals:

| Portal        | Service Support | Status   |
| ------------- | --------------- | -------- |
| Rightmove     | MCP Extraction  | Complete |
| Zoopla        | MCP Extraction  | Complete |
| OnTheMarket   | MCP Extraction  | Complete |
| PrimeLocation | MCP Extraction  | Complete |
| Purplebricks  | MCP Extraction  | Planned  |

### Property Data Extraction Architecture

HomeTruth uses a Managed Content Processing (MCP) approach for extracting property data from UK portals. This is more maintainable than direct DOM scraping since property websites frequently change their layouts.

#### Key Components:

1. **PortalExtractorService** (`src/services/portalExtractorService.js`)

   - Identifies supported UK property portals
   - Processes and standardizes extracted data with UK-specific fields
   - Handles complex data normalization for cross-portal consistency

2. **API Service MCP Integration** (`src/services/api.js`)

   - Provides endpoints for property extraction via MCP
   - Methods for extracting from URLs and HTML content
   - Support for property search functionality

3. **Property Service** (`src/services/propertyService.js`)
   - High-level interface for property operations
   - Uses the PortalExtractorService for data retrieval
   - Implements caching for performance optimization

### Adding New Portal Support

To add support for a new UK property portal:

1. Update the supported portals list in `src/services/portalExtractorService.js`:

   ```javascript
   this.supportedPortals = [
     "rightmove.co.uk",
     "zoopla.co.uk",
     "onthemarket.com",
     "primelocation.com",
     "new-portal-domain.co.uk", // Add new portal
   ];
   ```

2. Add portal identification logic:

   ```javascript
   identifyPortal(url) {
     // ... existing code ...
     if (hostname.includes('new-portal-domain.co.uk')) return 'newportal';
     // ... existing code ...
   }
   ```

3. Add property page detection logic:

   ```javascript
   isPropertyPage(url) {
     // ... existing code ...
     case 'newportal':
       return pathname.match(/\/your-property-pattern/) !== null;
     // ... existing code ...
   }
   ```

4. Add property ID extraction logic:

   ```javascript
   generatePropertyId(data, portal) {
     // ... existing code ...
     case 'newportal':
       const npMatch = pathname.match(/\/your-id-pattern\/(\d+)/);
       return npMatch ? `${portal}-${npMatch[1]}` : null;
     // ... existing code ...
   }
   ```

5. Implement backend MCP support (server-side)

## UK-Specific Data Requirements

The PortalExtractorService processes the following UK-specific fields:

- **Property tenure**: Freehold/Leasehold/Share of Freehold
- **Leasehold years**: Remaining years on lease
- **Ground rent and service charges**: Cost and payment frequency
- **EPC rating**: Energy efficiency information
- **Council tax band**: UK council tax classification
- **Listed building status**: Historical property designation
- **Conservation area status**: Protected area designation

The standardized property data structure is defined in `processExtractedData()` within `src/services/portalExtractorService.js`.

## API Integration

The HomeTruth API has specific endpoints for UK data:

- `/api/uk/propertyCheck` - Primary property verification
- `/api/uk/councilTax` - Council tax estimation
- `/api/uk/floodRisk` - Flood risk assessment
- `/api/uk/landRegistry` - Land Registry data integration
- `/api/uk/schoolData` - School catchment information

Additionally, MCP-specific endpoints are available:

- `/mcp/extract-property` - Extract data from a property URL
- `/mcp/extract-from-html` - Extract data from HTML content
- `/mcp/search-properties` - Search for properties using criteria

## Testing UK Functionality

Test all UK-specific features against our standard test properties:

```javascript
const UK_TEST_PROPERTIES = {
  rightmove_freehold: "https://www.rightmove.co.uk/properties/123456789",
  zoopla_leasehold: "https://www.zoopla.co.uk/for-sale/details/12345678",
  otm_share_of_freehold: "https://www.onthemarket.com/details/12345678",
};
```

## Localization Standards

- All user-facing text must use British English spelling
- Financial data should use GBP (£) format
- Dates should follow UK format (DD/MM/YYYY)
- Property measurements should offer both metric (m²) and imperial (sq ft) with metric as default

## Release Checklist

Before submitting updates:

1. Verify all UK portal selectors are current
2. Test MCP extraction with UK-specific edge cases (leasehold properties, listed buildings)
3. Ensure EPC compliance with latest standards
4. Validate Land Registry API interactions
5. Check Council Tax band calculations
6. Verify flood risk assessments

## Regulatory Compliance

Ensure compliance with:

- UK GDPR
- Distance Selling Regulations
- Consumer Rights Act 2015
- Property Ombudsman requirements

## Support Contacts

For development questions specific to UK integration:

- Technical Lead: tech@hometruth.uk
- UK Data Specialist: ukdata@hometruth.uk
- Regulatory Compliance: compliance@hometruth.uk

## Documentation

Keep this guide and the following documentation updated:

- API reference
- User guide
- Portal integration specifications
- UK data models
