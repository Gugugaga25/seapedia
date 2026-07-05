<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SellerProductController extends Controller
{
    /**
     * Display a listing of the seller's products.
     */
    public function index(): Response
    {
        Gate::authorize('active-seller');

        $user = Auth::user();
        $products = Product::where('user_id', $user->id)->get();
        $shop = $user->shop;

        return Inertia::render('Seller/ProductCRUD', [
            'products' => $products,
            'shop' => $shop,
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('active-seller');

        $user = Auth::user();
        
        // Ensure they have created a shop first
        if (!$user->shop) {
            return back()->withErrors(['shop' => 'Please create your shop profile first before listing products.']);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);

        // Security Hardening: XSS protection
        $cleanName = strip_tags($request->name);
        $cleanDescription = $request->filled('description') ? strip_tags($request->description) : null;

        Product::create([
            'user_id' => $user->id,
            'name' => $cleanName,
            'description' => $cleanDescription,
            'price' => $request->price,
            'stock' => $request->stock,
        ]);

        return back()->with('status', 'Product listed successfully!');
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        Gate::authorize('active-seller');

        // Ensure user owns the product
        if ($product->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);

        // Security Hardening: XSS protection
        $cleanName = strip_tags($request->name);
        $cleanDescription = $request->filled('description') ? strip_tags($request->description) : null;

        $product->update([
            'name' => $cleanName,
            'description' => $cleanDescription,
            'price' => $request->price,
            'stock' => $request->stock,
        ]);

        return back()->with('status', 'Product updated successfully!');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product): RedirectResponse
    {
        Gate::authorize('active-seller');

        // Ensure user owns the product
        if ($product->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $product->delete();

        return back()->with('status', 'Product deleted successfully!');
    }
}
