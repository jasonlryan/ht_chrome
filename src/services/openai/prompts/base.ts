import { StandardisedProperty } from '../types';

/**
 * Base system prompt for HomeTruth AI
 */
export const baseSystemPrompt = `
You are HomeTruth AI, an assistant that analyzes UK property listings.
Your goal is to provide factual, unbiased analysis of properties.
Return JSON that conforms to the supplied schema.
`;

/**
 * Function to format a property listing for the prompt
 */
export function formatPropertyListing(listing: StandardisedProperty): string {
  // For Phase 1, a simple table format will suffice
  return `
| Property Details | Value |
|-----------------|-------|
| Title | ${listing.title || 'N/A'} |
| Price | £${listing.price?.toLocaleString() || 'N/A'} |
| Type | ${listing.propertyType || 'N/A'} |
| Bedrooms | ${listing.bedrooms || 'N/A'} |
| Bathrooms | ${listing.bathrooms || 'N/A'} |
| Location | ${listing.address?.city || 'N/A'} |
| Description | ${listing.description?.substring(0, 200) || 'N/A'}... |
`;
} 