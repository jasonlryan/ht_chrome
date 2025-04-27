export interface StandardisedProperty {
  id: string;
  title: string;
  price: number;
  description: string;
  features: string[];
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  address?: {
    street?: string;
    city?: string;
    postcode?: string;
  };
  // Add other property fields as needed
}

export interface OpenAIRequest {
  listing: StandardisedProperty;
  // Expanded context object as per plan
  context?: {
    userId?: string;
    plan?: "free" | "premium";
    locale?: string;
    features?: string[];
  };
}

export interface FactCheckSection {
  claims: Array<{
    claim: string;
    verified: boolean;
    explanation?: string;
  }>;
}

export interface PhotoSection {
  summary: string;
  concerns: string[];
}

export interface PriceSection {
  assessment: string;
  comparables?: Array<{
    price: number;
    description: string;
  }>;
}

export interface LocationSection {
  summary: string;
  amenities: string[];
  concerns: string[];
}

export interface OpenAIResponseData {
  trustScore: number; // 0-100
  factCheck: FactCheckSection;
  photoAnalysis: PhotoSection;
  priceAnalysis: PriceSection;
  locationAnalysis: LocationSection;
  rawModelAnswer?: string; // kept 24h for audit
  partial?: boolean; // true if response was truncated
  parseError?: boolean; // true if schema validation failed
}

// New wrapper response interface for versioning
export interface OpenAIResponse {
  version: string; // API version (e.g., "1")
  data: OpenAIResponseData;
} 