HomeTruth Technical Delivery Plan: Stage 2 Enhancement
Executive Summary
Based on the new requirements, Stage 2 of HomeTruth will introduce personalized property criteria, allowing users to define their specific needs and preferences. This transforms the product from a general analysis tool into a personalized real estate advisor. The system will now calculate both a "Trust Score" (objective analysis) and a "Match Score" (personalized fit), enhancing the value proposition and user experience.
Key new features for Stage 2 include:

User profiles with customizable property criteria
Personalized match scoring against user preferences
Enhanced UI showing both objective analysis and personalized matches
Updated user portal with criteria management
Expanded database schema to store user preferences

1. System Architecture Impact
   The core architecture remains intact, but will be extended to support personalization:
   ┌───────────────┐ 1. User visits ┌──────────────┐
   │ Property Site │◄─────listing─────►│Browser + Ext │
   └───────┬───────┘ └──────┬───────┘
   │ │
   │ 2. Capture listing data │ 2a. Check user
   │ │ preferences
   │ ▼
   │ ┌─────────────┐
   │ │ Extension │
   │ │ Content │
   │ │ Scripts │
   └───────────────────────────►│ │
   └──────┬──────┘
   │
   │ 3. Extract & process data
   │ 3a. Include user criteria
   ▼
   ┌───────────────┐ 5. Return ┌──────────────┐
   │ Extension │◄─────analysis────┤ Backend API │
   │ UI Overlay │ + match score │ │
   └───────────────┘ └──────┬───────┘
   │
   │ 4. AI Analysis
   ┌─────────────────┐ │
   │ User Portal │ ▼
   │ ┌───────────┐ │ ┌─────────────┐
   │ │ Account │ │ │ OpenAI API │
   │ │ Management│ │ │ │
   │ └───────────┘ │ └─────────────┘
   │ ┌───────────┐ │
   │ │ Billing │ │
   │ └───────────┘ │
   │ ┌───────────┐ │
   │ │ Criteria │ │
   │ │ Management│ │
   │ └───────────┘ │
   └─────────────────┘
2. Changes to Components
   2.1 Browser Extension
   Additions:

User authentication state management
Criteria matching UI components
Match score calculation logic
Preference highlighting in analysis results

Data Models:
typescript// New interfaces
interface UserCriteria {
price: {
min: number;
max: number;
};
features: {
bedrooms: {
min: number;
preferred: number;
};
bathrooms: {
min: number;
preferred: number;
};
propertyType: string[];
mustHaveFeatures: string[];
niceToHaveFeatures: string[];
};
location: {
preferredAreas: string[];
maxCommuteTime: number;
commuteDestinations?: {
name: string;
address: string;
transportMode: "driving" | "transit" | "walking";
}[];
amenityPreferences: {
schools: number; // 0-10 importance
shopping: number;
restaurants: number;
parks: number;
transit: number;
};
};
riskTolerance: {
flood: number; // 0-10, higher = more risk averse
wildfire: number;
crime: number;
noise: number;
};
}

interface MatchResult {
overallScore: number; // 0-100
categoryScores: {
price: number;
features: number;
location: number;
risks: number;
};
matchDetails: {
matches: Array<{
criterion: string;
status: "match" | "partial" | "mismatch";
importance: "must-have" | "important" | "nice-to-have";
details: string;
}>;
};
}

// Extended AnalysisResult to include matches
interface AnalysisResult {
// Existing fields remain...

// New fields
matchAnalysis?: MatchResult;
}
2.2 Backend API
Additions:

Endpoints for criteria management
Enhanced analysis to include criteria matching
User preferences storage

New API Endpoints:
typescript// New API methods
interface UserCriteriaAPI {
getUserCriteria(req: Request, res: Response): Promise<void>;
updateUserCriteria(req: Request, res: Response): Promise<void>;

// Enhanced analysis endpoint now takes user ID
analyzePropertyWithCriteria(req: Request, res: Response): Promise<void>;
}

// New service
interface MatchingService {
calculateMatchScore(listing: PropertyListing, criteria: UserCriteria): Promise<MatchResult>;
highlightMatchingFeatures(analysis: AnalysisResult, criteria: UserCriteria): Promise<AnalysisResult>;
}
2.3 User Portal
Additions:

Criteria management interfaces
Enhanced account dashboard with preference visualization
Match history in analysis records

New Portal Pages:

