import React, { useState } from 'react';
import { EmployeeFormState } from '../hooks/hooks';
import '../styles/employee-panel.css';

interface EditEmployeeDialogProps {
  onClose: () => void;
  editForm: EmployeeFormState;
  updateEditField: (field: keyof EmployeeFormState, value: string) => void;
  saveEmployee: (mode: 'edit', e: React.FormEvent) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  canAssignAdminRole: boolean;
}

const EditEmployeeDialog: React.FC<EditEmployeeDialogProps> = ({
  onClose,
  editForm,
  updateEditField,
  saveEmployee,
  loading,
  error,
  canAssignAdminRole,
}) => {
  const [showEditPassword, setShowEditPassword] = useState(false);

  const PasswordToggle = ({
    show,
    onClick,
    ariaLabel,
  }: {
    show: boolean;
    onClick: () => void;
    ariaLabel: string;
  }) => (
    <button
      type="button"
      className="password-toggle"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {show ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );

  return (
    <div
      className="employee-modal-overlay"
      onClick={onClose}
    >
      <div
        className="employee-modal"
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>Edit employee</h2>
        {error && (
          <div className="banner banner-error" role="alert" style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}
        <form
          onSubmit={async e => {
            const ok = await saveEmployee('edit', e);
            if (ok) onClose();
          }}
          className="login-form"
          noValidate
        >
          <label htmlFor="edit-employee-name">
            Full Name <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            id="edit-employee-name"
            type="text"
            value={editForm.name}
            onChange={e => updateEditField('name', e.target.value)}
            placeholder="John Doe"
            required
          />

          <label htmlFor="edit-employee-email">
            Email <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            id="edit-employee-email"
            type="email"
            value={editForm.email}
            onChange={e => updateEditField('email', e.target.value)}
            placeholder="you@domain.com"
            required
          />

          {canAssignAdminRole && (
            <>
              <label htmlFor="edit-employee-role">Role</label>
              <select
                id="edit-employee-role"
                value={editForm.role}
                onChange={e => updateEditField('role', e.target.value)}
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </>
          )}

          <label htmlFor="edit-employee-password">
            New Password (leave blank to keep current)
          </label>
          <div className="password-input-container">
            <input
              id="edit-employee-password"
              type={showEditPassword ? 'text' : 'password'}
              value={editForm.password || ''}
              onChange={e => updateEditField('password', e.target.value)}
              placeholder="Leave blank to keep current"
              autoComplete="new-password"
            />
            <PasswordToggle
              show={showEditPassword}
              onClick={() => setShowEditPassword(!showEditPassword)}
              ariaLabel={showEditPassword ? 'Hide password' : 'Show password'}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-red" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-blue" disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeDialog;
