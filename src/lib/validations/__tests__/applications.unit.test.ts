import { describe, it, expect } from 'vitest';
import { createApplicationSchema } from '../applications';

describe('createApplicationSchema', () => {
  const validInput = {
    applicantName: 'Test User',
    applicantMobile: '+919876543210',
    applicantEmail: 'test@example.com',
    dateOfBirth: '2000-01-01',
    gender: 'Male',
    vertical: 'BOYS' as const,
  };

  it('accepts valid input', () => {
    expect(createApplicationSchema.safeParse(validInput).success).toBe(true);
  });

  it('rejects missing email (CHANGE-3 — email required)', () => {
    const { applicantEmail: _, ...noEmail } = validInput;
    expect(createApplicationSchema.safeParse(noEmail).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(createApplicationSchema.safeParse({ ...validInput, applicantEmail: 'not-email' }).success).toBe(false);
  });

  it('rejects missing name', () => {
    expect(createApplicationSchema.safeParse({ ...validInput, applicantName: '' }).success).toBe(false);
  });

  it('rejects invalid vertical', () => {
    expect(createApplicationSchema.safeParse({ ...validInput, vertical: 'INVALID' }).success).toBe(false);
  });

  it('defaults type to NEW', () => {
    const result = createApplicationSchema.parse(validInput);
    expect(result.type).toBe('NEW');
  });
});
