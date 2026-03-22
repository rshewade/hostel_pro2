'use client';

import { cn } from '../utils';

export interface MessagePreviewProps {
  message: string;
  variables?: Record<string, string>;
  channel?: 'sms' | 'whatsapp' | 'email';
  showCharacterCount?: boolean;
  className?: string;
}

const MessagePreview = ({
  message,
  variables = {},
  channel = 'sms',
  showCharacterCount = true,
  className,
}: MessagePreviewProps) => {
  const replaceVariables = (text: string): string => {
    let result = text;

    Object.keys(variables).forEach(key => {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(pattern, variables[key]);
    });

    return result;
  };

  const previewMessage = replaceVariables(message);
  const characterCount = previewMessage.length;
  const smsLimit = 160;

  const isSmsOverLimit = channel === 'sms' && characterCount > smsLimit;

  const getChannelStyle = () => {
    switch (channel) {
      case 'sms':
        return 'bg-yellow-50 border-yellow-200';
      case 'whatsapp':
        return 'bg-green-50 border-green-200';
      case 'email':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getChannelIcon = () => {
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
  };

  const getChannelLabel = () => {
    switch (channel) {
      case 'sms':
        return 'SMS Preview';
      case 'whatsapp':
        return 'WhatsApp Preview';
      case 'email':
        return 'Email Preview';
      default:
        return 'Message Preview';
    }
  };

  const hasUnreplacedVariables = previewMessage.match(/\{\{[^}]+\}\}/g);

  return (
    <div className={cn('space-y-2', className)} data-testid="message-preview">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-navy-900" data-testid="preview-label">
          {getChannelIcon()} {getChannelLabel()}
        </label>
        {showCharacterCount && (
          <span
            className={cn(
              'text-xs font-medium',
              isSmsOverLimit ? 'text-red-600' : 'text-gray-500'
            )}
            data-testid="character-count"
          >
            {characterCount} / {channel === 'email' ? '∞' : smsLimit} characters
          </span>
        )}
      </div>

      <div
        className={cn(
          'p-4 rounded-lg border font-mono text-sm whitespace-pre-wrap break-words',
          getChannelStyle()
        )}
        data-testid="preview-content"
      >
        {previewMessage || (
          <span className="text-gray-400 italic">No message content...</span>
        )}

        {hasUnreplacedVariables && hasUnreplacedVariables.length > 0 && (
          <div className="mt-3 p-2 rounded bg-red-50 border border-red-200" data-testid="unreplaced-variables-warning">
            <p className="text-xs text-red-700 font-medium">
              ⚠️ Unreplaced variables:
            </p>
            <ul className="mt-1 text-xs text-red-600" data-testid="unreplaced-variables-list">
              {hasUnreplacedVariables.map((variable, index) => (
                <li key={index} className="ml-2 list-disc">
                  {variable}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-red-700">
              These variables will not be replaced when sending. Please ensure all variables have values.
            </p>
          </div>
        )}
      </div>

      {isSmsOverLimit && (
        <div className="flex items-start gap-2 p-2 rounded bg-red-50 border border-red-200" data-testid="sms-limit-warning">
          <span className="text-red-600">⚠️</span>
          <div className="flex-1">
            <p className="text-xs text-red-700 font-medium">
              SMS over character limit
            </p>
            <p className="text-xs text-red-600 mt-1">
              Your message is {characterCount - smsLimit} characters over SMS limit of {smsLimit}. Consider shortening message or using Email.
            </p>
          </div>
        </div>
      )}

      {Object.keys(variables).length > 0 && (
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200" data-testid="variable-values">
          <p className="text-xs font-medium text-gray-700 mb-2">
            Variable Values Used:
          </p>
          <div className="space-y-1">
            {Object.entries(variables).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-xs" data-testid={`variable-value-${key}`}>
                <code className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded font-mono">
                  {`{{${key}}}`}
                </code>
                <span className="text-gray-600">→</span>
                <span className="text-gray-900 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

MessagePreview.displayName = 'MessagePreview';

export { MessagePreview };
