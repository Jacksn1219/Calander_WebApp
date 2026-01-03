/**
 * User-related types and interfaces
 * Used for authentication, user management, and employee data
 */

export interface User {
  userId?: number;
  name?: string;
  email: string;
  role: 'Admin' | 'User'| 'SuperAdmin';
  token?: string;
}

export interface Employee {
  user_id: number;
  name: string;
  email: string;
}

export interface EmployeeFormState {
  id: number | null;
  name: string;
  email: string;
  role: string;
  password?: string;
  confirmPassword?: string;
}
