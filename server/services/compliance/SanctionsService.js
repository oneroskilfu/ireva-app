/**
 * Sanctions Screening Service
 * 
 * Handles sanctions list and PEP (Politically Exposed Persons) screening.
 * Integrates with external APIs for comprehensive compliance checks.
 */

const axios = require('axios');
const { db } = require('../../db');
const { randomUUID } = require('crypto');
const { eq, and, or, desc } = require('drizzle-orm');
const KycService = require('./KycService');
const { FlagTypeEnum, RiskLevelEnum } = require('../../../shared/schema-kyc');

// Configuration for external sanction screening APIs
const complyAdvantageConfig = {
  baseUrl: process.env.COMPLY_ADVANTAGE_API_URL,
  apiKey: process.env.COMPLY_ADVANTAGE_API_KEY,
};

// Schema definition for screening tables (would be defined in schema-kyc.ts in a real implementation)
// For demonstration purposes, we'll use a placeholder schema reference
const screeningResults = {
  id: 'id',
  kycVerificationId: 'kyc_verification_id',
  userId: 'user_id',
  screeningType: 'screening_type', // 'pep' or 'sanctions'
  inputData: 'input_data', // JSON object with screened data
  matchStatus: 'match_status', // 'match', 'potential_match', or 'no_match'
  matchDetails: 'match_details', // JSON object with match details
  externalReferenceId: 'external_reference_id', // Reference ID from external API
  createdAt: 'created_at',
};

