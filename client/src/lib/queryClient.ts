import { QueryClient } from '@tanstack/react-query';

interface ApiRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  on401?: 'throw' | 'returnNull';
}

interface GetQueryFnOptions {
  on401?: 'throw' | 'returnNull';
}

/**
 * Create a new query client
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

/**
 * Make an API request
 */
export async function apiRequest(
  method: string,
  url: string,
  body?: any,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Prepare fetch options
  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: 'include',
    signal: options.signal,
  };

  // Add body for non-GET requests
  if (method !== 'GET' && body) {
    if (headers['Content-Type'] === 'application/json') {
      fetchOptions.body = JSON.stringify(body);
    } else {
      fetchOptions.body = body;
    }
  }

  // Make the request
  const response = await fetch(url, fetchOptions);

  // Handle 401 Unauthorized
  if (response.status === 401 && options.on401 === 'throw') {
    throw new Error('Unauthorized');
  }

  return response;
}

/**
 * Get a query function for TanStack Query
 */
export function getQueryFn({ on401 = 'throw' }: GetQueryFnOptions = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const url = queryKey[0];
    const response = await apiRequest('GET', url, undefined, { on401 });
    
    // Handle 404 Not Found
    if (response.status === 404) {
      throw new Error('Resource not found');
    }
    
    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Something went wrong');
    }
    
    // Return null for empty responses
    if (response.headers.get('Content-Length') === '0') {
      return null;
    }
    
    // Parse and return JSON response
    return response.json();
  };
}

/**
 * Mutation function for TanStack Query
 */
export function getMutationFn(method: string, url: string) {
  return async (data: any) => {
    const response = await apiRequest(method, url, data);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Something went wrong');
    }
    
    // Return null for empty responses
    if (response.headers.get('Content-Length') === '0') {
      return null;
    }
    
    return response.json();
  };
}