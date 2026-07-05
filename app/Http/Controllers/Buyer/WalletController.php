<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\ShippingAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class WalletController extends Controller
{
    /**
     * Display wallet balance and shipping address management.
     */
    public function index(): Response
    {
        Gate::authorize('active-buyer');

        $user = Auth::user();
        
        // Resolve wallet
        $wallet = $user->wallet()->firstOrCreate(
            ['user_id' => $user->id],
            ['wallet_balance' => 0.00, 'driver_earnings' => 0.00]
        );

        // Fetch shipping addresses
        $addresses = $user->shippingAddresses()->latest()->get();

        return Inertia::render('Buyer/WalletAndAddress', [
            'wallet' => $wallet,
            'addresses' => $addresses,
        ]);
    }

    /**
     * Simulate a top-up of the wallet.
     */
    public function topUp(Request $request): RedirectResponse
    {
        Gate::authorize('active-buyer');

        $request->validate([
            'amount' => 'required|numeric|min:10000|max:10000000',
        ]);

        $user = Auth::user();
        $wallet = $user->wallet()->firstOrCreate(
            ['user_id' => $user->id],
            ['wallet_balance' => 0.00, 'driver_earnings' => 0.00]
        );

        $wallet->increment('wallet_balance', $request->amount);

        return back()->with('status', 'Simulasi Top-Up berhasil! Saldo dompet Anda telah ditambahkan.');
    }

    /**
     * Store a new shipping address.
     */
    public function storeAddress(Request $request): RedirectResponse
    {
        Gate::authorize('active-buyer');

        $request->validate([
            'recipient_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:1000',
            'is_default' => 'boolean',
        ]);

        $user = Auth::user();
        $isDefault = $request->is_default ?? false;

        // If this is set as default, remove default flag from other addresses
        if ($isDefault) {
            $user->shippingAddresses()->update(['is_default' => false]);
        }

        // Security Hardening: XSS protection
        $cleanRecipientName = strip_tags($request->recipient_name);
        $cleanPhone = strip_tags($request->phone);
        $cleanAddress = strip_tags($request->address);

        $user->shippingAddresses()->create([
            'recipient_name' => $cleanRecipientName,
            'phone' => $cleanPhone,
            'address' => $cleanAddress,
            'is_default' => $isDefault,
        ]);

        return back()->with('status', 'Alamat pengiriman baru berhasil disimpan.');
    }

    /**
     * Update an existing shipping address.
     */
    public function updateAddress(Request $request, ShippingAddress $address): RedirectResponse
    {
        Gate::authorize('active-buyer');

        if ($address->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'recipient_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:1000',
            'is_default' => 'boolean',
        ]);

        $isDefault = $request->is_default ?? false;

        if ($isDefault) {
            Auth::user()->shippingAddresses()->update(['is_default' => false]);
        }

        // Security Hardening: XSS protection
        $cleanRecipientName = strip_tags($request->recipient_name);
        $cleanPhone = strip_tags($request->phone);
        $cleanAddress = strip_tags($request->address);

        $address->update([
            'recipient_name' => $cleanRecipientName,
            'phone' => $cleanPhone,
            'address' => $cleanAddress,
            'is_default' => $isDefault,
        ]);

        return back()->with('status', 'Alamat pengiriman berhasil diperbarui.');
    }

    /**
     * Delete a shipping address.
     */
    public function destroyAddress(ShippingAddress $address): RedirectResponse
    {
        Gate::authorize('active-buyer');

        if ($address->user_id !== Auth::id()) {
            abort(403);
        }

        $address->delete();

        // If deleted address was default, set another address as default
        $user = Auth::user();
        if ($address->is_default && $user->shippingAddresses()->exists()) {
            $user->shippingAddresses()->first()->update(['is_default' => true]);
        }

        return back()->with('status', 'Alamat pengiriman berhasil dihapus.');
    }
}
