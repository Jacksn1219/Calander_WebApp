export function isAuthenticated(): boolean {
  try {
    const user = localStorage.getItem('user');
    return !!user;
  } catch {
    return false;
  }
}
