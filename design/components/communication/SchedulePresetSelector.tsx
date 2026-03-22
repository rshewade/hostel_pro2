'use client';

import { Select, type SelectOption } from '../forms/Select';

export type SchedulePreset = {
  id: string;
  label: string;
  calculateDate: (baseDate?: Date) => Date;
}

export type SchedulePresetSelectorProps = {
  presets?: SchedulePreset[];
  baseDate?: Date;
  onSelect: (date: Date) => void;
  disabled?: boolean;
}

const DEFAULT_PRESETS: SchedulePreset[] = [
  {
    id: 'now',
    label: 'Send Now',
    calculateDate: () => new Date(),
  },
  {
    id: 'in_1_hour',
    label: 'In 1 Hour',
    calculateDate: (baseDate) => {
      const date = baseDate || new Date();
      const result = new Date(date);
      result.setHours(result.getHours() + 1);
      return result;
    },
  },
  {
    id: 'in_3_hours',
    label: 'In 3 Hours',
    calculateDate: (baseDate) => {
      const date = baseDate || new Date();
      const result = new Date(date);
      result.setHours(result.getHours() + 3);
      return result;
    },
  },
  {
    id: 'tomorrow_9am',
    label: 'Tomorrow at 9:00 AM',
    calculateDate: (baseDate) => {
      const date = baseDate || new Date();
      const result = new Date(date);
      result.setDate(result.getDate() + 1);
      result.setHours(9, 0, 0, 0);
      return result;
    },
  },
  {
    id: 'tomorrow_5pm',
    label: 'Tomorrow at 5:00 PM',
    calculateDate: (baseDate) => {
      const date = baseDate || new Date();
      const result = new Date(date);
      result.setDate(result.getDate() + 1);
      result.setHours(17, 0, 0, 0);
      return result;
    },
  },
  {
    id: 'in_3_days',
    label: 'In 3 Days (at 9:00 AM)',
    calculateDate: (baseDate) => {
      const date = baseDate || new Date();
      const result = new Date(date);
      result.setDate(result.getDate() + 3);
      result.setHours(9, 0, 0, 0);
      return result;
    },
  },
  {
    id: 'in_7_days',
    label: 'In 7 Days (at 9:00 AM)',
    calculateDate: (baseDate) => {
      const date = baseDate || new Date();
      const result = new Date(date);
      result.setDate(result.getDate() + 7);
      result.setHours(9, 0, 0, 0);
      return result;
    },
  },
  {
    id: 'next_monday_9am',
    label: 'Next Monday at 9:00 AM',
    calculateDate: (baseDate) => {
      const date = baseDate || new Date();
      const result = new Date(date);
      const day = result.getDay();
      const diff = (1 - day + 7) % 7 || 7;
      result.setDate(result.getDate() + diff);
      result.setHours(9, 0, 0, 0);
      return result;
    },
  },
];

const SchedulePresetSelector = ({
  presets = DEFAULT_PRESETS,
  baseDate,
  onSelect,
  disabled = false,
}: SchedulePresetSelectorProps) => {
  const presetOptions: SelectOption[] = presets.map(preset => ({
    value: preset.id,
    label: preset.label,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = presets.find(p => p.id === e.target.value);
    if (preset) {
      onSelect(preset.calculateDate(baseDate));
    }
  };

  return (
    <div className="space-y-2">
      <Select
        label="Quick Schedule Presets"
        options={presetOptions}
        placeholder="Select a preset..."
        onChange={handleChange}
        disabled={disabled}
        helperText="Select a preset to quickly set schedule date and time"
      />
    </div>
  );
};

SchedulePresetSelector.displayName = 'SchedulePresetSelector';

export { SchedulePresetSelector, DEFAULT_PRESETS };
