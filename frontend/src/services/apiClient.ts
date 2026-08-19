/**
 * Aegis Biometric Banking - Enterprise API Client Abstraction Layer
 * Preconfigured for seamless future REST API / Express Backend Integration.
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  }

  private async request<T>(endpoint: string, init: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, { ...init, credentials: "same-origin" });
    const payload = await response.json().catch(() => ({}));

    if (payload && typeof payload === "object" && "success" in payload) {
      return payload as ApiResponse<T>;
    }

    return {
      success: response.ok,
      data: payload as T,
      message: response.ok ? undefined : "Request failed"
    };
  }

  private getAuthHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
    };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      return await this.request<T>(endpoint, {
        method: "GET",
        headers: this.getAuthHeaders()
      });
    } catch {
      return { success: false, message: "Network request failed" };
    }
  }

  async post<T>(endpoint: string, payload: unknown): Promise<ApiResponse<T>> {
    try {
      return await this.request<T>(endpoint, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });
    } catch {
      return { success: false, message: "Network request failed" };
    }
  }

  async patch<T>(endpoint: string, payload: unknown): Promise<ApiResponse<T>> {
    try {
      return await this.request<T>(endpoint, {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });
    } catch {
      return { success: false, message: "Network request failed" };
    }
  }

  async put<T>(endpoint: string, payload: unknown): Promise<ApiResponse<T>> {
    try {
      return await this.request<T>(endpoint, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });
    } catch {
      return { success: false, message: "Network request failed" };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      return await this.request<T>(endpoint, {
        method: "DELETE",
        headers: this.getAuthHeaders()
      });
    } catch {
      return { success: false, message: "Network request failed" };
    }
  }
}

export const apiClient = new ApiClient();
