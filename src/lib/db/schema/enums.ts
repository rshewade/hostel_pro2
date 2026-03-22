import { pgEnum } from 'drizzle-orm/pg-core';

// User & Auth
export const userRoleEnum = pgEnum('user_role', [
  'STUDENT', 'SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS', 'PARENT',
]);

export const verticalTypeEnum = pgEnum('vertical_type', [
  'BOYS', 'GIRLS', 'DHARAMSHALA', 'BOYS_HOSTEL', 'GIRLS_ASHRAM',
]);

// Applications
export const applicationStatusEnum = pgEnum('application_status', [
  'DRAFT', 'SUBMITTED', 'REVIEW', 'INTERVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED',
]);

export const applicationTypeEnum = pgEnum('application_type', [
  'NEW', 'RENEWAL',
]);

// Documents
export const documentStatusEnum = pgEnum('document_status', [
  'UPLOADED', 'VERIFIED', 'REJECTED',
]);

export const documentTypeEnum = pgEnum('document_type', [
  'PHOTOGRAPH', 'AADHAAR_CARD', 'BIRTH_CERTIFICATE', 'EDUCATION_CERTIFICATE',
  'INCOME_CERTIFICATE', 'MEDICAL_CERTIFICATE', 'POLICE_VERIFICATION',
  'UNDERTAKING', 'RECEIPT', 'LEAVE_APPLICATION', 'RENEWAL_FORM', 'OTHER',
]);

// Rooms
export const roomStatusEnum = pgEnum('room_status', [
  'AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED',
]);

export const allocationStatusEnum = pgEnum('allocation_status', [
  'ACTIVE', 'CHECKED_OUT', 'TRANSFERRED', 'CANCELLED',
]);

// Fees & Payments
export const feeHeadEnum = pgEnum('fee_head', [
  'PROCESSING_FEE', 'SECURITY_DEPOSIT', 'HOSTEL_FEE', 'MESS_FEE',
  'MAINTENANCE_FEE', 'ELECTRICITY_FEE', 'LAUNDRY_FEE', 'LATE_FEE',
  'DAMAGE_CHARGE', 'OTHER',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING', 'PAID', 'OVERDUE', 'WAIVED', 'REFUNDED', 'CANCELLED',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'DEMAND_DRAFT', 'CARD', 'OTHER',
]);

export const gatewayPaymentStatusEnum = pgEnum('gateway_payment_status', [
  'INITIATED', 'PENDING', 'SUCCESS', 'FAILED',
  'REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED',
]);

// Leaves
export const leaveTypeEnum = pgEnum('leave_type', [
  'HOME_VISIT', 'SHORT_LEAVE', 'MEDICAL', 'EMERGENCY', 'OTHER',
]);

export const leaveStatusEnum = pgEnum('leave_status', [
  'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED',
]);

// Interviews
export const interviewModeEnum = pgEnum('interview_mode', [
  'ONLINE', 'IN_PERSON', 'PHONE',
]);

export const interviewStatusEnum = pgEnum('interview_status', [
  'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED',
]);

// Notifications
export const notificationTypeEnum = pgEnum('notification_type', [
  'FEE_REMINDER', 'FEE_OVERDUE', 'LEAVE_APPROVED', 'LEAVE_REJECTED',
  'LEAVE_PENDING', 'RENEWAL_REMINDER', 'APPLICATION_UPDATE',
  'INTERVIEW_SCHEDULED', 'ROOM_ALLOCATION', 'ANNOUNCEMENT', 'SYSTEM', 'OTHER',
]);

// Communications
export const communicationTypeEnum = pgEnum('communication_type', [
  'SMS', 'EMAIL', 'WHATSAPP', 'PUSH',
]);

export const communicationStatusEnum = pgEnum('communication_status', [
  'PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED',
]);

// Consent
export const consentTypeEnum = pgEnum('consent_type', [
  'TERMS_AND_CONDITIONS', 'PRIVACY_POLICY', 'DATA_PROCESSING',
  'HOSTEL_RULES', 'RENEWAL_TERMS', 'PARENT_GUARDIAN',
]);

// Exit
export const exitRequestStatusEnum = pgEnum('exit_request_status', [
  'DRAFT', 'SUBMITTED', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'COMPLETED',
]);

export const clearanceStatusEnum = pgEnum('clearance_status', [
  'PENDING', 'APPROVED', 'REJECTED',
]);

// Renewals
export const renewalStatusEnum = pgEnum('renewal_status', [
  'DRAFT', 'SUBMITTED', 'REVIEW', 'APPROVED', 'REJECTED',
]);

// Students
export const studentStatusEnum = pgEnum('student_status', [
  'ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED', 'EXPELLED',
]);
