'use client';

import { useState } from 'react';
import { SidePanel } from '../feedback/SidePanel';
import { Button } from '../ui/Button';
import { ChannelToggle, type Channel } from './ChannelToggle';
import { RecipientSelector, type Recipient } from './RecipientSelector';
import { TemplateSelector, type Template } from './TemplateSelector';
import { MessagePreview } from './MessagePreview';

export interface SendMessageData {
  recipientId: string;
  channels: string[];
  templateId?: string;
  message: string;
  schedule?: {
    date?: string;
    time?: string;
  };
  escalate?: boolean;
}

export interface SendMessagePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: SendMessageData) => void | Promise<void>;
  recipients: Recipient[];
  templates: Template[];
  channels?: Channel[];
  defaultRecipientId?: string;
  defaultTemplateId?: string;
  defaultChannels?: string[];
  context?: {
    trackingNumber?: string;
    status?: string;
    vertical?: string;
  };
  isLoading?: boolean;
  showContextWarning?: boolean;
}

const AVAILABLE_CHANNELS: Channel[] = [
  { id: 'sms', label: 'SMS', icon: '📱' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { id: 'email', label: 'Email', icon: '📧' },
];

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'interview_invitation',
    name: 'Interview Invitation',
    content: 'Your interview is scheduled on {{date}} at {{time}}. Mode: {{mode}}. {{link?}}',
    variables: ['date', 'time', 'mode', 'link'],
  },
  {
    id: 'provisional_approval',
    name: 'Provisional Approval',
    content: 'Your application {{tracking_number}} has been provisionally approved. {{interview_required?}}',
    variables: ['tracking_number', 'interview_required'],
  },
  {
    id: 'final_approval',
    name: 'Final Approval',
    content: 'Congratulations! Your application {{tracking_number}} is approved. Login credentials sent to your email.',
    variables: ['tracking_number', 'vertical'],
  },
  {
    id: 'rejection',
    name: 'Rejection',
    content: 'Your application {{tracking_number}} has been rejected. Reason: {{reason}}. {{refund?}}',
    variables: ['tracking_number', 'reason', 'refund'],
  },
  {
    id: 'fee_reminder',
    name: 'Fee Reminder',
    content: 'Reminder: {{fee_name}} of ₹{{amount}} due on {{due_date}}. Pay now.',
    variables: ['fee_name', 'amount', 'due_date'],
  },
  {
    id: 'leave_application',
    name: 'Leave Application',
    content: 'Your child {{student_name}} has applied for {{leave_type}} from {{start_date}} to {{end_date}}.',
    variables: ['student_name', 'leave_type', 'start_date', 'end_date'],
  },
];

