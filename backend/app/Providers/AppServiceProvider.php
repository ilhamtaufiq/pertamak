<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Production / HTTPS domains: force https:// in generated URLs
        $appUrl = (string) config('app.url', '');
        if (
            app()->environment('production')
            || str_starts_with($appUrl, 'https://')
        ) {
            URL::forceScheme('https');
        }
    }
}
