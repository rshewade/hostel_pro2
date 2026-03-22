'use client';

import { useState } from 'react';
import { cn } from '../utils';
import { Button } from '../ui/Button';

export type Supervisor = {
  id: string;
  name: string;
  role: 'superintendent' | 'trustee' | 'accounts' | 'admin';
  vertical?: 'BOYS' | 'GIRLS' | 'DHARAMSHALA';
  available?: boolean;
}

export type EscalationSelectorProps = {
  supervisors: Supervisor[];
  selectedSupervisorId?: string;
  onSelect: (supervisorId: string | undefined) => void;
  context?: string;
  disabled?: boolean;
}

const EscalationSelector = ({
  supervisors,
  selectedSupervisorId,
  onSelect,
  context,
  disabled = false,
}: EscalationSelectorProps) => {
  const [showReason, setShowReason] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');

  const selectedSupervisor = supervisors.find(s => s.id === selectedSupervisorId);

  const getRoleBadgeColor = (role: Supervisor['role']) => {
    switch (role) {
      case 'trustee':
        return 'bg-purple-100 text-purple-700';
      case 'accounts':
        return 'bg-blue-100 text-blue-700';
      case 'admin':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const getRoleLabel = (role: Supervisor['role']) => {
    switch (role) {
      case 'trustee':
        return 'Trustee';
      case 'accounts':
        return 'Accounts';
      case 'admin':
        return 'Administrator';
      default:
        return 'Superintendent';
    }
  };

  const getVerticalBadge = (vertical?: Supervisor['vertical']) => {
    if (!vertical) return null;

    switch (vertical) {
      case 'BOYS':
        return 'bg-blue-100 text-blue-700';
      case 'GIRLS':
        return 'bg-pink-100 text-pink-700';
      case 'DHARAMSHALA':
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const handleEscalate = () => {
    if (selectedSupervisor) {
      onSelect(selectedSupervisor.id);
      setShowReason(true);
    }
  };

  const handleCancelEscalation = () => {
    setShowReason(false);
    setEscalationReason('');
    onSelect(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border-2 border-orange-200 bg-orange-50">
        <div className="flex items-start gap-2 mb-3">
          <span className="text-xl">🚨</span>
          <div>
            <h4 className="font-semibold text-orange-900">
              Escalation Required?
            </h4>
            <p className="text-sm text-orange-700 mt-1">
              Select a supervisor to notify for urgent matters requiring immediate attention.
            </p>
          </div>
        </div>

        {context && (
          <div className="p-3 rounded bg-orange-100 border border-orange-200 mb-3">
            <p className="text-xs font-medium text-orange-800 mb-1">
              Communication Context
            </p>
            <p className="text-xs text-orange-700">
              {context}
            </p>
          </div>
        )}

        {!showReason ? (
          <>
            {supervisors.length === 0 ? (
              <p className="text-sm text-orange-700 italic">
                No supervisors available for escalation
              </p>
            ) : (
              <div className="space-y-2">
                {supervisors.map((supervisor) => {
                  const isSelected = supervisor.id === selectedSupervisorId;

                  return (
                    <button
                      key={supervisor.id}
                      type="button"
                      disabled={disabled || !supervisor.available}
                      onClick={() => onSelect(supervisor.id)}
                      className={cn(
                        'w-full text-left px-4 py-3 rounded-lg border-2 transition-all',
                        'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        isSelected
                          ? 'border-orange-600 bg-orange-100 shadow-md'
                          : 'border-orange-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-orange-900">
                              {supervisor.name}
                            </span>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium',
                                getRoleBadgeColor(supervisor.role)
                              )}
                            >
                              {getRoleLabel(supervisor.role)}
                            </span>
                            {supervisor.vertical && (
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded text-xs font-medium',
                                  getVerticalBadge(supervisor.vertical)
                                )}
                              >
                                {supervisor.vertical}
                              </span>
                            )}
                          </div>

                          {!supervisor.available && (
                            <p className="text-xs text-orange-600 mt-1">
                              ⚠️ Currently unavailable
                            </p>
                          )}
                        </div>

                        {isSelected && (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white">
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

            <div className="mt-4 flex gap-2">
              {selectedSupervisorId && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleEscalate}
                  disabled={disabled || !supervisors.find(s => s.id === selectedSupervisorId)?.available}
                >
                  Confirm Escalation
                </Button>
              )}

              {selectedSupervisorId && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSelect(undefined)}
                  disabled={disabled}
                >
                  Cancel Selection
                </Button>
              )}

              {!selectedSupervisorId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelect(undefined)}
                  disabled={disabled}
                >
                  Skip Escalation
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded bg-orange-100 border border-orange-200">
              <p className="text-xs font-medium text-orange-800 mb-1">
                Escalation To:
              </p>
              <p className="text-sm font-medium text-orange-900">
                {selectedSupervisor?.name} ({getRoleLabel(selectedSupervisor?.role || 'superintendent')})
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">
                Escalation Reason (Optional)
              </label>
              <textarea
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Provide context for this escalation..."
                className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px] bg-white"
                disabled={disabled}
                maxLength={500}
              />
              <p className="text-xs text-orange-700 mt-1">
                {escalationReason.length} / 500 characters
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowReason(false)}
                disabled={disabled}
              >
                Save Reason
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancelEscalation}
                disabled={disabled}
              >
                Cancel Escalation
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-2">
          <span className="text-blue-600">ℹ️</span>
          <div>
            <p className="text-sm font-medium text-blue-800">
              About Escalation
            </p>
            <ul className="mt-1 space-y-1 text-xs text-blue-700">
              <li className="flex items-start gap-1">
                <span>•</span>
                <span>Use escalation only for urgent or high-priority communications</span>
              </li>
              <li className="flex items-start gap-1">
                <span>•</span>
                <span>Supervisor will receive immediate notification</span>
              </li>
              <li className="flex items-start gap-1">
                <span>•</span>
                <span>Escalation is logged in audit trail with timestamp</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

EscalationSelector.displayName = 'EscalationSelector';

export { EscalationSelector };
