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
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  }

  private async request<T>(endpoint: string, init: RequestInit): Promise<ApiResponse<T>> {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        const headers = new Headers(init.headers);
        headers.set("Authorization", `Bearer ${token}`);
        init = { ...init, headers };
      }
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, { ...init, credentials: "same-origin" });
    } catch {
      return { success: false, message: "Cannot reach the backend. Make sure the API server is running." };
    }

    const payload = await response.json().catch(() => ({}));

    if (payload && typeof payload === "object" && "success" in payload) {
      return payload as ApiResponse<T>;
    }

    return {
      success: response.ok,
      data: payload as T,
      message: response.ok ? undefined : `Request failed (${response.status})`
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
