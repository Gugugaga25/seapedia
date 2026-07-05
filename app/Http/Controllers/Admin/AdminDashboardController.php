<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Shop;
use App\Models\Product;
use App\Models\Order;
use App\Models\Discount;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class AdminDashboardController extends Controller
{
    /**
     * Display the Admin control panel monitoring workspace.
     */
    public function index(): Response
    {
        Gate::authorize('active-admin');

        $users = User::with('roles')->get();
        $shops = Shop::with('owner')->get();
        $products = Product::with('seller.shop')->get();
        
        // Orders with items, buyer, seller shop, and driver assigned
        $orders = Order::with(['items', 'buyer', 'shop', 'driver', 'statusLogs'])->latest()->get();
        $discounts = Discount::latest()->get();

        return Inertia::render('Admin/Dashboard', [
            'users' => $users,
            'shops' => $shops,
            'products' => $products,
            'orders' => $orders,
            'discounts' => $discounts,
            'stats' => [
                'users_count' => $users->count(),
                'shops_count' => $shops->count(),
                'products_count' => $products->count(),
                'orders_count' => $orders->count(),
                'discounts_count' => $discounts->count(),
            ]
        ]);
    }

    /**
     * Create a new discount voucher or promo code.
     */
    public function storeDiscount(Request $request): RedirectResponse
    {
        Gate::authorize('active-admin');

        $request->validate([
            'code' => 'required|string|unique:discounts,code|max:50',
            'type' => 'required|string|in:voucher,promo',
            'discount_type' => 'required|string|in:percent,fixed',
            'value' => 'required|numeric|min:0',
            'quota' => 'nullable|required_if:type,voucher|integer|min:1',
            'expires_at' => 'required|date|after:today',
        ], [
            'quota.required_if' => 'Quota is required for voucher type discounts.'
        ]);

        Discount::create([
            'code' => strtoupper($request->code),
            'type' => $request->type,
            'discount_type' => $request->discount_type,
            'value' => $request->value,
            'quota' => $request->type === 'voucher' ? $request->quota : null,
            'expires_at' => $request->expires_at,
        ]);

        return back()->with('status', 'Voucher atau Promo baru berhasil dibuat!');
    }

    /**
     * Trigger a simulated overdue state on an order.
     * This automatically:
     * - Restores product stocks.
     * - Restores voucher quota (if applicable).
     * - Performs refund to buyer wallet.
     * - Updates status to 'Dikembalikan'.
     * - Logs status transition.
     */
    public function triggerOverdue(Order $order): RedirectResponse
    {
        Gate::authorize('active-admin');

        // Prevent refunding completed or already returned/canceled orders
        if (in_array($order->status, ['Selesai', 'Dibatalkan', 'Dikembalikan'])) {
            return back()->withErrors([
                'overdue_error' => 'Pesanan ini sudah selesai, dibatalkan, atau telah dikembalikan.'
            ]);
        }

        try {
            DB::transaction(function () use ($order) {
                // 1. Lock the order row
                $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->first();

                // 2. Lock and fetch buyer's wallet
                $buyerWallet = Wallet::firstOrCreate(
                    ['user_id' => $lockedOrder->user_id],
                    ['wallet_balance' => 0.00, 'driver_earnings' => 0.00]
                );
                $lockedBuyerWallet = Wallet::where('id', $buyerWallet->id)->lockForUpdate()->first();

                // 3. Restore product stock safely
                foreach ($lockedOrder->items as $item) {
                    if ($item->product_id) {
                        $lockedProduct = Product::where('id', $item->product_id)->lockForUpdate()->first();
                        if ($lockedProduct) {
                            $lockedProduct->increment('stock', $item->quantity);
                        }
                    }
                }

                // 4. Restore discount voucher quota (if applicable)
                if ($lockedOrder->discount_code) {
                    $discount = Discount::where('code', $lockedOrder->discount_code)->first();
                    if ($discount && $discount->type === 'voucher') {
                        $lockedDiscount = Discount::where('id', $discount->id)->lockForUpdate()->first();
                        if ($lockedDiscount && !is_null($lockedDiscount->quota)) {
                            $lockedDiscount->increment('quota', 1);
                        }
                    }
                }

                // 5. Transfer refund back to Buyer's wallet
                $lockedBuyerWallet->increment('wallet_balance', $lockedOrder->total_price);

                // 6. Transition status to 'Dikembalikan'
                $lockedOrder->update([
                    'status' => 'Dikembalikan',
                ]);

                // 7. Write status change log
                $lockedOrder->statusLogs()->create([
                    'status' => 'Dikembalikan',
                ]);
            });
        } catch (\Exception $e) {
            return back()->withErrors(['overdue_error' => 'Gagal memproses overdue: ' . $e->getMessage()]);
        }

        return back()->with('status', 'Simulasi Overdue Berhasil! Dana ' . number_format($order->total_price, 0, ',', '.') . ' telah direfund ke dompet pembeli, stok produk dikembalikan, dan status diubah menjadi "Dikembalikan".');
    }
}
