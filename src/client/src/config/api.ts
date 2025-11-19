export const API_BASE = 'http://localhost:3001';

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  return fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...(options.headers as any) } });
};
