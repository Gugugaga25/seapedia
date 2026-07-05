<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ShippingAddress;
use App\Models\Wallet;
use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;

class CheckoutController extends Controller
{
    /**
     * Handle the checkout submission and payment simulation.
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('active-buyer');

        $request->validate([
            'shipping_address_id' => 'required|exists:shipping_addresses,id',
            'shipping_option' => 'required|in:Instant,Next Day,Regular',
            'discount_code' => 'nullable|string',
        ]);

        $user = Auth::user();
        
        // 1. Fetch shipping address and verify ownership
        $address = ShippingAddress::where('user_id', $user->id)
            ->findOrFail($request->shipping_address_id);

        // 2. Fetch cart items
        $cartItems = CartItem::with('product.seller.shop')
            ->where('user_id', $user->id)
            ->get();

        if ($cartItems->isEmpty()) {
            return back()->withErrors(['cart' => 'Your cart is empty.']);
        }

        // Security Check: Prevent self-purchase during checkout
        foreach ($cartItems as $item) {
            if ($item->product->user_id === $user->id) {
                return back()->withErrors(['cart' => 'Anda tidak dapat membeli produk dari toko Anda sendiri']);
            }
        }

        // Security Check: Enforce single-store checkout rule
        $firstShopId = $cartItems->first()->product->seller->shop->id ?? null;
        foreach ($cartItems as $item) {
            $itemShopId = $item->product->seller->shop->id ?? null;
            if ($itemShopId !== $firstShopId) {
                return back()->withErrors(['cart' => 'Semua item di dalam keranjang harus berasal dari toko yang sama.']);
            }
        }

        // 3. Calculate initial subtotal
        $subtotal = $cartItems->reduce(function ($acc, $item) {
            return $acc + ((float) $item->product->price * $item->quantity);
        }, 0);

        // 4. Handle Discount Code (Promo/Voucher)
        $discount = null;
        $discountAmount = 0.00;
        if ($request->filled('discount_code')) {
            $discount = Discount::where('code', $request->discount_code)->first();
            if (!$discount || !$discount->isValid()) {
                return back()->withErrors(['discount' => 'Kode promo/voucher tidak valid']);
            }
            $discountAmount = $discount->calculateAmount($subtotal);
        }

        $discountedSubtotal = max(0.00, $subtotal - $discountAmount);

        // 5. Calculate Shipping fee rules
        $shippingFee = 10000.00; // Regular default
        if ($request->shipping_option === 'Instant') {
            $shippingFee = 25000.00;
        } elseif ($request->shipping_option === 'Next Day') {
            $shippingFee = 15000.00;
        }

        // Tax 12% computed on the discounted subtotal
        $tax = $discountedSubtotal * 0.12; 
        $grandTotal = $discountedSubtotal + $shippingFee + $tax;

        // 6. Check wallet balance
        $wallet = $user->wallet()->firstOrCreate(['user_id' => $user->id], ['wallet_balance' => 0.00, 'driver_earnings' => 0.00]);
        if ($wallet->wallet_balance < $grandTotal) {
            return back()->withErrors(['balance' => 'Saldo dompet tidak mencukupi untuk melakukan checkout. Silakan top up terlebih dahulu.']);
        }

        // 7. Execute checkout under a database transaction with locks
        try {
            DB::transaction(function () use ($user, $cartItems, $address, $request, $shippingFee, $tax, $grandTotal, $discount, $discountAmount) {
                // Lock user's wallet for update to prevent race conditions
                $lockedWallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first();
                
                if ($lockedWallet->wallet_balance < $grandTotal) {
                    throw new \Exception('Saldo dompet tidak mencukupi.');
                }

                // Verify and lock product stocks
                foreach ($cartItems as $item) {
                    $lockedProduct = Product::where('id', $item->product_id)->lockForUpdate()->first();
                    
                    if ($lockedProduct->stock < $item->quantity) {
                        throw new \Exception("Stok ikan '{$lockedProduct->name}' tidak mencukupi. Tersedia: {$lockedProduct->stock} kg.");
                    }

                    // Decrement stock
                    $lockedProduct->decrement('stock', $item->quantity);
                }

                // If utilizing a voucher, lock and update voucher quota
                if ($discount && $discount->type === 'voucher') {
                    $lockedDiscount = Discount::where('id', $discount->id)->lockForUpdate()->first();
                    if (!$lockedDiscount || !$lockedDiscount->isValid()) {
                        throw new \Exception('Voucher ini sudah habis terpakai atau kedaluwarsa.');
                    }
                    if (!is_null($lockedDiscount->quota)) {
                        $lockedDiscount->decrement('quota', 1);
                    }
                }

                // Deduct wallet balance
                $lockedWallet->decrement('wallet_balance', $grandTotal);

                // Create Order record (status initially 'Sedang Dikemas')
                $order = Order::create([
                    'user_id' => $user->id,
                    'shop_id' => $cartItems->first()->product->seller->shop->id, // Corrected: Use actual Shop ID, not Seller User ID
                    'recipient_name' => $address->recipient_name,
                    'phone' => $address->phone,
                    'address' => $address->address,
                    'shipping_option' => $request->shipping_option,
                    'discount_code' => $discount ? $discount->code : null,
                    'discount_amount' => $discountAmount,
                    'shipping_fee' => $shippingFee,
                    'tax' => $tax,
                    'total_price' => $grandTotal,
                    'status' => 'Sedang Dikemas',
                ]);

                // Create Order Items snapshots
                foreach ($cartItems as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product->name,
                        'price' => $item->product->price,
                        'quantity' => $item->quantity,
                    ]);
                }

                // Empty the cart
                CartItem::where('user_id', $user->id)->delete();
            });
        } catch (\Exception $e) {
            return back()->withErrors(['checkout' => $e->getMessage()]);
        }

        return redirect()->route('buyer.orders.index')->with('status', 'Checkout Berhasil! Pesanan Anda telah dibuat dengan status "Sedang Dikemas".');
    }

    /**
     * Validate discount code.
     */
    public function validateDiscount(Request $request): \Illuminate\Http\JsonResponse
    {
        Gate::authorize('active-buyer');

        $request->validate([
            'code' => 'required|string',
        ]);

        $discount = Discount::where('code', $request->code)->first();

        if ($discount && $discount->isValid()) {
            return response()->json([
                'valid' => true,
                'code' => $discount->code,
                'type' => $discount->type,
                'discount_type' => $discount->discount_type,
                'value' => (float) $discount->value,
            ]);
        }

        return response()->json([
            'valid' => false,
            'message' => 'Kode voucher/promo tidak valid atau sudah kedaluwarsa.'
        ]);
    }
}

// Simple helper inside namespace
if (!function_exists('App\Http\Controllers\Buyer\parseFloat')) {
    function parseFloat($str) {
        return (float) $str;
    }
}
