import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Link } from 'react-router-dom';
import { useRoomsAdmin } from '../hooks/hooks';
import '../styles/room.css';

const RoomAdmin: React.FC = () => {
  const {
    rooms,
    loading,
    error,
    setError,
    createForm,
    editForm,
    isEditing,
    updateCreateField,
    updateEditField,
    saveRoom,
    startEdit,
    resetEditForm,
    deleteRoom,
  } = useRoomsAdmin();

  const [isModalOpen, setIsModalOpen] = useState(false);
  // Pagination state
  const [page, setPage] = useState(1);
  const ROOMS_PER_PAGE = 5;
  const totalPages = Math.ceil(rooms.length / ROOMS_PER_PAGE);
  const pagedRooms = rooms.slice((page - 1) * ROOMS_PER_PAGE, page * ROOMS_PER_PAGE);

  const openEditModal = (room: any) => {
    setError(null);
    startEdit(room);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setError(null);
    resetEditForm();
    setIsModalOpen(false);
  };

  return (
    <div className="app-layout rooms-page">
      <Sidebar />
      <main className="main-content">
        <div style={{ margin: '1rem 0 2rem 0' }}>
          <Link to="/admin-panel" style={{
            background: '#007bff', color: '#fff', border: 'none', borderRadius: 5, padding: '0.5rem 1.2rem', fontSize: '1rem', textDecoration: 'none', fontWeight: 500, boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
          }}>Go back to Admin Panel</Link>
        </div>
        <div className="events-header">
          <div className="events-header-left">
            <h1>Manage rooms</h1>
            <p className="muted">Create and manage rooms for bookings.</p>
            {loading && <p className="muted">Loading rooms...</p>}
          </div>
        </div>

        <div className={`home-row ${isModalOpen ? 'blurred-background' : ''}`} style={{ marginTop: '1.5rem' }}>
          {/* Left: Create room form */}
          <div className="calendar-container" style={{ maxWidth: '600px' }}>
            <section className="calendar-grid">
              <h2 className="section-title">Create room</h2>
              {error && !isModalOpen && (
                <div className="banner banner-error" role="alert">
                  {error}
                </div>
              )}
              <form
                onSubmit={e => saveRoom('create', e)}
                className="login-form"
                noValidate
              >
                <label htmlFor="room-name">
                  Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  id="room-name"
                  type="text"
                  value={createForm.name}
                  onChange={e => updateCreateField('name', e.target.value)}
                  placeholder="Room name"
                  required
                />

                <label htmlFor="room-location">
                  Location <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  id="room-location"
                  type="text"
                  value={createForm.location}
                  onChange={e => updateCreateField('location', e.target.value)}
                  placeholder="e.g. Floor 3, West Wing"
                  required
                />

                <label htmlFor="room-capacity">
                  Capacity <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  id="room-capacity"
                  type="number"
                  min="1"
                  value={createForm.capacity}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === '' || Number(value) >= 1) {
                      updateCreateField('capacity', value);
                    }
                  }}
                  placeholder="Must be at least 1"
                />
                <div className="form-actions">
                  <button type="submit" className="btn-green" disabled={loading}>
                    {loading ? 'Creating room...' : 'Create room'}
                  </button>
                </div>
              </form>
            </section>
          </div>

          <div className="calendar-container" style={{ maxWidth: '480px' }}>
            <section className="calendar-grid">
              <h2 className="section-title">Existing rooms</h2>
              {rooms.length === 0 && !loading && (
                <p className="muted">No rooms have been created yet.</p>
              )}
              {rooms.length > 0 && (
                <>
                  <div className="room-booking-list">
                    {pagedRooms.map(room => (
                      <div key={room.id} className="room-booking-row">
                      <div className="room-booking-details">
                        <div className="room-booking-room">
                          {room.name} <span style={{color:'#888',fontSize:'0.95em'}}> </span>
                        </div>
                        {room.location && (
                          <div className="room-booking-time">Location: {room.location}</div>
                        )}
                        {room.capacity != null && (
                          <div className="room-booking-time">Capacity: {room.capacity}</div>
                        )}

                      </div>
                      <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                        <button
                          type="button"
                          className="btn-today room-edit-button"
                          style={{ minWidth: 60, padding: '0.4rem 0.8rem' }}
                          onClick={() => openEditModal(room)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-red room-delete-button"
                          style={{ minWidth: 60, padding: '0.4rem 0.8rem' }}
                          onClick={() => deleteRoom(room.id)}
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

        {isModalOpen && (
          <div
            className="room-modal-overlay"
            onClick={e => {
              if (e.target === e.currentTarget) {
                closeModal();
              }
            }}
          >
            <div className="room-modal" onClick={e => e.stopPropagation()}>
              <h2 className="section-title">Edit room</h2>
              {error && (
                <div className="banner banner-error" role="alert" style={{ marginBottom: 12 }}>
                  {error}
                </div>
              )}
              <form
                onSubmit={async e => {
                  const ok = await saveRoom('edit', e);
                  if (ok) {
                    closeModal();
                  }
                }}
                className="login-form"
                noValidate
              >
                <label htmlFor="modal-room-name">
                  Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  id="modal-room-name"
                  type="text"
                  value={editForm.name}
                  onChange={e => updateEditField('name', e.target.value)}
                  placeholder="Room name"
                  required
                />

                <label htmlFor="modal-room-location">
                  Location <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  id="modal-room-location"
                  type="text"
                  value={editForm.location}
                  onChange={e => updateEditField('location', e.target.value)}
                  placeholder="e.g. Floor 3, West Wing"
                  required
                />

                <label htmlFor="modal-room-capacity">
                  Capacity <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  id="modal-room-capacity"
                  type="number"
                  min="1"
                  value={editForm.capacity}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === '' || Number(value) >= 1) {
                      updateEditField('capacity', value);
                    }
                  }}
                  placeholder="Must be at least 1"
                />

                <div className="form-actions">
                  <button type="submit" className="btn-green" disabled={loading}>
                    {loading ? 'Saving room...' : 'Save room'}
                  </button>
                  <button
                    type="button"
                    className="btn-red"
                    onClick={closeModal}
                    disabled={loading}
                  >
                    Cancel
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

export default RoomAdmin;