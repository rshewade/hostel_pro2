'use client';

import { useState } from 'react';
import { Input } from '@/components/forms/Input';
import { DatePicker } from '@/components/forms/DatePicker';
import { Select, type SelectOption } from '@/components/forms/Select';
import { Toggle } from '@/components/forms/Toggle';
import { Checkbox } from '@/components/forms/Checkbox';
import { Textarea } from '@/components/forms/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Modal } from '@/components/feedback/Modal';
import { cn } from '@/components/utils';

// Types
type Vertical = 'BOYS' | 'GIRLS' | 'DHARAMSHALA';

interface LeaveType {
  id: string;
  name: string;
  maxDaysPerMonth: number;
  maxDaysPerSemester: number;
  requiresApproval: boolean;
  allowedVerticals: Vertical[];
  active: boolean;
}

interface BlackoutDate {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  verticals: Vertical[];
  reason: string;
}

interface NotificationRule {
  id: string;
  eventType: 'LEAVE_APPLICATION' | 'LEAVE_APPROVAL' | 'LEAVE_REJECTION' | 'EMERGENCY' | 'ARRIVAL' | 'DEPARTURE';
  timing: 'IMMEDIATE' | 'BEFORE_1H' | 'BEFORE_6H' | 'BEFORE_24H' | 'DAILY';
  channels: {
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
  };
  verticals: Vertical[];
  template: string;
  active: boolean;
}

