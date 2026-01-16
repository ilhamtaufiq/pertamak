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

            // Update database every minute (throttle database writes)
            if (!$user->last_seen || $user->last_seen->diffInMinutes(now()) >= 1) {
                $updateData = ['last_seen' => now()];
                
                // Track location if provided in headers or request
                if ($request->hasHeader('X-User-Lat') && $request->hasHeader('X-User-Lng')) {
                    $updateData['latitude'] = $request->header('X-User-Lat');
                    $updateData['longitude'] = $request->header('X-User-Lng');
                } elseif ($request->has(['lat', 'lng'])) {
                    $updateData['latitude'] = $request->input('lat');
                    $updateData['longitude'] = $request->input('lng');
                }

                $user->update($updateData);
            }
        }

        return $next($request);
    }
}
