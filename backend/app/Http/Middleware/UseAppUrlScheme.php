<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Signed URLs are built with the scheme from APP_URL. A reverse proxy can rewrite the forwarded
 * scheme (Traefik sets it to the hop it received over), so the signature check would compare
 * against the wrong scheme. This makes the request use APP_URL's scheme for validation.
 */
class UseAppUrlScheme
{
    public function handle(Request $request, Closure $next)
    {
        $scheme = parse_url((string) config('app.url'), PHP_URL_SCHEME);

        if (in_array($scheme, ['http', 'https'], true)) {
            $request->headers->set('X-Forwarded-Proto', $scheme);
        }

        return $next($request);
    }
}
