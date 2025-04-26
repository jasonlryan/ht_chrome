# HomeTruth Technical Delivery Guide

## Overview

This document outlines the technical deployment, monitoring, and operational processes for the HomeTruth Chrome extension targeting the UK property market.

## Architecture

HomeTruth consists of:

1. **Chrome Extension** - Manifest V3 based frontend that integrates with UK property portals
2. **Backend API** - Handles authentication, AI requests, and data storage
3. **OpenAI Integration** - Function-calling API implementation for property analysis
4. **Database** - User data, property history, and feedback storage

## UK Property Portal Integration

### Supported Portals

HomeTruth integrates with the following UK property portals:

- Rightmove.co.uk
- Zoopla.co.uk
- OnTheMarket.com
- PrimeLocation.com

### Integration Points

Each portal requires specific content script implementations due to differences in DOM structure:

| Portal        | Listing Detection Pattern                         | Data Extraction Points                                       |
| ------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| Rightmove     | URL pattern: `/properties/[0-9]+.html`            | `.property-header`, `.key-features`, `.property-description` |
| Zoopla        | URL pattern: `/for-sale/details/[0-9]+`           | `.dp-sidebar-wrapper`, `.dp-description`                     |
| OnTheMarket   | URL pattern: `/details/[a-zA-Z0-9]+`              | `.details-heading`, `.details-content`                       |
| PrimeLocation | URL pattern: `/property-for-sale/property-[0-9]+` | `.property-header`, `.property-features`                     |

## Deployment Pipeline

### Development Environment

- **Local**: `npm run dev` - Runs webpack in watch mode
- **Testing**: `npm run test` - Runs Jest test suite
- **Building**: `npm run build:dev` - Builds the extension for development

### Staging Deployment

1. Create a release branch from development: `release/vX.Y.Z`
2. Run `npm run build:staging`
3. Deploy backend API to staging environment
4. Upload extension to Chrome Developer Dashboard in draft mode
5. Verify integration with staging API endpoints

### Production Deployment

1. Merge staging branch to main after QA approval
2. Run `npm run build:production`
3. Deploy backend API to production environment
4. Submit extension to Chrome Web Store for review
5. Once approved, publish to store

## UK Compliance Requirements

### GDPR Compliance

- User data stored in EU-based data centers
- Data Processing Agreement with OpenAI
- User data export and deletion capability
- Privacy Policy with clear data usage explanations

### Financial Conduct Authority (FCA) Considerations

If providing property valuation or mortgage-related advice:

- Disclaimer that HomeTruth is not providing regulated financial advice
- Clear Terms of Service specifying limitations of analysis

### Accessibility Requirements

- WCAG 2.1 AA compliance
- Ensure screen reader compatibility
- Keyboard navigation support
- Sufficient color contrast

## Monitoring & Operations

### Monitoring

- **Error Tracking**: Sentry for frontend and backend error reporting
- **API Performance**: Datadog for API performance monitoring
- **User Analytics**: Mixpanel for user engagement metrics

### Alerting

| Alert                   | Threshold                        | Response                                  |
| ----------------------- | -------------------------------- | ----------------------------------------- |
| API Error Rate          | >1% of requests over 5 minutes   | On-call engineer notification             |
| API Latency             | >2s p95 over 10 minutes          | On-call engineer notification             |
| OpenAI API Failures     | >5% failure rate over 15 minutes | Fallback to cached responses, notify team |
| Extension Crash Reports | >10 in 1 hour                    | Immediate investigation                   |

### Deployment Schedule

- Regular deployments every two weeks
- Hotfixes as needed with expedited review
- UK Bank Holiday planning to ensure support coverage

## Security

### Authentication

- OAuth 2.0 with Google Sign-In
- JWT tokens with 1-hour expiry
- Refresh token rotation

### API Security

- Rate limiting: 100 requests per user per hour
- Input validation on all endpoints
- HTTPS-only communication
- API key rotation schedule (quarterly)

### Data Protection

- PII encryption at rest
- Minimal data collection policy
- 90-day data retention for inactive users
- Data anonymization for analytics

## Disaster Recovery

### Backup Procedures

- Database backups every 6 hours
- Configuration backups daily
- Complete system backup weekly

### Recovery Process

1. Identify affected components
2. Switch to replica if database issue
3. Roll back to last known good deployment if service issue
4. Restore from backup if data corruption issue

### Communication Plan

- Status page updates within 10 minutes of incident
- Email notification for extended downtime
- Post-mortem published for major incidents

## Support Process

### Tier 1 Support

- Initial user inquiries via extension feedback
- Email support response time: 24 hours
- Common issues documented in help center

### Tier 2 Support

- Technical issues escalated from Tier 1
- Bug reproduction and validation
- Solution development for known issues

### Tier 3 Support

- Complex technical issues requiring developer involvement
- API integration problems
- Security incidents

## Appendix

### API Documentation

Complete API documentation available at: `https://api.hometruth.uk/docs`

### Monitoring Dashboard

Main operations dashboard: `https://monitoring.hometruth.uk`

### Emergency Contacts

- Technical Director: tech@hometruth.uk
- Operations Manager: ops@hometruth.uk
- Security Officer: security@hometruth.uk
