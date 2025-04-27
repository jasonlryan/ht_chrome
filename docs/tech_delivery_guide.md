# HomeTruth Technical Delivery Guide

## Overview

This document outlines the technical deployment, monitoring, and operational processes for the HomeTruth Chrome extension targeting the UK property market.

## Architecture [PARTIAL]

HomeTruth consists of:

1. **Chrome Extension** - Manifest V3 based frontend that integrates with UK property portals [COMPLETE]
2. **Backend API** - Handles authentication, AI requests, and data storage [PARTIAL]
3. **OpenAI Integration** - Function-calling API implementation for property analysis [INCOMPLETE]
   > **DEV NOTE**: No implementation found. Need detailed specifications for OpenAI model selection, function definitions, prompt engineering, and integration points.
4. **Database** - User data, property history, and feedback storage [PARTIAL]

## UK Property Portal Integration [PARTIAL]

### Supported Portals

HomeTruth integrates with the following UK property portals:

- Rightmove.co.uk [COMPLETE]
- Zoopla.co.uk [COMPLETE]
- OnTheMarket.com [COMPLETE]
- PrimeLocation.com [COMPLETE]
  > **DEV NOTE**: Purplebricks integration is planned but not implemented. All other portals have working MCP extraction.

### Integration Points [COMPLETE]

Each portal requires specific content script implementations due to differences in DOM structure:

| Portal        | Listing Detection Pattern                         | Data Extraction Points                                       |
| ------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| Rightmove     | URL pattern: `/properties/[0-9]+.html`            | `.property-header`, `.key-features`, `.property-description` |
| Zoopla        | URL pattern: `/for-sale/details/[0-9]+`           | `.dp-sidebar-wrapper`, `.dp-description`                     |
| OnTheMarket   | URL pattern: `/details/[a-zA-Z0-9]+`              | `.details-heading`, `.details-content`                       |
| PrimeLocation | URL pattern: `/property-for-sale/property-[0-9]+` | `.property-header`, `.property-features`                     |

> **DEV NOTE**: DOM selectors are primarily used for portal identification. Actual data extraction now uses MCP approach via API.

## Deployment Pipeline [PARTIAL]

### Development Environment [COMPLETE]

- **Local**: `npm run dev` - Runs webpack in watch mode
- **Testing**: `npm run test` - Runs Jest test suite
- **Building**: `npm run build:dev` - Builds the extension for development

### Staging Deployment [INCOMPLETE]

1. Create a release branch from development: `release/vX.Y.Z`
2. Run `npm run build:staging`
3. Deploy backend API to staging environment
4. Upload extension to Chrome Developer Dashboard in draft mode
5. Verify integration with staging API endpoints

> **DEV NOTE**: Need to implement CI/CD pipeline for automated staging deployment.

### Production Deployment [INCOMPLETE]

1. Merge staging branch to main after QA approval
2. Run `npm run build:production`
3. Deploy backend API to production environment
4. Submit extension to Chrome Web Store for review
5. Once approved, publish to store

> **DEV NOTE**: No evidence of automated production deployment process. Need to implement production release workflow.

## UK Compliance Requirements [INCOMPLETE]

### GDPR Compliance [PARTIAL]

- User data stored in EU-based data centers [UNKNOWN]
- Data Processing Agreement with OpenAI [INCOMPLETE]
- User data export and deletion capability [INCOMPLETE]
- Privacy Policy with clear data usage explanations [PARTIAL]

> **DEV NOTE**: Error monitoring is implemented with PII filtering, but comprehensive GDPR compliance requires additional user data management features.

### Financial Conduct Authority (FCA) Considerations [INCOMPLETE]

If providing property valuation or mortgage-related advice:

- Disclaimer that HomeTruth is not providing regulated financial advice [INCOMPLETE]
- Clear Terms of Service specifying limitations of analysis [INCOMPLETE]

> **DEV NOTE**: No implementation of FCA compliance features. Required before deploying valuation or financial advice features.

### Accessibility Requirements [INCOMPLETE]

- WCAG 2.1 AA compliance [INCOMPLETE]
- Ensure screen reader compatibility [INCOMPLETE]
- Keyboard navigation support [INCOMPLETE]
- Sufficient color contrast [INCOMPLETE]

> **DEV NOTE**: No evidence of accessibility testing or implementation. Required for public release.

## Monitoring & Operations [PARTIAL]

### Monitoring [PARTIAL]

- **Error Tracking**: Sentry for frontend and backend error reporting [COMPLETE]
- **API Performance**: Datadog for API performance monitoring [INCOMPLETE]
- **User Analytics**: Mixpanel for user engagement metrics [INCOMPLETE]

> **DEV NOTE**: Error monitoring via Sentry is well-implemented. Need to add API performance and user analytics integration.

### Alerting [INCOMPLETE]

| Alert                   | Threshold                        | Response                                  |
| ----------------------- | -------------------------------- | ----------------------------------------- |
| API Error Rate          | >1% of requests over 5 minutes   | On-call engineer notification             |
| API Latency             | >2s p95 over 10 minutes          | On-call engineer notification             |
| OpenAI API Failures     | >5% failure rate over 15 minutes | Fallback to cached responses, notify team |
| Extension Crash Reports | >10 in 1 hour                    | Immediate investigation                   |

