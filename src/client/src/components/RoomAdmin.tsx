import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useRoomsAdmin } from '../hooks/hooks';
import '../styles/room.css';

const RoomAdmin: React.FC = () => {
  const {
    rooms,
    loading,
    error,
    createForm,
    editForm,
    isEditing,
    updateCreateField,
    updateEditField,
    saveRoom,
    startEdit,
    resetEditForm,
  } = useRoomsAdmin();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openEditModal = (room: any) => {
    startEdit(room);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    resetEditForm();
    setIsModalOpen(false);
  };

  return (
    <div className="app-layout rooms-page">
      <Sidebar />
      <main className="main-content">
        <div className="events-header">
          <div className="events-header-left">
            <h1>Manage rooms</h1>
            <p className="muted">Create and manage rooms for bookings.</p>
            {loading && <p className="muted">Loading rooms...</p>}
            {error && (
              <div className="calendar-status error">
                <span>{error}</span>
              </div>
            )}
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
                  min="0"
                  value={createForm.capacity}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === '' || Number(value) >= 0) {
                      updateCreateField('capacity', value);
                    }
                  }}
                  placeholder="Optional capacity"
                />

                <label htmlFor="room-description">Description</label>
                <textarea
                  id="room-description"
                  value={createForm.description}
                  onChange={e => updateCreateField('description', e.target.value)}
                  placeholder="Optional description"
                  rows={3}
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
                <div className="room-booking-list">
                  {rooms.map(room => (
                    <div key={room.id} className="room-booking-row">
                      <div className="room-booking-details">
                        <div className="room-booking-room">{room.name}</div>
                        {room.capacity != null && (
                          <div className="room-booking-time">Capacity: {room.capacity}</div>
                        )}
                        {room.description && (
                          <div className="room-booking-time">{room.description}</div>
                        )}
                      </div>
                      <button
                                            type="button"
                      className="btn-today room-edit-button"
                      onClick={() => openEditModal(room)}
                      >
                      Edit
                    </button>
                    </div>
                  ))}
                </div>
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
                <div className="banner banner-error" role="alert">
                  {error}
                </div>
              )}
              <form
                onSubmit={async e => {
                  await saveRoom('edit', e);
                  if (!error) {
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
                  min="0"
                  value={editForm.capacity}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === '' || Number(value) >= 0) {
                      updateEditField('capacity', value);
                    }
                  }}
                  placeholder="Optional capacity"
                />

                <label htmlFor="modal-room-description">Description</label>
                <textarea
                  id="modal-room-description"
                  value={editForm.description}
                  onChange={e => updateEditField('description', e.target.value)}
                  placeholder="Optional description"
                  rows={3}
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