/criteria - For managing all user criteria
/criteria/location - For setting location preferences
/criteria/features - For setting property feature preferences
/criteria/budget - For setting price range and financial preferences
/criteria/risks - For setting risk tolerance preferences

3. Database Schema Changes
   typescript// Extended User model
   model User {
   // Existing fields...

// New fields
criteria UserCriteria?
}

// New model
model UserCriteria {
id String @id @default(uuid())
userId String @unique @map("user_id")
createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @updatedAt @map("updated_at")

// Price preferences
priceMin Int? @map("price_min")
priceMax Int? @map("price_max")

// Feature preferences
bedroomsMin Int? @map("bedrooms_min")
bedroomsPreferred Int? @map("bedrooms_preferred")
bathroomsMin Float? @map("bathrooms_min")
propertyTypes String[] @map("property_types")
mustHaveFeatures String[] @map("must_have_features")
niceToHaveFeatures String[] @map("nice_to_have_features")

// Location preferences
preferredAreas String[] @map("preferred_areas")
maxCommuteTime Int? @map("max_commute_time")
commuteDestinations Json? @map("commute_destinations")
amenityPreferences Json @map("amenity_preferences")

// Risk tolerance
riskTolerances Json @map("risk_tolerances")

// Relations
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@map("user_criteria")
}

// Extended Analysis model
model Analysis {
// Existing fields...

// New fields
matchScore Int? @map("match_score")
matchDetails Json? @map("match_details")
} 4. Stage 2 Milestone Plan (4-week timeline)
Sprint 1: Core Criteria Management

Implement user criteria database models
Create criteria management API endpoints
Build basic criteria management UI in portal
Add authentication state to extension

Sprint 2: Matching Engine

Develop the property-to-criteria matching algorithm
Implement the match score calculation service
Create API endpoint for criteria-enhanced analysis
Extend the analysis history to include match data

Sprint 3: Extension UI Enhancement

Update extension UI to show match score
Add preference highlighting in analysis sections
Implement criteria status indicators (checkmarks, etc.)
Create settings panel for quick criteria access

Sprint 4: Polish & Integration

Finalize criteria onboarding flow
Implement criteria sync between portal and extension
Add "save these criteria" from current listing feature
Complete end-to-end testing and optimization

5. Stage 1 Preparation Requirements
   To ensure smooth implementation of Stage 2, the following elements must be built or prepared during Stage 1:
   5.1 Technical Foundation

Authentication System:

Implement full Auth0 integration with token management
Design user session handling in the extension
Create user database schema with extensibility in mind

Extensible Data Models:

Design the PropertyListing interface with all fields that will be needed for matching
Ensure the AnalysisResult interface is extensible for adding match data
Implement version compatibility in API responses

API Architecture:

Design API endpoints with authentication hooks
Implement user-specific data access patterns
Create middleware for authorization checks

User Portal Foundation:

Build the account management system
Design the portal with navigation structure for future criteria sections
Implement user settings storage and retrieval

Extension Framework:

Design UI component system with slots for match indicators
Implement a "logged in" state in the extension
Create user preference storage in extension local storage

5.2 Database Preparation

Database schema should include:

users table with extensible profile structure
Foreign key relationships ready for user_criteria
Indexes optimized for user-based queries

Ensure migration paths are clear for adding criteria tables later

5.3 UI/UX Considerations

Extension UI should:

Have layout space reserved for match information
Include an account section in settings
Design system should support status indicators (matches/non-matches)

Portal UI should:

Have navigation structure supporting criteria sections
Include account settings architecture
Support responsive layouts for form-heavy criteria pages

6. Workstream Tickets for Stage 1 Preparation
   EPIC: Authentication Foundation

HT-A1: Implement complete Auth0 integration with extension support

AC1: Users can authenticate via extension popup
AC2: JWT tokens properly stored and refreshed
AC3: Token validation middleware implemented for all protected API endpoints

HT-A2: Create extensible user database schema

AC1: User model includes fields for future preference storage
AC2: Database indexes optimized for user-based queries
AC3: Test migration path for adding related tables

EPIC: Extensible Analysis Framework

HT-E1: Design analysis results for future enhancement

AC1: AnalysisResult interface includes optional fields for match data
AC2: API versioning strategy implemented for backward compatibility
AC3: Extension can handle both basic and enhanced result formats

HT-E2: Implement user-aware analysis pipeline

