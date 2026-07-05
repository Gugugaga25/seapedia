<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CartController extends Controller
{
    /**
     * Display the buyer's shopping cart.
     */
    public function index(): Response
    {
        Gate::authorize('active-buyer');

        $user = Auth::user();
        $cartItems = CartItem::with(['product.seller.shop'])
            ->where('user_id', $user->id)
            ->get();

        // Get wallet and addresses to support checkout mock
        $wallet = $user->wallet()->firstOrCreate(['user_id' => $user->id], ['balance' => 0.00]);
        $addresses = $user->shippingAddresses()->get();

        return Inertia::render('Buyer/CartIndex', [
            'cartItems' => $cartItems,
            'wallet' => $wallet,
            'addresses' => $addresses,
        ]);
    }

    /**
     * Add a product to the cart (enforces single-store rule).
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('active-buyer');

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $user = Auth::user();
        $product = Product::with('seller.shop')->findOrFail($request->product_id);

        // Security Check: Prevent self-purchase
        if ($product->user_id === $user->id) {
            return back()->withErrors([
                'cart_error' => 'Anda tidak dapat membeli produk dari toko Anda sendiri'
            ]);
        }

        // 1. Verify product is in stock
        if ($product->stock < $request->quantity) {
            return back()->withErrors(['quantity' => 'Not enough stock available.']);
        }

        // 2. Fetch existing cart items
        $existingCartItems = CartItem::where('user_id', $user->id)->get();

        if ($existingCartItems->isNotEmpty()) {
            // Find the seller of the first item in the cart
            $firstCartItem = $existingCartItems->first()->product;
            
            if ($firstCartItem->user_id !== $product->user_id) {
                // Seller mismatch! Reject and enforce single-store checkout
                $existingShopName = $firstCartItem->seller->shop->name ?? 'another seller';
                return back()->withErrors([
                    'cart_error' => "Oops! Keranjang Anda saat ini berisi produk dari \"{$existingShopName}\". Untuk efisiensi pengiriman, satu transaksi hanya diperbolehkan dari satu toko. Silakan selesaikan transaksi saat ini atau kosongkan keranjang Anda terlebih dahulu."
                ]);
            }
        }

        // 3. Add to cart or update quantity
        $cartItem = CartItem::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if ($cartItem) {
            $newQuantity = $cartItem->quantity + $request->quantity;
            if ($product->stock < $newQuantity) {
                return back()->withErrors(['quantity' => 'Not enough stock to add more of this item.']);
            }
            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            CartItem::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'quantity' => $request->quantity,
            ]);
        }

        return back()->with('status', 'Product added to cart!');
    }

    /**
     * Update quantity of a cart item.
     */
    public function update(Request $request, CartItem $cartItem): RedirectResponse
    {
        Gate::authorize('active-buyer');

        if ($cartItem->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        // Verify stock
        $product = $cartItem->product;
        if ($product->stock < $request->quantity) {
            return back()->withErrors(['quantity' => 'Not enough stock available.']);
        }

        $cartItem->update(['quantity' => $request->quantity]);

        return back()->with('status', 'Cart quantity updated.');
    }

    /**
     * Remove an item from the cart.
     */
    public function destroy(CartItem $cartItem): RedirectResponse
    {
        Gate::authorize('active-buyer');

        if ($cartItem->user_id !== Auth::id()) {
            abort(403);
        }

        $cartItem->delete();

        return back()->with('status', 'Item removed from cart.');
    }

    /**
     * Clear all items in the cart.
     */
    public function clear(): RedirectResponse
    {
        Gate::authorize('active-buyer');

        CartItem::where('user_id', Auth::id())->delete();

        return back()->with('status', 'Keranjang berhasil dikosongkan.');
    }
}
