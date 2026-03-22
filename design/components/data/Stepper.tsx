import { cn } from '../utils';
import type { StepProps } from '../types';

export interface StepperProps {
  steps: StepProps[];
  currentStep?: number;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Stepper = ({
  steps,
  currentStep = 0,
  orientation = 'horizontal',
  size = 'md',
  className,
}: StepperProps) => {
  const stepperClasses = cn(
    // Base stepper styles
    'flex',
    {
      'flex-col space-y-4': orientation === 'vertical',
      'flex-row space-x-4': orientation === 'horizontal',
    },

    // Custom classes
    className
  );

  const getStepClasses = (index: number) => {
    const isCompleted = index < currentStep;
    const isCurrent = index === currentStep;
    const isUpcoming = index > currentStep;

    return cn(
      // Base step styles
      'flex items-center',
      {
        'flex-col space-y-2': orientation === 'vertical',
        'flex-col space-y-1': orientation === 'horizontal',
      }
    );
  };

  const getNumberClasses = (index: number) => {
    const isCompleted = index < currentStep;
    const isCurrent = index === currentStep;
    const isUpcoming = index > currentStep;

    return cn(
      // Base number styles
      'flex items-center justify-center rounded-full border-2 font-medium transition-colors',
      {
        'w-6 h-6 text-xs': size === 'sm',
        'w-8 h-8 text-sm': size === 'md',
        'w-10 h-10 text-base': size === 'lg',
      },

      // State-based styles
      {
        'bg-green-500 border-green-500 text-white': isCompleted,
        'bg-gold-500 border-gold-500 text-white': isCurrent,
        'border-gray-300 text-gray-400 bg-white': isUpcoming,
      }
    );
  };

  const getContentClasses = (index: number) => {
    const isCurrent = index === currentStep;

    return cn(
      // Base content styles
      'text-center',
      {
        'text-left': orientation === 'vertical',
      },

      // Current step highlighting
      isCurrent && 'text-navy-900',
      !isCurrent && 'text-gray-600'
    );
  };

  return (
    <div className={stepperClasses}>
      {steps.map((step, index) => (
        <div key={index} className={getStepClasses(index)}>
          {/* Step number/icon */}
          <div className={getNumberClasses(index)}>
            {step.completed ? (
              <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              index + 1
            )}
          </div>

          {/* Step content */}
          <div className={getContentClasses(index)}>
            <div className={cn(
              'font-medium',
              {
                'text-sm': size === 'sm',
                'text-base': size === 'md',
                'text-lg': size === 'lg',
              }
            )}>
              {step.title}
            </div>
            {step.description && (
              <div className={cn(
                'text-sm text-gray-500 mt-1',
                {
                  'hidden': orientation === 'horizontal' && size === 'sm',
                }
              )}>
                {step.description}
              </div>
            )}
          </div>

          {/* Connector line (for horizontal orientation) */}
          {orientation === 'horizontal' && index < steps.length - 1 && (
            <div className="flex-1 h-px bg-gray-300 mx-4 mt-4" />
          )}
        </div>
      ))}
    </div>
  );
};

Stepper.displayName = 'Stepper';

export { Stepper };