<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Discounts table
        Schema::create('discounts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('type'); // voucher, promo
            $table->string('discount_type'); // percent, fixed
            $table->decimal('value', 12, 2); // e.g. 10.00 for 10% or 20000.00 for Rp 20k
            $table->integer('quota')->nullable(); // null for promos (unlimited), integer for vouchers
            $table->dateTime('expires_at');
            $table->timestamps();
        });

        // 2. Order status logging
        Schema::create('order_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('status');
            $table->timestamp('created_at')->useCurrent();
        });

        // 3. Add discount snapshot fields to orders table
        Schema::table('orders', function (Blueprint $table) {
            $table->string('discount_code')->nullable()->after('shipping_option');
            $table->decimal('discount_amount', 12, 2)->default(0.00)->after('discount_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['discount_code', 'discount_amount']);
        });

        Schema::dropIfExists('order_status_logs');
        Schema::dropIfExists('discounts');
    }
};