class SanctionsService {
  /**
   * Screen user against PEP (Politically Exposed Persons) lists
   * 
   * @param {object} userData - User data for screening
   * @param {string} kycVerificationId - KYC verification ID
   * @param {number} userId - User ID
   * @returns {Promise<object>} PEP screening result
   */
  static async screenPEP(userData, kycVerificationId, userId) {
    try {
      // Generate a reference ID for tracking the request
      const referenceId = `pep-${randomUUID()}`;
      
      // Prepare request for ComplyAdvantage API
      const requestPayload = {
        search_term: `${userData.firstName} ${userData.lastName}`,
        client_ref: referenceId,
        fuzziness: 0.7,
        filters: {
          types: ['pep'],
          birth_year: userData.dateOfBirth ? new Date(userData.dateOfBirth).getFullYear() : undefined,
          countries: [userData.countryCode],
        },
      };
      
      let complyAdvantageResponse;
      let matchStatus = 'no_match';
      let matchDetails = {};
      
      try {
        // Call ComplyAdvantage API (in a real implementation)
        const response = await axios.post(
          `${complyAdvantageConfig.baseUrl}/searches`,
          requestPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${complyAdvantageConfig.apiKey}`,
            },
          }
        );
        
        complyAdvantageResponse = response.data;
        
        // Analyze the response
        if (complyAdvantageResponse.data.hits.length > 0) {
          // Check match strength
          const bestMatch = complyAdvantageResponse.data.hits[0];
          
          if (bestMatch.match_status === 'match') {
            matchStatus = 'match';
            
            // Create a risk flag for PEP match
            await KycService.createRiskFlag(kycVerificationId, userId, {
              type: FlagTypeEnum.PEP,
              severity: RiskLevelEnum.HIGH,
              description: `User identified as a Politically Exposed Person: ${bestMatch.entity.name} (${bestMatch.entity.title || 'PEP'})`,
              evidence: {
                hitId: bestMatch.id,
                name: bestMatch.entity.name,
                title: bestMatch.entity.title,
                positions: bestMatch.entity.positions,
                countries: bestMatch.entity.countries,
                matchScore: bestMatch.score,
              },
            });
            
            // Update KYC verification risk level
            await KycService.updateKycVerification(kycVerificationId, {
              riskLevel: RiskLevelEnum.HIGH,
            });
          } else if (bestMatch.match_status === 'potential_match' && bestMatch.score > 0.8) {
            matchStatus = 'potential_match';
            
            // Create a risk flag for potential PEP match
            await KycService.createRiskFlag(kycVerificationId, userId, {
              type: FlagTypeEnum.PEP,
              severity: RiskLevelEnum.MEDIUM,
              description: `User may be a Politically Exposed Person: ${bestMatch.entity.name} (${bestMatch.entity.title || 'PEP'}) - Requires review`,
              evidence: {
                hitId: bestMatch.id,
                name: bestMatch.entity.name,
                title: bestMatch.entity.title,
                positions: bestMatch.entity.positions,
                countries: bestMatch.entity.countries,
                matchScore: bestMatch.score,
              },
            });
          }
          
          matchDetails = {
            hits: complyAdvantageResponse.data.hits.map(hit => ({
              id: hit.id,
              name: hit.entity.name,
              title: hit.entity.title,
              score: hit.score,
              match_status: hit.match_status,
              countries: hit.entity.countries,
            })),
          };
        }
      } catch (apiError) {
        console.error('ComplyAdvantage API error:', apiError);
        matchDetails = { error: 'API connection error' };
      }
      
      // Save screening result
      // In a real implementation, we would insert into a database table
      const screeningResult = {
        id: randomUUID(),
        kycVerificationId,
        userId,
        screeningType: 'pep',
        inputData: userData,
        matchStatus,
        matchDetails,
        externalReferenceId: referenceId,
        createdAt: new Date(),
      };
      
      // For demo purposes, we'll mock this insert
      // await db.insert(screeningResults).values(screeningResult);
      
      return {
        id: screeningResult.id,
        matchStatus,
        matchDetails,
      };
    } catch (error) {
      console.error('Error performing PEP screening:', error);
      throw error;
    }
  }
  
  /**
   * Screen user against global sanctions lists
   * 
   * @param {object} userData - User data for screening
   * @param {string} kycVerificationId - KYC verification ID
   * @param {number} userId - User ID
   * @returns {Promise<object>} Sanctions screening result
   */
  static async screenSanctions(userData, kycVerificationId, userId) {
    try {
      // Generate a reference ID for tracking the request
      const referenceId = `sanctions-${randomUUID()}`;
      
      // Prepare request for ComplyAdvantage API
      const requestPayload = {
        search_term: `${userData.firstName} ${userData.lastName}`,
        client_ref: referenceId,
        fuzziness: 0.7,
        filters: {
          types: ['sanction'],
          birth_year: userData.dateOfBirth ? new Date(userData.dateOfBirth).getFullYear() : undefined,
          countries: [userData.countryCode],
        },
      };
      
      let complyAdvantageResponse;
      let matchStatus = 'no_match';
      let matchDetails = {};
      
      try {
        // Call ComplyAdvantage API (in a real implementation)
        const response = await axios.post(
          `${complyAdvantageConfig.baseUrl}/searches`,
          requestPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${complyAdvantageConfig.apiKey}`,
            },
          }
        );
        
        complyAdvantageResponse = response.data;
        
        // Analyze the response
        if (complyAdvantageResponse.data.hits.length > 0) {
          // Check match strength
          const bestMatch = complyAdvantageResponse.data.hits[0];
          
          if (bestMatch.match_status === 'match') {
            matchStatus = 'match';
            
            // Create a risk flag for sanctions match
            await KycService.createRiskFlag(kycVerificationId, userId, {
              type: FlagTypeEnum.SANCTION_LIST,
              severity: RiskLevelEnum.CRITICAL,
              description: `User found on sanctions list: ${bestMatch.entity.name} (${bestMatch.list.name})`,
              evidence: {
                hitId: bestMatch.id,
                name: bestMatch.entity.name,
                sanctionsList: bestMatch.list.name,
                countries: bestMatch.entity.countries,
                matchScore: bestMatch.score,
              },
            });
            
            // Update KYC verification risk level and status
            await KycService.updateKycVerification(kycVerificationId, {
              riskLevel: RiskLevelEnum.CRITICAL,
              status: 'REJECTED',
              rejectionReason: 'User found on sanctions list',
            });
          } else if (bestMatch.match_status === 'potential_match' && bestMatch.score > 0.8) {
            matchStatus = 'potential_match';
            
            // Create a risk flag for potential sanctions match
            await KycService.createRiskFlag(kycVerificationId, userId, {
              type: FlagTypeEnum.SANCTION_LIST,
              severity: RiskLevelEnum.HIGH,
              description: `User potential match with sanctions list: ${bestMatch.entity.name} (${bestMatch.list.name}) - Requires review`,
              evidence: {
                hitId: bestMatch.id,
                name: bestMatch.entity.name,
                sanctionsList: bestMatch.list.name,
                countries: bestMatch.entity.countries,
                matchScore: bestMatch.score,
              },
            });
            
            // Update KYC verification risk level
            await KycService.updateKycVerification(kycVerificationId, {
              riskLevel: RiskLevelEnum.HIGH,
            });
          }
          
          matchDetails = {
            hits: complyAdvantageResponse.data.hits.map(hit => ({
              id: hit.id,
              name: hit.entity.name,
              sanctions_list: hit.list.name,
              score: hit.score,
              match_status: hit.match_status,
              countries: hit.entity.countries,
            })),
          };
        }
      } catch (apiError) {
        console.error('ComplyAdvantage API error:', apiError);
        matchDetails = { error: 'API connection error' };
      }
      
