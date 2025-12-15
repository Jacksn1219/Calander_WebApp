export const API_BASE = 'http://localhost:3001';

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

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/unauthorized';
    throw new Error('Unauthorized');
  }

  return response;
};