const SendMessagePanel = ({
  isOpen,
  onClose,
  onSend,
  recipients,
  templates = DEFAULT_TEMPLATES,
  channels = AVAILABLE_CHANNELS,
  defaultRecipientId,
  defaultTemplateId,
  defaultChannels = ['sms', 'email'],
  context,
  isLoading = false,
  showContextWarning = false,
}: SendMessagePanelProps) => {
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(defaultRecipientId || recipients[0]?.id || '');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(defaultChannels);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(defaultTemplateId);
  const [message, setMessage] = useState<string>('');
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [scheduleTime, setScheduleTime] = useState<string>('');
  const [escalate, setEscalate] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const selectedRecipient = recipients.find(r => r.id === selectedRecipientId);
  const selectedChannel = selectedChannels[0] as 'sms' | 'whatsapp' | 'email' || 'sms';

  const handleSend = async () => {
    setError('');

    if (!selectedRecipientId) {
      setError('Please select a recipient');
      return;
    }

    if (selectedChannels.length === 0) {
      setError('Please select at least one channel');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    // Only validate unreplaced variables if NO context is provided
    // When context exists, variables will be replaced by backend
    const variableMatches = message.match(/\{\{([^}]+)\}\}/g);
    if (!context && variableMatches && variableMatches.length > 0) {
      setError('Message contains unreplaced variables. Please replace them or remove from template.');
      return;
    }

    const sendData: SendMessageData = {
      recipientId: selectedRecipientId,
      channels: selectedChannels,
      templateId: selectedTemplateId,
      message,
      escalate,
    };

    if (scheduleDate || scheduleTime) {
      sendData.schedule = {
        date: scheduleDate,
        time: scheduleTime,
      };
    }

    try {
      await onSend(sendData);
      handleClose();
    } catch (err) {
      setError('Failed to send message. Please try again.');
    }
  };

  const handleClose = () => {
    setError('');
    setSelectedRecipientId(defaultRecipientId || recipients[0]?.id || '');
    setSelectedChannels(defaultChannels);
    setSelectedTemplateId(undefined);
    setMessage('');
    setScheduleDate('');
    setScheduleTime('');
    setEscalate(false);
    onClose();
  };

  const getPreviewVariables = (): Record<string, string> => {
    const vars: Record<string, string> = {};

    if (context?.trackingNumber) {
      vars['tracking_number'] = context.trackingNumber;
    }
    if (context?.status) {
      vars['status'] = context.status;
    }
    if (context?.vertical) {
      vars['vertical'] = context.vertical;
    }
    if (selectedRecipient?.name) {
      vars['name'] = selectedRecipient.name;
      vars['student_name'] = selectedRecipient.name;
    }

    return vars;
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
      title="Send Message"
      size="lg"
      position="right"
    >
      <div className="space-y-6">
        {showContextWarning && context && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs font-medium text-blue-800 mb-1">
              Context Summary
            </p>
            <div className="space-y-1 text-xs text-blue-700">
              {context.trackingNumber && (
                <div>
                  <span className="font-medium">Tracking #:</span> {context.trackingNumber}
                </div>
              )}
              {context.status && (
                <div>
                  <span className="font-medium">Status:</span> {context.status}
                </div>
              )}
              {context.vertical && (
                <div>
                  <span className="font-medium">Vertical:</span> {context.vertical}
                </div>
              )}
            </div>
          </div>
        )}

        <RecipientSelector
          recipients={recipients}
          selectedRecipientId={selectedRecipientId}
          onChange={setSelectedRecipientId}
          showContext={true}
          disabled={isLoading}
        />

        <ChannelToggle
          channels={channels}
          selectedChannels={selectedChannels}
          onChange={setSelectedChannels}
          disabled={isLoading}
        />

        <TemplateSelector
          templates={templates}
          selectedTemplateId={selectedTemplateId}
          message={message}
          onTemplateChange={setSelectedTemplateId}
          onMessageChange={setMessage}
          disabled={isLoading}
        />

        <MessagePreview
          message={message}
          variables={getPreviewVariables()}
          channel={selectedChannel}
          showCharacterCount={true}
        />

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-navy-900">
            Schedule (Optional)
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                id="schedule-date"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="schedule-time" className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                id="schedule-time"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setScheduleDate('')}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Schedule
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setScheduleDate(tomorrow.toISOString().split('T')[0]);
                setScheduleTime('09:00');
              }}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tomorrow 9 AM
            </button>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={escalate}
            onChange={(e) => setEscalate(e.target.checked)}
            disabled={isLoading}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-gold-600 focus:ring-gold-500"
          />
          <div>
            <span className="text-sm font-medium text-navy-900">
              Escalate to supervisor
            </span>
            <p className="text-xs text-gray-600 mt-0.5">
              Notify supervisor of this communication (for urgent matters)
            </p>
          </div>
        </label>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200" data-testid="error-message">
            <div className="flex items-start gap-2">
              <span className="text-red-600">⚠️</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-start gap-2">
            <span className="text-gray-600">📋</span>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Message will be logged
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                All messages are logged for audit purposes with timestamp and channel details.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSend}
          loading={isLoading}
          disabled={isLoading}
        >
          {scheduleDate || scheduleTime ? 'Schedule Message' : 'Send Now'}
        </Button>
      </div>
    </SidePanel>
  );
};

SendMessagePanel.displayName = 'SendMessagePanel';

export { SendMessagePanel, DEFAULT_TEMPLATES };