import { API_BASE_URL } from "../config";

const AUTH_STORAGE_KEY = "homeswift_user";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // Get token from localStorage
  const userJson = localStorage.getItem(AUTH_STORAGE_KEY);
  const user = userJson ? JSON.parse(userJson) : null;
  const token = user?.token;

  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  // Merge existing headers if provided
  if (init?.headers && typeof init.headers === "object") {
    Object.assign(headers, init.headers);
  }

  // Add Authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...init
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Yêu cầu thất bại" }));
    const error = new Error(body.message ?? "Yêu cầu thất bại");
    (error as any).status = response.status;
    throw error;
  }

  return response.json() as Promise<T>;
}
