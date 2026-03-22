'use client';

import { forwardRef } from 'react';
import { cn } from '../utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  FileText,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import type { BaseComponentProps } from '../types';

export type UndertakingStatus = 'pending' | 'in_progress' | 'completed' | 'required' | 'overdue';

export type UndertakingType = 
  | 'dpdp_consent_renewal'
  | 'hostel_rules_acknowledgement'
  | 'code_of_conduct'
  | 'emergency_contact_verification'
  | 'payment_terms_acceptance'
  | 'leave_policy_acknowledgement'
  | 'general_rules_update';

export interface UndertakingCardProps extends BaseComponentProps {
  type: UndertakingType;
  title: string;
  description: string;
  status: UndertakingStatus;
  required: boolean;
  dueDate?: string;
  completedAt?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  version?: string;
  isBlocking?: boolean;
  onAction?: () => void;
  onViewDetails?: () => void;
}

const UNDERTAKING_CONFIG: Record<UndertakingType, { icon: React.ReactNode; category: string }> = {
  dpdp_consent_renewal: {
    icon: <AlertCircle className="w-5 h-5" />,
    category: 'Compliance'
  },
  hostel_rules_acknowledgement: {
    icon: <FileText className="w-5 h-5" />,
    category: 'Hostel Rules'
  },
  code_of_conduct: {
    icon: <AlertTriangle className="w-5 h-5" />,
    category: 'Conduct'
  },
  emergency_contact_verification: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    category: 'Safety'
  },
  payment_terms_acceptance: {
    icon: <FileText className="w-5 h-5" />,
    category: 'Financial'
  },
  leave_policy_acknowledgement: {
    icon: <FileText className="w-5 h-5" />,
    category: 'Policies'
  },
  general_rules_update: {
    icon: <AlertCircle className="w-5 h-5" />,
    category: 'Updates'
  }
};

const STATUS_CONFIG: Record<UndertakingStatus, { 
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  label: string;
  description: string;
  icon: React.ReactNode;
}> = {
  pending: {
    variant: 'default',
    label: 'Pending',
    description: 'Awaiting your acknowledgement',
    icon: <Clock className="w-3 h-3" />
  },
  in_progress: {
    variant: 'info',
    label: 'In Progress',
    description: 'Acknowledgement in progress',
    icon: <FileText className="w-3 h-3" />
  },
  completed: {
    variant: 'success',
    label: 'Completed',
    description: 'Acknowledgement completed',
    icon: <CheckCircle2 className="w-3 h-3" />
  },
  required: {
    variant: 'warning',
    label: 'Required',
    description: 'Action required before proceeding',
    icon: <AlertTriangle className="w-3 h-3" />
  },
  overdue: {
    variant: 'error',
    label: 'Overdue',
    description: 'Acknowledgement overdue',
    icon: <AlertCircle className="w-3 h-3" />
  }
};

const UndertakingCard = forwardRef<HTMLDivElement, UndertakingCardProps>(({
  className,
  type,
  title,
  description,
  status,
  required,
  dueDate,
  completedAt,
  acknowledgedBy,
  acknowledgedAt,
  version,
  isBlocking = false,
  onAction,
  onViewDetails,
  'data-testid': testId,
}, ref) => {
  const config = UNDERTAKING_CONFIG[type];
  const statusConfig = STATUS_CONFIG[status];
  const isActionable = status === 'pending' || status === 'required' || status === 'overdue';

  return (
    <div
      ref={ref}
      className={cn(
        'border rounded-lg p-4 transition-all hover:shadow-md',
        isBlocking && 'border-l-4',
        'card'
      )}
      style={{
        borderColor: isBlocking ? 'var(--color-red-500)' : 'var(--border-primary)',
        borderLeftColor: isBlocking ? 'var(--color-red-500)' : undefined
      }}
      data-testid={testId}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {/* Icon */}
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--color-blue-50)' }}
          >
            {config.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 
                className="font-medium text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </h4>
              {required && (
                <Badge variant="warning" size="sm">
                  Required
                </Badge>
              )}
              {isBlocking && (
                <Badge variant="error" size="sm">
                  Blocking
                </Badge>
              )}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {config.category}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <Badge variant={statusConfig.variant} size="sm">
          <span className="flex items-center gap-1">
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>

      {/* Metadata */}
      <div className="space-y-1 text-xs mb-3">
        {dueDate && status !== 'completed' && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-blue-600)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>
              Due: {new Date(dueDate).toLocaleDateString()}
            </span>
          </div>
        )}
        
        {acknowledgedAt && acknowledgedBy && (
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-green-600)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>
              Completed: {new Date(acknowledgedAt).toLocaleDateString()} by {acknowledgedBy}
            </span>
          </div>
        )}

        {version && (
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-gray-600)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>
              Version: {version}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {onViewDetails && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onViewDetails}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            View Details
          </Button>
        )}
        
        {isActionable && onAction && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAction}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            {status === 'overdue' ? 'Complete Now' : 'Acknowledge'}
          </Button>
        )}

        {status === 'completed' && (
          <Badge variant="success" size="sm" className="ml-auto">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        )}
      </div>

      {/* Blocking Warning */}
      {isBlocking && (
        <div className="mt-3 p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-red-50)' }}>
          <p className="flex items-center gap-1 font-medium" style={{ color: 'var(--color-red-700)' }}>
            <AlertCircle className="w-3 h-3" />
            This undertaking is blocking access to other features
          </p>
        </div>
      )}
    </div>
  );
});

UndertakingCard.displayName = 'UndertakingCard';

export { UndertakingCard };
