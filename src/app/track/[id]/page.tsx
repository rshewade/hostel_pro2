'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Application {
  id: string;
  tracking_number: string;
  type: string;
  applicant_mobile: string;
  current_status: string;
  vertical: string;
  data: any;
  submitted_at: string;
  created_at: string;
}

interface Document {
  id: string;
  document_type: string;
  verification_status: string;
  uploaded_at: string;
}

interface Interview {
  id: string;
  schedule_time: string;
  mode: string;
  status: string;
  internal_remarks?: string;
}

const statusConfig = {
  DRAFT: {
    label: 'Draft',
    color: 'gray',
    description: 'Application is being prepared'
  },
  SUBMITTED: {
    label: 'Submitted',
    color: 'blue',
    description: 'Application submitted and under initial review'
  },
  REVIEW: {
    label: 'Under Review',
    color: 'yellow',
    description: 'Application is being reviewed by superintendent'
  },
  APPROVED: {
    label: 'Approved',
    color: 'green',
    description: 'Application approved, awaiting final processing'
  },
  REJECTED: {
    label: 'Rejected',
    color: 'red',
    description: 'Application has been rejected'
  }
};

const statusSteps = [
  { status: 'DRAFT', label: 'Draft', order: 1 },
  { status: 'SUBMITTED', label: 'Submitted', order: 2 },
  { status: 'REVIEW', label: 'Under Review', order: 3 },
  { status: 'APPROVED', label: 'Approved', order: 4 },
  { status: 'REJECTED', label: 'Rejected', order: 5 }
];

// Helper function to get the order of current status in the application flow
function getCurrentStepOrder(status: string): number {
  const statusOrder: { [key: string]: number } = {
    'DRAFT': 1,
    'SUBMITTED': 2,
    'REVIEW': 3,
    'INTERVIEW': 4,
    'APPROVED': 5,
    'REJECTED': 5,
    'ARCHIVED': 6
  };
  return statusOrder[status] || 0;
}

// Helper function to map color names to Tailwind classes
function getStatusColor(color: string | undefined): string {
  const colorMap: { [key: string]: string } = {
    'gray': 'bg-gray-100 text-gray-700',
    'blue': 'bg-blue-100 text-blue-700',
    'yellow': 'bg-yellow-100 text-yellow-700',
    'green': 'bg-green-100 text-green-700',
    'red': 'bg-red-100 text-red-700'
  };
  return colorMap[color || 'gray'] || colorMap.gray;
}

