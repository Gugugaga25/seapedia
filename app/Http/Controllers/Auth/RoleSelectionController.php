<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class RoleSelectionController extends Controller
{
    /**
     * Show the role selection page.
     */
    public function show(): Response|RedirectResponse
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

        $roles = $user->roles()->pluck('name');

        // If they only have one role, no need to select, just redirect to dashboard
        if ($roles->count() <= 1) {
            return redirect()->intended(route('dashboard'));
        }

        return Inertia::render('Auth/SelectRole', [
            'roles' => $roles,
            'activeRole' => session('active_role'),
        ]);
    }

    /**
     * Handle the role selection submission.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'role' => 'required|string',
        ]);

        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

        $selectedRole = $request->role;

        // Verify the user actually has this role
        if (!$user->roles()->where('name', $selectedRole)->exists()) {
            return back()->withErrors(['role' => 'You do not have permission for the selected role.']);
        }

        // Store selected role in session
        session(['active_role' => $selectedRole]);

        return redirect()->intended(route('dashboard'));
    }
}
