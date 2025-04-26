# HomeTruth: Product Requirements Document (PRD)

## 1. Product Overview

HomeTruth is a browser extension that uses AI to analyse property listings in real-time, helping UK home buyers make more informed decisions by providing objective analysis of property listings directly on property portal websites.

### 1.1 Vision Statement

To empower home buyers with transparency and data-driven insights, reducing information asymmetry in the property market.

### 1.2 Target Audience

- First-time home buyers in the UK
- Property investors assessing multiple properties
- Anyone who feels overwhelmed by property listings and wants objective analysis
- Users who want to quickly identify potential issues or misleading information in listings

### 1.3 Supported Platforms

- Chrome browser extension (initial release)
- Edge browser extension (subsequent release)

### 1.4 Supported Property Portals

- Rightmove.co.uk
- Zoopla.co.uk
- OnTheMarket.com
- PrimeLocation.com

## 2. Feature Requirements

### 2.1 Core Features

#### 2.1.1 Property Listing Detection

The extension must automatically detect when a user is viewing a property listing page on a supported property portal.

#### 2.1.2 Data Extraction

The extension must extract relevant property data from the listing page, including:

- Property description
- Listed price
- Property images
- Property address
- Property features (bedrooms, bathrooms, square footage)
- Property type (house, flat, etc.)
- Property history (if available)

#### 2.1.3 AI Analysis

The backend must analyse the extracted data to provide the following insights:

**Fact-Checking**

- Identify claims made in the property description
- Assess the veracity of these claims where possible
- Flag potentially misleading statements
- Provide confidence levels for each assessment

**Photo Analysis**

- Detect wide-angle lens distortion
- Identify virtual staging/edited images
- Flag potential photographic tricks that misrepresent the property

**Price Analysis**

- Compare listing price to historical prices for the property
- Compare to similar properties in the area
- Provide an assessment of the price relative to market value
- Flag potential pricing strategies (under-pricing to generate interest, etc.)

**Location Analysis**

- Verify amenities mentioned in the listing
- Assess neighbourhood factors (schools, transport, shopping)
- Identify potential location risks (flood zones, crime rates, noise)

#### 2.1.4 Trust Score

Generate an overall "Trust Score" for each listing based on:

- Accuracy of listing description
- Transparency of photos
- Price fairness
- Comprehensive disclosure of location factors
- Overall listing transparency

#### 2.1.5 UI Integration

The extension must display analysis results directly on the listing page:

- Integrate with the property portal's UI
- Show an overall Trust Score prominently
- Group findings by category (Facts, Photos, Price, Location)
- Allow users to expand/collapse detailed findings
- Provide a feedback mechanism for analysis accuracy

### 2.2 User Account Features

#### 2.2.1 User Management

- Account creation and authentication
- User profile management
- Email notifications for saved properties

#### 2.2.2 Property History

- Save analysed properties
- Compare multiple properties
- Track changes to listings over time

#### 2.2.3 Premium Features

- Set up a tiered subscription model
- Implement billing and payment processing
- Provide enhanced features for premium users:
  - More detailed analysis
  - Unlimited saved properties
  - Priority processing
  - Additional data sources

## 3. Technical Requirements

### 3.1 Extension Architecture

- Manifest V3 compliance
- Content scripts for each supported property portal
- Background service worker
- Secure communication with backend API

### 3.2 Backend Infrastructure

- RESTful API for handling extension requests
- Secure authentication system
- Integration with OpenAI's API
- Database for user accounts and property histories
- Integration with external data sources (property records, location data)

### 3.3 AI Integration

- Implement function calling with OpenAI's API
- Design effective prompts for consistent analysis
- Implement retry logic and fallbacks
- Cache results to reduce API costs
- Monitor and improve AI response quality

### 3.4 Data Security & Privacy

- GDPR compliance for UK/EU users
- Secure handling of user data
- Clear privacy policy
- Data minimisation practices
- User consent for data collection

## 4. User Experience Requirements

### 4.1 Performance

- Analysis results should display within 5 seconds of page load
- Extension should not noticeably slow down the browser
- Fallback UI should appear if analysis takes longer than expected

### 4.2 Design

- Clean, modern interface that complements property portal designs
- Clear visual hierarchy for analysis results
- Intuitive icons and color-coding for quick understanding
- Responsive design that works across viewport sizes
- Accessibility compliance (WCAG 2.1 AA)

### 4.3 Content

