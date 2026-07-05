<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveRoleSelected
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
            
            // Allow role selection routes and logout to pass through
            if ($request->routeIs('role-select') || $request->routeIs('role-select.store') || $request->routeIs('logout')) {
                return $next($request);
            }

            // If active role is already in session, check if it's still valid for the user
            if (session()->has('active_role')) {
                $activeRole = session('active_role');
                // Ensure user actually has this role
                if ($user->roles()->where('name', $activeRole)->exists()) {
                    return $next($request);
                }
                // Invalid active role, clear it
                session()->forget('active_role');
            }

            // User does not have an active role in the session.
            $roles = $user->roles()->pluck('name');

            if ($roles->isEmpty()) {
                // No roles, log out and redirect with error
                Auth::logout();
                return redirect()->route('login')->withErrors(['email' => 'User does not have any assigned roles.']);
            }

            if ($roles->count() === 1) {
                // Auto-set the only role
                session(['active_role' => $roles->first()]);
                return $next($request);
            }

            // User has multiple roles, redirect to the role selection page
            return redirect()->route('role-select');
        }

        return $next($request);
    }
}
