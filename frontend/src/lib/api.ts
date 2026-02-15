// API Client using native Bun fetch

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface RequestOptions extends RequestInit {
    params?: Record<string, string | number>;
}

let authToken: string | null = null;
let currentCoords: { latitude: number; longitude: number } | null = null;

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    let url = `${API_BASE_URL}${endpoint}`;

    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            searchParams.append(key, String(value));
        });
        url += `?${searchParams.toString()}`;
    }

    const headers = new Headers({
        'Accept': 'application/json',
        ...fetchOptions.headers,
    } as HeadersInit);

    if (authToken) {
        headers.set('Authorization', `Bearer ${authToken}`);
    }

    if (currentCoords) {
        headers.set('X-User-Lat', String(currentCoords.latitude));
        headers.set('X-User-Lng', String(currentCoords.longitude));
    }

    const response = await fetch(url, {
        ...fetchOptions,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        // Handle 401 Unauthorized
        if (response.status === 401) {
            // Optional: Broadcast logout or redirect if needed
        }
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}

export const api = {
    setToken: (token: string | null) => {
        authToken = token;
    },

    setLocation: (coords: { latitude: number; longitude: number } | null) => {
        currentCoords = coords;
    },

    get: <T>(endpoint: string, params?: Record<string, string | number>) =>
        request<T>(endpoint, { method: 'GET', params }),

    post: <T>(endpoint: string, data: FormData | Record<string, unknown>) => {
        const isFormData = data instanceof FormData;
        return request<T>(endpoint, {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data),
            headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        });
    },

    put: <T>(endpoint: string, data: FormData | Record<string, unknown>) => {
        const isFormData = data instanceof FormData;
        // Laravel needs _method for FormData PUT
        if (isFormData) {
            data.append('_method', 'PUT');
            return request<T>(endpoint, {
                method: 'POST',
                body: data,
            });
        }
        return request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });
    },

    delete: <T>(endpoint: string) =>
        request<T>(endpoint, { method: 'DELETE' }),

    patch: <T>(endpoint: string, data: FormData | Record<string, unknown>) => {
        const isFormData = data instanceof FormData;
        if (isFormData) {
            data.append('_method', 'PATCH');
            return request<T>(endpoint, {
                method: 'POST',
                body: data,
            });
        }
        return request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });
    },
};
