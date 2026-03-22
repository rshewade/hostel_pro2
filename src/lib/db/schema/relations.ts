import { relations } from 'drizzle-orm';
import { users } from './users';
import { applications } from './applications';
import { documents } from './documents';
import { rooms, roomAllocations } from './rooms';
import { fees } from './fees';
import { payments } from './payments';
import { leaveRequests } from './leave-requests';
import { renewals } from './renewals';
import { interviews } from './interviews';
import { notifications } from './notifications';
import { deviceSessions } from './device-sessions';
import { gatewayPayments } from './gateway-payments';
import { consentLogs } from './consent-logs';
import { communications } from './communications';

export const usersRelations = relations(users, ({ many }) => ({
  applications: many(applications, { relationName: 'studentApplications' }),
  documents: many(documents, { relationName: 'studentDocuments' }),
  roomAllocations: many(roomAllocations),
  fees: many(fees),
  payments: many(payments),
  leaveRequests: many(leaveRequests),
  renewals: many(renewals),
  notifications: many(notifications),
  deviceSessions: many(deviceSessions),
  gatewayPayments: many(gatewayPayments),
  consentLogs: many(consentLogs),
  communications: many(communications),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  studentUser: one(users, {
    fields: [applications.studentUserId],
    references: [users.id],
    relationName: 'studentApplications',
  }),
  approvedByUser: one(users, {
    fields: [applications.approvedBy],
    references: [users.id],
    relationName: 'approverApplications',
  }),
  documents: many(documents),
  interviews: many(interviews),
  fees: many(fees),
  renewals: many(renewals),
  gatewayPayments: many(gatewayPayments),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  application: one(applications, {
    fields: [documents.applicationId],
    references: [applications.id],
  }),
  studentUser: one(users, {
    fields: [documents.studentUserId],
    references: [users.id],
    relationName: 'studentDocuments',
  }),
  uploadedByUser: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
    relationName: 'uploaderDocuments',
  }),
}));

export const roomsRelations = relations(rooms, ({ many }) => ({
  allocations: many(roomAllocations),
}));

export const roomAllocationsRelations = relations(roomAllocations, ({ one }) => ({
  room: one(rooms, {
    fields: [roomAllocations.roomId],
    references: [rooms.id],
  }),
  studentUser: one(users, {
    fields: [roomAllocations.studentUserId],
    references: [users.id],
  }),
}));

export const feesRelations = relations(fees, ({ one, many }) => ({
  studentUser: one(users, {
    fields: [fees.studentUserId],
    references: [users.id],
  }),
  application: one(applications, {
    fields: [fees.applicationId],
    references: [applications.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  fee: one(fees, {
    fields: [payments.feeId],
    references: [fees.id],
  }),
  studentUser: one(users, {
    fields: [payments.studentUserId],
    references: [users.id],
  }),
}));

export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
  studentUser: one(users, {
    fields: [leaveRequests.studentUserId],
    references: [users.id],
  }),
  approvedByUser: one(users, {
    fields: [leaveRequests.approvedBy],
    references: [users.id],
    relationName: 'approverLeaves',
  }),
}));

export const renewalsRelations = relations(renewals, ({ one }) => ({
  studentUser: one(users, {
    fields: [renewals.studentUserId],
    references: [users.id],
  }),
  application: one(applications, {
    fields: [renewals.applicationId],
    references: [applications.id],
  }),
}));

export const interviewsRelations = relations(interviews, ({ one }) => ({
  application: one(applications, {
    fields: [interviews.applicationId],
    references: [applications.id],
  }),
  superintendent: one(users, {
    fields: [interviews.superintendentId],
    references: [users.id],
    relationName: 'superintendentInterviews',
  }),
  trustee: one(users, {
    fields: [interviews.trusteeId],
    references: [users.id],
    relationName: 'trusteeInterviews',
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const deviceSessionsRelations = relations(deviceSessions, ({ one }) => ({
  user: one(users, {
    fields: [deviceSessions.userId],
    references: [users.id],
  }),
}));

export const gatewayPaymentsRelations = relations(gatewayPayments, ({ one }) => ({
  studentUser: one(users, {
    fields: [gatewayPayments.studentUserId],
    references: [users.id],
  }),
  application: one(applications, {
    fields: [gatewayPayments.applicationId],
    references: [applications.id],
  }),
  fee: one(fees, {
    fields: [gatewayPayments.feeId],
    references: [fees.id],
  }),
}));

export const consentLogsRelations = relations(consentLogs, ({ one }) => ({
  user: one(users, {
    fields: [consentLogs.userId],
    references: [users.id],
  }),
}));

export const communicationsRelations = relations(communications, ({ one }) => ({
  recipient: one(users, {
    fields: [communications.recipientId],
    references: [users.id],
  }),
}));
