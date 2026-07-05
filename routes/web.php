<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\PublicMarketplaceController;

Route::get('/', [PublicMarketplaceController::class, 'index'])->name('home');
Route::post('/reviews', [PublicMarketplaceController::class, 'storeReview'])->name('reviews.store');


Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', 'active_role'])->name('dashboard');

Route::middleware(['auth', 'active_role'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Seller Shop Profile
    Route::get('/seller/shop', [\App\Http\Controllers\Seller\ShopController::class, 'edit'])->name('seller.shop.edit');
    Route::post('/seller/shop', [\App\Http\Controllers\Seller\ShopController::class, 'update'])->name('seller.shop.update');

    // Seller Product CRUD
    Route::get('/seller/products', [\App\Http\Controllers\Seller\SellerProductController::class, 'index'])->name('seller.products.index');
    Route::post('/seller/products', [\App\Http\Controllers\Seller\SellerProductController::class, 'store'])->name('seller.products.store');
    Route::patch('/seller/products/{product}', [\App\Http\Controllers\Seller\SellerProductController::class, 'update'])->name('seller.products.update');
    Route::delete('/seller/products/{product}', [\App\Http\Controllers\Seller\SellerProductController::class, 'destroy'])->name('seller.products.destroy');

    // Buyer Dedicated Marketplace
    Route::get('/buyer/marketplace', [\App\Http\Controllers\Buyer\BuyerMarketplaceController::class, 'index'])->name('buyer.marketplace.index');

    // Buyer Wallet & Address Profile
    Route::get('/buyer/wallet', [\App\Http\Controllers\Buyer\WalletController::class, 'index'])->name('buyer.wallet.index');
    Route::post('/buyer/wallet/topup', [\App\Http\Controllers\Buyer\WalletController::class, 'topUp'])->name('buyer.wallet.topup');
    Route::post('/buyer/address', [\App\Http\Controllers\Buyer\WalletController::class, 'storeAddress'])->name('buyer.address.store');
    Route::patch('/buyer/address/{address}', [\App\Http\Controllers\Buyer\WalletController::class, 'updateAddress'])->name('buyer.address.update');
    Route::delete('/buyer/address/{address}', [\App\Http\Controllers\Buyer\WalletController::class, 'destroyAddress'])->name('buyer.address.destroy');

    // Buyer Cart
    Route::get('/buyer/cart', [\App\Http\Controllers\Buyer\CartController::class, 'index'])->name('buyer.cart.index');
    Route::post('/buyer/cart', [\App\Http\Controllers\Buyer\CartController::class, 'store'])->name('buyer.cart.store');
    Route::patch('/buyer/cart/{cartItem}', [\App\Http\Controllers\Buyer\CartController::class, 'update'])->name('buyer.cart.update');
    Route::delete('/buyer/cart/{cartItem}', [\App\Http\Controllers\Buyer\CartController::class, 'destroy'])->name('buyer.cart.destroy');
    Route::post('/buyer/cart/clear', [\App\Http\Controllers\Buyer\CartController::class, 'clear'])->name('buyer.cart.clear');

    // Buyer Checkout & Orders
    Route::post('/buyer/checkout', [\App\Http\Controllers\Buyer\CheckoutController::class, 'store'])->name('buyer.checkout.store');
    Route::post('/buyer/discounts/validate', [\App\Http\Controllers\Buyer\CheckoutController::class, 'validateDiscount'])->name('buyer.discounts.validate');
    Route::get('/buyer/orders', [\App\Http\Controllers\Buyer\OrderHistoryController::class, 'index'])->name('buyer.orders.index');

    // Seller Incoming Orders
    Route::get('/seller/orders', [\App\Http\Controllers\Seller\SellerOrderController::class, 'index'])->name('seller.orders.index');
    Route::patch('/seller/orders/{order}', [\App\Http\Controllers\Seller\SellerOrderController::class, 'updateStatus'])->name('seller.orders.updateStatus');

    // Driver Jobs & Operations
    Route::get('/driver/jobs', [\App\Http\Controllers\Driver\DriverOrderController::class, 'index'])->name('driver.jobs.index');
    Route::post('/driver/jobs/{order}/accept', [\App\Http\Controllers\Driver\DriverOrderController::class, 'acceptJob'])->name('driver.jobs.accept');
    Route::post('/driver/jobs/{order}/complete', [\App\Http\Controllers\Driver\DriverOrderController::class, 'completeJob'])->name('driver.jobs.complete');

    // Admin Control Panel
    Route::get('/admin/dashboard', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('admin.dashboard.index');
    Route::post('/admin/discounts', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'storeDiscount'])->name('admin.discounts.store');
    Route::post('/admin/orders/{order}/overdue', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'triggerOverdue'])->name('admin.orders.overdue');
});

Route::middleware('auth')->group(function () {
    Route::get('/role-select', [\App\Http\Controllers\Auth\RoleSelectionController::class, 'show'])->name('role-select');
    Route::post('/role-select', [\App\Http\Controllers\Auth\RoleSelectionController::class, 'store'])->name('role-select.store');
});

require __DIR__.'/auth.php';