> **DEV NOTE**: Alert thresholds defined but no implementation of alerting system. Need to integrate with monitoring platforms.

### Deployment Schedule [INCOMPLETE]

- Regular deployments every two weeks
- Hotfixes as needed with expedited review
- UK Bank Holiday planning to ensure support coverage

> **DEV NOTE**: No implementation of deployment scheduling system.

## Security [PARTIAL]

### Authentication [PARTIAL]

- OAuth 2.0 with Google Sign-In [PARTIAL]
- JWT tokens with 1-hour expiry [COMPLETE]
- Refresh token rotation [INCOMPLETE]

> **DEV NOTE**: Basic auth token handling implemented, but refresh token rotation not found.

### API Security [PARTIAL]

- Rate limiting: 100 requests per user per hour [INCOMPLETE]
- Input validation on all endpoints [PARTIAL]
- HTTPS-only communication [COMPLETE]
- API key rotation schedule (quarterly) [INCOMPLETE]

> **DEV NOTE**: HTTPS implemented, partial input validation. Need to implement rate limiting and API key rotation.

### Data Protection [PARTIAL]

- PII encryption at rest [INCOMPLETE]
- Minimal data collection policy [COMPLETE]
- 90-day data retention for inactive users [INCOMPLETE]
- Data anonymization for analytics [INCOMPLETE]

> **DEV NOTE**: Minimal data collection implemented. PII scrubbing in error reporting works, but need encryption, retention policies, and anonymization.

## Disaster Recovery [INCOMPLETE]

### Backup Procedures [INCOMPLETE]

- Database backups every 6 hours
- Configuration backups daily
- Complete system backup weekly

> **DEV NOTE**: No evidence of implemented backup procedures.

### Recovery Process [INCOMPLETE]

1. Identify affected components
2. Switch to replica if database issue
3. Roll back to last known good deployment if service issue
4. Restore from backup if data corruption issue

> **DEV NOTE**: Documented process but no implementation evidence.

### Communication Plan [INCOMPLETE]

- Status page updates within 10 minutes of incident
- Email notification for extended downtime
- Post-mortem published for major incidents

> **DEV NOTE**: No implementation of incident communication system.

## Support Process [INCOMPLETE]

### Tier 1 Support [INCOMPLETE]

- Initial user inquiries via extension feedback
- Email support response time: 24 hours
- Common issues documented in help center

> **DEV NOTE**: Support system implementation not found.

### Tier 2 Support [INCOMPLETE]

- Technical issues escalated from Tier 1
- Bug reproduction and validation
- Solution development for known issues

> **DEV NOTE**: No evidence of support escalation process.

### Tier 3 Support [INCOMPLETE]

- Complex technical issues requiring developer involvement
- API integration problems
- Security incidents

> **DEV NOTE**: No implementation of Tier 3 support process.

## Appendix [INCOMPLETE]

### API Documentation [INCOMPLETE]

Complete API documentation available at: `https://api.hometruth.uk/docs`

> **DEV NOTE**: API documentation referenced but not implemented or accessible.

### Monitoring Dashboard [INCOMPLETE]

Main operations dashboard: `https://monitoring.hometruth.uk`

> **DEV NOTE**: Dashboard referenced but not implemented.

### Emergency Contacts [COMPLETE]

- Technical Director: tech@hometruth.uk
- Operations Manager: ops@hometruth.uk
- Security Officer: security@hometruth.uk

## Development Priorities

Based on the current implementation status, here are the priorities for completing the HomeTruth extension:

### Priority 1: Core Functionality (Critical)

1. **OpenAI Integration** - Implement the function-calling API for property analysis, which is a central feature of the product. Requires detailed specification.
2. **UK-specific Data Endpoints** - Implement missing API endpoints for council tax, flood risk, land registry, and school data.
3. **Purplebricks Portal Integration** - Complete the planned portal integration using the existing MCP framework.

### Priority 2: Security & Compliance (High)

1. **GDPR Compliance** - Implement user data export/deletion capabilities and complete privacy policy.
2. **Data Protection** - Implement PII encryption at rest and data retention policies.
3. **API Security** - Add rate limiting and complete input validation for all endpoints.

### Priority 3: Deployment & Reliability (Medium)

1. **CI/CD Pipeline** - Implement automated deployment workflows for staging and production.
2. **Disaster Recovery** - Set up database backup procedures and validation.
3. **Monitoring Integration** - Implement API performance monitoring with Datadog and user analytics with Mixpanel.

### Priority 4: User Support & Documentation (Medium)

1. **Support System** - Implement the tiered support system for user inquiries.
2. **API Documentation** - Create comprehensive API documentation for developers and integrations.
3. **Help Center** - Develop user documentation and FAQs.

### Priority 5: Enhancements (Lower)

1. **Accessibility Implementation** - Ensure WCAG 2.1 AA compliance for UI components.
2. **Analytics & Dashboards** - Implement operational dashboards and reporting.
3. **Alerting System** - Set up monitoring alerts based on defined thresholds.

### Final Release Checklist

1. Security audit
2. Performance testing
3. GDPR compliance verification
4. Accessibility testing
5. User acceptance testing with UK property scenarios
