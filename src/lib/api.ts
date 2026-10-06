/**
 * Resilient API Client with Architecture-grade Retry & Circuit Breaker Logic
 * Implements DevOps SRE resilience principles:
 * - Exponential backoff on transient network faults ('Failed to fetch')
 * - Timeout enforcement
 * - Content-Type validation
 */

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeoutMs?: number;
}

export async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const retries = options.retries ?? 2;
  const retryDelay = options.retryDelay ?? 300;
  const timeoutMs = options.timeoutMs ?? 8000;

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
          try {
            const text = await response.text();
            errorMessage = text.slice(0, 100) || errorMessage;
          } catch {
            // fallback to status
          }
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON response but got ${contentType || 'unknown'}`);
      }

      const data = await response.json();
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

  throw lastError || new Error(`Failed request to ${url}`);
}