export default function TrackingDetailPage() {
  const params = useParams();
  const trackingId = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploading, setUploading] = useState(false);
  const [timeUntilInterview, setTimeUntilInterview] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  // Get current status safely (returns default status if application is null)
  const currentStepOrder = getCurrentStepOrder(application?.current_status || '');

  const hasPendingDocuments = documents.some(d => d.verification_status === 'PENDING');
  const isAwaitingDocuments = application?.current_status === 'REVIEW' && hasPendingDocuments;

  const getStatusAlert = () => {
    if (!application) return null;

    switch (application.current_status) {
      case 'SUBMITTED':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Application Submitted</h4>
                <p className="text-sm text-blue-700">
                  Your application has been received and is under initial review. We will notify you when it moves to the next stage.
                </p>
              </div>
            </div>
          </div>
        );

      case 'REVIEW':
        if (hasPendingDocuments) {
          return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-900 mb-1">Action Required: Documents Pending</h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    Some of your documents need attention. Please re-upload the documents marked as pending below to continue with your application.
                  </p>
                  <button
                    className="text-sm font-medium text-yellow-800 hover:underline"
                    onClick={() => setShowReuploadModal(true)}
                  >
                    Re-upload Documents →
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-yellow-900 mb-1">Under Review</h4>
                <p className="text-sm text-yellow-700">
                  Your application is currently under review by the superintendent. We will update you on any further steps.
                </p>
              </div>
            </div>
          </div>
        );

      case 'APPROVED':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-green-900 mb-1">Congratulations! Application Approved</h4>
                <p className="text-sm text-green-700">
                  Your application has been approved. Please download your provisional letter and complete the admission formalities.
                </p>
              </div>
            </div>
          </div>
        );

      case 'REJECTED':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-red-900 mb-1">Application Rejected</h4>
                <p className="text-sm text-red-700">
                  Your application could not be approved. For more information, please contact our admissions team.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state while application data is being fetched
  if (loading || !application) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application details...</p>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[application.current_status as keyof typeof statusConfig] || statusConfig.DRAFT;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="px-6 py-4 border-b bg-white">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Hirachand Gumanji Family Charitable Trust" width={48} height={48} className="h-12 w-auto" />
            <div>
              <h1 className="text-lg font-semibold">Hirachand Gumanji Family</h1>
              <p className="text-caption">Charitable Trust</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/track" className="text-sm text-blue-600 hover:underline">← Back to Tracking</Link>
            <Link href="/" className="text-sm text-gray-600 hover:underline">Home</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Status-specific Alert Banner */}
          {getStatusAlert()}

          {/* Application Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Application #{application.tracking_number}</h2>
                <p className="text-gray-600">{application.vertical.replace('_', ' ')} • {application.type}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus?.color)}`}>
                {currentStatus.label}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Applicant</p>
                <p className="font-medium">{application.data?.personal_info?.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted</p>
                <p className="font-medium">{new Date(application.submitted_at || application.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium">{application.applicant_mobile}</p>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>Status Description:</strong> {currentStatus.description}</p>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-6">Application Timeline</h3>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              {statusSteps.map((step, index) => {
                const isCompleted = step.order <= currentStepOrder;
                const isCurrent = step.order === currentStepOrder;
                const isRejected = application.current_status === 'REJECTED' && step.status === 'REJECTED';

                return (
                  <div key={step.status} className="relative flex items-center mb-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-blue-600 text-white' :
                      isCurrent ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{step.order}</span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">{step.label}</h4>
                      {isCurrent && (
                        <p className="text-sm text-gray-600 mt-1">{statusConfig[step.status as keyof typeof statusConfig].description}</p>
                      )}
                      {isRejected && (
                        <p className="text-sm text-red-600 mt-1">Application has been rejected</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interview Details */}
          {interview && interview.status === 'SCHEDULED' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Interview Details</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">{new Date(interview.schedule_time).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mode</p>
                    <p className="font-medium">{interview.mode === 'IN_PERSON' ? 'In Person' : 'Online'}</p>
                  </div>
                </div>
                {timeUntilInterview && (
                  <div className="mt-4 pt-4 border-t border-blue-300">
                    <p className="text-sm text-gray-500 mb-2">Time until interview</p>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className="bg-blue-600 text-white rounded-lg p-2 min-w-[60px]">
                          <span className="text-2xl font-bold">{timeUntilInterview.days}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Days</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-blue-600 text-white rounded-lg p-2 min-w-[60px]">
                          <span className="text-2xl font-bold">{timeUntilInterview.hours}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Hours</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-blue-600 text-white rounded-lg p-2 min-w-[60px]">
                          <span className="text-2xl font-bold">{timeUntilInterview.minutes}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Minutes</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Scheduled
                  </span>
                </div>
              </div>
            </div>
          )}

          {interview && interview.status === 'COMPLETED' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Interview Details</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">{new Date(interview.schedule_time).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mode</p>
                    <p className="font-medium">{interview.mode === 'IN_PERSON' ? 'In Person' : 'Online'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Documents</h3>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">{doc.document_type.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-500">Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doc.verification_status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                      doc.verification_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {doc.verification_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              {isAwaitingDocuments && (
                <button
                  className="w-full bg-yellow-500 text-white py-3 px-4 rounded-md hover:bg-yellow-600 font-medium border-2 border-yellow-600"
                  onClick={() => setShowReuploadModal(true)}
                >
                  📎 Re-upload Pending Documents
                </button>
              )}
              {interview && interview.status === 'SCHEDULED' && (
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                  Confirm Interview Attendance
                </button>
              )}
              {application.current_status === 'APPROVED' && (
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium">
                  Download Provisional Letter
                </button>
              )}
              <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">
                Download Application PDF
              </button>
              {application.current_status !== 'APPROVED' && application.current_status !== 'REJECTED' && (
                <button className="w-full border-2 border-red-500 text-red-600 py-2 px-4 rounded-md hover:bg-red-50">
                  Withdraw Application
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Privacy & Data Protection</h4>
            <p className="text-sm text-blue-700">
              Your application data is processed in compliance with the Digital Personal Data Protection Act, 2023.
              We use your information solely for hostel admission processing and maintain strict confidentiality.
              For more details, please refer to our{' '}
              <a href="#" className="text-blue-600 underline hover:text-blue-800">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Re-upload Modal */}
      {showReuploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Re-upload Documents</h3>
                <button
                  onClick={() => setShowReuploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Document Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Choose document type...</option>
                    <option value="AADHAR_CARD">Aadhar Card</option>
                    <option value="PHOTO">Passport Size Photo</option>
                    <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
                    <option value="CASTE_CERTIFICATE">Caste Certificate</option>
                    <option value="COLLEGE_LETTER">College Admission Letter</option>
                    <option value="ACADEMIC_RECORDS">Academic Records</option>
                    <option value="RECOMMENDATION">Jain Sangh Recommendation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Click to upload or drag and drop
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            PDF, JPG, JPEG up to 10MB
                          </span>
                        </label>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelectedFiles([file]);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-700">{selectedFiles[0].name}</span>
                      </div>
                      <button
                        onClick={() => setSelectedFiles([])}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReuploadModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (selectedFiles.length === 0) {
                      alert('Please select a file to upload');
                      return;
                    }

                    setUploading(true);
                    // Simulate upload
                    setUploadProgress({ [selectedFiles[0].name]: 0 });
                    const interval = setInterval(() => {
                      setUploadProgress(prev => {
                        const current = prev[selectedFiles[0].name] || 0;
                        if (current >= 100) {
                          clearInterval(interval);
                          setTimeout(() => {
                            setShowReuploadModal(false);
                            setSelectedFiles([]);
                            setUploadProgress({});
                            alert('Document uploaded successfully!');
                          }, 500);
                          return { [selectedFiles[0].name]: 100 };
                        }
                        return { [selectedFiles[0].name]: current + 10 };
                      });
                    }, 200);
                    setUploading(false);
                  }}
                  disabled={uploading || selectedFiles.length === 0}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>

              {Object.keys(uploadProgress).length > 0 && (
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress[Object.keys(uploadProgress)[0]]}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 text-center">
                    {uploadProgress[Object.keys(uploadProgress)[0]]}% uploaded
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}