const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";
const APP_NAME = process.env.EXPO_PUBLIC_APP_NAME || "Pertamak";
const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV || "local";

export const APP_CONFIG = {
  API_URL,
  APP_NAME,
  APP_ENV,
};

/** Resolve media URL: replace localhost with production domain */
export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.includes('pertamak.cianjur.space') || !url.includes('localhost')) return url;
  return url.replace('http://localhost:8000', 'https://pertamak.cianjur.space');
}

export default APP_CONFIG;
