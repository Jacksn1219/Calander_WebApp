import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../config/api';
import { RoomDto, RoomFormState } from '../types/room_types';

// _________________________________________
// functions rooms
// _________________________________________

export const useRoomsAdmin = () => {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<Omit<RoomFormState, 'id'>>({
    roomName: '',
    location: '',
    capacity: ''
  });

  const [editForm, setEditForm] = useState<RoomFormState>({
    id: null,
    roomName: '',
    location: '',
    capacity: ''
  });


  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/rooms');
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to load rooms');
      }
      const data = await res.json();
      const mapped: RoomDto[] = (data || []).map((r: any) => ({
        room_id: r.room_id ?? r.id ?? r.roomId ?? r.RoomId ?? 0,
        roomName: r.room_name ?? r.roomName ?? r.RoomName ?? 'Room',
        capacity: r.capacity ?? r.Capacity ?? null,
        location: r.location ?? r.Location ?? '',
      }));
      setRooms(mapped);
    } catch (e: any) {
      console.error('Error loading rooms', e);
      setError(e.message ?? 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const isEditing = editForm.id != null;

  const resetCreateForm = () => {
    setCreateForm({ roomName: '', location: '', capacity: '' });
  };

  const resetEditForm = () => {
    setEditForm({ id: null, roomName: '', location: '', capacity: '' });
  };

  const startEdit = (room: RoomDto) => {
    setEditForm({
      id: room.room_id,
      roomName: room.roomName,
      location: (room as any).location ?? (room as any).Location ?? '',
      capacity: room.capacity != null ? String(room.capacity) : '',
    });
  };

  const updateCreateField = (field: keyof Omit<RoomFormState, 'id'>, value: string) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };

  const updateEditField = (field: keyof RoomFormState, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const saveRoom = async (
    mode: 'create' | 'edit',
    e?: React.FormEvent
  ): Promise<boolean> => {
    if (e) e.preventDefault();

    const form = mode === 'create'
      ? { ...createForm, id: null }
      : editForm;

    const fail = (reason: string) => {
      const action = mode === 'create' ? 'create' : 'edit';
      setError(`Couldn't ${action} because ${reason}`);
      return false;
    };

    if (!form.roomName.trim()) {
      return fail('room name is required');
    }

    if (!form.location.trim()) {
      return fail('room location is required');
    }

    if (!form.capacity.trim()) {
      return fail('room capacity is required');
    }

    const capacityNumber = form.capacity.trim() ? Number(form.capacity) : null;

    if (capacityNumber != null && (Number.isNaN(capacityNumber) || capacityNumber < 1)) {
      return fail('room capacity must be at least 1');
    }

    const payload: any = {
      roomName: form.roomName.trim(),
      location: form.location.trim(),
      capacity: capacityNumber,
    };

    try {
      setLoading(true);
      setError(null);

      let res: Response;
      if (mode === 'edit' && form.id != null) {
        res = await apiFetch(`/api/rooms/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: form.id, ...payload }),
        });
      } else {
        res = await apiFetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to save room');
      }

      await loadRooms();
      alert(`Room ${mode === 'create' ? 'created' : 'updated'} successfully.`);
      if (mode === 'create') {
        resetCreateForm();
      } else {
        resetEditForm();
      }
      return true;
    } catch (e: any) {
      console.error('Error saving room', e);
      const reason = e?.message || 'failed to save room';
      return fail(reason);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/rooms/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to delete room');
      }
      await loadRooms();
    } catch (e: any) {
      console.error('Error deleting room', e);
      setError(e.message ?? 'Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  return {
    rooms,
    loading,
    error,
    setError,
    createForm,
    editForm,
    isEditing,
    loadRooms,
    resetCreateForm,
    resetEditForm,
    startEdit,
    updateCreateField,
    updateEditField,
    saveRoom,
    deleteRoom,
  };
};
