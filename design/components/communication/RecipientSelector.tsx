'use client';

import { cn } from '../utils';

export interface Recipient {
  id: string;
  name: string;
  role: 'applicant' | 'student' | 'parent' | 'staff';
  contact?: {
    sms?: string;
    whatsapp?: string;
    email?: string;
  };
}

export interface RecipientSelectorProps {
  recipients: Recipient[];
  selectedRecipientId: string;
  onChange: (recipientId: string) => void;
  showContext?: boolean;
  className?: string;
  disabled?: boolean;
}

const RecipientSelector = ({
  recipients,
  selectedRecipientId,
  onChange,
  showContext = true,
  className,
  disabled = false,
}: RecipientSelectorProps) => {
  const selectedRecipient = recipients.find(r => r.id === selectedRecipientId);

  const getRoleBadgeColor = (role: Recipient['role']) => {
    switch (role) {
      case 'applicant':
        return 'bg-blue-100 text-blue-700';
      case 'student':
        return 'bg-green-100 text-green-700';
      case 'parent':
        return 'bg-purple-100 text-purple-700';
      case 'staff':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={cn('space-y-3', className)} data-testid="recipient-selector">
      <label className="block text-sm font-medium text-navy-900" id="recipient-selector-label" data-testid="recipient-selector-label">
        Recipient
      </label>

      {recipients.length === 0 ? (
        <p className="text-sm text-gray-500 italic" data-testid="no-recipients">No recipients available</p>
      ) : (
        <div className="space-y-2">
          {recipients.map((recipient) => {
            const isSelected = recipient.id === selectedRecipientId;
            const hasSms = !!recipient.contact?.sms;
            const hasWhatsapp = !!recipient.contact?.whatsapp;
            const hasEmail = !!recipient.contact?.email;

            return (
              <button
                key={recipient.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange(recipient.id)}
                aria-labelledby="recipient-selector-label"
                aria-selected={isSelected}
                data-testid={`recipient-card-${recipient.id}`}
                data-selected={isSelected}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-lg border-2 transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isSelected
                    ? 'border-gold-600 bg-gold-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-navy-900" data-testid={`recipient-name-${recipient.id}`}>
                        {recipient.name}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          getRoleBadgeColor(recipient.role)
                        )}
                        data-testid={`recipient-role-${recipient.id}`}
                      >
                        {recipient.role}
                      </span>
                    </div>

                    {showContext && (
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-600" data-testid={`recipient-channels-${recipient.id}`}>
                        {hasSms && (
                          <span className="flex items-center gap-1">
                            <span className="text-green-600" data-testid={`contact-sms-${recipient.id}`}>✓</span> SMS
                          </span>
                        )}
                        {hasWhatsapp && (
                          <span className="flex items-center gap-1">
                            <span className="text-green-600" data-testid={`contact-whatsapp-${recipient.id}`}>✓</span> WhatsApp
                          </span>
                        )}
                        {hasEmail && (
                          <span className="flex items-center gap-1">
                            <span className="text-green-600" data-testid={`contact-email-${recipient.id}`}>✓</span> Email
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gold-500 text-white" data-testid={`recipient-checkmark-${recipient.id}`}>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedRecipient && showContext && (
        <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200" data-testid="recipient-details">
          <p className="text-xs font-medium text-blue-800 mb-1">
            Recipient Details
          </p>
          <div className="space-y-1 text-sm text-blue-700">
            {selectedRecipient.contact?.sms && (
              <div data-testid="detail-sms">
                <span className="font-medium">SMS:</span> {selectedRecipient.contact.sms}
              </div>
            )}
            {selectedRecipient.contact?.whatsapp && (
              <div data-testid="detail-whatsapp">
                <span className="font-medium">WhatsApp:</span> {selectedRecipient.contact.whatsapp}
              </div>
            )}
            {selectedRecipient.contact?.email && (
              <div data-testid="detail-email">
                <span className="font-medium">Email:</span> {selectedRecipient.contact.email}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

RecipientSelector.displayName = 'RecipientSelector';

export { RecipientSelector };
