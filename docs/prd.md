# HomeTruth Chrome Extension & GPT Plug-in – Product Requirements Document (PRD)

_Version 0.9 – 25 April 2025_

---

## 1 Overview

HomeTruth will ship a **one-click “Ask-the-Chatbot” button** that appears on every Rightmove, Zoopla, OnTheMarket and PrimeLocation listing in the UK property market.  
The button opens a conversational UI powered by an OpenAI function-calling backend that answers detailed questions about the listing and the surrounding area.  
The surface is a Manifest V3 Chrome/Edge extension; the intelligence lives in a hosted API that also exposes an `ai-plugin.json` so the same capabilities can be used inside a custom GPT (“HomeTruth Advisor”).

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
Portal → sees “Ask HomeTruth” → clicks → modal opens → asks “Can I knock through the kitchen wall?” → answer + CTA to share/save.

## 5 Requirements

### 5.1 Functional (must-have)

| ID  | Description                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------ |
| FR1 | Inject fixed-position button on matching portal pages via `content_scripts` in Manifest V3                               |
| FR2 | Background `service_worker.js` listens for `postMessage`, packages URL + extracted JSON-LD, and calls backend over HTTPS |
| FR3 | Use `chrome.offscreen` to perform network calls when popup is closed                                                     |
| FR4 | Authenticate requests with `chrome.identity` OAuth token when user opts in                                               |
| FR5 | Display answer in modal with thumbs-up/down feedback and “Share” deep-link                                               |
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
