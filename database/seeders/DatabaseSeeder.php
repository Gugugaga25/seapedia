<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Product;
use App\Models\AppReview;
use App\Models\Shop;
use App\Models\Wallet;
use App\Models\ShippingAddress;
use App\Models\Discount;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Roles
        $adminRole = Role::create(['name' => 'Admin']);
        $sellerRole = Role::create(['name' => 'Seller']);
        $buyerRole = Role::create(['name' => 'Buyer']);
        $driverRole = Role::create(['name' => 'Driver']);

        // 2. Create Admin User
        $admin = User::create([
            'name' => 'Seapedia Admin',
            'email' => 'admin@seapedia.com',
            'password' => Hash::make('password'),
        ]);
        $admin->roles()->attach($adminRole);

        // 3. Create Multi-Role User (Seller, Buyer, Driver)
        $multiUser = User::create([
            'name' => 'Banu Multi Role',
            'email' => 'multi@seapedia.com',
            'password' => Hash::make('password'),
        ]);
        $multiUser->roles()->attach([$sellerRole->id, $buyerRole->id, $driverRole->id]);
        $multiShop = Shop::create([
            'user_id' => $multiUser->id,
            'name' => 'Sea Nusantara Mart',
            'description' => 'Menyediakan berbagai macam hasil laut tangkapan nelayan tradisional dengan kualitas terbaik.',
            'address' => 'Pelabuhan Sunda Kelapa, Jakarta Utara',
        ]);
        $multiUser->wallet()->create([
            'wallet_balance' => 750000.00,
            'driver_earnings' => 125000.00,
        ]);

        // 4. Create Single-Role Buyer User
        $buyerUser = User::create([
            'name' => 'Banu Buyer Only',
            'email' => 'buyer@seapedia.com',
            'password' => Hash::make('password'),
        ]);
        $buyerUser->roles()->attach($buyerRole);
        $buyerUser->wallet()->create([
            'wallet_balance' => 500000.00,
            'driver_earnings' => 0.00,
        ]);
        $buyerUser->shippingAddresses()->create([
            'recipient_name' => 'Banu Pandara',
            'phone' => '081234567890',
            'address' => 'Jl. Menteng Raya No. 45, RT 01/RW 02, Menteng, Jakarta Pusat',
            'is_default' => true,
        ]);

        // 5. Create Single-Role Seller User
        $sellerUser = User::create([
            'name' => 'Banu Seller Only',
            'email' => 'seller@seapedia.com',
            'password' => Hash::make('password'),
        ]);
        $sellerUser->roles()->attach($sellerRole);
        $sellerShop = Shop::create([
            'user_id' => $sellerUser->id,
            'name' => 'Toko Nelayan Banu',
            'description' => 'Spesialis tangkapan ikan karang dan udang lobster segar.',
            'address' => 'Pantai Indah Kapuk, Jakarta Utara',
        ]);
        $sellerUser->wallet()->create([
            'wallet_balance' => 0.00,
            'driver_earnings' => 0.00,
        ]);

        // 6. Create Mock Products (associated with Sellers)
        Product::create([
            'user_id' => $sellerUser->id,
            'name' => 'Fresh Yellowfin Tuna (Tuna Sirip Kuning)',
            'description' => 'Tangkapan segar langsung dari Laut Banda. Daging merah padat berlemak, sangat cocok untuk sashimi atau steak.',
            'price' => 75000.00,
            'stock' => 50,
            'image_url' => 'tuna_sirip_kuning.jpg',
        ]);

        Product::create([
            'user_id' => $multiUser->id,
            'name' => 'Giant Tiger Lobster (Lobster Windu)',
            'description' => 'Lobster tangkapan laut dalam perairan selatan Jawa. Ukuran besar (grade A), dikirim dalam keadaan segar dingin.',
            'price' => 185000.00,
            'stock' => 12,
            'image_url' => 'lobster_windu.jpg',
        ]);

        Product::create([
            'user_id' => $sellerUser->id,
            'name' => 'Live Mud Crab (Kepiting Bakau Hidup)',
            'description' => 'Kepiting bakau tangkapan hutan mangrove Kalimantan Timur. Cangkang keras isi daging penuh dan gurih.',
            'price' => 95000.00,
            'stock' => 20,
            'image_url' => 'kepiting_bakau.jpg',
        ]);

        Product::create([
            'user_id' => $multiUser->id,
            'name' => 'Premium Black Tiger Shrimp (Udang Windu)',
            'description' => 'Udang laut premium dengan cangkang bergaris hitam tegas. Rasa manis alami dan tekstur yang sangat renyah.',
            'price' => 120000.00,
            'stock' => 35,
            'image_url' => 'udang_windu.jpg',
        ]);

        // 7. Create Mock App Reviews (feedback on using SEAPEDIA)
        AppReview::create([
            'user_id' => $sellerUser->id,
            'reviewer_name' => $sellerUser->name,
            'rating' => 5,
            'comment' => 'Sebagai nelayan lokal, aplikasi SEAPEDIA membantu saya menjual tangkapan langsung ke restoran tanpa tengkulak. Margin keuntungan meningkat drastis!',
        ]);

        AppReview::create([
            'user_id' => $buyerUser->id,
            'reviewer_name' => $buyerUser->name,
            'rating' => 4,
            'comment' => 'Bisa beli seafood premium dalam kondisi segar bugar. Pembayaran mudah dan driver sangat ramah mengantarkan sampai depan dapur rumah.',
        ]);

        AppReview::create([
            'user_id' => null, // Guest reviewer
            'reviewer_name' => 'Rian Fishery',
            'rating' => 5,
            'comment' => 'Desain UI aplikasi sangat bersih dan mudah dimengerti. Saya baru pertama mencoba tapi sudah langsung bisa memesan ikan kakap merah dengan lancar.',
        ]);

        // 8. Create Mock Vouchers and Promos
        Discount::create([
            'code' => 'MERDEKA17',
            'type' => 'promo',
            'discount_type' => 'percent',
            'value' => 17.00,
            'quota' => null,
            'expires_at' => now()->addYear(),
        ]);

        Discount::create([
            'code' => 'SEAPEDIA50',
            'type' => 'voucher',
            'discount_type' => 'fixed',
            'value' => 50000.00,
            'quota' => 10,
            'expires_at' => now()->addYear(),
        ]);
    }
}
