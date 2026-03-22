/**
 * Standard API Response Formatters
 *
 * Consistent response formatting for all API routes.
 */

import { NextResponse } from 'next/server';
import { HTTP_STATUS } from './index';

// ============================================================================
// Success Responses
// ============================================================================

export function successResponse<T = any>(
  data?: T,
  message?: string,
  status: number = HTTP_STATUS.OK
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...(message && { message }),
      ...(data !== undefined && { data }),
    },
    { status }
  );
}

export function createdResponse<T = any>(data: T, message?: string): NextResponse {
  return successResponse(data, message, HTTP_STATUS.CREATED);
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
}

// ============================================================================
// Error Responses
// ============================================================================

export function errorResponse(
  message: string,
  status: number = HTTP_STATUS.BAD_REQUEST,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      message, // Some clients expect 'message' instead of 'error'
      ...(details && { details }),
    },
    { status }
  );
}

export function badRequestResponse(message: string, details?: any): NextResponse {
  return errorResponse(message, HTTP_STATUS.BAD_REQUEST, details);
}

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return errorResponse(message, HTTP_STATUS.UNAUTHORIZED);
}

export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return errorResponse(message, HTTP_STATUS.FORBIDDEN);
}

export function notFoundResponse(message: string = 'Resource not found'): NextResponse {
  return errorResponse(message, HTTP_STATUS.NOT_FOUND);
}

export function conflictResponse(message: string, details?: any): NextResponse {
  return errorResponse(message, HTTP_STATUS.CONFLICT, details);
}

export function validationErrorResponse(
  message: string,
  errors: Record<string, string[]>
): NextResponse {
  return errorResponse(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, { errors });
}

export function rateLimitResponse(message: string = 'Too many requests'): NextResponse {
  return errorResponse(message, HTTP_STATUS.TOO_MANY_REQUESTS);
}

export function serverErrorResponse(
  message: string = 'Internal server error',
  error?: Error
): NextResponse {
  // Log error details server-side
  if (error) {
    console.error('Server Error:', error);
  }

  // Don't expose error details to client in production
  const clientMessage =
    process.env.NODE_ENV === 'development'
      ? message
      : 'An unexpected error occurred';

  return errorResponse(clientMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}

// ============================================================================
// Paginated Response
// ============================================================================

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...(message && { message }),
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    { status: HTTP_STATUS.OK }
  );
}

// ============================================================================
// Validation Helpers
// ============================================================================

export type ValidationRule = {
  field: string;
  value: any;
  rules: Array<{
    type: 'required' | 'email' | 'phone' | 'min' | 'max' | 'pattern' | 'custom';
    message: string;
    param?: any;
    validator?: (value: any) => boolean;
  }>;
};

export function validateFields(rules: ValidationRule[]): {
  isValid: boolean;
  errors: Record<string, string[]>;
} {
  const errors: Record<string, string[]> = {};

  rules.forEach(({ field, value, rules: fieldRules }) => {
    const fieldErrors: string[] = [];

    fieldRules.forEach((rule) => {
      switch (rule.type) {
        case 'required':
          if (value === undefined || value === null || value === '') {
            fieldErrors.push(rule.message);
          }
          break;

        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            fieldErrors.push(rule.message);
          }
          break;

        case 'phone':
          if (value && !/^[6-9]\d{9}$/.test(value.replace(/[+\s-]/g, ''))) {
            fieldErrors.push(rule.message);
          }
          break;

        case 'min':
          if (value && value.length < rule.param) {
            fieldErrors.push(rule.message);
          }
          break;

        case 'max':
          if (value && value.length > rule.param) {
            fieldErrors.push(rule.message);
          }
          break;

        case 'pattern':
          if (value && !rule.param.test(value)) {
            fieldErrors.push(rule.message);
          }
          break;

        case 'custom':
          if (rule.validator && !rule.validator(value)) {
            fieldErrors.push(rule.message);
          }
          break;
      }
    });

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
