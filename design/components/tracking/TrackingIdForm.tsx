import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { cn } from '../utils';

interface TrackingIdFormProps {
  onSubmit: (trackingId: string) => void;
  error?: string;
  isSubmitting?: boolean;
}

export const TrackingIdForm: React.FC<TrackingIdFormProps> = ({ 
  onSubmit, 
  error, 
  isSubmitting = false 
}) => {
  const [trackingId, setTrackingId] = useState('');
  const [fieldError, setFieldError] = useState('');

  const validateTrackingId = (id: string): boolean => {
    // Alphanumeric validation, 10-15 characters as specified
    const isValid = /^[A-Za-z0-9]{10,15}$/.test(id);
    
    if (!isValid) {
      setFieldError('Tracking ID must be 10-15 alphanumeric characters');
      return false;
    }
    
    if (id.length < 10 || id.length > 15) {
      setFieldError('Tracking ID must be between 10-15 characters');
      return false;
    }
    
    setFieldError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTrackingId(trackingId)) {
      return;
    }
    
    onSubmit(trackingId);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Enter Application Tracking ID
          </h2>
          <p className="text-gray-600 mb-4">
            Please enter the tracking ID provided in your confirmation email or SMS
          </p>
        </div>

        {error && (
          <div 
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4"
            role="alert"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg 
                  className="w-5 h-5 text-red-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v6a2 2 0 00-2-2V6a2 2 0 00-2 2h10a2 2 0 00-2-2v6a2 2 0 00-2 2M12 14a7 7 0 00-7 7h14a7 7 0 00-7 7z" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label 
              htmlFor="trackingId" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Application Tracking ID
            </label>
            <div className="relative">
              <input
                type="text"
                id="trackingId"
                name="trackingId"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g., JHM2024001234"
                className={cn(
                  'w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500',
                  fieldError && 'border-red-500 focus:ring-red-500'
                )}
                aria-describedby="trackingId-error"
                aria-invalid={!!fieldError}
                disabled={isSubmitting}
                maxLength={15}
                pattern="[A-Za-z0-9]{10,15}"
                required
                aria-label="Application Tracking ID"
              />
              {fieldError && (
                <div 
                  id="trackingId-error"
                  className="text-sm text-red-600 mt-1"
                  role="alert"
                  aria-live="polite"
                >
                  {fieldError}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!trackingId || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Verifying...' : 'Continue to Tracking'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Tracking ID should be provided in your confirmation email or SMS message
          </p>
        </div>
      </div>
    </div>
  );
};