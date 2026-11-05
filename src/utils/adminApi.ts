/**
 * Client-side helper for authenticated admin API requests.
 * Attaches the Bearer token from localStorage and credentials: 'include'
 * for resilient session management across all browsers, iframes, and deployments.
 */

export function getAdminAuthHeaders(customHeaders?: HeadersInit): Headers {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cozybite_admin_token') : null;
  const headers = new Headers(customHeaders || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = getAdminAuthHeaders(init?.headers);
  return fetch(input, {
    ...init,
    headers,
    credentials: init?.credentials || 'include',
  });
}