- Clear explanations of analysis results
- Helpful tooltips for technical terms
- Actionable insights rather than just data
- Professional, neutral tone

## 5. Business Requirements

### 5.1 Monetisation Strategy

- Freemium model with basic analysis for free
- Premium subscription for enhanced features
- Potential for referral partnerships (mortgage brokers, surveyors)

### 5.2 Marketing Requirements

- Chrome Web Store listing optimisation
- Website landing page
- Product demo video
- Social media assets
- Email marketing integration

### 5.3 Analytics

- Track extension installations
- Monitor feature usage
- Collect anonymous analysis data for improvements
- Measure conversion to premium accounts

## 6. Legal & Compliance

### 6.1 Terms of Service

- Clear terms for extension use
- Limitations of AI analysis
- User responsibilities

### 6.2 Privacy Policy

- Data collection practices
- User data handling and storage
- Third-party data sharing
- User rights under GDPR

### 6.3 Compliance

- Ensure compliance with Google's extension policies
- Maintain GDPR compliance
- Ensure accessibility standards are met

## 7. Launch Requirements

### 7.1 Alpha Release

- Core functionality working on one property portal
- Limited user testing with internal team
- Basic analysis features implemented

### 7.2 Beta Release

- Support for all major property portals
- Expanded analysis features
- Limited external user testing
- User account system implemented

### 7.3 Public Launch

- Full feature set
- Performance optimisation
- Bug fixes from beta feedback
- Marketing materials and website ready
- Premium subscription tier available

## 8. Future Considerations

### 8.1 Potential Expansions

- Support for additional property portals
- Mobile app version
- Firefox extension
- Integration with property portal APIs (if available)
- White-label version for estate agents

### 8.2 Advanced Features

- AI-powered property recommendations
- Market trend analysis
- Investment potential scoring
- Mortgage affordability integration
- Environmental impact assessment

# HomeTruth Chrome Extension & GPT Plug-in – Product Requirements Document (PRD)

_Version 0.9 – 25 April 2025_

---

## 1 Overview

HomeTruth will ship a **one-click "Ask-the-Chatbot" button** that appears on every Rightmove, Zoopla, OnTheMarket and PrimeLocation listing in the UK property market.  
The button opens a conversational UI powered by an OpenAI function-calling backend that answers detailed questions about the listing and the surrounding area.  
The surface is a Manifest V3 Chrome/Edge extension; the intelligence lives in a hosted API that also exposes an `ai-plugin.json` so the same capabilities can be used inside a custom GPT ("HomeTruth Advisor").

## 2 Problem & opportunity

- **86 %** of UK property search traffic flows through Rightmove, giving a near-universal insertion point but providing only static information to consumers.
- Buyers must open multiple tabs to research mortgage costs, EPC scores, flood risk, crime and school data—creating friction and brand blind spots.
- No UK portal currently offers conversational answers at the point of intent.

## 3 Goals & non-goals

| Goal                     | Metric                     | Target                                          |
| ------------------------ | -------------------------- | ----------------------------------------------- |
| **G1 User engagement**   | Button click-through rate  | ≥ 6 % per listing view (first 30 d)             |
| **G2 Answer usefulness** | Thumbs-up rating in UI     | ≥ 75 % positive                                 |
| **G3 Virality**          | Average installs per share | ≥ 0.35                                          |
| **Non-goal**             | —                          | Direct integration with estate-agent CRMs in v1 |

## 4 Personas & user journeys

- **First-time buyer (FTB Fiona)** – needs affordability answers and area comparisons.
- **Second-stepper (SS Sam)** – wants renovation and extension potential queries.
- **Mortgage broker (MB Maya)** – installs to guide clients during Zoom calls.

**Typical flow (FTB)**  
Portal → sees "Ask HomeTruth" → clicks → modal opens → asks "Can I knock through the kitchen wall?" → answer + CTA to share/save.

## 5 Requirements

### 5.1 Functional (must-have)

| ID  | Description                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------ |
| FR1 | Inject fixed-position button on matching portal pages via `content_scripts` in Manifest V3                               |
| FR2 | Background `service_worker.js` listens for `postMessage`, packages URL + extracted JSON-LD, and calls backend over HTTPS |
| FR3 | Use `chrome.offscreen` to perform network calls when popup is closed                                                     |
| FR4 | Authenticate requests with `chrome.identity` OAuth token when user opts in                                               |
| FR5 | Display answer in modal with thumbs-up/down feedback and "Share" deep-link                                               |
| FR6 | Surface conversational history in extension popup                                                                        |