AC1: Analysis requests can include optional user context
AC2: Backend architecture supports pluggable enhancers for analysis results
AC3: Analysis storage linked to user accounts when authenticated

EPIC: Portal Foundation

HT-P1: Design portal for future criteria management

AC1: Navigation structure includes placeholders for criteria sections
AC2: Account settings architecture supports extensible user preferences
AC3: Responsive layouts handle form-heavy pages

HT-P2: Implement core user account management

AC1: Users can view and edit basic profile information
AC2: Settings storage and retrieval API implemented
AC3: Account dashboard designed with space for criteria summary

7. Cursor Agent Prompts for Stage 1 Preparation

### Cursor agent: Authentication System

Profile: Expert back-end engineer
Goal: Implement a comprehensive authentication system that will support user preferences in Stage 2

Tasks:

1. Set up Auth0 integration with proper configuration
2. Create authentication middleware for API protection
3. Implement token validation, refresh, and storage
4. Design extensible user model in the database
5. Create user registration and profile management endpoints
6. Add authentication state management to the extension

Deliverables:

- Complete Auth0 configuration
- Authentication middleware for Express
- Token management utilities
- User database models with migration scripts
- API endpoints for user management
- Extension authentication service

Acceptance criteria:

- Users can register and log in through both portal and extension
- JWT tokens are properly validated on all protected endpoints
- Token refresh works automatically before expiration
- User profiles can be retrieved and updated
- Extension maintains authentication state across sessions
- Database schema supports future addition of user preferences

Context:

```typescript
// Auth middleware example
import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

// User model with extensibility for preferences
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  lastLoginAt   DateTime? @map("last_login_at")

  // Auth info
  authId        String    @unique @map("auth_id") // Auth0 user ID

  // Basic profile
  firstName     String?   @map("first_name")
  lastName      String?   @map("last_name")

  // Relations
  subscription  Subscription?
  analyses      Analysis[]

  // Extensible settings - can store simple preferences before formal criteria model
  settings      Json?

  @@map("users")
}

// Extension auth service
class AuthService {
  private static readonly TOKEN_KEY = 'hometruth_auth_token';
  private static readonly USER_KEY = 'hometruth_user';

  private token: string | null = null;
  private user: UserProfile | null = null;

  constructor() {
    this.loadFromStorage();
  }

  async login(email: string, password: string): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { token, user } = await response.json();
      this.setSession(token, user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  logout(): void {
    this.clearSession();
  }

  isAuthenticated(): boolean {
    return !!this.token && !this.isTokenExpired();
  }

  getToken(): string | null {
    return this.token;
  }

  getCurrentUser(): UserProfile | null {
    return this.user;
  }

  // Will be important for criteria sync in Stage 2
  async refreshUserProfile(): Promise<UserProfile | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearSession();
          return null;
        }
        throw new Error('Failed to refresh user profile');
      }

      const user = await response.json();
      this.user = user;
      localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Profile refresh error:', error);
      return this.user;
    }
  }

  private setSession(token: string, user: UserProfile): void {
    this.token = token;
    this.user = user;
    localStorage.setItem(AuthService.TOKEN_KEY, token);
    localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
  }

  private clearSession(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem(AuthService.TOKEN_KEY);
    localStorage.removeItem(AuthService.USER_KEY);
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem(AuthService.TOKEN_KEY);
    const userJson = localStorage.getItem(AuthService.USER_KEY);

    if (token && userJson) {
      this.token = token;
      try {
        this.user = JSON.parse(userJson);
      } catch (e) {
        this.user = null;
      }
    }
  }

  private isTokenExpired(): boolean {
    if (!this.token) return true;

    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch (e) {
      return true;
    }
  }
}
```

### Cursor agent: Extensible Analysis Framework

Profile: Expert back-end engineer
Goal: Design and implement an analysis framework that can be extended in Stage 2 to support personalized criteria matching

Tasks:

1. Create a modular analysis pipeline with pluggable processors
2. Design an extensible AnalysisResult interface that can include optional match data
3. Implement version compatibility in API responses
4. Set up an analysis storage system linked to user accounts
5. Create enhancement hooks in the analysis flow for future criteria matching
6. Implement an abstraction layer to keep core analysis logic separate from matching

Deliverables:

- Modular analysis pipeline architecture
- Extensible data models for analysis results
- API versioning strategy documentation
- Analysis storage system with user associations
- Integration tests for the extensible components

Acceptance criteria:

