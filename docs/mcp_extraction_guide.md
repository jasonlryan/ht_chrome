# HomeTruth MCP Extraction Guide

## Overview

This guide explains the Managed Content Processing (MCP) approach used by HomeTruth to extract UK property data. The MCP service provides a reliable, maintainable method for extracting structured data from property portals, which is more resilient to layout changes than direct DOM scraping.

## Architecture

### Client-Side Components

- **PortalExtractorService**: Frontend service that interfaces with the MCP backend
- **PropertyService**: High-level service that uses PortalExtractorService for data retrieval
- **API Service**: Communicates with backend MCP endpoints

### Server-Side Components

- **MCP Extraction Engine**: Server-side processing for property data extraction
- **MCP API Endpoints**: Routes that handle extraction requests
- **MCP Data Normalization**: Ensures consistent data structure regardless of source

## Extraction Process

1. Content script detects a property listing page
2. Background script receives an `EXTRACT_PROPERTY_DATA` message
3. `handlePropertyExtraction()` calls the PropertyService
4. PropertyService uses PortalExtractorService to extract data
5. PortalExtractorService calls the MCP API endpoint
6. MCP backend processes the URL or HTML content
7. Extracted data is normalized and returned
8. Analysis is performed on the structured data

## MCP API Endpoints

| Endpoint                 | Method | Description                             |
| ------------------------ | ------ | --------------------------------------- |
| `/mcp/extract-property`  | POST   | Extract property data from a URL        |
| `/mcp/extract-from-html` | POST   | Extract property data from HTML content |
| `/mcp/search-properties` | POST   | Search for properties using criteria    |

### Request/Response Examples

#### Extract from URL

```json
// Request
{
  "url": "https://www.rightmove.co.uk/properties/12345678",
  "portal": "rightmove"
}

// Response
{
  "id": "rightmove-12345678",
  "price": 450000,
  "address": "123 High Street, London",
  "propertyType": "Terraced house",
  "bedrooms": 3,
  "bathrooms": 2,
  "tenure": "freehold",
  "epcRating": {
    "current": "C",
    "potential": "B"
  },
  "councilTaxBand": "D",
  // ... other property data
}
```

## UK-Specific Field Processing

The MCP service extracts and processes UK-specific property data:

### Tenure

```javascript
extractTenure(data) {
  if (data.tenure) {
    return data.tenure.toLowerCase();
  }

  // Look for tenure in description or features
  const tenureKeywords = {
    freehold: ['freehold'],
    leasehold: ['leasehold'],
    shareOfFreehold: ['share of freehold', 'share freehold']
  };

  // ... keyword search logic
}
```

### EPC Rating

EPC (Energy Performance Certificate) ratings are extracted as objects containing both current and potential values:

```json
"epcRating": {
  "current": "D",
  "potential": "B"
}
```

### Council Tax Band

UK council tax bands are standardized to uppercase letters:

```javascript
extractCouncilTaxBand(data) {
  if (data.councilTaxBand) {
    return data.councilTaxBand.toUpperCase();
  }

  return null;
}
```

## Extending MCP Extraction

To add support for new UK-specific property data:

1. Add fields to the standardized data structure in `processExtractedData()`
2. Create new extraction methods in the PortalExtractorService
3. Update the MCP backend to extract the new fields
4. Add data validation and normalization logic

## Error Handling

The MCP service includes comprehensive error handling:

- Portal identification errors
- Extraction failures
- Data validation errors
- Network connectivity issues

All errors are logged and tracked through the AnalyticsService for monitoring.

## Testing

Test the MCP extraction service using:

1. **Unit tests**: Test individual extraction methods
2. **Integration tests**: Test the full extraction pipeline
3. **Snapshot testing**: Compare extracted data against expected results

Use the test properties defined in the developer guide for consistent testing.

## Performance Considerations

- Extraction results are cached to minimize API calls
- Property data is standardized for efficient storage
- Heavy processing is performed server-side
- Batch operations are supported for multiple property extraction

## Security

The MCP service implements several security measures:

- Only approved portals can be processed
- CORS restrictions on API endpoints
- Rate limiting on extraction requests
- Data sanitization to prevent XSS
- No sensitive user data is stored with property information
