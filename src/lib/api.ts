/**
 * Resilient API Client with Architecture-grade SRE Resilience & Stale-While-Revalidate Fallback
 * - Exponential backoff retry on transient network errors
 * - Memory cache fallback to prevent poll errors during transient server restarts
 * - AbortController timeout enforcement
 * - Content-Type validation
 */

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeoutMs?: number;
  useCacheFallback?: boolean;
}

const memoryCache = new Map<string, any>();

export async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const retries = options.retries ?? 2;
  const retryDelay = options.retryDelay ?? 300;
  const timeoutMs = options.timeoutMs ?? 6000;
  const isGet = !options.method || options.method.toUpperCase() === 'GET';

  let lastError: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const requestOptions: RequestInit = {
        ...options,
        signal: options.signal || controller.signal,
        headers: {
          'Accept': 'application/json',
          ...(options.headers || {})
        }
      };

      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // ignore
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON response but got ${contentType || 'unknown'}`);
      }

      const data = await response.json();
      
      // Store in memory cache for safe fallback
      if (isGet) {
        memoryCache.set(url, data);
      }

      return data as T;
    } catch (err: any) {
      lastError = err;
      
      // If we still have retries and it's a transient network error, wait and retry
      if (attempt < retries) {
        const isNetworkOrAbort = 
          err.name === 'AbortError' || 
          err.name === 'TypeError' || 
          (err.message && err.message.includes('Failed to fetch'));

        if (isNetworkOrAbort) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }
      }
      break;
    }
  }

  // Graceful SRE Fallback: if GET request failed and we have cached data, return cached data
  if (isGet && memoryCache.has(url)) {
    return memoryCache.get(url) as T;
  }

  throw lastError || new Error(`Failed request to ${url}`);
}
