export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as any),
    },
  });

 // Do NOT globally redirect for login
  const isAuthEndpoint = path.startsWith('/api/auth/login');

  if (!isAuthEndpoint && (response.status === 401 || response.status === 403)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 401 → not logged in
    if (response.status === 401) {
      alert('Your session is invalid. Please log in again.');
      window.location.href = '/login';
    }

    // 403 → forbidden
    if (response.status === 403) {
      window.location.href = '/unauthorized';
    }

    throw new Error('Unauthorized');
  }

  return response;
};