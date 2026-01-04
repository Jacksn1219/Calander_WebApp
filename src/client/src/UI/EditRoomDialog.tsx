import React from 'react';
import { RoomFormState } from '../hooks/hooks';
import '../styles/room.css';

interface EditRoomDialogProps {
  onClose: () => void;
  editForm: RoomFormState;
  updateEditField: (field: keyof RoomFormState, value: string) => void;
  saveRoom: (mode: 'edit', e: React.FormEvent) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const EditRoomDialog: React.FC<EditRoomDialogProps> = ({
  onClose,
  editForm,
  updateEditField,
  saveRoom,
  loading,
  error,
}) => {
  return (
    <div
      className="room-modal-overlay"
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
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
              onClose();
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
            value={editForm.roomName}
            onChange={e => updateEditField('roomName', e.target.value)}
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
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoomDialog;
