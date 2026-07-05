<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\AppReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class PublicMarketplaceController extends Controller
{
    /**
     * Display the public landing page with products and app reviews.
     */
    public function index(): Response
    {
        $products = Product::with('seller.shop')->get();
        $reviews = AppReview::with('user:id,name')->latest()->get();

        return Inertia::render('Welcome', [
            'products' => $products,
            'reviews' => $reviews,
            'canLogin' => \Illuminate\Support\Facades\Route::has('login'),
            'canRegister' => \Illuminate\Support\Facades\Route::has('register'),
        ]);
    }

    /**
     * Store a new app review from a guest or logged-in user.
     */
    public function storeReview(Request $request): RedirectResponse
    {
        $rules = [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ];

        // If not logged in, reviewer name is required
        if (!Auth::check()) {
            $rules['reviewer_name'] = 'required|string|max:255';
        }

        $request->validate($rules);

        // Security Hardening: XSS prevention via input tag-stripping
        $cleanName = Auth::check() ? Auth::user()->name : $request->reviewer_name;
        $cleanName = strip_tags($cleanName);
        $cleanComment = strip_tags($request->comment);

        AppReview::create([
            'user_id' => Auth::id(), // Nullable
            'reviewer_name' => $cleanName,
            'rating' => $request->rating,
            'comment' => $cleanComment,
        ]);

        return back()->with('status', 'Thank you for your feedback!');
    }
}