- Analysis pipeline can process property data in discrete, modular steps
- Result format can be extended without breaking existing clients
- Analysis results can be associated with user accounts when authenticated
- API supports versioning for backward compatibility
- System architecture allows for future addition of criteria matching

Context:

```typescript
// Extensible analysis pipeline
interface AnalysisPipeline {
  process(
    data: PropertyListing,
    context?: AnalysisContext
  ): Promise<AnalysisResult>;
}

interface AnalysisContext {
  userId?: string;
  userPreferences?: any; // Will be strongly typed in Stage 2
  apiVersion?: string;
  includeRawResponses?: boolean;
}

// Pipeline implementation with processors
class ModularAnalysisPipeline implements AnalysisPipeline {
  private processors: AnalysisProcessor[] = [];

  constructor(processors: AnalysisProcessor[]) {
    this.processors = processors;
  }

  async process(
    data: PropertyListing,
    context?: AnalysisContext
  ): Promise<AnalysisResult> {
    // Start with empty result
    let result: AnalysisResult = {
      summary: {
        trustScore: 0,
        redFlags: 0,
        recommendations: [],
      },
      factCheck: { claims: [] },
      photoAnalysis: { techniques: [] },
      priceAnalysis: {
        fairMarketEstimate: 0,
        comparables: [],
        priceHistory: [],
      },
      locationAnalysis: {
        amenities: {
          transit: { score: 0, details: "" },
          shopping: { score: 0, details: "" },
          schools: { score: 0, details: "" },
          restaurants: { score: 0, details: "" },
        },
        risks: {
          flood: { score: 0, details: "" },
          wildfire: { score: 0, details: "" },
          crime: { score: 0, details: "" },
          noise: { score: 0, details: "" },
        },
      },
    };

    // Run each processor in sequence
    for (const processor of this.processors) {
      if (processor.canProcess(data, context)) {
        result = await processor.process(data, result, context);
      }
    }

    // Hook for Stage 2: criteria matching processor would be added here
    if (context?.userId && context?.userPreferences) {
      // This will be implemented in Stage 2
      // result = await this.matchingProcessor.process(data, result, context);
    }

    return result;
  }
}

// Abstract processor interface
interface AnalysisProcessor {
  canProcess(data: PropertyListing, context?: AnalysisContext): boolean;
  process(
    data: PropertyListing,
    currentResult: AnalysisResult,
    context?: AnalysisContext
  ): Promise<AnalysisResult>;
}

// Example processor implementation
class FactCheckProcessor implements AnalysisProcessor {
  private openAIService: OpenAIService;

  constructor(openAIService: OpenAIService) {
    this.openAIService = openAIService;
  }

  canProcess(data: PropertyListing): boolean {
    return !!data.description && data.description.length > 0;
  }

  async process(
    data: PropertyListing,
    currentResult: AnalysisResult
  ): Promise<AnalysisResult> {
    const factCheckResult = await this.openAIService.analyzeDescription(
      data.description
    );

    return {
      ...currentResult,
      factCheck: factCheckResult,
    };
  }
}

// API versioning middleware
const apiVersionMiddleware = (req, res, next) => {
  // Extract API version from Accept header or query param
  const acceptHeader = req.get("Accept") || "";
  const versionMatch = acceptHeader.match(
    /application\/vnd\.hometruth\.v(\d+)\+json/
  );

  // Default to latest version
  let version = "1";

  if (versionMatch) {
    version = versionMatch[1];
  } else if (req.query.apiVersion) {
    version = req.query.apiVersion;
  }

  // Attach to request
  req.apiVersion = version;
  next();
};

// Result transformer for version compatibility
const transformResult = (result: AnalysisResult, version: string): any => {
  switch (version) {
    case "1":
      // Remove any Stage 2 fields for v1 clients
      const { matchAnalysis, ...v1Result } = result;
      return v1Result;
    case "2":
      // Return full result with match data in v2
      return result;
    default:
      // Default to latest
      return result;
  }
};
```

### Cursor agent: Extension UI Framework

Profile: Expert front-end engineer
Goal: Design a flexible extension UI framework that can accommodate future personalized matching features

Tasks:

1. Create a component architecture that supports future match indicators
2. Implement layout with reserved space for match information
3. Design a theme system with status indicator styling
4. Add authentication UI components in the extension popup
5. Implement user state management in the extension
6. Create extensible settings panels for future criteria access

Deliverables:

