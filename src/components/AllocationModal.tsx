'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/components';

type Student = {
  id: string;
  full_name: string;
  email: string;
  mobile_no: string;
};

type Room = {
  id: string;
  room_number: string;
  vertical: string;
  floor: number;
  capacity: number;
  current_occupancy: number;
};

type AllocationModalProps = {
  room: Room;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AllocationModal({ room, onClose, onSuccess }: AllocationModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAvailableStudents();
  }, []);

  const fetchAvailableStudents = async () => {
    try {
      // Fetch approved students who don't have active allocations
      const usersResponse = await fetch('/api/users?role=STUDENT');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();

        // Filter students who don't have active allocations
        const allocationsResponse = await fetch('/api/allocations');
        const allocationsData = await allocationsResponse.json();
        const activeAllocations = new Set(
          (allocationsData.data || [])
            .filter((a: any) => a.status === 'ACTIVE')
            .map((a: any) => a.student_id)
        );

        const availableStudents = (usersData.data || []).filter(
          (user: any) => !activeAllocations.has(user.id)
        );

        setStudents(availableStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch available students');
    }
  };

  const handleAllocate = async () => {
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudent,
          room_id: room.id,
          notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || data.message || 'Failed to allocate room');
      }
    } catch (error) {
      console.error('Error allocating room:', error);
      setError('Failed to allocate room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.full_name?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.mobile_no?.includes(query)
    );
  });

  const selectedStudentData = students.find((s) => s.id === selectedStudent);
  const availableBeds = room.capacity - room.current_occupancy;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-6"
        style={{ background: 'var(--surface-primary)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-heading-2" style={{ color: 'var(--text-primary)' }}>
            Allocate Student to Room
          </h2>
          <button
            onClick={onClose}
            className="text-body hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            ✕
          </button>
        </div>

        {/* Room Info */}
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--surface-secondary)' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                Room Number
              </div>
              <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                {room.room_number}
              </div>
            </div>
            <div>
              <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                Floor
              </div>
              <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                {room.floor}
              </div>
            </div>
            <div>
              <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                Vertical
              </div>
              <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                {room.vertical.replace('_', ' ')}
              </div>
            </div>
            <div>
              <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                Available Beds
              </div>
              <div className="text-body font-medium text-green-600">
                {availableBeds} / {room.capacity}
              </div>
            </div>
          </div>
        </div>

        {/* Student Selection */}
        <div className="mb-4">
          <label className="block text-body font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Select Student
          </label>
          <Input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3"
          />

          <div
            className="border rounded-md max-h-64 overflow-y-auto"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            {filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                {students.length === 0
                  ? 'No available students to allocate'
                  : 'No students found matching your search'}
              </div>
            ) : (
              filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`w-full p-3 text-left border-b hover:bg-opacity-50 ${
                    selectedStudent === student.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    background: selectedStudent === student.id ? 'var(--surface-secondary)' : 'transparent',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                    {student.full_name || student.email}
                  </div>
                  <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    {student.email} • {student.mobile_no}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-body font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any special notes or instructions..."
            rows={3}
            className="w-full px-3 py-2 rounded-md border"
            style={{
              borderColor: 'var(--border-primary)',
              background: 'var(--surface-secondary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Confirmation Summary */}
        {selectedStudentData && (
          <div className="mb-6 p-4 rounded-lg border-l-4 border-blue-500" style={{ background: 'var(--surface-secondary)' }}>
            <div className="text-body-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Allocation Summary
            </div>
            <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
              Allocating <strong style={{ color: 'var(--text-primary)' }}>{selectedStudentData.full_name}</strong> to{' '}
              <strong style={{ color: 'var(--text-primary)' }}>Room {room.room_number}</strong> (Floor {room.floor})
            </div>
            <div className="text-body-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              After allocation: {room.current_occupancy + 1} / {room.capacity} beds occupied
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-body-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={onClose} fullWidth disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleAllocate}
            fullWidth
            loading={loading}
            disabled={!selectedStudent || loading}
          >
            {loading ? 'Allocating...' : 'Confirm Allocation'}
          </Button>
        </div>
      </div>
    </div>
  );
}
