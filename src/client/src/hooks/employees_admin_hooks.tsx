import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../config/api';
import { EmployeeFormState } from '../types/user_types';

// Employee management types
interface EmployeeDto {
  id: number;
  name: string;
  email: string;
  role: string;
}

/**
 * Hook for managing employees in the admin panel
 */
export const useEmployeesAdmin = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<Omit<EmployeeFormState, 'id'>>({
    name: '',
    email: '',
    role: 'User',
    password: '',
    confirmPassword: '',
  });

  const [editForm, setEditForm] = useState<EmployeeFormState>({
    id: null,
    name: '',
    email: '',
    role: 'User',
    password: '',
  });

  const canAssignAdminRole = user?.role === 'SuperAdmin';

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/employees');
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to load employees');
      }
      const data = await res.json();
      const mapped: EmployeeDto[] = (data || []).map((emp: any) => ({
        id: emp.user_id ?? emp.Id ?? emp.id ?? 0,
        name: emp.name ?? emp.Name ?? 'Unknown',
        email: emp.email ?? emp.Email ?? '',
        role: emp.role ?? emp.Role ?? 'User',
      }));
      setEmployees(mapped);
    } catch (e: any) {
      console.error('Error loading employees', e);
      setError(e.message ?? 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const isEditing = editForm.id != null;

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      email: '',
      role: 'User',
      password: '',
      confirmPassword: '',
    });
  };

  const resetEditForm = () => {
    setEditForm({
      id: null,
      name: '',
      email: '',
      role: 'User',
      password: '',
    });
  };

  const startEdit = (employee: EmployeeDto) => {
    setEditForm({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      password: '',
    });
  };

  const updateCreateField = (
    field: keyof Omit<EmployeeFormState, 'id'>,
    value: string
  ) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };

  const updateEditField = (field: keyof EmployeeFormState, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const saveEmployee = async (mode: 'create' | 'edit', e?: React.FormEvent): Promise<boolean> => {
    if (e) e.preventDefault();

    const form = mode === 'create' ? { ...createForm, id: null } : editForm;

    const fail = (reason: string) => {
      const action = mode === 'create' ? 'create' : 'edit';
      setError(`Couldn't ${action} because ${reason}`);
      return false;
    };

    if (!form.name.trim()) {
      return fail('full name is required');
    }

    if (!form.email.trim()) {
      return fail('email is required');
    }
    // Validate email format
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(form.email.trim())) {
      return fail('the email address is invalid');
    }
    if (mode === 'create') {
      if (!form.password || form.password.length < 8) {
        return fail('password must be at least 8 characters');
      }

      if (form.password !== form.confirmPassword) {
        return fail('passwords do not match');
      }
    }

    const payload: any = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role || 'User',
    };

    if (mode === 'create') {
      payload.password = form.password;
    } else if (mode === 'edit' && form.password && form.password.trim()) {
      payload.password = form.password.trim();
    }

    try {
      setLoading(true);
      setError(null);

      let res: Response;
      if (mode === 'edit' && form.id != null) {
        res = await apiFetch(`/api/employees/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: form.id, ...payload }),
        });
      } else {
        res = await apiFetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to save employee');
      }

      await loadEmployees();
      if (mode === 'create') {
        resetCreateForm();
      } else {
        resetEditForm();
      }
      return true;
    } catch (e: any) {
      console.error('Error saving employee', e);
      const reason = e?.message || 'failed to save employee';
      return fail(reason);
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to delete employee');
      }
      await loadEmployees();
    } catch (e: any) {
      console.error('Error deleting employee', e);
      setError(e.message ?? 'Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };

  return {
    employees,
    loading,
    error,
    setError,
    createForm,
    editForm,
    isEditing,
    canAssignAdminRole,
    loadEmployees,
    resetCreateForm,
    resetEditForm,
    startEdit,
    updateCreateField,
    updateEditField,
    saveEmployee,
    deleteEmployee,
  };
};
