import { OpenAIRequest, OpenAIResponse } from './types';
// Update the path to reference the correct config location
const openaiConfig = require('../../../config/openai');
import { formatPropertyListing } from './prompts/base';

// This is a placeholder implementation until the OpenAI SDK is installed
// We'll use a basic fetch wrapper for now
const openai = {
  chat: {
    completions: {
      create: async (params: any) => {
        // This will be replaced with the actual OpenAI SDK in phase 2
        console.log('OpenAI request:', params);
        
        // Mock response
        return {
          choices: [{
            message: {
              content: JSON.stringify({
                trustScore: 50,
                explanation: 'This is a demo response'
              })
            }
          }]
        };
      }
    }
  }
};

/**
 * Analyses a property listing using OpenAI
 */
export async function analyse(req: OpenAIRequest): Promise<OpenAIResponse> {
  // Will be expanded in later phases
  const { messages, functions } = buildPrompt(req);
  
  try {
    const response = await openai.chat.completions.create({
      model: openaiConfig.model,
      temperature: openaiConfig.temperature,
      messages,
      functions,
    });
    
    // Placeholder implementation - will be expanded
    return {
      trustScore: 50, // Default score
      factCheck: { claims: [] },
      photoAnalysis: { summary: '', concerns: [] },
      priceAnalysis: { assessment: '' },
      locationAnalysis: { summary: '', amenities: [], concerns: [] }
    };
  } catch (error) {
    console.error('OpenAI request failed:', error);
    // Return default response on error
    return {
      trustScore: 0,
      factCheck: { 
        claims: [{ 
          claim: 'Failed to analyze property', 
          verified: false 
        }] 
      },
      photoAnalysis: { summary: 'Analysis failed', concerns: [] },
      priceAnalysis: { assessment: 'Analysis failed' },
      locationAnalysis: { summary: 'Analysis failed', amenities: [], concerns: [] }
    };
  }
}

/**
 * Builds the prompt for the OpenAI request
 */
function buildPrompt(req: OpenAIRequest) {
  // Basic system message
  const systemMessage = {
    role: 'system',
    content: 'You are HomeTruth AI. Return JSON that conforms to the supplied schema.'
  };
  
  // Format property data using the formatter
  const userMessage = {
    role: 'user',
    content: formatPropertyListing(req.listing)
  };
  
  // Basic function definitions - will be expanded
  const functions = [
    {
      name: 'compute_trust_score',
      description: 'Compute a trust score for the property listing',
      parameters: {
        type: 'object',
        properties: {
          score: {
            type: 'number',
            description: 'Trust score from 0-100'
          },
          explanation: {
            type: 'string',
            description: 'Explanation for the score'
          }
        },
        required: ['score']
      }
    }
  ];
  
  return { 
    messages: [systemMessage, userMessage], 
    functions 
  };
} 