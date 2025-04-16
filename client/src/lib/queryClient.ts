import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Helper function to get JWT token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
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
    
    const res = await fetch(queryKey[0] as string, {
      headers: requestHeaders,
      credentials: "include", // Keep this for cookies in case of hybrid auth
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
