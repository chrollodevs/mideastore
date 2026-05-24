const BASE_URL = import.meta.env.VITE_API_URL || '';
export const API_BASE = `${BASE_URL}/api`;

export function getImageUrl(url) {
  if (!url) return 'https://placehold.co/600x400/png?text=No+Image';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads')) return `${BASE_URL}${url}`;
  return url;
}

export async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    
    // Auto-logout interceptor for expired tokens
    if (response.status === 401 && (error.error === 'Invalid or expired token' || error.error === 'Authentication required')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
      throw new Error('Session expired. Redirecting to login...');
    }

    throw new Error(error.error || 'API Request Failed');
  }

  // Not all endpoints return body (e.g. DELETE)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return null;
}
