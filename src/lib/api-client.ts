import type { ApiResponse } from "@/types";

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/**
 * Thin wrapper around `fetch` for same-origin API routes. Always sends
 * credentials (the session cookie) and unwraps the `ApiResponse<T>`
 * envelope, throwing `ApiClientError` on failure so callers (React Query
 * hooks) get a single consistent error shape to handle.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const isFormData = body instanceof FormData;

  const response = await fetch(path, {
    ...rest,
    credentials: "same-origin",
    headers: {
      ...(!isFormData && body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Guard against non-JSON responses (502 gateway timeouts, CDN error pages,
  // etc.) which would otherwise throw a confusing parse error from .json().
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new ApiClientError(
      "NETWORK_ERROR",
      `Unexpected response from server (HTTP ${response.status})`,
      response.status,
    );
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new ApiClientError(
      json.error.code,
      json.error.message,
      response.status,
      json.error.fieldErrors,
    );
  }

  return json.data;
}