### 5.2 Non-functional

- **Performance** – initial content script ≤ 30 KB compressed; answer latency ≤ 3 s (P95).
- **Security & privacy** – no PII stored without consent; link a GDPR-compliant Privacy Policy.
- **Compliance** – respect Chrome _single-purpose_ policy and portal anti-scraping clauses.
- **Internationalisation** – day-one support for `en-GB`; framework ready for future locale packs.

## 6 Ecosystem constraints

- **OpenAI plugin manifest** (`ai-plugin.json`) must describe auth, logo, endpoints.
- GPT Store now surfaces _GPTs with Actions_ instead of legacy plugins—HomeTruth Advisor will be published accordingly.

## 7 Analytics & observability

Instrument the extension with an event queue sent to the backend; forward runtime errors to Sentry with the browser-extension filter disabled.

## 8 Milestones & timeline

| Week | Deliverable                           |
| ---- | ------------------------------------- |
| W-1  | Architecture & PRD sign-off           |
| W2   | Extension prototype with dummy API    |
| W4   | Private beta in Chrome Canary channel |
| W6   | Chrome Web Store submission           |
| W7   | Edge Add-ons submission               |
| W8   | Product Hunt launch                   |

## 9 Open questions

1. Will portals object to overlay buttons? _(Legal review in progress.)_
2. Should we cache answers per URL to cut token spend?
3. Do we gate advanced questions (e.g. local crime stats) behind a paywall at launch?

---

# Technical Implementation Plan

## 1 Architecture overview

    Content Script ─┐            ┌─> Listing Parser ──┐
                    │            │                    │
    Portal DOM ───> │ postMsg    │                    │
                    ├──────────▶ Service Worker ───▶ OpenAI Orchestrator ─▶ Chat Completion
                    │            │                    │
    Button UI  <─── │ answer     │  <─── JSON         │

### Components

| Layer               | Responsibility                                              | Key tech                      |
| ------------------- | ----------------------------------------------------------- | ----------------------------- |
| Content script      | DOM ready, inject button, extract JSON-LD                   | Manifest V3 `content_scripts` |
| Service worker      | Background messaging, offscreen networking                  | `chrome.offscreen` API        |
| Backend router      | Auth validate, rate-limit, routing                          | Next.js API routes            |
| Listing parser      | Server-side scrape of page HTML (respect robots) & enrich   | Cheerio + custom rules        |
| OpenAI orchestrator | Call `chat/completions` with function-calling, stream reply | OpenAI Node SDK               |
| Cache               | Store Q&A for 24 h                                          | Redis                         |

## 2 Data flow

1. User clicks button.
2. Content script posts `{url, jsonLd}` to service worker.
3. Service worker sends HTTPS POST to `/api/ask` with OAuth token.
4. Backend enriches listing, calls OpenAI, streams answer back.
5. Service worker relays answer to content script → modal.

## 3 Security & compliance

- Minimise permissions: `"activeTab"`, `"scripting"`, portal hostnames, `"storage"`.
- No DOM scraping beyond current page on Zoopla/Rightmove.
- Store only anonymised analytics; honour GDPR DSAR requests.

## 4 DevOps & CI

| Activity          | Tooling/Platform                               |
| ----------------- | ---------------------------------------------- |
| Build & pack      | Plasmo BPP GitHub Action (multi-store publish) |
| Unit tests        | Mocha + JSDom                                  |
| End-to-end        | Puppeteer via LambdaTest                       |
| Static type-check | TypeScript strict mode                         |
| Error monitoring  | Sentry JS SDK (extension filter disabled)      |

## 5 Testing strategy

- **Unit:** parser utilities, prompt formatting.
- **Integration:** mock OpenAI responses.
- **E2E:** launch Chrome with extension, visit staging listing, assert modal content via Puppeteer.

## 6 Release checklist

1. Remove `key` from manifest before zipping.
2. Provide icons 128 × 128 & 512 × 512.
3. Add Privacy Policy URL.
4. Keep store description ≤ 132 characters intro.
5. Record reviewer video/GIF demo.

## 7 Future enhancements

- Mobile deep-link from portal share sheet.
- Fine-tuned model for UK property jargon.
- In-chat inline images via GPT-Vision when GA.

---

_End of document._