      // Save screening result
      // In a real implementation, we would insert into a database table
      const screeningResult = {
        id: randomUUID(),
        kycVerificationId,
        userId,
        screeningType: 'sanctions',
        inputData: userData,
        matchStatus,
        matchDetails,
        externalReferenceId: referenceId,
        createdAt: new Date(),
      };
      
      // For demo purposes, we'll mock this insert
      // await db.insert(screeningResults).values(screeningResult);
      
      return {
        id: screeningResult.id,
        matchStatus,
        matchDetails,
      };
    } catch (error) {
      console.error('Error performing sanctions screening:', error);
      throw error;
    }
  }
  
  /**
   * Get screening results (pep or sanctions)
   * 
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @param {string} type - Type of screening ('pep' or 'sanctions')
   * @param {string} matchStatus - Match status filter
   * @returns {Promise<object>} Screening results with pagination
   */
  static async getScreeningResults(page, limit, type, matchStatus) {
    try {
      // In a real implementation, we would query the database
      // For demo purposes, we'll return mock data
      
      // Generate mock screening results
      const screenings = Array.from({ length: 15 }, (_, i) => ({
        id: `screen-${i + 1}`,
        kycVerificationId: `kyc-${i + 100}`,
        userId: 1000 + i,
        user: {
          name: `User ${1000 + i}`,
          email: `user${1000 + i}@example.com`,
        },
        screeningType: type || (i % 2 === 0 ? 'pep' : 'sanctions'),
        matchStatus: matchStatus || (i % 3 === 0 ? 'match' : i % 3 === 1 ? 'potential_match' : 'no_match'),
        matchDetails: i % 3 === 0 ? {
          hits: [{
            id: `hit-${i}`,
            name: `Political Figure ${i}`,
            title: 'Minister of Finance',
            score: 0.92,
            match_status: 'match',
            countries: ['US', 'UK'],
          }]
        } : i % 3 === 1 ? {
          hits: [{
            id: `hit-${i}`,
            name: `Similar Name ${i}`,
            title: 'Local Politician',
            score: 0.85,
            match_status: 'potential_match',
            countries: ['CA'],
          }]
        } : { hits: [] },
        externalReferenceId: `ref-${i}`,
        createdAt: new Date(Date.now() - i * 86400000),
      }));
      
      // Apply type filter
      let filteredScreenings = screenings;
      if (type) {
        filteredScreenings = filteredScreenings.filter(s => s.screeningType === type);
      }
      
      // Apply match status filter
      if (matchStatus) {
        filteredScreenings = filteredScreenings.filter(s => s.matchStatus === matchStatus);
      }
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedScreenings = filteredScreenings.slice(startIndex, endIndex);
      
      return {
        screenings: paginatedScreenings,
        pagination: {
          total: filteredScreenings.length,
          page,
          limit,
          pages: Math.ceil(filteredScreenings.length / limit),
        },
      };
    } catch (error) {
      console.error('Error getting screening results:', error);
      throw error;
    }
  }
  
  /**
   * Get screening result by ID
   * 
   * @param {string} id - Screening result ID
   * @returns {Promise<object|null>} Screening result or null if not found
   */
  static async getScreeningResultById(id) {
    try {
      // In a real implementation, we would query the database
      // For demo purposes, we'll return mock data
      
      const mockScreening = {
        id,
        kycVerificationId: `kyc-${id.substring(id.length - 3)}`,
        userId: 1000,
        user: {
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
        screeningType: id.startsWith('pep') ? 'pep' : 'sanctions',
        matchStatus: 'match',
        matchDetails: {
          hits: [{
            id: 'hit-123',
            name: 'John Doe',
            title: 'Former Minister',
            score: 0.95,
            match_status: 'match',
            countries: ['US', 'UK'],
          }]
        },
        externalReferenceId: `ref-${id}`,
        createdAt: new Date(),
      };
      
      return mockScreening;
    } catch (error) {
      console.error(`Error getting screening result ${id}:`, error);
      throw error;
    }
  }
}

module.exports = SanctionsService;