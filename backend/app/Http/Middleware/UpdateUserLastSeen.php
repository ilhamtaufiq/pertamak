<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class UpdateUserLastSeen
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            $expiresAt = now()->addMinutes(5);
            
            // Cache current user as online
            Cache::put('user-is-online-' . $user->id, true, $expiresAt);

            $lat = $request->header('X-User-Lat') ?? $request->input('lat');
            $lng = $request->header('X-User-Lng') ?? $request->input('lng');
            $hasLocation = is_numeric($lat) && is_numeric($lng);

            // Throttle last_seen writes to once per minute
            $shouldTouchLastSeen = ! $user->last_seen || $user->last_seen->diffInMinutes(now()) >= 1;

            // Still allow location updates when GPS arrives after first heartbeat
            $shouldUpdateLocation = $hasLocation && (
                $user->latitude === null
                || $user->longitude === null
                || abs((float) $user->latitude - (float) $lat) > 0.00001
                || abs((float) $user->longitude - (float) $lng) > 0.00001
            );

            if ($shouldTouchLastSeen || $shouldUpdateLocation) {
                $updateData = [];

                if ($shouldTouchLastSeen) {
                    $updateData['last_seen'] = now();
                }

                if ($shouldUpdateLocation) {
                    $updateData['latitude'] = (float) $lat;
                    $updateData['longitude'] = (float) $lng;
                }

                if ($updateData !== []) {
                    $user->update($updateData);
                }
            }
        }

        return $next($request);
    }
}
