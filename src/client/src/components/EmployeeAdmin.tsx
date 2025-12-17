import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { useEmployeesAdmin } from '../hooks/hooks';
import '../styles/employee-panel.css';

const EmployeeAdmin: React.FC = () => {
  const navigate = useNavigate();
  const {
    employees,
    loading,
    error,
    createForm,
    editForm,
    isEditing,
    updateCreateField,
    updateEditField,
    saveEmployee,
    startEdit,
    resetEditForm,
    setError,
    deleteEmployee,
    canAssignAdminRole,
  } = useEmployeesAdmin();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const EMPLOYEES_PER_PAGE = 5;
  const visibleEmployees = employees.filter(e => {
    // SuperAdmin can manage Admins and Users; hide SuperAdmins
    // Admins can manage only Users; hide Admins and SuperAdmins
    return canAssignAdminRole ? (e.role !== 'SuperAdmin') : (e.role !== 'Admin' && e.role !== 'SuperAdmin');
  });
  const totalPages = Math.ceil(visibleEmployees.length / EMPLOYEES_PER_PAGE);
  const pagedEmployees = visibleEmployees.slice((page - 1) * EMPLOYEES_PER_PAGE, page * EMPLOYEES_PER_PAGE);

  const openEditModal = (employee: any) => {
    setError(null);
    startEdit(employee);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setError(null);
    resetEditForm();
    setIsModalOpen(false);
    setShowEditPassword(false);
  };

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
    <div className="app-layout employee-panel-page">
      <Sidebar />
      <main className="main-content">
        <div style={{ marginBottom: 16 }}>
          <button
            className="btn-today"
            style={{ minWidth: 180, height: 40 }}
            onClick={() => navigate('/admin-panel')}
          >
            Go Back to Admin Panel
          </button>
        </div>
        
        <div className="events-header">
          <div className="events-header-left">
            <h1>Manage employees</h1>
            <p className="muted">Create and manage employee accounts.</p>
            {loading && <p className="muted">Loading employees...</p>}
               
          </div>
        </div>

        <div className={`home-row ${isModalOpen ? 'blurred-background' : ''}`} style={{ marginTop: '1.5rem' }}>
          {/* Left: Create employee form */}
          <div className="calendar-container" style={{ maxWidth: '600px' }}>
            <section className="calendar-grid">
              <h2 className="section-title">Add employee</h2>
              {error && !isModalOpen && !isEditing && (
              <div className="calendar-status error">
                <span>{error}</span>
              </div>
            )}
              <form
                onSubmit={e => saveEmployee('create', e)}
                className="login-form"
                noValidate
              >
                <label htmlFor="employee-name">
                  Full Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  id="employee-name"
                  type="text"
                  value={createForm.name}
                  onChange={e => updateCreateField('name', e.target.value)}
                  placeholder="John Doe"
                  required
                />

                <label htmlFor="employee-email">
                  Email <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  id="employee-email"
                  type="email"
                  value={createForm.email}
                  onChange={e => updateCreateField('email', e.target.value)}
                  placeholder="you@domain.com"
                  autoComplete="email"
                  required
                />

                {canAssignAdminRole && (
                  <>
                    <label htmlFor="employee-role">Role</label>
                    <select
                      id="employee-role"
                      value={createForm.role}
                      onChange={e => updateCreateField('role', e.target.value)}
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </>
                )}

                <label htmlFor="employee-password">
                  Temporary Password <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div className="password-input-container">
                  <input
                    id="employee-password"
                    type={showPassword ? 'text' : 'password'}
                    value={createForm.password}
                    onChange={e => updateCreateField('password', e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                  />
                  <PasswordToggle
                    show={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                    ariaLabel={showPassword ? 'Hide password' : 'Show password'}
                  />
                </div>

                <label htmlFor="employee-confirm-password">
                  Confirm Password <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div className="password-input-container">
                  <input
                    id="employee-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={createForm.confirmPassword}
                    onChange={e => updateCreateField('confirmPassword', e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                  />
                  <PasswordToggle
                    show={showConfirmPassword}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    ariaLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-green" disabled={loading}>
                    {loading ? 'Creating employee...' : 'Create employee'}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Right: Existing employees list */}
          <div className="calendar-container" style={{ maxWidth: '480px' }}>
            <section className="calendar-grid">
              <h2 className="section-title">Existing employees</h2>
              {visibleEmployees.length === 0 && !loading && (
                <p className="muted">No employees have been created yet.</p>
              )}
              {visibleEmployees.length > 0 && (
                <>
                  <div className="employee-list">
                    {pagedEmployees.map(employee => (
                      <div key={employee.id} className="employee-row">
                        <div className="employee-details">
                          <div className="employee-name">
                            {employee.name}
                          </div>
                          <div className="employee-email">{employee.email}</div>
                          <div className="employee-role">Role: {employee.role}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                          <button
                            type="button"
                            className="btn-today employee-edit-button"
                            style={{ minWidth: 60, padding: '0.4rem 0.8rem' }}
                            onClick={() => openEditModal(employee)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-red employee-delete-button"
                            style={{ minWidth: 60, padding: '0.4rem 0.8rem' }}
                            onClick={() => deleteEmployee(employee.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, gap: 8 }}>
                    <button
                      type="button"
                      className="btn-today"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      style={{ minWidth: 80 }}
                    >
                      Previous
                    </button>
                    <span style={{ alignSelf: 'center', color: '#333', fontWeight: 500 }}>
                      Page {page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn-today"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      style={{ minWidth: 80 }}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>

        {/* Edit Modal */}
        {isModalOpen && (
          <div
            className="employee-modal-overlay"
            onClick={closeModal}
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
                  if (ok) closeModal();
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
                  <button type="button" className="btn-red" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-blue" disabled={loading}>
                    {loading ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeAdmin;