- Extension UI component library with future-proof design
- Authentication UI flows in the extension
- User state management service
- Theme system with status indicators
- Layout templates with reserved sections

Acceptance criteria:

- UI components accommodate future match indicators without redesign
- Extension maintains user authentication state across sessions
- Settings UI has clear extension points for future criteria sections
- Theme system supports status indicators (match/mismatch styles)
- Layouts reserve appropriate space for match information

Context:

```typescript
// Example UI component with extensibility for match indicators
interface AnalysisSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  score?: number;
  // Stage 2: Will add these props
  matchScore?: number;
  matchStatus?: "match" | "partial" | "mismatch";
  userCriteriaRelevant?: boolean;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({
  title,
  icon,
  children,
  score,
  matchScore,
  matchStatus,
  userCriteriaRelevant,
}) => {
  return (
    <div className="analysis-section">
      <div className="section-header">
        <div className="header-left">
          <Icon name={icon} />
          <h3>{title}</h3>
        </div>
        <div className="header-right">
          {score !== undefined && <div className="score-pill">{score}/10</div>}

          {/* Reserved space for Stage 2 match indicators */}
          <div className="match-indicator-container">
            {matchStatus && (
              <div className={`match-indicator match-${matchStatus}`}>
                {matchStatus === "match" && <Icon name="check" />}
                {matchStatus === "partial" && <Icon name="partial" />}
                {matchStatus === "mismatch" && <Icon name="x" />}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section-content">
        {/* If user criteria are relevant to this section in Stage 2, we'll show this banner */}
        {userCriteriaRelevant && matchStatus && (
          <div className={`criteria-banner criteria-${matchStatus}`}>
            {matchStatus === "match" && "Matches your criteria"}
            {matchStatus === "partial" && "Partially matches your criteria"}
            {matchStatus === "mismatch" && "Does not match your criteria"}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

// Authentication UI components
const LoginForm: React.FC<{
  onLogin: (email: string, password: string) => Promise<void>;
  onSignUp: () => void;
}> = ({ onLogin, onSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onLogin(email, password);
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Log In to HomeTruth</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Log In"}
      </button>

      <div className="form-footer">
        <span>Don't have an account?</span>
        <button type="button" onClick={onSignUp} className="link-button">
          Sign Up
        </button>
      </div>
    </form>
  );
};

// Extension popup with account section
const ExtensionPopup: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="extension-popup">
      <header>
        <img src="logo.png" alt="HomeTruth" />
        {isAuthenticated ? (
          <div className="user-info">
            <span>{user?.email}</span>
            <button onClick={logout}>Log Out</button>
          </div>
        ) : (
          <button onClick={() => setActiveTab("login")}>Log In</button>
        )}
      </header>

      <div className="popup-content">
        {activeTab === "home" && (
          <div className="home-tab">{/* Extension home content */}</div>
        )}

        {activeTab === "login" && (
          <LoginForm onLogin={login} onSignUp={() => setActiveTab("signup")} />
        )}

        {activeTab === "signup" && (
          <SignupForm onSignUp={signup} onCancel={() => setActiveTab("home")} />
        )}

        {activeTab === "settings" && (
          <div className="settings-tab">
            <h2>Settings</h2>

            {/* Core settings */}
            <section>
              <h3>General</h3>
              {/* General settings */}
            </section>

            {/* Reserved space for criteria quick-access in Stage 2 */}
            {isAuthenticated && (
              <section className="criteria-settings-placeholder">
                <h3>Your Criteria</h3>
                <p>Manage your criteria in the HomeTruth portal.</p>
                <a
                  href="https://portal.hometruth.io/criteria"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Portal
                </a>
              </section>
            )}
          </div>
        )}
      </div>

      <nav>
        <button
          className={activeTab === "home" ? "active" : ""}
          onClick={() => setActiveTab("home")}
        >
          <Icon name="home" />
          <span>Home</span>
        </button>

        <button
          className={activeTab === "settings" ? "active" : ""}
          onClick={() => setActiveTab("settings")}
        >
          <Icon name="settings" />
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
};
```

8. Conclusion
   To successfully implement user accounts with personalized property criteria in Stage 2, we need to build a solid foundation in Stage 1. The key preparations include:

A comprehensive authentication system that will support user profiles
An extensible analysis framework that can be enhanced with criteria matching
UI components with space reserved for match indicators
Database schemas designed for future extension
API versioning to maintain compatibility
