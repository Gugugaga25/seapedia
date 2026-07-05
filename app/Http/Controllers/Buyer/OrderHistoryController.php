<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class OrderHistoryController extends Controller
{
    /**
     * Display the buyer's order history.
     */
    public function index(): Response
    {
        Gate::authorize('active-buyer');

        $user = Auth::user();
        
        $orders = Order::with(['items.product', 'shop', 'statusLogs'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return Inertia::render('Buyer/OrderHistory', [
            'orders' => $orders,
        ]);
    }
}
