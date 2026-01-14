import { useState, useCallback } from 'react';

interface GeolocationState {
    isLoading: boolean;
    error: string | null;
    coordinates: {
        latitude: number;
        longitude: number;
    } | null;
    address: string | null;
}

interface UseGeolocationReturn extends GeolocationState {
    getLocation: () => Promise<void>;
    formatLocationWithCoords: () => string;
}

/**
 * Custom hook for getting user's geolocation and reverse geocoding using Nominatim
 * Nominatim is OpenStreetMap's free geocoding API - no API key required
 */
export function useGeolocation(): UseGeolocationReturn {
    const [state, setState] = useState<GeolocationState>({
        isLoading: false,
        error: null,
        coordinates: null,
        address: null,
    });

    const getLocation = useCallback(async () => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            setState(prev => ({
                ...prev,
                error: 'Geolocation tidak didukung oleh browser Anda',
            }));
            return;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Get coordinates from browser
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000, // Cache for 1 minute
                });
            });

            const { latitude, longitude } = position.coords;

            setState(prev => ({
                ...prev,
                coordinates: { latitude, longitude },
            }));

            // Reverse geocode using Nominatim (OpenStreetMap)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'id', // Indonesian language preference
                        'User-Agent': 'PertamakApp/1.0', // Required by Nominatim ToS
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Gagal mendapatkan alamat');
            }

            const data = await response.json();

            // Build address from response
            let address = '';
            if (data.address) {
                const parts = [];

                // Try to get the most specific location first
                if (data.address.road) parts.push(data.address.road);
                if (data.address.house_number) parts[0] = `${parts[0]} No. ${data.address.house_number}`;
                if (data.address.village || data.address.suburb) {
                    parts.push(data.address.village || data.address.suburb);
                }
                if (data.address.city || data.address.town || data.address.municipality) {
                    parts.push(data.address.city || data.address.town || data.address.municipality);
                }
                if (data.address.state) parts.push(data.address.state);

                address = parts.join(', ');
            }

            // Fallback to display_name if no structured address
            if (!address && data.display_name) {
                address = data.display_name.split(',').slice(0, 3).join(',');
            }

            setState(prev => ({
                ...prev,
                address: address || 'Lokasi ditemukan',
                isLoading: false,
            }));

        } catch (err) {
            let errorMessage = 'Gagal mendapatkan lokasi';

            if (err instanceof GeolocationPositionError) {
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = 'Izin lokasi ditolak. Silakan aktifkan di pengaturan browser.';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = 'Informasi lokasi tidak tersedia.';
                        break;
                    case err.TIMEOUT:
                        errorMessage = 'Waktu permintaan habis. Coba lagi.';
                        break;
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, []);

    const formatLocationWithCoords = useCallback((): string => {
        if (!state.coordinates || !state.address) return '';

        const { latitude, longitude } = state.coordinates;
        // Format: "Nama Lokasi (lat, lng)" with 6 decimal places
        return `${state.address} (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
    }, [state.coordinates, state.address]);

    return {
        ...state,
        getLocation,
        formatLocationWithCoords,
    };
}
