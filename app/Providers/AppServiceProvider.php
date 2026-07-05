<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
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
        Vite::prefetch(concurrency: 3);

        // Define gates for active roles
        Gate::define('active-admin', function ($user) {
            return $user->hasActiveRole('Admin');
        });

        Gate::define('active-seller', function ($user) {
            return $user->hasActiveRole('Seller');
        });

        Gate::define('active-buyer', function ($user) {
            return $user->hasActiveRole('Buyer');
        });

        Gate::define('active-driver', function ($user) {
            return $user->hasActiveRole('Driver');
        });
    }
}
