import { APP_CONFIG } from '../config';
import { useAuthStore } from '../stores/authStore';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
}

export const api = {
  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<{ data: T; status: number }> {
    const { token } = useAuthStore.getState();
    const { method = 'GET', headers = {}, params = {}, body } = options;

    let url = `${APP_CONFIG.API_URL}${endpoint}`;
    
    // Add query params for GET
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      url += `?${queryParams.toString()}`;
    }

    const fetchHeaders: Record<string, string> = {
      'Accept': 'application/json',
      ...headers,
    };

    if (token) {
      fetchHeaders['Authorization'] = `Bearer ${token}`;
    }

    let fetchBody: any = body;
    
    // Auto-detect JSON vs FormData
    if (body && !(body instanceof FormData) && typeof body === 'object') {
      fetchHeaders['Content-Type'] = 'application/json';
      fetchBody = JSON.stringify(body);
    }

    const response = await fetch(url, {
      method,
      headers: fetchHeaders,
      body: fetchBody,
    });

    if (!response.ok) {
       let errorMsg = `API Error: ${response.status}`;
       try {
         const errorBody = await response.json();
         errorMsg = errorBody.message || errorMsg;
       } catch (e) { /* fallback to default */ }
       throw new Error(errorMsg);
    }

    const data = await response.json();
    return { data, status: response.status };
  },

  get<T>(endpoint: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  },

  put<T>(endpoint: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  },

  patch<T>(endpoint: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  },

  delete<T>(endpoint: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
};
