const PUBLIC_HOST = 'https://pertamak.cianjur.space';

/**
 * Media URLs from the API are built from APP_URL. Before APP_URL was set to https, some
 * responses (and the offline cache) contain http:// URLs, which Android and iOS block by default.
 * Normalises them to https and maps local development hosts to the public host.
 */
export function toSecureMediaUrl(url?: string | null): string {
  if (!url) return '';
  return url
    .replace(/^http:\/\/localhost(:\d+)?/, PUBLIC_HOST)
    .replace(/^http:\/\/pertamak\.cianjur\.space/, PUBLIC_HOST);
}
