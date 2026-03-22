'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components';

// Types
type Allocation = {
  id: string;
  student_id: string;
  room_id: string;
  allocated_at: string;
  status: 'ACTIVE' | 'VACATED';
  check_in_confirmed: boolean;
  check_in_confirmed_at?: string;
  notes?: string;
};

type Room = {
  id: string;
  room_number: string;
  vertical: string;
  floor: number;
  capacity: number;
  current_occupancy: number;
  amenities?: string[];
};

type Roommate = {
  id: string;
  full_name: string;
  bed_number: number;
  check_in_confirmed: boolean;
};

export default function StudentRoomPage() {
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock student ID - in production, get from auth session
  const studentId = 'student1';

  useEffect(() => {
    fetchAllocationData();
  }, []);

  const fetchAllocationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch student's allocation
      const allocationsResponse = await fetch('/api/allocations');
      const allocationsData = await allocationsResponse.json();

      const studentAllocation = (allocationsData.data || []).find(
        (a: Allocation) => a.student_id === studentId && a.status === 'ACTIVE'
      );

      if (!studentAllocation) {
        setError('No room allocation found. Please contact the administrator.');
        setLoading(false);
        return;
      }

      setAllocation(studentAllocation);

      // Fetch room details
      const roomsResponse = await fetch('/api/rooms');
      const roomsData = await roomsResponse.json();
      const roomData = (roomsData.data || []).find((r: Room) => r.id === studentAllocation.room_id);

      if (roomData) {
        setRoom(roomData);
      }

      // Fetch roommates (other students in the same room)
      const allRoomAllocations = (allocationsData.data || []).filter(
        (a: Allocation) => a.room_id === studentAllocation.room_id && a.status === 'ACTIVE'
      );

      const roommatesData = await Promise.all(
        allRoomAllocations
          .filter((a: Allocation) => a.student_id !== studentId)
          .map(async (allocation: Allocation, index: number) => {
            try {
              const response = await fetch(`/api/users/profile?user_id=${allocation.student_id}`);
              if (response.ok) {
                const data = await response.json();
                return {
                  id: allocation.student_id,
                  full_name: data.profile?.full_name || 'Student',
                  bed_number: index + 2,
                  check_in_confirmed: allocation.check_in_confirmed || false,
                };
              }
            } catch (err) {
              console.error('Error fetching roommate:', err);
            }
            return {
              id: allocation.student_id,
              full_name: 'Student',
              bed_number: index + 2,
              check_in_confirmed: allocation.check_in_confirmed || false,
            };
          })
      );

      setRoommates(roommatesData);
    } catch (err) {
      console.error('Error fetching allocation data:', err);
      setError('Failed to load room information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInClick = () => {
    // Navigate to check-in confirmation page (to be implemented)
    window.location.href = '/dashboard/student/room/check-in';
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="text-heading-3 mb-2" style={{ color: 'var(--text-primary)' }}>
            Loading...
          </div>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            Fetching your room details
          </p>
        </div>
      </div>
    );
  }

  if (error || !allocation || !room) {
    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="p-6 rounded-lg border border-red-200 bg-red-50">
            <h2 className="text-heading-3 text-red-700 mb-2">Unable to Load Room Information</h2>
            <p className="text-body text-red-600">{error || 'Room information not available'}</p>
            <Button variant="primary" size="md" onClick={fetchAllocationData} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const availableAmenities = room.amenities || ['Bed', 'Study Table', 'Cupboard', 'Chair', 'Ceiling Fan'];
  const checkInStatus = allocation.check_in_confirmed ? 'Confirmed' : 'Pending';

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-heading-1 mb-2" style={{ color: 'var(--text-primary)' }}>
            My Room
          </h1>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            View your room details and check-in status
          </p>
        </div>

        {/* Check-in Status Banner */}
        {!allocation.check_in_confirmed && (
          <div className="mb-6 p-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-heading-4 text-yellow-800 mb-1">Check-in Required</h3>
                <p className="text-body-sm text-yellow-700">
                  You have been allocated a room. Please complete your check-in to confirm your occupancy.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={handleCheckInClick}>
                Check In Now
              </Button>
            </div>
          </div>
        )}

        {allocation.check_in_confirmed && (
          <div className="mb-6 p-4 rounded-lg border-l-4 border-green-500 bg-green-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-heading-4 text-green-800 mb-1">Check-in Confirmed</h3>
                <p className="text-body-sm text-green-700">
                  You checked in on {new Date(allocation.check_in_confirmed_at!).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-2xl">✓</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Details Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
              <h2 className="text-heading-2 mb-4" style={{ color: 'var(--text-primary)' }}>
                Room Details
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-body-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Room Number
                  </div>
                  <div className="text-heading-3" style={{ color: 'var(--text-primary)' }}>
                    {room.room_number}
                  </div>
                </div>

                <div>
                  <div className="text-body-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Floor
                  </div>
                  <div className="text-heading-3" style={{ color: 'var(--text-primary)' }}>
                    {room.floor}
                  </div>
                </div>

                <div>
                  <div className="text-body-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Vertical
                  </div>
                  <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                    {room.vertical.replace('_', ' ')}
                  </div>
                </div>

                <div>
                  <div className="text-body-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Capacity
                  </div>
                  <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                    {room.capacity} beds
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="text-body-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Allocated On
                  </div>
                  <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                    {new Date(allocation.allocated_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-heading-4 mb-3" style={{ color: 'var(--text-primary)' }}>
                  Room Amenities
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {availableAmenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded"
                      style={{ background: 'var(--surface-secondary)' }}
                    >
                      <span className="text-green-600">✓</span>
                      <span className="text-body-sm" style={{ color: 'var(--text-primary)' }}>
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {allocation.notes && (
                <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--surface-secondary)' }}>
                  <h3 className="text-body font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Special Notes
                  </h3>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    {allocation.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Roommates Card */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-lg sticky top-6" style={{ background: 'var(--surface-primary)' }}>
              <h2 className="text-heading-3 mb-4" style={{ color: 'var(--text-primary)' }}>
                Roommates
              </h2>

              {roommates.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🚪</div>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    No other roommates yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {roommates.map((roommate) => (
                    <div
                      key={roommate.id}
                      className="p-3 rounded-lg border"
                      style={{
                        background: 'var(--surface-secondary)',
                        borderColor: 'var(--border-primary)',
                      }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                          {roommate.full_name}
                        </div>
                        {roommate.check_in_confirmed && (
                          <span className="text-green-600 text-sm">✓</span>
                        )}
                      </div>
                      <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                        Bed {roommate.bed_number}
                      </div>
                      <div className="text-body-sm mt-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs ${
                            roommate.check_in_confirmed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {roommate.check_in_confirmed ? 'Checked In' : 'Not Checked In'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Room Occupancy */}
              <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="text-body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Room Occupancy
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--surface-secondary)' }}>
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${(room.current_occupancy / room.capacity) * 100}%` }}
                    />
                  </div>
                  <div className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {room.current_occupancy} / {room.capacity}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          {!allocation.check_in_confirmed && (
            <Button variant="primary" size="md" onClick={handleCheckInClick}>
              Complete Check-in
            </Button>
          )}
          <Button variant="secondary" size="md" onClick={fetchAllocationData}>
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
}
