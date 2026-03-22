import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils';

interface OtpInputProps {
  length?: number;
  initialValue?: string;
  onChange?: (otp: string) => void;
  onComplete?: (otp: string) => void;
  error?: string;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  initialValue = '',
  onChange,
  onComplete,
  error,
  disabled = false,
}) => {
  const [otp, setOtp] = useState<string[]>(
    initialValue.split('').concat(Array(length).fill('')).slice(0, length)
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    const otpString = newOtp.join('');
    onChange?.(otpString);

    const otpComplete = otpString.length === length && !otpString.includes('');
    if (otpComplete) {
      onComplete?.(otpString);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              if (el) {
                inputRefs.current[index] = el;
              }
            }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={disabled}
            className={cn(
              'w-12 h-12 text-center text-lg font-semibold',
              'border-2 rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-gold-500',
              error ? 'border-red-500' : 'border-gray-300',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`OTP digit ${index + 1}`}
            autoComplete="one-time-code"
          />
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
};

OtpInput.displayName = 'OtpInput';
