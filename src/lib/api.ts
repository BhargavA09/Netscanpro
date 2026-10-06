export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // If not JSON, try to get text
      try {
        const text = await response.text();
        errorMessage = text.slice(0, 100) || errorMessage;
      } catch (e2) {
        // Ignore
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
}
