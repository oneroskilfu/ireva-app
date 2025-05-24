import { get, post, put, patch, del } from './api';
import { Property } from '@shared/schema';

/**
 * Service for managing properties
 */
const propertyService = {
  /**
   * Get all properties
   * @param filters - Optional filter parameters
   */
  getAllProperties: async (filters?: {
    type?: string;
    location?: string;
    tier?: string;
    minInvestment?: number;
    maxInvestment?: number;
    search?: string;
    accreditedOnly?: boolean;
  }): Promise<Property[]> => {
    const response = await get<Property[]>('/properties', { params: filters });
    return response.data;
  },

  /**
   * Get property details by ID
   * @param id - Property ID
   */
  getPropertyById: async (id: number): Promise<Property> => {
    const response = await get<Property>(`/properties/${id}`);
    return response.data;
  },

  /**
   * Get properties by type
   * @param type - Property type (residential, commercial, etc.)
   */
  getPropertiesByType: async (type: string): Promise<Property[]> => {
    const response = await get<Property[]>(`/properties/type/${type}`);
    return response.data;
  },

  /**
   * Get properties by location
   * @param location - Property location
   */
  getPropertiesByLocation: async (location: string): Promise<Property[]> => {
    const response = await get<Property[]>(`/properties/location/${location}`);
    return response.data;
  },

  /**
   * Get featured properties
   */
  getFeaturedProperties: async (): Promise<Property[]> => {
    const response = await get<Property[]>('/properties/featured');
    return response.data;
  },

  /**
   * Search properties
   * @param query - Search query
   */
  searchProperties: async (query: string): Promise<Property[]> => {
    const response = await get<Property[]>('/properties/search', { params: { q: query } });
    return response.data;
  },

  /**
   * Create a new property (admin only)
   * @param propertyData - Property data
   */
  createProperty: async (propertyData: Partial<Property>): Promise<Property> => {
    const response = await post<Property>('/admin/properties', propertyData);
    return response.data;
  },

  /**
   * Update a property (admin only)
   * @param id - Property ID
   * @param propertyData - Updated property data
   */
  updateProperty: async (id: number, propertyData: Partial<Property>): Promise<Property> => {
    const response = await patch<Property>(`/admin/properties/${id}`, propertyData);
    return response.data;
  },

  /**
   * Delete a property (admin only)
   * @param id - Property ID
   */
  deleteProperty: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await del<{ success: boolean; message: string }>(`/admin/properties/${id}`);
    return response.data;
  },

  /**
   * Add property update or image (admin only)
   * @param id - Property ID
   * @param updateData - Update data or image
   */
  addPropertyUpdate: async (id: number, updateData: any): Promise<Property> => {
    const response = await post<Property>(`/admin/properties/${id}/updates`, updateData);
    return response.data;
  },

  /**
   * Toggle property as favorite
   * @param id - Property ID
   */
  toggleFavorite: async (id: number): Promise<{ success: boolean; isFavorite: boolean }> => {
    const response = await post<{ success: boolean; isFavorite: boolean }>(`/properties/${id}/favorite`);
    return response.data;
  },

  /**
   * Get user's favorite properties
   */
  getFavoriteProperties: async (): Promise<Property[]> => {
    const response = await get<Property[]>('/user/favorites');
    return response.data;
  },

  /**
   * Check if a property is in user's favorites
   * @param id - Property ID
   */
  isFavorite: async (id: number): Promise<boolean> => {
    const response = await get<{ isFavorite: boolean }>(`/properties/${id}/is-favorite`);
    return response.data.isFavorite;
  },
};

export default propertyService;