export default function SuperintendentConfig() {
  const [selectedTab, setSelectedTab] = useState<'leave' | 'notification'>('leave');
  const [selectedVertical] = useState<Vertical | 'ALL'>('ALL');

  // Leave Configuration State
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([
    {
      id: '1',
      name: 'Sick Leave',
      maxDaysPerMonth: 3,
      maxDaysPerSemester: 10,
      requiresApproval: false,
      allowedVerticals: ['BOYS', 'GIRLS', 'DHARAMSHALA'],
      active: true
    },
    {
      id: '2',
      name: 'Casual Leave',
      maxDaysPerMonth: 2,
      maxDaysPerSemester: 8,
      requiresApproval: true,
      allowedVerticals: ['BOYS', 'GIRLS'],
      active: true
    },
    {
      id: '3',
      name: 'Emergency Leave',
      maxDaysPerMonth: 5,
      maxDaysPerSemester: 15,
      requiresApproval: true,
      allowedVerticals: ['BOYS', 'GIRLS', 'DHARAMSHALA'],
      active: true
    },
    {
      id: '4',
      name: 'Home Visit',
      maxDaysPerMonth: 4,
      maxDaysPerSemester: 12,
      requiresApproval: true,
      allowedVerticals: ['BOYS', 'GIRLS'],
      active: true
    }
  ]);

  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>([
    {
      id: '1',
      name: 'Exam Period - Semester 2',
      startDate: '2025-04-15',
      endDate: '2025-05-15',
      verticals: ['BOYS', 'GIRLS'],
      reason: 'Final examinations'
    },
    {
      id: '2',
      name: 'Festival Season - Diwali',
      startDate: '2025-10-18',
      endDate: '2025-10-25',
      verticals: ['BOYS', 'GIRLS', 'DHARAMSHALA'],
      reason: 'Festival period'
    }
  ]);

  // Notification Configuration State
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([
    {
      id: '1',
      eventType: 'LEAVE_APPLICATION',
      timing: 'IMMEDIATE',
      channels: { sms: true, whatsapp: true, email: false },
      verticals: ['BOYS', 'GIRLS', 'DHARAMSHALA'],
      template: 'Your child {{student_name}} has applied for leave from {{start_date}} to {{end_date}}.',
      active: true
    },
    {
      id: '2',
      eventType: 'LEAVE_APPROVAL',
      timing: 'IMMEDIATE',
      channels: { sms: true, whatsapp: true, email: true },
      verticals: ['BOYS', 'GIRLS', 'DHARAMSHALA'],
      template: 'Leave application for {{student_name}} from {{start_date}} to {{end_date}} has been APPROVED.',
      active: true
    },
    {
      id: '3',
      eventType: 'LEAVE_REJECTION',
      timing: 'IMMEDIATE',
      channels: { sms: true, whatsapp: true, email: true },
      verticals: ['BOYS', 'GIRLS', 'DHARAMSHALA'],
      template: 'Leave application for {{student_name}} from {{start_date}} to {{end_date}} has been REJECTED. Reason: {{reason}}.',
      active: true
    },
    {
      id: '4',
      eventType: 'EMERGENCY',
      timing: 'IMMEDIATE',
      channels: { sms: true, whatsapp: true, email: true },
      verticals: ['BOYS', 'GIRLS', 'DHARAMSHALA'],
      template: 'URGENT: {{student_name}} - {{emergency_type}}. Contact Superintendent immediately.',
      active: true
    }
  ]);

  // Modal states
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  const [addingBlackoutDate, setAddingBlackoutDate] = useState(false);
  const [editingNotificationRule, setEditingNotificationRule] = useState<NotificationRule | null>(null);

  // Event type options
  const eventTypeOptions: SelectOption[] = [
    { value: 'LEAVE_APPLICATION', label: 'Leave Application' },
    { value: 'LEAVE_APPROVAL', label: 'Leave Approval' },
    { value: 'LEAVE_REJECTION', label: 'Leave Rejection' },
    { value: 'EMERGENCY', label: 'Emergency' },
    { value: 'ARRIVAL', label: 'Arrival' },
    { value: 'DEPARTURE', label: 'Departure' }
  ];

  const timingOptions: SelectOption[] = [
    { value: 'IMMEDIATE', label: 'Immediate' },
    { value: 'BEFORE_1H', label: '1 Hour Before' },
    { value: 'BEFORE_6H', label: '6 Hours Before' },
    { value: 'BEFORE_24H', label: '24 Hours Before' },
    { value: 'DAILY', label: 'Daily Summary' }
  ];

  const verticalOptions: SelectOption[] = [
    { value: 'BOYS', label: 'Boys Hostel' },
    { value: 'GIRLS', label: 'Girls Ashram' },
    { value: 'DHARAMSHALA', label: 'Dharamshala' }
  ];

  return (
    <div style={{ background: 'var(--bg-page)' }} className="min-h-screen">
      {/* Header */}
      <header className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Superintendent Configuration
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--bg-accent)', color: 'var(--text-on-accent)' }}>
              {selectedVertical === 'ALL' ? 'All Verticals' : selectedVertical}
            </span>
          </div>
          <Button variant="ghost" size="sm">
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="mx-auto max-w-7xl border-b" style={{ borderColor: 'var(--border-gray-200)' }}>
        <div className="flex gap-8 px-6">
          <button
            className={cn(
              'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
              selectedTab === 'leave'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
            style={{
              borderColor: selectedTab === 'leave' ? 'var(--border-primary)' : 'transparent',
              color: selectedTab === 'leave' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setSelectedTab('leave')}
          >
            Leave Configuration
          </button>
          <button
            className={cn(
              'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
              selectedTab === 'notification'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
            style={{
              borderColor: selectedTab === 'notification' ? 'var(--border-primary)' : 'transparent',
              color: selectedTab === 'notification' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setSelectedTab('notification')}
          >
            Parent Notification Rules
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {selectedTab === 'leave' && (
          <div className="space-y-8">
            {/* Leave Types Configuration */}
            <div className="p-6 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Leave Types
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure different types of leaves with approval rules and duration limits
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setEditingLeaveType({
                    id: '',
                    name: '',
                    maxDaysPerMonth: 0,
                    maxDaysPerSemester: 0,
                    requiresApproval: false,
                    allowedVerticals: ['BOYS', 'GIRLS', 'DHARAMSHALA'],
                    active: true
                  })}
                >
                  Add Leave Type
                </Button>
              </div>

              <div className="grid gap-4">
                {leaveTypes.map((leaveType) => (
                  <div
                    key={leaveType.id}
                    className="p-4 rounded border"
                    style={{
                      borderColor: 'var(--border-gray-200)',
                      background: 'var(--bg-page)',
                      opacity: leaveType.active ? 1 : 0.5
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {leaveType.name}
                          </h3>
                          {!leaveType.active && (
                            <Badge variant="warning" size="sm">Inactive</Badge>
                          )}
                          {leaveType.requiresApproval && (
                            <Badge variant="info" size="sm">Requires Approval</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <label className="text-gray-600">Max Days/Month</label>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {leaveType.maxDaysPerMonth}
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-600">Max Days/Semester</label>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {leaveType.maxDaysPerSemester}
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-600">Approval Required</label>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {leaveType.requiresApproval ? 'Yes' : 'No'}
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-600">Allowed Verticals</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {leaveType.allowedVerticals.map((v) => (
                                <Chip
                                  key={v}
                                  variant="default"
                                  size="sm"
                                >
                                  {v}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingLeaveType(leaveType)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setLeaveTypes(leaveTypes.map(lt =>
                              lt.id === leaveType.id ? { ...lt, active: !lt.active } : lt
                            ));
                          }}
                        >
                          {leaveType.active ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blackout Dates Configuration */}
            <div className="p-6 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Blackout Dates
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Periods when leaves are not allowed (e.g., exam periods, festivals)
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setAddingBlackoutDate(true)}
                >
                  Add Blackout Period
                </Button>
              </div>

              <div className="grid gap-4">
                {blackoutDates.map((blackoutDate) => (
                  <div
                    key={blackoutDate.id}
                    className="p-4 rounded border"
                    style={{
                      borderColor: 'var(--border-gray-200)',
                      background: 'var(--bg-page)'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          {blackoutDate.name}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <label className="text-gray-600">Start Date</label>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {blackoutDate.startDate}
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-600">End Date</label>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {blackoutDate.endDate}
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-600">Applies To</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {blackoutDate.verticals.map((v) => (
                                <Chip
                                  key={v}
                                  variant="default"
                                  size="sm"
                                >
                                  {v}
                                </Chip>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-gray-600">Reason</label>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {blackoutDate.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            // Edit functionality
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setBlackoutDates(blackoutDates.filter(bd => bd.id !== blackoutDate.id));
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'notification' && (
          <div className="space-y-8">
            {/* Notification Rules Configuration */}
            <div className="p-6 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Parent Notification Rules
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure when and how parents are notified about student activities
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setEditingNotificationRule({
                    id: '',
                    eventType: 'LEAVE_APPLICATION',
                    timing: 'IMMEDIATE',
                    channels: { sms: true, whatsapp: true, email: false },
                    verticals: ['BOYS', 'GIRLS', 'DHARAMSHALA'],
                    template: '',
                    active: true
                  })}
                >
                  Add Notification Rule
                </Button>
              </div>

              <div className="grid gap-4">
                {notificationRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded border"
                    style={{
                      borderColor: 'var(--border-gray-200)',
                      background: 'var(--bg-page)',
                      opacity: rule.active ? 1 : 0.5
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {eventTypeOptions.find(opt => opt.value === rule.eventType)?.label || rule.eventType}
                          </h3>
                          {!rule.active && (
                            <Badge variant="warning" size="sm">Inactive</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                          <div>
                            <label className="text-gray-600">Timing</label>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {timingOptions.find(opt => opt.value === rule.timing)?.label || rule.timing}
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-600">Channels</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {rule.channels.sms && <Chip variant="success" size="sm">SMS</Chip>}
                              {rule.channels.whatsapp && <Chip variant="success" size="sm">WhatsApp</Chip>}
                              {rule.channels.email && <Chip variant="success" size="sm">Email</Chip>}
                            </div>
                          </div>
                          <div>
                            <label className="text-gray-600">Applies To</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {rule.verticals.map((v) => (
                                <Chip
                                  key={v}
                                  variant="default"
                                  size="sm"
                                >
                                  {v}
                                </Chip>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-gray-600">Status</label>
                            <Badge
                              variant={rule.active ? 'success' : 'warning'}
                              size="sm"
                              className="mt-1"
                            >
                              {rule.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-gray-600">Message Template</label>
                          <div className="p-3 rounded mt-1 text-sm font-mono" style={{
                            background: 'var(--bg-page)',
                            color: 'var(--text-primary)'
                          }}>
                            {rule.template}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingNotificationRule(rule)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setNotificationRules(notificationRules.map(nr =>
                              nr.id === rule.id ? { ...nr, active: !nr.active } : nr
                            ));
                          }}
                        >
                          {rule.active ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Leave Type Modal */}
      <Modal
        isOpen={editingLeaveType !== null}
        onClose={() => setEditingLeaveType(null)}
        title={editingLeaveType?.id ? 'Edit Leave Type' : 'Add Leave Type'}
        size="lg"
        onConfirm={() => {
          // Save logic here
          setEditingLeaveType(null);
        }}
        confirmText="Save"
      >
        {editingLeaveType && (
          <div className="space-y-4">
            <Input
              label="Leave Type Name"
              value={editingLeaveType.name}
              onChange={(e) => setEditingLeaveType({ ...editingLeaveType, name: e.target.value })}
              placeholder="e.g., Sick Leave"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Max Days Per Month"
                value={String(editingLeaveType.maxDaysPerMonth)}
                onChange={(e) => setEditingLeaveType({ ...editingLeaveType, maxDaysPerMonth: Number(e.target.value) })}
                required
              />
              <Input
                type="number"
                label="Max Days Per Semester"
                value={String(editingLeaveType.maxDaysPerSemester)}
                onChange={(e) => setEditingLeaveType({ ...editingLeaveType, maxDaysPerSemester: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Allowed Verticals</label>
              <div className="flex gap-6">
                {(['BOYS', 'GIRLS', 'DHARAMSHALA'] as Vertical[]).map((vertical) => (
                  <Checkbox
                    key={vertical}
                    label={vertical}
                    checked={editingLeaveType.allowedVerticals.includes(vertical)}
                    onChange={(checked) => {
                      const updatedVerticals = checked
                        ? [...editingLeaveType.allowedVerticals, vertical]
                        : editingLeaveType.allowedVerticals.filter(v => v !== vertical);
                      setEditingLeaveType({ ...editingLeaveType, allowedVerticals: updatedVerticals });
                    }}
                  />
                ))}
              </div>
            </div>

            <Toggle
              label="Requires Approval"
              checked={editingLeaveType.requiresApproval}
              onChange={(checked) => setEditingLeaveType({ ...editingLeaveType, requiresApproval: checked })}
              helperText="If enabled, leave applications of this type require superintendent approval"
            />
          </div>
        )}
      </Modal>

      {/* Blackout Date Modal */}
      <Modal
        isOpen={addingBlackoutDate}
        onClose={() => setAddingBlackoutDate(false)}
        title="Add Blackout Period"
        size="lg"
        onConfirm={() => {
          setAddingBlackoutDate(false);
        }}
        confirmText="Add"
      >
        <div className="space-y-4">
          <Input
            label="Period Name"
            placeholder="e.g., Exam Period - Semester 2"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label="Start Date"
              required
            />
            <DatePicker
              label="End Date"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Applies To Verticals</label>
            <div className="flex gap-6">
              {(['BOYS', 'GIRLS', 'DHARAMSHALA'] as Vertical[]).map((vertical) => (
                <Checkbox
                  key={vertical}
                  label={vertical}
                  defaultChecked={true}
                />
              ))}
            </div>
          </div>

          <Textarea
            label="Reason"
            placeholder="e.g., Final examinations, festival period, etc."
            required
          />
        </div>
      </Modal>

      {/* Notification Rule Modal */}
      <Modal
        isOpen={editingNotificationRule !== null}
        onClose={() => setEditingNotificationRule(null)}
        title={editingNotificationRule?.id ? 'Edit Notification Rule' : 'Add Notification Rule'}
        size="xl"
        onConfirm={() => {
          // Save logic here
          setEditingNotificationRule(null);
        }}
        confirmText="Save"
      >
        {editingNotificationRule && (
          <div className="space-y-4">
            <Select
              label="Event Type"
              options={eventTypeOptions}
              value={editingNotificationRule.eventType}
              onChange={(e) => setEditingNotificationRule({
                ...editingNotificationRule,
                eventType: e.target.value as any
              })}
              required
            />

            <Select
              label="Notification Timing"
              options={timingOptions}
              value={editingNotificationRule.timing}
              onChange={(e) => setEditingNotificationRule({
                ...editingNotificationRule,
                timing: e.target.value as any
              })}
              required
              helperText="When should the notification be sent?"
            />

            <div className="space-y-3">
              <label className="text-sm font-medium">Notification Channels</label>
              <div className="flex gap-6">
                <Toggle
                  label="SMS"
                  checked={editingNotificationRule.channels.sms}
                  onChange={(checked) => setEditingNotificationRule({
                    ...editingNotificationRule,
                    channels: { ...editingNotificationRule.channels, sms: checked }
                  })}
                />
                <Toggle
                  label="WhatsApp"
                  checked={editingNotificationRule.channels.whatsapp}
                  onChange={(checked) => setEditingNotificationRule({
                    ...editingNotificationRule,
                    channels: { ...editingNotificationRule.channels, whatsapp: checked }
                  })}
                />
                <Toggle
                  label="Email"
                  checked={editingNotificationRule.channels.email}
                  onChange={(checked) => setEditingNotificationRule({
                    ...editingNotificationRule,
                    channels: { ...editingNotificationRule.channels, email: checked }
                  })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Applies To Verticals</label>
              <div className="flex gap-6">
                {(['BOYS', 'GIRLS', 'DHARAMSHALA'] as Vertical[]).map((vertical) => (
                  <Checkbox
                    key={vertical}
                    label={vertical}
                    checked={editingNotificationRule.verticals.includes(vertical)}
                    onChange={(checked) => {
                      const updatedVerticals = checked
                        ? [...editingNotificationRule.verticals, vertical]
                        : editingNotificationRule.verticals.filter(v => v !== vertical);
                      setEditingNotificationRule({ ...editingNotificationRule, verticals: updatedVerticals });
                    }}
                  />
                ))}
              </div>
            </div>

            <Textarea
              label="Message Template"
              value={editingNotificationRule.template}
              onChange={(e) => setEditingNotificationRule({
                ...editingNotificationRule,
                template: e.target.value
              })}
              placeholder="Use {{variable_name}} for dynamic content. Available: {{student_name}}, {{start_date}}, {{end_date}}, {{reason}}, {{emergency_type}}"
              required
              helperText="Variables will be replaced with actual data when sending notifications"
            />

            <Toggle
              label="Active"
              checked={editingNotificationRule.active}
              onChange={(checked) => setEditingNotificationRule({ ...editingNotificationRule, active: checked })}
              helperText="Enable or disable this notification rule"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
