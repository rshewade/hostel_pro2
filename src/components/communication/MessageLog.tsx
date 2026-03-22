'use client';

import { useState } from 'react';
import { cn } from '../utils';
import { Badge, type BadgeVariant } from '../ui/Badge';
import { Button } from '../ui/Button';

export type MessageStatus = 'SENT' | 'PENDING' | 'FAILED' | 'SCHEDULED' | 'DELIVERED' | 'READ';

export type MessageLogEntry = {
  id: string;
  recipient: {
    id: string;
    name: string;
    role: string;
  };
  channels: string[];
  template?: string;
  message: string;
  status: MessageStatus;
  sentAt?: string;
  scheduledFor?: string;
  escalatedTo?: {
    id: string;
    name: string;
    role: string;
  };
  escalatedAt?: string;
  sentBy: {
    id: string;
    name: string;
    role: string;
  };
  auditLogId: string;
}

export type MessageLogProps = {
  entries: MessageLogEntry[];
  loading?: boolean;
  error?: string;
  onRetry?: (entryId: string) => void;
  onViewDetails?: (entryId: string) => void;
  emptyMessage?: string;
  maxEntries?: number;
}

const MessageLog = ({
  entries,
  loading = false,
  error,
  onRetry,
  onViewDetails,
  emptyMessage = 'No messages sent yet',
  maxEntries,
}: MessageLogProps) => {
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<MessageStatus | 'ALL'>('ALL');

  const getStatusVariant = (status: MessageStatus): BadgeVariant => {
    switch (status) {
      case 'SENT':
        return 'success';
      case 'DELIVERED':
        return 'success';
      case 'READ':
        return 'info';
      case 'PENDING':
        return 'warning';
      case 'SCHEDULED':
        return 'info';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'SENT':
        return '✅';
      case 'DELIVERED':
        return '✓';
      case 'READ':
        return '👁';
      case 'PENDING':
        return '⏳';
      case 'SCHEDULED':
        return '📅';
      case 'FAILED':
        return '❌';
      default:
        return '📝';
    }
  };

  const filteredEntries = entries
    .filter(entry => filterStatus === 'ALL' || entry.status === filterStatus)
    .slice(0, maxEntries);

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getChannelIcons = (channels: string[]) => {
    return channels.map(channel => {
      switch (channel) {
        case 'sms':
          return '📱';
        case 'whatsapp':
          return '💬';
        case 'email':
          return '📧';
        default:
          return '💭';
      }
    }).join(' ');
  };

  if (loading) {
    return (
      <div className="p-6 text-center" data-testid="message-log-loading">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600" data-testid="loading-spinner"></div>
        <p className="text-sm text-gray-600 mt-2">Loading message history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200" data-testid="message-log-error">
        <div className="flex items-start gap-2">
          <span className="text-red-600">⚠️</span>
          <div>
            <p className="text-sm font-medium text-red-800">Failed to load message history</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="p-8 text-center" data-testid="message-log-empty">
        <span className="text-4xl mb-3 block">📭</span>
        <p className="text-sm text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-navy-900">
          Message History
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {filteredEntries.length} of {entries.length} shown
          </span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as MessageStatus | 'ALL')}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="ALL">All Status</option>
            <option value="SENT">Sent</option>
            <option value="DELIVERED">Delivered</option>
            <option value="READ">Read</option>
            <option value="PENDING">Pending</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

       <div className="space-y-3" data-testid="message-log-entries">
         {filteredEntries.map((entry) => {
           const isExpanded = expandedEntryId === entry.id;

           return (
             <div
               key={entry.id}
               data-testid={`message-log-entry-${entry.id}`}
               data-expanded={isExpanded}
               data-status={entry.status}
               className={cn(
                 'border-2 rounded-lg transition-all',
                 entry.status === 'FAILED'
                   ? 'border-red-300 bg-red-50'
                   : 'border-gray-200 bg-white hover:border-gray-300'
               )}
             >
               <div className="p-4">
                 <div className="flex items-start justify-between">
                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-2">
                       <span className="text-xl" data-testid={`status-icon-${entry.id}`}>
                         {getStatusIcon(entry.status)}
                       </span>
                       <span className="font-medium text-navy-900" data-testid={`recipient-name-${entry.id}`}>
                         {entry.recipient.name}
                       </span>
                       <span
                         className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                         data-testid={`recipient-role-${entry.id}`}
                       >
                         {entry.recipient.role}
                       </span>
                       <Badge variant={getStatusVariant(entry.status)} size="sm">
                         {entry.status}
                       </Badge>
                     </div>

                     <div className="flex items-center gap-3 mb-2 text-xs text-gray-600">
                       <span data-testid={`channel-icons-${entry.id}`}>{getChannelIcons(entry.channels)}</span>
                       <span data-testid={`sent-time-${entry.id}`}>{formatDateTime(entry.sentAt)}</span>
                       <span className="font-mono text-gray-400">
                         #{entry.auditLogId.slice(-6)}
                       </span>
                     </div>

                     <p className="text-sm text-gray-700 line-clamp-2" data-testid={`entry-message-${entry.id}`}>
                       {entry.message}
                     </p>

                     {entry.template && (
                       <span className="text-xs text-gray-500 mt-1">
                         Template: {entry.template}
                       </span>
                     )}

                     {entry.scheduledFor && (
                       <div className="mt-2 flex items-center gap-1 text-xs text-blue-700" data-testid={`scheduled-info-${entry.id}`}>
                         <span>📅</span>
                         <span>
                           Scheduled for: {formatDateTime(entry.scheduledFor)}
                         </span>
                       </div>
                     )}

                     {entry.escalatedTo && (
                       <div className="mt-2 p-2 rounded bg-orange-100 border border-orange-200" data-testid={`escalation-info-${entry.id}`}>
                         <div className="flex items-center gap-1 text-xs text-orange-800">
                           <span>🚨</span>
                           <span>
                             Escalated to: {entry.escalatedTo.name} ({entry.escalatedTo.role})
                           </span>
                         </div>
                         <span className="text-xs text-orange-700 mt-0.5">
                           {formatDateTime(entry.escalatedAt)}
                         </span>
                       </div>
                     )}
                   </div>

                   <div className="flex gap-2 ml-4">
                     {entry.status === 'FAILED' && onRetry && (
                       <Button
                         variant="primary"
                         size="xs"
                         onClick={() => onRetry(entry.id)}
                         data-testid={`retry-button-${entry.id}`}
                       >
                         Retry
                       </Button>
                     )}

                     {onViewDetails && (
                       <Button
                         variant="ghost"
                         size="xs"
                         onClick={() => {
                           setExpandedEntryId(isExpanded ? null : entry.id);
                           if (!isExpanded && onViewDetails) {
                             onViewDetails(entry.id);
                           }
                         }}
                         data-testid={`details-button-${entry.id}`}
                       >
                         {isExpanded ? 'Hide' : 'Details'}
                       </Button>
                     )}
                   </div>
                 </div>

                 {isExpanded && (
                   <div className="mt-3 pt-3 border-t border-gray-200" data-testid={`expanded-details-${entry.id}`}>
                     <div className="grid grid-cols-2 gap-3 text-sm">
                       <div>
                         <label className="text-xs font-medium text-gray-600">
                           Recipient ID
                         </label>
                         <p className="font-mono text-navy-900">{entry.recipient.id}</p>
                       </div>
                       <div>
                         <label className="text-xs font-medium text-gray-600">
                           Audit Log ID
                         </label>
                         <p className="font-mono text-navy-900">{entry.auditLogId}</p>
                       </div>
                       <div>
                         <label className="text-xs font-medium text-gray-600">
                           Sent By
                         </label>
                         <p className="text-navy-900">
                           {entry.sentBy.name} ({entry.sentBy.role})
                         </p>
                       </div>
                       <div>
                         <label className="text-xs font-medium text-gray-600">
                           Sent At
                         </label>
                         <p className="text-navy-900">
                           {formatDateTime(entry.sentAt)}
                         </p>
                       </div>
                     </div>

                     <div className="mt-3">
                       <label className="text-xs font-medium text-gray-600">
                         Full Message
                       </label>
                       <div className="mt-1 p-3 rounded bg-gray-50 border border-gray-200 text-sm whitespace-pre-wrap break-words">
                         {entry.message}
                       </div>
                     </div>

                     <div className="mt-3 flex justify-end gap-2">
                       <Button variant="secondary" size="xs">
                         View in Audit Log
                       </Button>
                       <Button variant="secondary" size="xs">
                         Export
                       </Button>
                     </div>
                   </div>
                 )}
               </div>
             </div>
           );
         })}
       </div>

      {filteredEntries.length === 0 && entries.length > 0 && (
        <div className="p-4 text-center text-sm text-gray-600">
          No messages match the selected filter
        </div>
      )}

      {maxEntries && filteredEntries.length === maxEntries && entries.length > maxEntries && (
        <div className="text-center">
          <Button variant="secondary" size="sm">
            View All {entries.length} Messages
          </Button>
        </div>
      )}
    </div>
  );
};

MessageLog.displayName = 'MessageLog';

export { MessageLog };
