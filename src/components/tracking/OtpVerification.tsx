import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { cn } from '../utils';

interface OtpVerificationProps {
  onVerify: (otp: string) => void;
  onResend: () => void;
  error?: string;
  isSubmitting?: boolean;
  isResending?: boolean;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({
  onVerify,
  onResend,
  error,
  isSubmitting = false,
  isResending = false
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first empty input
  useEffect(() => {
    if (otp.join('') === '') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [otp]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits, auto-advance to next input
    if (/^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 4) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 50);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    const input = inputRefs.current[index];
    
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      
      // Focus previous input
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 50);
    }
    
    // Handle arrow keys for navigation
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && index > 0) {
      e.preventDefault();
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 50);
    }
    
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && index > 0) {
      e.preventDefault();
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 50);
    }
    
    if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && index < 4) {
      e.preventDefault();
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 50);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      
      // Focus last filled input
      setTimeout(() => {
        const lastFilledIndex = newOtp.findIndex(digit => digit !== '');
        if (lastFilledIndex !== -1) {
          inputRefs.current[lastFilledIndex]?.focus();
        }
      }, 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      return; // Don't submit incomplete OTP
    }
    
    onVerify(otpValue);
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '', '']);
    setTimeLeft(60);
    onResend();
  };

  const canResend = timeLeft === 0;

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Verify Your Identity
          </h2>
          <p className="text-gray-600 mb-6">
            Enter the 6-digit code sent to your registered mobile number
          </p>

          {/* 6 Digit Inputs */}
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3, 4, 5].map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={otp[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={cn(
                  'w-12 h-14 text-center text-lg font-semibold border-2 rounded-md',
                  'border-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500',
                  error && 'border-red-500 focus:ring-red-500'
                )}
                aria-label={`OTP digit ${index + 1} of 6`}
                aria-invalid={!!error}
                disabled={isSubmitting}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {error && (
            <div 
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v6a2 2 0 00-2 2v6a2 2 0 00-2 2l2 2m-2a2 2 0 01-2 2v10a1 1 0 001 1h-3m10-11l2 2m-2-2v10a1 1 0 001 1h-3m-6 0a1 1 0 001 1v4a1 1 0 003-1z" />
                </svg>
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <Button
              variant="secondary"
              onClick={handleResend}
              disabled={!canResend || isResending}
              className="flex-1"
            >
              {isResending ? 'Sending...' : `Resend Code ${canResend ? '' : `(${timeLeft}s)`}`}
            </Button>

            <Button
              type="submit"
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || otp.join('').length !== 6}
              className="flex-1"
            >
              {isSubmitting ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </div>

          {/* Resend Timer */}
          {timeLeft > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Resend code in {timeLeft} seconds
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};