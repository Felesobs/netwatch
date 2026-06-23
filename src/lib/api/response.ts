import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiError, ApiSuccess } from "@/types";
import { UnauthorizedError } from "@/lib/auth";

export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(
  code: string,
  message: string,
  status: number,
  fieldErrors?: Record<string, string[]>,
): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: { code, message, fieldErrors } },
    { status },
  );
}

/** Application-level error carrying an HTTP status and stable error code. */
export class ApiRouteError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiRouteError";
  }
}

export class NotFoundError extends ApiRouteError {
  constructor(resource = "Resource") {
    super("NOT_FOUND", `${resource} not found`, 404);
  }
}

export class ConflictError extends ApiRouteError {
  constructor(message: string) {
    super("CONFLICT", message, 409);
  }
}

/**
 * Wraps a route handler, normalizing thrown errors into the standard API
 * error envelope. Keeps individual route handlers free of repetitive
 * try/catch boilerplate.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return apiError("UNAUTHORIZED", error.message, 401);
      }
      if (error instanceof ApiRouteError) {
        return apiError(error.code, error.message, error.status);
      }
      if (error instanceof ZodError) {
        return apiError(
          "VALIDATION_ERROR",
          "The request contains invalid data",
          422,
          error.flatten().fieldErrors as Record<string, string[]>,
        );
      }
      console.error("Unhandled API error:", error);
      return apiError(
        "INTERNAL_ERROR",
        "An unexpected error occurred. Please try again.",
        500,
      );
    }
  };
}
