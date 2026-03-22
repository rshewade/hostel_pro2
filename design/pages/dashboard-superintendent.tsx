'use client';

import { useState } from 'react';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/feedback/Modal';
import { Table } from '@/components/data/Table';
import { SendMessagePanel, type SendMessageData, DEFAULT_TEMPLATES } from '@/components/communication/SendMessagePanel';
import { MessageLog, type MessageLogEntry } from '@/components/communication/MessageLog';
import type { TableColumn, TableRowDensity } from '@/components/types';
import { cn } from '@/components/utils';
import { Input } from '@/components/forms/Input';
import { DatePicker } from '@/components/forms/DatePicker';
import { Select, type SelectOption } from '@/components/forms/Select';
import { Toggle } from '@/components/forms/Toggle';
import { Checkbox } from '@/components/forms/Checkbox';
import { Textarea } from '@/components/forms/Textarea';

// Types
type ApplicationStatus = 'NEW' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
type Vertical = 'BOYS' | 'GIRLS' | 'DHARAMSHALA';

interface Application {
  id: string;
  trackingNumber: string;
  applicantName: string;
  vertical: Vertical;
  status: ApplicationStatus;
  applicationDate: string;
  paymentStatus: string;
  interviewScheduled: boolean;
  flags?: string[];
}

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

