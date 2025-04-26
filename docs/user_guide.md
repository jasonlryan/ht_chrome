# HomeTruth User Guide

## What HomeTruth Does

HomeTruth is a browser extension designed to empower home buyers. When a user visits a property listing page on major real estate websites (like Zillow, Redfin, Realtor.com, Trulia), the extension automatically activates.

- **Data Extraction**: It reads key information from the webpage: the property description, listed price, photos, address, features (bedrooms, bathrooms, area), etc.
- **Backend Analysis**: This extracted data is securely sent to the HomeTruth backend API.
- **AI & Data Processing**: The backend uses AI models (like OpenAI's) and potentially other external data sources to:
  - **Fact-Check**: Analyze claims made in the description for accuracy or potential exaggeration (e.g., "newly renovated," "quiet street").
  - **Analyze Photos**: Detect common photographic tricks like excessive wide-angle lens use or virtual staging that might misrepresent the space.
  - **Assess Pricing**: Compare the listing price against historical price changes for that property and recent sales of comparable nearby properties (comps).
  - **Evaluate Location**: Check nearby amenities (transit, shopping, schools, restaurants) and assess potential risks (flood zones, wildfire areas, crime rates, noise levels).
- **Display Insights**: The results of this analysis are sent back to the browser extension.
- **UI Injection**: The extension then displays these findings directly on the listing page, often as an overlay or an added section. This includes things like a "Trust Score," identified red flags, fact-check results, photo analysis notes, price comparisons, and location scores/warnings.
- **User Account (Optional)**: Users can potentially create accounts via a separate User Portal to manage preferences, view analysis history, and access premium features or subscription tiers.

In short: It acts as an AI-powered assistant that automatically analyzes real estate listings you browse, highlighting potential issues and providing objective data to help you see beyond the marketing hype.

## Chrome Web Store Materials

### Extension Name

HomeTruth

### Tagline (Short Description - max 132 chars)

AI-powered analysis for real estate listings. See beyond the hype, uncover facts, and buy your next home with confidence.

### Detailed Description

Tired of navigating misleading property descriptions, suspiciously perfect photos, and uncertainty about fair market value? Buying a home is one of life's biggest decisions, and HomeTruth is here to bring clarity and confidence to your search.

HomeTruth is a smart browser extension that automatically analyzes real estate listings on popular sites like Zillow, Redfin, Realtor.com, and Trulia. As you browse, HomeTruth works silently in the background, using advanced AI and data analysis to give you the unbiased insights you need.

#### Key Features:

- 🔎 **AI-Powered Fact-Checking**: We scrutinize the listing description, identifying potentially misleading claims, exaggerations, or omissions and assessing their likely accuracy.
- 📸 **Photo Reality Check**: Detects common photographic techniques like extreme wide-angle lenses or virtual staging that can make rooms appear larger or different than they are.
- 💰 **Intelligent Price Analysis**: Get insights into the property's price history, see how it compares to similar recently sold homes nearby, and understand if the asking price aligns with market trends.
- 📍 **Comprehensive Location Insights**: Verify local amenities, check walkability and transit scores, and assess potential risks like flood zones, wildfire areas, crime rates, and noise pollution levels.
- 📊 **Overall Trust Score**: Get an at-a-glance summary of the listing's transparency and potential red flags based on our comprehensive analysis.
- ✨ **Seamless Integration**: Insights are displayed directly on the listing pages you're already browsing – no need to copy/paste or switch tabs.

#### How It Works:

1. Install the HomeTruth extension.
2. Browse listings on supported sites (Zillow, Redfin, Realtor.com, Trulia).
3. Look for the HomeTruth analysis panel appearing automatically on the page.
4. Explore the insights, understand the findings, and make more informed decisions!

Stop guessing and start analyzing. Install HomeTruth today and bring transparency to your real estate journey!

#### (Optional additions for the store):

- **Privacy Focus**: We only analyze listing data when activated and handle your information securely. See our Privacy Policy for details.
- **Supported Sites**: Currently supports Zillow.com, Redfin.com, Realtor.com, and Trulia.com in the US (or specify regions). More sites coming soon!

## User Guide

### Welcome to HomeTruth!

HomeTruth helps you see the real story behind online real estate listings. By automatically analyzing property details, photos, pricing, and location factors, HomeTruth provides valuable insights directly on the listing pages you browse. This guide will help you get started.

### 1. Installation

#### Chrome:

1. Go to the Chrome Web Store and search for "HomeTruth".
2. Click the "Add to Chrome" button.
3. Confirm by clicking "Add extension" in the pop-up.
4. (Recommended) Click the puzzle piece icon (Extensions) in your Chrome toolbar and click the pin icon next to HomeTruth to keep it visible.

#### Edge:

1. Go to the Microsoft Edge Add-ons store and search for "HomeTruth".
2. Click the "Get" button.
3. Confirm by clicking "Add extension".

### 2. How to Use HomeTruth

Using HomeTruth is designed to be simple:

1. **Browse as Usual**: Navigate to a property listing page on a supported website (e.g., Zillow.com, Redfin.com, Realtor.com, Trulia.com).
2. **Automatic Analysis**: HomeTruth will automatically detect you're on a listing page and begin its analysis. You might see a small HomeTruth loading indicator appear briefly.
3. **View Insights**: Once the analysis is complete (usually takes a few seconds), the HomeTruth panel or overlay will appear on the page. This panel contains the insights gathered about the listing.
4. **Explore the Sections**: The HomeTruth panel is typically organized into sections like:
   - **Summary**: An overview, often including a "Trust Score," key highlights, and major red flags detected.
   - **Fact Check**: Details on claims made in the property description and HomeTruth's assessment of their validity (e.g., "True," "Misleading," "Unverifiable").
   - **Photo Analysis**: Notes on detected photography techniques (e.g., "Wide-angle lens detected," "Potential virtual staging").
   - **Price Analysis**: Information on the property's price history, comparison to estimated fair market value, and details on comparable properties (comps).
   - **Location Analysis**: Scores and details regarding local amenities (shopping, transit, schools) and potential risks (flood, crime, noise).

### 3. Understanding the Analysis

- **Trust Score**: A rating (e.g., 0-100) indicating the overall perceived transparency and reliability of the listing based on our analysis. Higher scores are better.
- **Assessments**: Look for terms like "True," "Misleading," "False," or "Unverifiable" in the Fact Check section, along with explanations.
- **Scores**: Location and risk factors are often presented as scores (e.g., 0-10). Pay attention to whether a high score is good (like amenities) or bad (like risk).

### 4. Account & Premium Features (If Applicable)

- You may be prompted to create a free HomeTruth account to save your analysis history or access certain features.
- Premium subscription options might be available, offering enhanced analysis, more detailed data, or higher usage limits. You can manage your account and subscription through the HomeTruth User Portal (link usually provided in the extension or on the website).

### 5. Troubleshooting

#### HomeTruth panel not appearing?

- Ensure you are on a supported website's specific property listing page (not just the search results).
- Try refreshing the page.
- Check if the HomeTruth extension is enabled in your browser's extension settings.

#### Analysis seems slow?

- The analysis involves complex AI processing and data fetching, which can take a few moments, especially on the first visit to a listing.

#### Incorrect analysis?

- AI and data analysis are powerful but not perfect. If you believe something is wrong, look for a feedback option within the extension or contact support.

### 6. Need Help?

If you have questions or encounter issues, please visit our support page [Link to Support/FAQ Page] or contact us at [Support Email Address].

Thank you for using HomeTruth! We hope it empowers you to make smarter, more confident real estate decisions.
