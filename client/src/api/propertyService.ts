import API from './axios';

export interface Property {
  id: number;
  name: string;
  location: string;
  price: number;
  type: string;
  description: string;
  images?: string[];
  features?: string[];
  status: 'available' | 'sold' | 'pending';
  roi: number;
  risk: 'low' | 'medium' | 'high';
  developerId?: number;
}

export interface PropertyQuery {
  location?: string;
  type?: string;
  priceMin?: number;
  priceMax?: number;
  roi?: number;
  risk?: string;
  status?: string;
}

// Get all properties with optional filtering
export const getProperties = async (query?: PropertyQuery) => {
  const response = await API.get<Property[]>('/properties', { params: query });
  return response.data;
};

// Get a single property by ID
export const getPropertyById = async (id: number | string) => {
  const response = await API.get<Property>(`/properties/${id}`);
  return response.data;
};

// For admin: Create a new property
export const createProperty = async (propertyData: Omit<Property, 'id'>) => {
  const response = await API.post<Property>('/properties', propertyData);
  return response.data;
};

// For admin: Update a property
export const updateProperty = async (id: number, propertyData: Partial<Property>) => {
  const response = await API.put<Property>(`/properties/${id}`, propertyData);
  return response.data;
};

// For admin: Delete a property
export const deleteProperty = async (id: number) => {
  const response = await API.delete(`/properties/${id}`);
  return response.data;
};

// Get featured properties
export const getFeaturedProperties = async () => {
  const response = await API.get<Property[]>('/properties/featured');
  return response.data;
};