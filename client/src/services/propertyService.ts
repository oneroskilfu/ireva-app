import { get, post, put, patch, del } from './api';
import { Property } from '@shared/schema';

/**
 * Service for managing property data
 */
const propertyService = {
  /**
   * Get all properties with optional filters
   * @param params - Query parameters for filtering
   */
  getAllProperties: async (params?: {
    type?: string;
    location?: string;
    tier?: string;
    accreditedOnly?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }): Promise<Property[]> => {
    const response = await get<Property[]>('/properties', { params });
    return response.data;
  },

  /**
   * Get a single property by ID
   * @param id - Property ID
   */
  getProperty: async (id: number): Promise<Property> => {
    const response = await get<Property>(`/properties/${id}`);
    return response.data;
  },

  /**
   * Get properties by type (residential, commercial, etc.)
   * @param type - Property type
   */
  getPropertiesByType: async (type: string): Promise<Property[]> => {
    const response = await get<Property[]>(`/properties`, { params: { type } });
    return response.data;
  },

  /**
   * Get properties by location
   * @param location - Property location
   */
  getPropertiesByLocation: async (location: string): Promise<Property[]> => {
    const response = await get<Property[]>(`/properties`, { params: { location } });
    return response.data;
  },

  /**
   * Create a new property (admin only)
   * @param property - Property data
   */
  createProperty: async (property: Partial<Property>): Promise<Property> => {
    const response = await post<Property>('/admin/properties', property);
    return response.data;
  },

  /**
   * Update an existing property (admin only)
   * @param id - Property ID
   * @param property - Updated property data
   */
  updateProperty: async (id: number, property: Partial<Property>): Promise<Property> => {
    const response = await patch<Property>(`/admin/properties/${id}`, property);
    return response.data;
  },

  /**
   * Delete a property (admin only)
   * @param id - Property ID
   */
  deleteProperty: async (id: number): Promise<void> => {
    await del(`/admin/properties/${id}`);
  },

  /**
   * Add property update or image (admin only)
   * @param id - Property ID
   * @param update - Update data or image
   */
  addPropertyUpdate: async (id: number, update: any): Promise<Property> => {
    const response = await post<Property>(`/admin/properties/${id}/updates`, update);
    return response.data;
  },

  /**
   * Search properties by text query
   * @param query - Search query
   */
  searchProperties: async (query: string): Promise<Property[]> => {
    const response = await get<Property[]>('/properties', { params: { search: query } });
    return response.data;
  },

  /**
   * Get featured properties
   */
  getFeaturedProperties: async (): Promise<Property[]> => {
    const response = await get<Property[]>('/properties/featured');
    return response.data;
  },
};

export default propertyService;