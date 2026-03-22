'use client';

import { cn } from '../utils';

export interface Channel {
  id: 'sms' | 'whatsapp' | 'email';
  label: string;
  icon?: string;
  disabled?: boolean;
}

export interface ChannelToggleProps {
  channels: Channel[];
  selectedChannels: string[];
  onChange: (channelIds: string[]) => void;
  className?: string;
  disabled?: boolean;
}

const ChannelToggle = ({
  channels,
  selectedChannels,
  onChange,
  className,
  disabled = false,
}: ChannelToggleProps) => {
  const toggleChannel = (channelId: string) => {
    if (disabled) return;

    if (selectedChannels.includes(channelId)) {
      onChange(selectedChannels.filter(id => id !== channelId));
    } else {
      onChange([...selectedChannels, channelId]);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)} data-testid="channel-toggle-container">
      {channels.map((channel) => {
        const isSelected = selectedChannels.includes(channel.id);

        return (
          <button
            key={channel.id}
            type="button"
            disabled={disabled || channel.disabled}
            onClick={() => toggleChannel(channel.id)}
            aria-pressed={isSelected}
            data-testid={`channel-button-${channel.id}`}
            data-selected={isSelected}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all',
              'focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isSelected
                ? 'border-gold-600 bg-gold-500 text-white shadow-md'
                : 'border-gray-300 text-gray-700 bg-white hover:border-gray-400 hover:bg-gray-50'
            )}
          >
            {channel.icon && <span className="text-lg" data-testid={`channel-icon-${channel.id}`}>{channel.icon}</span>}
            <span data-testid={`channel-label-${channel.id}`}>{channel.label}</span>
          </button>
        );
      })}
    </div>
  );
};

ChannelToggle.displayName = 'ChannelToggle';

export { ChannelToggle };
