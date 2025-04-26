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
│   ├── popup/            # Extension popup UI
│   └── utils/            # Utility functions
├── public/               # Static assets
├── tests/                # Test suite
└── docs/                 # Documentation
```

## UK Property Portal Integration

HomeTruth supports the following UK property portals:

| Portal        | Class Namespace       | Support Level |
| ------------- | --------------------- | ------------- |
| Rightmove     | `RightmovePortal`     | Full          |
| Zoopla        | `ZooplaPortal`        | Full          |
| OnTheMarket   | `OTMPortal`           | Full          |
| PrimeLocation | `PrimeLocationPortal` | Full          |
| Purplebricks  | `PurplebricksPortal`  | Partial       |

### Adding New Portal Support

1. Create a new portal class in `src/portals/`
2. Implement the required interface:
   ```typescript
   interface PortalInterface {
     getPropertyDetails(): PropertyDetails;
     extractListingData(): ListingData;
     getPropertyLocation(): GeoLocation;
     getDOMSelectors(): DOMSelectors;
   }
   ```
3. Register the portal in `src/portals/index.ts`
4. Add portal-specific extractors for UK property data

## UK-Specific Data Requirements

Ensure all portal integrations extract these UK-specific fields:

- Property tenure (Freehold/Leasehold/Share of Freehold)
- Leasehold years remaining
- Ground rent and service charges
- EPC rating
- Council tax band
- Listed building status
- Conservation area status

## API Integration

The HomeTruth API has specific endpoints for UK data:

- `/api/uk/propertyCheck` - Primary property verification
- `/api/uk/councilTax` - Council tax estimation
- `/api/uk/floodRisk` - Flood risk assessment
- `/api/uk/landRegistry` - Land Registry data integration
- `/api/uk/schoolData` - School catchment information

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
2. Test with UK-specific edge cases (leasehold properties, listed buildings)
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
