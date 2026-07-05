<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class DriverOrderController extends Controller
{
    /**
     * Display the Driver's dashboard containing:
     * - Search for jobs ('Menunggu Pengirim')
     * - Ongoing delivery jobs ('Sedang Dikirim' taken by driver)
     * - Earnings history ('Selesai' taken by driver)
     */
    public function index(): Response
    {
        Gate::authorize('active-driver');

        $driverId = Auth::id();

        // 1. Available jobs: Awaiting Dispatch ('Menunggu Pengirim') with no driver assigned
        $availableJobs = Order::with(['items.product', 'shop', 'buyer'])
            ->where('status', 'Menunggu Pengirim')
            ->whereNull('driver_id')
            ->latest()
            ->get();

        // 2. Active jobs: Currently delivering ('Sedang Dikirim') assigned to this driver
        $activeJobs = Order::with(['items.product', 'shop', 'buyer'])
            ->where('driver_id', $driverId)
            ->where('status', 'Sedang Dikirim')
            ->latest()
            ->get();

        // 3. Completed jobs & earnings: Completed ('Selesai') assigned to this driver
        $completedJobs = Order::with(['items.product', 'shop', 'buyer'])
            ->where('driver_id', $driverId)
            ->where('status', 'Selesai')
            ->latest()
            ->get();

        // Driver Wallet balance
        $wallet = Wallet::firstOrCreate(['user_id' => $driverId], ['wallet_balance' => 0.00, 'driver_earnings' => 0.00]);

        return Inertia::render('Driver/JobsIndex', [
            'availableJobs' => $availableJobs,
            'activeJobs' => $activeJobs,
            'completedJobs' => $completedJobs,
            'wallet' => $wallet,
        ]);
    }

    /**
     * Accept a delivery job.
     */
    public function acceptJob(Order $order): RedirectResponse
    {
        Gate::authorize('active-driver');

        $driverId = Auth::id();

        try {
            DB::transaction(function () use ($order, $driverId) {
                // Lock the order row to prevent race conditions
                $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->first();

                if ($lockedOrder->status !== 'Menunggu Pengirim' || !is_null($lockedOrder->driver_id)) {
                    throw new \Exception('Pekerjaan pengiriman ini sudah diambil oleh driver lain.');
                }

                // Assign driver and transition status
                $lockedOrder->update([
                    'driver_id' => $driverId,
                    'status' => 'Sedang Dikirim',
                ]);

                // Create status log
                $lockedOrder->statusLogs()->create([
                    'status' => 'Sedang Dikirim',
                ]);
            });
        } catch (\Exception $e) {
            return back()->withErrors(['job_error' => $e->getMessage()]);
        }

        return back()->with('status', 'Pekerjaan berhasil diambil! Silakan kirimkan pesanan ke alamat penerima.');
    }

    /**
     * Complete a delivery job.
     */
    public function completeJob(Order $order): RedirectResponse
    {
        Gate::authorize('active-driver');

        $driverId = Auth::id();

        if ($order->driver_id !== $driverId) {
            abort(403, 'Unauthorized action.');
        }

        if ($order->status !== 'Sedang Dikirim') {
            return back()->withErrors(['job_error' => 'Pesanan ini tidak berada dalam status pengiriman.']);
        }

        try {
            DB::transaction(function () use ($order, $driverId) {
                // Transition order status to 'Selesai'
                $order->update([
                    'status' => 'Selesai',
                ]);

                // Create status log
                $order->statusLogs()->create([
                    'status' => 'Selesai',
                ]);

                // Increment driver's wallet with the shipping fee
                $driverWallet = Wallet::where('user_id', $driverId)->lockForUpdate()->firstOrCreate(
                    ['user_id' => $driverId],
                    ['wallet_balance' => 0.00, 'driver_earnings' => 0.00]
                );
                
                $driverWallet->increment('driver_earnings', $order->shipping_fee);
            });
        } catch (\Exception $e) {
            return back()->withErrors(['job_error' => $e->getMessage()]);
        }

        return back()->with('status', 'Pengiriman Berhasil Diselesaikan! Ongkos kirim sebesar ' . number_format($order->shipping_fee, 0, ',', '.') . ' telah masuk ke dompet Anda.');
    }
}
