export type ApiRequestOptions = Omit<RequestInit, "headers"> & {
  accessToken?: string;
  headers?: HeadersInit;
};

export class ApiError extends Error {
  readonly payload: unknown;
  readonly status: number;

  constructor(response: Response, payload: unknown) {
    super(getErrorMessage(response, payload));
    this.name = "ApiError";
    this.payload = payload;
    this.status = response.status;
  }
}

function getApiUrl(path: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const normalizedPath = path.startsWith("/") ? path : "/" + path;

  return new URL(normalizedPath, apiUrl).toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(response: Response, payload: unknown): string {
  if (isRecord(payload) && typeof payload.message === "string") {
    return payload.message;
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  return response.statusText || "The API request failed.";
}

async function readErrorPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => null);
}

/**
 * Calls the Go API. Pass only command/input IDs for financial actions; the backend owns all money calculations.
 */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { accessToken, headers: requestHeaders, ...requestInit } = options;
  const headers = new Headers(requestHeaders);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", "Bearer " + accessToken);
  }

  const response = await fetch(getApiUrl(path), {
    ...requestInit,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(response, await readErrorPayload(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
