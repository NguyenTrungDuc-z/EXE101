import { API_BASE_URL } from "../config";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Yêu cầu thất bại" }));
    throw new Error(body.message ?? "Yêu cầu thất bại");
  }

  return response.json() as Promise<T>;
}
