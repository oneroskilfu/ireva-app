import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Helper function to get JWT token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error(`API error: ${res.status} ${res.statusText} - ${text}`);
    throw new Error(`${res.status}: ${text}`);
  }
}

interface ApiRequestOptions {
  headers?: Record<string, string>;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: ApiRequestOptions
): Promise<Response> {
  // Get token from localStorage
  const token = getAuthToken();
  
  // Initialize headers with content type if data is provided
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(options?.headers || {})
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Keep this for cookies in case of hybrid auth
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
interface QueryFnOptions {
  on401: UnauthorizedBehavior;
  headers?: Record<string, string>;
}

export const getQueryFn: <T>(options: QueryFnOptions) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, headers = {} }) =>
  async ({ queryKey }) => {
    // Get token from localStorage
    const token = getAuthToken();
    
    // Initialize headers
    const requestHeaders: Record<string, string> = {
      ...headers
    };
    
    // Add Authorization header if token exists
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
    
    // Build URL with query parameters if present
    const basePath = queryKey[0] as string;
    
    let url = basePath;
    
    // Handle the params object format - queryKey[1] is an object with filter params
    if (queryKey.length > 1 && typeof queryKey[1] === 'object') {
      const params = queryKey[1] as Record<string, any>;
      const queryParams = new URLSearchParams();
      
      for (const [key, value] of Object.entries(params)) {
        if (value && value !== 'all') {
          queryParams.append(key, String(value));
        }
      }
      
      const queryString = queryParams.toString();
      if (queryString) {
        url = `${basePath}?${queryString}`;
      }
    }
    // Fallback to old format where queryKey alternates between key and value
    else if (queryKey.length > 1) {
      const params = queryKey.slice(1).filter(Boolean);
      
      if (params.length > 0) {
        const queryParams = new URLSearchParams();
        
        // Assuming params alternate between key and value
        for (let i = 0; i < params.length; i += 2) {
          const key = params[i];
          const value = params[i + 1];
          if (key && value && value !== 'all') {
            queryParams.append(String(key), String(value));
          }
        }
        
        const queryString = queryParams.toString();
        if (queryString) {
          url = `${basePath}?${queryString}`;
        }
      }
    }
    
    console.log("Making API request to:", url);
    
    const res = await fetch(url, {
      headers: requestHeaders,
      credentials: "include", // Keep this for cookies in case of hybrid auth
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const responseData = await res.json();
    console.log("API response data from:", url, responseData);
    return responseData;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
