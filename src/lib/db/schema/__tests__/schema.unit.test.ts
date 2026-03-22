import { describe, it, expect } from 'vitest';
import * as schema from '../index';

describe('Schema definitions', () => {
  const tableNames = [
    'users', 'applications', 'documents', 'rooms', 'roomAllocations',
    'fees', 'payments', 'leaveRequests', 'renewals', 'auditLogs',
    'deviceSessions', 'gatewayPayments', 'reconciliationLogs', 'consentLogs',
    'applicationsArchive', 'auditReports', 'interviews', 'notifications',
    'notificationRules', 'communications', 'leaveTypes', 'blackoutDates',
  ];

  it('exports all 22 tables', () => {
    for (const name of tableNames) {
      expect(schema).toHaveProperty(name);
    }
  });

  it('applications.applicantEmail is notNull (CHANGE-3)', () => {
    const col = schema.applications.applicantEmail;
    expect(col.notNull).toBe(true);
  });

  it('applications.currentStatus defaults to SUBMITTED (CHANGE-6)', () => {
    const col = schema.applications.currentStatus;
    expect(col.hasDefault).toBe(true);
  });

  it('all enums are exported', () => {
    const enumNames = [
      'userRoleEnum', 'verticalTypeEnum', 'applicationStatusEnum', 'applicationTypeEnum',
      'documentStatusEnum', 'documentTypeEnum', 'roomStatusEnum', 'allocationStatusEnum',
      'feeHeadEnum', 'paymentStatusEnum', 'paymentMethodEnum', 'leaveTypeEnum',
      'leaveStatusEnum', 'interviewModeEnum', 'interviewStatusEnum', 'notificationTypeEnum',
      'communicationTypeEnum', 'communicationStatusEnum', 'consentTypeEnum',
    ];
    for (const name of enumNames) {
      expect(schema).toHaveProperty(name);
    }
  });

  it('userRoleEnum has correct values', () => {
    expect(schema.userRoleEnum.enumValues).toEqual([
      'STUDENT', 'SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS', 'PARENT',
    ]);
  });

  it('applicationStatusEnum has correct values', () => {
    expect(schema.applicationStatusEnum.enumValues).toEqual([
      'DRAFT', 'SUBMITTED', 'REVIEW', 'INTERVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED',
    ]);
  });
});
