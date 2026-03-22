import { describe, it, expect } from 'vitest';
import {
  AppError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
  ConflictError,
  RateLimitError,
} from '../errors';

describe('Error classes', () => {
  it('NotFoundError has status 404 and code NOT_FOUND', () => {
    const err = new NotFoundError('User not found');
    expect(err.status).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('User not found');
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(Error);
  });

  it('ForbiddenError has status 403 and code FORBIDDEN', () => {
    const err = new ForbiddenError();
    expect(err.status).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('UnauthorizedError has status 401 and code UNAUTHORIZED', () => {
    const err = new UnauthorizedError();
    expect(err.status).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('ValidationError has status 400 and supports details', () => {
    const details = [{ field: 'email', message: 'Invalid email' }];
    const err = new ValidationError('Bad input', details);
    expect(err.status).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details).toEqual(details);
  });

  it('ConflictError has status 409', () => {
    const err = new ConflictError('Already exists');
    expect(err.status).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });

  it('RateLimitError has status 429', () => {
    const err = new RateLimitError();
    expect(err.status).toBe(429);
    expect(err.code).toBe('RATE_LIMITED');
  });

  it('AppError defaults work', () => {
    const err = new AppError('test', 500, 'TEST');
    expect(err.name).toBe('AppError');
    expect(err.status).toBe(500);
    expect(err.code).toBe('TEST');
  });
});
