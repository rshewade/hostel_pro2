'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '../utils';
import { Button } from '../ui/Button';
import { Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { Stepper, Step } from './Stepper';

export interface WizardFormData {
  [key: string]: any;
}

export interface FormWizardProps {
  steps: {
    id: string;
    title: string;
    description?: string;
    component: React.FC<{
      data: WizardFormData;
      onChange: (key: string, value: any) => void;
      errors: Record<string, string>;
      setErrors: (errors: Record<string, string>) => void;
      isValid: boolean;
      setIsValid: (valid: boolean) => void;
      saving?: boolean;
    }>;
    validate?: (data: WizardFormData) => Record<string, string> | null;
  }[];
  initialData?: WizardFormData;
  onSaveDraft?: (data: WizardFormData, step: number) => Promise<void>;
  onSubmit?: (data: WizardFormData) => Promise<void>;
  onSubmitLabel?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const FormWizard: React.FC<FormWizardProps> = ({
  steps,
  initialData = {},
  onSaveDraft,
  onSubmit,
  onSubmitLabel = 'Submit Application',
  orientation = 'horizontal',
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stepValidity, setStepValidity] = useState<boolean[]>(
    new Array(steps.length).fill(false)
  );
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  const CurrentStepComponent = steps[currentStep].component;

  const handleChange = useCallback((key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  }, [errors]);

  const validateCurrentStep = useCallback((): boolean => {
    const validate = steps[currentStep].validate;
    if (!validate) return true;

    const validationErrors = validate(formData);
    if (validationErrors) {
      setErrors(validationErrors);
      return false;
    }
    return true;
  }, [currentStep, steps, formData]);

  const handleNext = useCallback(async () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  }, [validateCurrentStep, steps.length]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const handleStepClick = useCallback((stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  }, [currentStep]);

  const handleSaveDraft = useCallback(async () => {
    if (onSaveDraft) {
      setSaving(true);
      try {
        await onSaveDraft(formData, currentStep);
        setLastSavedTime(new Date());
      } catch (error) {
        console.error('Failed to save draft:', error);
      } finally {
        setSaving(false);
      }
    }
  }, [formData, currentStep, onSaveDraft]);

  const handleSubmit = useCallback(async () => {
    if (validateCurrentStep()) {
      setSubmitting(true);
      try {
        if (onSubmit) {
          await onSubmit(formData);
        }
      } catch (error) {
        console.error('Failed to submit:', error);
      } finally {
        setSubmitting(false);
      }
    }
  }, [validateCurrentStep, formData, onSubmit]);

  const updateStepValidity = useCallback((isValid: boolean) => {
    setStepValidity(prev => {
      const newValidity = [...prev];
      newValidity[currentStep] = isValid;
      return newValidity;
    });
  }, [currentStep]);

  const stepperSteps: Step[] = steps.map((step, index) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    status:
      index === currentStep
        ? 'in-progress'
        : index < currentStep
        ? 'completed'
        : stepValidity[index]
        ? 'completed'
        : 'pending',
  }));

  const canGoNext = stepValidity[currentStep] || Object.keys(errors).length === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className={cn('w-full', className)}>
      <Stepper
        steps={stepperSteps}
        currentStep={currentStep}
        orientation={orientation}
        onStepClick={handleStepClick}
        className="mb-8"
      />

      <div className="card">
        <div className="p-6 md:p-8">
          {lastSavedTime && (
            <div className="mb-4 flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Save className="w-4 h-4 text-green-600" />
              <span>Saved as draft at {lastSavedTime.toLocaleTimeString()}</span>
            </div>
          )}

          <CurrentStepComponent
            data={formData}
            onChange={handleChange}
            errors={errors}
            setErrors={setErrors}
            isValid={stepValidity[currentStep] || false}
            setIsValid={updateStepValidity}
            saving={saving}
          />
        </div>

        <div className="border-t px-6 py-4 flex items-center justify-between gap-4" style={{ borderColor: 'var(--border-primary)' }}>
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={saving || !onSaveDraft}
              loading={saving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </Button>

            {isLastStep ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!canGoNext || submitting}
                loading={submitting}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                {submitting ? 'Submitting...' : onSubmitLabel}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canGoNext}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

FormWizard.displayName = 'FormWizard';

export { FormWizard };
