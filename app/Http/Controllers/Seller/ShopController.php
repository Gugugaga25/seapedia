<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ShopController extends Controller
{
    /**
     * Show the shop profile editor.
     */
    public function edit(): Response
    {
        Gate::authorize('active-seller');

        $user = Auth::user();
        $shop = $user->shop;

        return Inertia::render('Seller/ShopProfile', [
            'shop' => $shop,
        ]);
    }

    /**
     * Update or create the shop profile.
     */
    public function update(Request $request): RedirectResponse
    {
        Gate::authorize('active-seller');

        $user = Auth::user();
        $shop = $user->shop;

        $request->validate([
            'name' => 'required|string|max:255|unique:shops,name,' . ($shop ? $shop->id : 'NULL') . ',id',
            'description' => 'nullable|string|max:1000',
            'address' => 'nullable|string|max:500',
        ]);

        // Security Hardening: strip HTML tags for XSS protection
        $cleanName = strip_tags($request->name);
        $cleanDescription = $request->filled('description') ? strip_tags($request->description) : null;
        $cleanAddress = $request->filled('address') ? strip_tags($request->address) : null;

        $user->shop()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'name' => $cleanName,
                'description' => $cleanDescription,
                'address' => $cleanAddress,
            ]
        );

        return back()->with('status', 'Shop profile updated successfully!');
    }
}