export default function SuperintendentDashboard() {
  const [selectedTab, setSelectedTab] = useState<'applications' | 'leaves' | 'communication' | 'settings'>('applications');
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [selectedVertical, setSelectedVertical] = useState<Vertical | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Communication state
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const [selectedMessageRecipient, setSelectedMessageRecipient] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [messageEntries, setMessageEntries] = useState<MessageLogEntry[]>([
    {
      id: 'msg-1',
      recipient: { id: '1', name: 'Rahul Sharma', role: 'applicant' },
      channels: ['sms', 'email'],
      template: 'interview_invitation',
      message: 'Your interview is scheduled on Dec 28, 2024 at 10:00 AM. Mode: Online. Meeting link: https://meet.google.com/abc-xyz',
      status: 'SENT',
      sentAt: '2024-12-22T14:30:00Z',
      sentBy: { id: 'sup-001', name: 'John Smith', role: 'Superintendent' },
      auditLogId: 'AUD-004'
    },
    {
      id: 'msg-2',
      recipient: { id: '2', name: 'Priya Patel', role: 'applicant' },
      channels: ['whatsapp'],
      template: 'fee_reminder',
      message: 'Reminder: Application fee of ₹5,000 due on Dec 25, 2024. Pay now.',
      status: 'DELIVERED',
      sentAt: '2024-12-21T09:00:00Z',
      sentBy: { id: 'sup-001', name: 'John Smith', role: 'Superintendent' },
      auditLogId: 'AUD-003'
    }
  ]);

  // Configuration state
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
    }
  ]);

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
    }
  ]);

  // Modal states
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  const [addingBlackoutDate, setAddingBlackoutDate] = useState(false);
  const [editingNotificationRule, setEditingNotificationRule] = useState<NotificationRule | null>(null);

  // Action confirmation modal state
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'forward';
    application: Application | null;
    remarks: string;
  }>({
    isOpen: false,
    type: 'approve',
    application: null,
    remarks: ''
  });

  // Select options
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

  // Mock data
  const mockApplications: Application[] = [
    {
      id: '1',
      trackingNumber: 'APP-2024-001',
      applicantName: 'Rahul Sharma',
      vertical: 'BOYS',
      status: 'UNDER_REVIEW',
      applicationDate: '2024-12-20',
      paymentStatus: 'PAID',
      interviewScheduled: true,
      flags: ['Documents Pending']
    },
    {
      id: '2',
      trackingNumber: 'APP-2024-002',
      applicantName: 'Priya Patel',
      vertical: 'GIRLS',
      status: 'NEW',
      applicationDate: '2024-12-21',
      paymentStatus: 'PENDING',
      interviewScheduled: false,
      flags: []
    },
    {
      id: '3',
      trackingNumber: 'APP-2024-003',
      applicantName: 'Amit Kumar',
      vertical: 'BOYS',
      status: 'APPROVED',
      applicationDate: '2024-12-15',
      paymentStatus: 'PAID',
      interviewScheduled: false,
      flags: []
    },
    {
      id: '4',
      trackingNumber: 'APP-2024-004',
      applicantName: 'Sneha Reddy',
      vertical: 'DHARAMSHALA',
      status: 'REJECTED',
      applicationDate: '2024-12-18',
      paymentStatus: 'REFUNDED',
      interviewScheduled: false,
      flags: ['Incomplete Documents']
    },
    {
      id: '5',
      trackingNumber: 'APP-2024-005',
      applicantName: 'Vijay Singh',
      vertical: 'GIRLS',
      status: 'UNDER_REVIEW',
      applicationDate: '2024-12-22',
      paymentStatus: 'PAID',
      interviewScheduled: true,
      flags: ['High Priority']
    }
  ];

  // Filter applications
  const filteredApplications = mockApplications.filter(app => {
    const matchesStatus = selectedStatus === 'ALL' || app.status === selectedStatus;
    const matchesVertical = selectedVertical === 'ALL' || app.vertical === selectedVertical;
    const matchesSearch = app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       app.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesVertical && matchesSearch;
  });

  // Status badge variants
  const getStatusVariant = (status: ApplicationStatus): BadgeVariant => {
    switch (status) {
      case 'NEW': return 'info';
      case 'UNDER_REVIEW': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const handleSendMessage = async (data: SendMessageData) => {
    setIsSending(true);
    try {
      const newEntry: MessageLogEntry = {
        id: `msg-${Date.now()}`,
        recipient: mockApplications.find(app => app.id === data.recipientId) ? {
          id: data.recipientId,
          name: mockApplications.find(app => app.id === data.recipientId)!.applicantName,
          role: 'applicant' as const
        } : { id: data.recipientId, name: 'Unknown', role: 'applicant' as const },
        channels: data.channels,
        template: DEFAULT_TEMPLATES.find(t => t.id === data.templateId)?.name,
        message: data.message,
        status: data.schedule ? 'SCHEDULED' : 'SENT',
        sentAt: data.schedule ? undefined : new Date().toISOString(),
        scheduledFor: data.schedule?.date ? `${data.schedule.date}T${data.schedule.time || '00:00'}:00Z` : undefined,
        escalatedTo: data.escalate ? { id: 'trustee-001', name: 'Trustee Board', role: 'Trustee' } : undefined,
        escalatedAt: data.escalate ? new Date().toISOString() : undefined,
        sentBy: { id: 'sup-001', name: 'John Smith', role: 'Superintendent' },
        auditLogId: `AUD-${Date.now()}`
      };
      setMessageEntries([newEntry, ...messageEntries]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Table columns
  const columns: TableColumn<Application>[] = [
    {
      key: 'applicantName',
      header: 'Applicant Name',
      sortable: true,
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'trackingNumber',
      header: 'Tracking #',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs">{value}</span>
      )
    },
    {
      key: 'vertical',
      header: 'Vertical',
      sortable: true,
      render: (value: Vertical) => (
        <span className={cn(
          'px-2 py-0.5 rounded text-xs font-medium',
          value === 'BOYS' && 'bg-blue-100 text-blue-700',
          value === 'GIRLS' && 'bg-pink-100 text-pink-700',
          value === 'DHARAMSHALA' && 'bg-yellow-100 text-yellow-700'
        )}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: ApplicationStatus) => (
        <Badge variant={getStatusVariant(value)} size="sm">
          {value.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      sortable: true,
      render: (value: string) => (
        <Badge
          variant={value === 'PAID' ? 'success' : value === 'PENDING' ? 'warning' : 'error'}
          size="sm"
        >
          {value}
        </Badge>
      )
    },
    {
      key: 'interviewScheduled',
      header: 'Interview',
      render: (value: boolean) => (
        <Badge
          variant={value ? 'success' : 'default'}
          size="sm"
          rounded={true}
        >
          {value ? 'Scheduled' : 'Not Scheduled'}
        </Badge>
      )
    },
    {
      key: 'flags',
      header: 'Flags',
      render: (value: string[]) => (
        <div className="flex gap-1">
          {value && value.length > 0 && value.map((flag, index) => (
            <Chip
              key={index}
              variant="warning"
              size="sm"
            >
              {flag}
            </Chip>
          ))}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: Application) => (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setSelectedApplication(row)}
          >
            Review
          </Button>
          <Button
            variant="secondary"
            size="sm"
          >
            View Details
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ background: 'var(--bg-page)' }} className="min-h-screen">
      {/* Header */}
      <header className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Superintendent Dashboard
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--bg-accent)', color: 'var(--text-on-accent)' }}>
              {selectedVertical === 'ALL' ? 'All Verticals' : selectedVertical}
            </span>
          </div>
          <Button variant="ghost" size="sm">
            Logout
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="mx-auto max-w-7xl border-b" style={{ borderColor: 'var(--border-gray-200)' }}>
        <div className="flex gap-8 px-6">
          <button
            className={cn(
              'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
              selectedTab === 'applications'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
            style={{
              borderColor: selectedTab === 'applications' ? 'var(--border-primary)' : 'transparent',
              color: selectedTab === 'applications' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setSelectedTab('applications')}
          >
            Applications
          </button>
          <button
            className={cn(
              'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
              selectedTab === 'leaves'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
            style={{
              borderColor: selectedTab === 'leaves' ? 'var(--border-primary)' : 'transparent',
              color: selectedTab === 'leaves' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setSelectedTab('leaves')}
          >
            Leaves
          </button>
          <button
            className={cn(
              'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
              selectedTab === 'communication'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
            style={{
              borderColor: selectedTab === 'communication' ? 'var(--border-primary)' : 'transparent',
              color: selectedTab === 'communication' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setSelectedTab('communication')}
          >
            Communication
          </button>
          <button
            className={cn(
              'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
              selectedTab === 'settings'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
            style={{
              borderColor: selectedTab === 'settings' ? 'var(--border-primary)' : 'transparent',
              color: selectedTab === 'settings' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setSelectedTab('settings')}
          >
            Settings
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {selectedTab === 'applications' && (
          <>
            {/* Filters - Enhanced with Filter Chips */}
            <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
              <div className="flex flex-col gap-4">
                {/* Vertical Filter Chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-sm font-medium mr-2" style={{ color: 'var(--text-secondary)' }}>
                    Vertical:
                  </label>
                  <button
                    onClick={() => setSelectedVertical('ALL')}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2',
                      selectedVertical === 'ALL'
                        ? 'border-navy-900 bg-navy-900 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    )}
                  >
                    All Verticals
                  </button>
                  <button
                    onClick={() => setSelectedVertical('BOYS')}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2',
                      selectedVertical === 'BOYS'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-blue-300 text-blue-700 hover:border-blue-400'
                    )}
                  >
                    Boys Hostel
                  </button>
                  <button
                    onClick={() => setSelectedVertical('GIRLS')}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2',
                      selectedVertical === 'GIRLS'
                        ? 'border-pink-600 bg-pink-600 text-white'
                        : 'border-pink-300 text-pink-700 hover:border-pink-400'
                    )}
                  >
                    Girls Ashram
                  </button>
                  <button
                    onClick={() => setSelectedVertical('DHARAMSHALA')}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2',
                      selectedVertical === 'DHARAMSHALA'
                        ? 'border-yellow-600 bg-yellow-600 text-white'
                        : 'border-yellow-300 text-yellow-700 hover:border-yellow-400'
                    )}
                  >
                    Dharamshala
                  </button>
                </div>

                {/* Status Filter Chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-sm font-medium mr-2" style={{ color: 'var(--text-secondary)' }}>
                    Status:
                  </label>
                  <button
                    onClick={() => setSelectedStatus('ALL')}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2',
                      selectedStatus === 'ALL'
                        ? 'border-navy-900 bg-navy-900 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    )}
                  >
                    All Statuses
                  </button>
                  <button
                    onClick={() => setSelectedStatus('NEW')}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2',
                      selectedStatus === 'NEW'
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-blue-200 text-blue-700 hover:border-blue-300'
                    )}
                  >
                    New
                  </button>
                  <button
                    onClick={() => setSelectedStatus('UNDER_REVIEW')}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2',
                      selectedStatus === 'UNDER_REVIEW'
                        ? 'border-yellow-500 bg-yellow-500 text-white'
                        : 'border-yellow-200 text-yellow-700 hover:border-yellow-300'
                    )}
                  >
                    Under Review
                  </button>
                  <button
                    onClick={() => setSelectedStatus('APPROVED')}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2',
                      selectedStatus === 'APPROVED'
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-green-200 text-green-700 hover:border-green-300'
                    )}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setSelectedStatus('REJECTED')}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2',
                      selectedStatus === 'REJECTED'
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-red-200 text-red-700 hover:border-red-300'
                    )}
                  >
                    Rejected
                  </button>
                </div>

                {/* Search and Clear */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Search:
                    </label>
                    <input
                      type="text"
                      placeholder="Search by name or tracking #"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded border border-gray-300 px-3 py-2 text-sm flex-1 max-w-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                      style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  {/* Clear Filters */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedStatus('ALL');
                      setSelectedVertical('ALL');
                      setSearchQuery('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* Applications Table */}
            <Table<Application>
              data={filteredApplications}
              columns={columns}
              onRowClick={(row) => setSelectedApplication(row)}
              pagination={{
                currentPage: 1,
                pageSize: 10,
                totalItems: filteredApplications.length,
                totalPages: Math.ceil(filteredApplications.length / 10),
                onPageChange: (page) => console.log('Page change:', page)
              }}
              density="normal"
              striped={true}
            />
          </>
        )}

        {selectedTab === 'leaves' && (
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

        {selectedTab === 'communication' && (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowMessagePanel(true)}
                className="p-6 rounded-lg border-2 border-dashed hover:border-navy-900 transition-colors text-left"
                style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-gray-200)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">💬</span>
                  <h3 className="font-semibold text-navy-900">Send Message</h3>
                </div>
                <p className="text-sm text-gray-600">Send SMS, WhatsApp, or Email to applicants</p>
              </button>
              <button
                onClick={() => {}}
                className="p-6 rounded-lg border-2 border-dashed hover:border-navy-900 transition-colors text-left"
                style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-gray-200)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📊</span>
                  <h3 className="font-semibold text-navy-900">View Statistics</h3>
                </div>
                <p className="text-sm text-gray-600">View communication analytics and reports</p>
              </button>
              <button
                onClick={() => {}}
                className="p-6 rounded-lg border-2 border-dashed hover:border-navy-900 transition-colors text-left"
                style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-gray-200)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📋</span>
                  <h3 className="font-semibold text-navy-900">Manage Templates</h3>
                </div>
                <p className="text-sm text-gray-600">Create and edit message templates</p>
              </button>
            </div>

            {/* Message History */}
            <div className="p-6 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
              <MessageLog
                entries={messageEntries}
                loading={false}
                onRetry={(entryId) => {
                  console.log('Retry message:', entryId);
                }}
                onViewDetails={(entryId) => {
                  console.log('View details:', entryId);
                }}
                maxEntries={10}
              />
            </div>

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

        {selectedTab === 'settings' && (
          <div className="p-12 text-center rounded-lg" style={{ background: 'var(--surface-primary)' }}>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        )}
      </main>

      {/* Application Detail Modal */}
      <Modal
        isOpen={selectedApplication !== null}
        onClose={() => setSelectedApplication(null)}
        title="Application Details"
        size="xl"
      >
        {selectedApplication && (
          <div className="space-y-6">
            {/* Applicant Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Applicant Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {selectedApplication.applicantName}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Tracking Number</label>
                  <p className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                    {selectedApplication.trackingNumber}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Vertical</label>
                  <Badge
                    variant={selectedApplication.vertical === 'BOYS' ? 'success' : selectedApplication.vertical === 'GIRLS' ? 'warning' : 'info'}
                    size="md"
                  >
                    {selectedApplication.vertical}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Application Date</label>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {selectedApplication.applicationDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Status & Payment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Application Status</label>
                <Badge
                  variant={getStatusVariant(selectedApplication.status)}
                  size="md"
                  className="mt-2"
                >
                  {selectedApplication.status.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <label className="text-sm text-gray-600">Payment Status</label>
                <Badge
                  variant={selectedApplication.paymentStatus === 'PAID' ? 'success' : selectedApplication.paymentStatus === 'PENDING' ? 'warning' : 'error'}
                  size="md"
                  className="mt-2"
                >
                  {selectedApplication.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Interview Details */}
            {selectedApplication.interviewScheduled && (
              <div className="p-4 rounded-lg" style={{ background: 'var(--bg-page)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Interview Scheduled
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-600">Date</label>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      December 28, 2024
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Time</label>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      10:00 AM IST
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Mode</label>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      Online (Google Meet)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Flags */}
            {selectedApplication.flags && selectedApplication.flags.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Flags
                </h4>
                <div className="flex gap-2">
                  {selectedApplication.flags.map((flag, index) => (
                    <Chip
                      key={index}
                      variant="warning"
                      size="sm"
                    >
                      {flag}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {/* Documents Preview */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Uploaded Documents
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {['Student Declaration', 'Parent Consent', 'Aadhar Card', 'Marksheets'].map((doc, index) => (
                  <div
                    key={index}
                    className="p-4 rounded border cursor-pointer hover:shadow-md transition-shadow"
                    style={{ borderColor: 'var(--border-gray-200)', background: 'var(--bg-page)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📄</div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                          {doc}
                        </p>
                        <p className="text-xs text-gray-600">PDF • 245 KB</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Internal Notes (Superintendent Remarks)
              </h4>
              <textarea
                placeholder="Add internal remarks..."
                className="w-full rounded border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 min-h-[100px]"
                style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-gray-200)' }}>
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={() => {
                    setActionModal({
                      isOpen: true,
                      type: 'approve',
                      application: selectedApplication,
                      remarks: ''
                    });
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setActionModal({
                      isOpen: true,
                      type: 'reject',
                      application: selectedApplication,
                      remarks: ''
                    });
                  }}
                >
                  Reject
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setActionModal({
                      isOpen: true,
                      type: 'forward',
                      application: selectedApplication,
                      remarks: ''
                    });
                  }}
                >
                  Forward to Trustees
                </Button>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedMessageRecipient(selectedApplication.id);
                  setShowMessagePanel(true);
                }}
              >
                Send Message
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Leave Type Modal */}
      <Modal
        isOpen={editingLeaveType !== null}
        onClose={() => setEditingLeaveType(null)}
        title={editingLeaveType?.id ? 'Edit Leave Type' : 'Add Leave Type'}
        size="lg"
        variant="confirmation"
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
        variant="confirmation"
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
        variant="confirmation"
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
              helperText="When should notification be sent?"
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
                      setEditingNotificationRule({
                        ...editingNotificationRule,
                        verticals: updatedVerticals
                      });
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

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, type: 'approve', application: null, remarks: '' })}
        title={
          actionModal.type === 'approve' ? 'Approve Application' :
          actionModal.type === 'reject' ? 'Reject Application' : 'Forward to Trustees'
        }
        size="md"
        variant={actionModal.type === 'reject' ? 'destructive' : 'confirmation'}
        onConfirm={() => {
          console.log(`${actionModal.type} application:`, actionModal.application?.id, 'remarks:', actionModal.remarks);
          setActionModal({ isOpen: false, type: 'approve', application: null, remarks: '' });
          setSelectedApplication(null);
        }}
        confirmText={actionModal.type === 'approve' ? 'Approve' : actionModal.type === 'reject' ? 'Reject' : 'Forward'}
        confirmLoading={false}
      >
        {actionModal.application && (
          <div className="space-y-4">
            {/* Application Summary */}
            <div className="p-4 rounded border" style={{ background: 'var(--bg-page)', borderColor: 'var(--border-gray-200)' }}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-600">Applicant Name</label>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {actionModal.application.applicantName}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600">Tracking Number</label>
                  <p className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                    {actionModal.application.trackingNumber}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600">Vertical</label>
                  <Badge
                    variant={actionModal.application.vertical === 'BOYS' ? 'success' : actionModal.application.vertical === 'GIRLS' ? 'warning' : 'info'}
                    size="sm"
                    className="mt-1"
                  >
                    {actionModal.application.vertical}
                  </Badge>
                </div>
                <div>
                  <label className="text-gray-600">Current Status</label>
                  <Badge
                    variant={getStatusVariant(actionModal.application.status)}
                    size="sm"
                    className="mt-1"
                  >
                    {actionModal.application.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Payment Status Warning */}
              {actionModal.application.paymentStatus !== 'PAID' && (
                <div className="mt-4 p-3 rounded border-l-4" style={{
                  background: 'var(--color-yellow-50)',
                  borderColor: 'var(--color-yellow-500)'
                }}>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">⚠️</span>
                    <div>
                      <p className="font-medium text-yellow-800">Payment Status: {actionModal.application.paymentStatus}</p>
                      <p className="text-sm text-yellow-700">
                        Consider payment status before proceeding with this action.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Remarks Field */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Remarks <span className="text-red-500">*</span>
              </label>
              <textarea
                value={actionModal.remarks}
                onChange={(e) => setActionModal({ ...actionModal, remarks: e.target.value })}
                placeholder={actionModal.type === 'approve'
                  ? 'Enter approval remarks (e.g., Documents verified, interview completed successfully)'
                  : actionModal.type === 'reject'
                  ? 'Enter rejection reason (e.g., Incomplete documents,不符合条件)'
                  : 'Enter remarks for trustees (e.g., Recommendation, additional notes)'
                }
                className="w-full rounded border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 min-h-[100px]"
                style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Remarks will be recorded in the audit trail and visible to other superintendents.
              </p>
            </div>

            {/* Vertical Context Warning */}
            {selectedVertical !== 'ALL' && actionModal.application.vertical !== selectedVertical && (
              <div className="p-3 rounded border-l-4" style={{
                background: 'var(--color-red-50)',
                borderColor: 'var(--color-red-500)'
              }}>
                <div className="flex items-start gap-2">
                  <span className="text-red-600">🚨</span>
                  <div>
                    <p className="font-medium text-red-800">Cross-Vertical Action Warning</p>
                    <p className="text-sm text-red-700">
                      You are currently viewing <strong>{selectedVertical}</strong> applications but attempting to take action on a <strong>{actionModal.application.vertical}</strong> application.
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      Please verify this is intentional before proceeding.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Send Message Panel */}
      <SendMessagePanel
        isOpen={showMessagePanel}
        onClose={() => {
          setShowMessagePanel(false);
          setSelectedMessageRecipient(null);
        }}
        onSend={handleSendMessage}
        recipients={mockApplications.map(app => ({
          id: app.id,
          name: app.applicantName,
          role: 'applicant' as const,
          phone: '+91 9876543210',
          email: `${app.applicantName.toLowerCase().replace(' ', '.')}@example.com`
        }))}
        templates={DEFAULT_TEMPLATES}
        defaultRecipientId={selectedMessageRecipient || undefined}
        context={selectedApplication ? {
          trackingNumber: selectedApplication.trackingNumber,
          status: selectedApplication.status,
          vertical: selectedApplication.vertical
        } : undefined}
        isLoading={isSending}
        showContextWarning={!!selectedApplication}
      />
    </div>
  );
}
