'use client';

import React, { ReactNode } from 'react';
import { cn } from '../utils';
import { Check } from 'lucide-react';

export interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  size = 'md',
  onStepClick,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const handleStepClick = (index: number) => {
    if (onStepClick && steps[index].status !== 'pending') {
      onStepClick(index);
    }
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = step.status === 'completed';
          const isError = step.status === 'error';
          const canNavigate = step.status !== 'pending' || index <= currentStep;

          return (
            <div key={step.id} className="flex items-start gap-4">
              <div className="relative flex flex-col items-center">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!canNavigate}
                  className={cn(
                    'rounded-full flex items-center justify-center font-medium transition-colors duration-200 border-2',
                    sizeClasses[size],
                    {
                      'bg-gold-500 border-gold-500 text-white': isActive,
                      'bg-green-500 border-green-500 text-white': isCompleted,
                      'bg-red-500 border-red-500 text-white': isError,
                      'bg-white border-gray-300 text-gray-600': !isActive && !isCompleted && !isError,
                      'hover:border-gold-500 hover:text-gold-500 cursor-pointer': canNavigate && !isActive,
                      'opacity-50 cursor-not-allowed': !canNavigate,
                    }
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
                  ) : (
                    index + 1
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div className="absolute top-8 left-1/2 w-0.5 h-full -translate-x-1/2 border-l-2 border-dashed border-gray-300" />
                )}
              </div>

              <div className="flex-1 pt-1">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!canNavigate}
                  className={cn(
                    'text-left transition-colors',
                    {
                      'font-semibold text-navy-900': isActive,
                      'text-navy-700': isCompleted,
                      'text-gray-500': !isActive && !isCompleted && !isError,
                    }
                  )}
                >
                  <div className={size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}>
                    {step.title}
                  </div>
                  {step.description && (
                    <div className={cn('text-sm', size === 'sm' ? 'mt-0.5' : 'mt-1')} style={{ color: 'var(--text-secondary)' }}>
                      {step.description}
                    </div>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = step.status === 'completed';
          const isError = step.status === 'error';
          const canNavigate = step.status !== 'pending' || index <= currentStep;

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!canNavigate}
                  className={cn(
                    'rounded-full flex items-center justify-center font-medium transition-colors duration-200 border-2',
                    sizeClasses[size],
                    {
                      'bg-gold-500 border-gold-500 text-white': isActive,
                      'bg-green-500 border-green-500 text-white': isCompleted,
                      'bg-red-500 border-red-500 text-white': isError,
                      'bg-white border-gray-300 text-gray-600': !isActive && !isCompleted && !isError,
                      'hover:border-gold-500 hover:text-gold-500 cursor-pointer': canNavigate && !isActive,
                      'opacity-50 cursor-not-allowed': !canNavigate,
                    }
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
                  ) : (
                    index + 1
                  )}
                </button>
                <span
                  className={cn(
                    'font-medium hidden sm:block',
                    {
                      'text-navy-900': isActive,
                      'text-navy-700': isCompleted,
                      'text-gray-500': !isActive && !isCompleted && !isError,
                      'text-sm': size === 'sm',
                      'text-base': size === 'md',
                      'text-lg': size === 'lg',
                    }
                  )}
                >
                  {step.title}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 border-t-2 border-dashed',
                    {
                      'border-green-500': isCompleted && (index + 1 < currentStep || steps[index + 1].status === 'completed'),
                      'border-gray-300': !isCompleted || !(index + 1 < currentStep),
                    }
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

Stepper.displayName = 'Stepper';

export { Stepper };
