<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SellerOrderController extends Controller
{
    /**
     * Display a listing of incoming orders for the seller's shop.
     */
    public function index(): Response|RedirectResponse
    {
        Gate::authorize('active-seller');

        $user = Auth::user();
        $shop = $user->shop;

        if (!$shop) {
            return redirect()->route('seller.shop.edit')->withErrors([
                'shop' => 'Please create your shop profile first to view incoming orders.'
            ]);
        }

        // Fetch orders associated with this shop and eager load status logs
        $orders = Order::with(['items.product', 'buyer', 'statusLogs'])
            ->where('shop_id', $shop->id)
            ->latest()
            ->get();

        return Inertia::render('Seller/IncomingOrders', [
            'orders' => $orders,
            'shop' => $shop,
        ]);
    }

    /**
     * Update the status of an incoming order.
     */
    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        Gate::authorize('active-seller');

        $shop = Auth::user()->shop;
        
        // Ensure the order belongs to this seller's shop
        if (!$shop || $order->shop_id !== $shop->id) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'status' => 'required|string|in:Sedang Dikemas,Menunggu Pengirim,Dikirim,Selesai,Dibatalkan',
        ]);

        $oldStatus = $order->status;
        $newStatus = $request->status;

        $order->update([
            'status' => $newStatus,
        ]);

        // Record the status transition inside the status logs table
        if ($oldStatus !== $newStatus) {
            $order->statusLogs()->create([
                'status' => $newStatus,
            ]);
        }

        return back()->with('status', 'Status pesanan berhasil diperbarui menjadi "' . $newStatus . '".');
    }
}
