<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BuyerMarketplaceController extends Controller
{
    /**
     * Display the authenticated Buyer seafood catalog.
     */
    public function index(): Response
    {
        Gate::authorize('active-buyer');

        // Fetch products with their corresponding seller shop information
        $products = Product::with('seller.shop')->get();

        return Inertia::render('Buyer/Marketplace', [
            'products' => $products,
        ]);
    }
}
