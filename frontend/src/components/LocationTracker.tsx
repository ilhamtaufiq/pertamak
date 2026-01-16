import { useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { api } from '../lib/api';

export function LocationTracker() {
    const { coordinates, getLocation } = useGeolocation();

    // Initial location fetch
    useEffect(() => {
        getLocation();
    }, [getLocation]);

    // Update API client when coordinates change
    useEffect(() => {
        if (coordinates) {
            api.setLocation(coordinates);
        }
    }, [coordinates]);

    // Periodically refresh location (every 2 minutes)
    useEffect(() => {
        const interval = setInterval(() => {
            getLocation();
        }, 120000);

        return () => clearInterval(interval);
    }, [getLocation]);

    return null; // This is a logic-only component
}
