export const SUPER_ADMIN_EMAIL = 'bart@test.com';
export const SUPER_ADMIN_PASSWORD = '1234';

export const isSuperAdminEmail = (email?: string | null): boolean => {
  if (!email) {
    return false;
  }
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL;
};

export const isSuperAdmin = (email?: string | null, password?: string | null): boolean => {
  if (!email || !password) {
    return false;
  }

  const matchesEmail = isSuperAdminEmail(email);
  const matchesPassword = password === SUPER_ADMIN_PASSWORD;

  return matchesEmail && matchesPassword;
};
