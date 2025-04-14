import OpenAI from "openai";
import { Property } from "../../shared/schema";
import { storage } from "../storage";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type definition for user preferences
export type UserPreferences = {
  riskTolerance: "low" | "medium" | "high";
  investmentGoal: "income" | "growth" | "balanced";
  investmentHorizon: "short" | "medium" | "long";
  preferredLocations?: string[];
  preferredPropertyTypes?: string[];
  minReturn?: number;
  maxInvestment?: number;
};

// Type for recommendation response
export type PropertyRecommendation = {
  property: Property;
  score: number;
  reasons: string[];
};

export async function getPropertyRecommendations(
  userId: number,
  preferences: UserPreferences
): Promise<PropertyRecommendation[]> {
  try {
    // Get all properties
    const allProperties = await storage.getAllProperties();
    if (!allProperties || allProperties.length === 0) {
      return [];
    }

    // Get user's existing investments if available
    const userInvestments = await storage.getUserInvestments(userId);
    const investedPropertyIds = new Set(
      userInvestments.map((inv) => inv.propertyId)
    );

    // Prepare data for OpenAI
    const propertiesData = allProperties.map((property) => ({
      id: property.id,
      name: property.name,
      type: property.type,
      location: property.location,
      price: property.price,
      area: property.area,
      rooms: property.rooms,
      returnRate: property.returnRate,
      riskRating: property.riskRating,
      description: property.description,
      features: property.features,
      alreadyInvested: investedPropertyIds.has(property.id),
    }));

    // Call OpenAI API for personalized recommendations
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert real estate investment advisor for a Nigerian real estate platform. 
          Your task is to analyze properties and recommend the best matches based on the user's investment preferences.
          Focus on Nigerian real estate market dynamics.
          For each property, provide a score from 0-100 and concise reasons for your recommendation.
          Format your response as a valid JSON array of objects with the structure: 
          [{ "propertyId": number, "score": number, "reasons": [string] }]`,
        },
        {
          role: "user",
          content: `Based on these preferences:
          - Risk tolerance: ${preferences.riskTolerance}
          - Investment goal: ${preferences.investmentGoal}
          - Investment horizon: ${preferences.investmentHorizon}
          - Preferred locations: ${preferences.preferredLocations?.join(", ") || "Any"}
          - Preferred property types: ${preferences.preferredPropertyTypes?.join(", ") || "Any"}
          - Minimum expected return: ${preferences.minReturn || "Any"}
          - Maximum investment amount: ${preferences.maxInvestment || "Any"}
          
          Recommend the best properties from this list:
          ${JSON.stringify(propertiesData, null, 2)}
          
          Return your recommendations as JSON with propertyId, score, and reasons.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    const recommendations = JSON.parse(content);
    if (!Array.isArray(recommendations)) {
      throw new Error("Invalid recommendation format");
    }

    // Map the recommendations back to property objects
    const propertyRecommendations: PropertyRecommendation[] = recommendations
      .map((rec: any) => {
        const property = allProperties.find((p) => p.id === rec.propertyId);
        if (!property) return null;

        return {
          property,
          score: rec.score,
          reasons: rec.reasons,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    return propertyRecommendations;
  } catch (error) {
    console.error("Error generating property recommendations:", error);
    return [];
  }
}

// Function to analyze user behavior and update preferences
export async function analyzeUserBehavior(userId: number): Promise<UserPreferences | null> {
  try {
    // Get user's viewing history, investments, etc.
    const userInvestments = await storage.getUserInvestments(userId);
    
    if (userInvestments.length === 0) {
      return null; // Not enough data to analyze
    }

    // Get properties the user has invested in
    const investedPropertyIds = userInvestments.map((inv) => inv.propertyId);
    const investedProperties = await Promise.all(
      investedPropertyIds.map((id) => storage.getProperty(id))
    );
    
    const validProperties = investedProperties.filter(Boolean) as Property[];
    
    if (validProperties.length === 0) {
      return null;
    }

    // Extract data for analysis
    const propertyData = validProperties.map((property) => ({
      type: property.type,
      location: property.location,
      price: property.price,
      returnRate: property.returnRate,
      riskRating: property.riskRating,
    }));

    // Call OpenAI to analyze user's behavior and infer preferences
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in analyzing investment behavior and inferring user preferences.
          Based on a user's investment history in Nigerian real estate, determine their preferences.
          Format your response as a valid JSON object with the structure:
          {
            "riskTolerance": "low" | "medium" | "high",
            "investmentGoal": "income" | "growth" | "balanced",
            "investmentHorizon": "short" | "medium" | "long",
            "preferredLocations": [string],
            "preferredPropertyTypes": [string],
            "minReturn": number | null,
            "maxInvestment": number | null
          }`,
        },
        {
          role: "user",
          content: `Based on this user's investment history in Nigerian real estate properties:
          ${JSON.stringify(propertyData, null, 2)}
          
          Analyze their behavior and infer their investment preferences.
          Return your analysis as a JSON object with the structure specified.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    const preferences = JSON.parse(content) as UserPreferences;
    return preferences;
  } catch (error) {
    console.error("Error analyzing user behavior:", error);
    return null;
  }
}