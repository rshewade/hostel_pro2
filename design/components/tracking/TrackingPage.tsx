import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

type ApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'INTERVIEW_SCHEDULED' | 'INTERVIEW_COMPLETED' | 'PROVISIONALLY_APPROVED' | 'FINAL_APPROVED' | 'REJECTED';

interface TimelineStep {
  step: number;
  title: string;
  description?: string;
  completed?: boolean;
  date?: string;
  time?: string;
  status?: ApplicationStatus;
}

interface TrackingData {
  trackingNumber: string;
  applicantName: string;
  vertical: string;
  appliedDate: string;
  currentStatus: ApplicationStatus;
  interviewDetails?: {
    mode: 'ONLINE' | 'PHYSICAL';
    date?: string;
    time?: string;
    venue?: string;
    meetingLink?: string;
    status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
    countdown?: {
      days?: number;
      hours?: number;
      minutes?: number;
    };
  };
  documentsRequired?: boolean;
  actions?: {
    canReupload: boolean;
    canConfirmInterview?: boolean;
    canDownloadLetter?: boolean;
    canWithdraw?: boolean;
  };
}

interface TrackingPageProps {
  trackingId: string;
}

export const TrackingPage = ({ trackingId }: TrackingPageProps) => {
  const [trackingData, setTrackingData] = React.useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const mockData: TrackingData = {
        trackingNumber: trackingId.toUpperCase(),
        applicantName: 'Rahul Kumar Sharma',
        vertical: 'BOYS_HOSTEL',
        appliedDate: '2024-12-15',
        currentStatus: 'UNDER_REVIEW',
        interviewDetails: {
          mode: 'ONLINE',
          date: '2025-01-10',
          time: '10:00 AM',
          venue: 'Google Meet - https://meet.google.com/xyz-abc123',
          meetingLink: 'https://meet.google.com/xyz-abc123',
          status: 'UPCOMING',
          countdown: {
            days: 2,
            hours: 14,
            minutes: 30
          }
        },
        documentsRequired: true,
        actions: {
          canReupload: true,
          canConfirmInterview: true,
          canDownloadLetter: false
        }
      };

      setTrackingData(mockData);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [trackingId]);

  const getInterviewStatusBadge = (status: string): string => {
    switch (status) {
      case 'UPCOMING': return 'Upcoming';
      case 'IN_PROGRESS': return 'In Progress';
      case 'COMPLETED': return 'Completed';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-200"></div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card max-w-md w-full">
          <div className="text-center p-8">
            <div className="text-red-600 text-lg mb-4">⚠️ Tracking ID not found</div>
            <p className="text-gray-600">Please check your tracking ID and try again.</p>
            <Button onClick={() => window.history.back()} className="mt-4">Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-xl font-semibold text-gray-900">Application Tracking</div>
              </div>
              <Button variant="ghost" onClick={() => window.history.back()}>Back to Home</Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-6 py-8">
          {/* Applicant Summary */}
          <div className="card lg:col-span-2">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Summary</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-medium text-gray-900">{trackingData.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Applicant Name</p>
                    <p className="font-medium text-gray-900">{trackingData.applicantName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Vertical</p>
                    <p className="font-medium text-gray-900">{trackingData.vertical}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Applied Date</p>
                    <p className="font-medium text-gray-900">{trackingData.appliedDate}</p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Current Status: {trackingData.currentStatus}</p>
              </div>
            </div>
          </div>

          {/* Interview Details */}
          {trackingData.interviewDetails && (
            <div className="card lg:col-span-1">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Mode</p>
                      <p className="font-medium text-gray-900">
                        {trackingData.interviewDetails.mode === 'ONLINE' ? 'Online Interview' : 'Physical Interview'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium text-gray-900">
                        {trackingData.interviewDetails.date} at {trackingData.interviewDetails.time}
                      </p>
                    </div>
                  </div>

                  {trackingData.interviewDetails.venue && (
                    <div>
                      <p className="text-sm text-gray-600">Venue</p>
                      <p className="font-medium text-gray-900">{trackingData.interviewDetails.venue}</p>
                    </div>
                  )}

                  {trackingData.interviewDetails?.meetingLink && (
                    <div>
                      <p className="text-sm text-gray-600">Meeting Link</p>
                      <a
                        href={trackingData.interviewDetails.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-800 underline"
                      >
                        {trackingData.interviewDetails.meetingLink}
                      </a>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant="info">{getInterviewStatusBadge(trackingData.interviewDetails.status)}</Badge>
                  </div>

                  {trackingData.interviewDetails.countdown && (
                    <div>
                      <p className="text-sm text-gray-600">Time Until Interview</p>
                      <p className="font-medium text-orange-600">
                        {trackingData.interviewDetails.countdown.days} days, {trackingData.interviewDetails.countdown.hours} hours, {trackingData.interviewDetails.countdown.minutes} minutes
                      </p>
                    </div>
                  )}
                </div>

                {/* Interview Status Actions */}
                {trackingData.interviewDetails.status === 'UPCOMING' && trackingData.actions?.canConfirmInterview && (
                  <div className="mt-6">
                    <Button className="w-full">
                      Confirm Interview Slot
                    </Button>
                  </div>
                )}

                {trackingData.interviewDetails.status === 'COMPLETED' && (
                  <div className="mt-6">
                    <Badge variant="success">{getInterviewStatusBadge(trackingData.interviewDetails.status)}</Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Prompts */}
          <div className="card lg:col-span-1">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

              {/* Alert for Document Re-upload */}
              {trackingData.documentsRequired && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v6a2 2 0 00-2 2h10a2 2 0 002 2v4a2 2 0 01-2 2h12a2 2 0 002-2v8a2 2 0 011-2h6a2 2 0 011-2h2a2 2 0 01-1v2a1 1 0 01-1h2m-2 2v4a1 1 0 01-1h3m10-11l2 9-1a1 1 0 002-2h2a1 1 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Document Re-upload Required</p>
                      <p className="text-sm text-gray-600 mt-1">Please upload updated documents to continue processing</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Download Provisional Letter */}
              {trackingData.actions?.canDownloadLetter && (
                <Button className="w-full mb-4">
                  Download Provisional Letter
                </Button>
              )}

              {/* Withdraw Application */}
              {trackingData.actions?.canWithdraw && (
                <Button variant="destructive" className="w-full">
                  Withdraw Application
                </Button>
              )}

              {/* Contact Support */}
              <Button variant="secondary" className="w-full">
                Contact Support
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            For assistance, please contact the admissions office at +91 22 2414 1234
          </p>
        </div>
      </div>
    </div>
  );
};
