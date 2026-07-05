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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Buyer ID
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');  // Shop ID
            $table->string('recipient_name');
            $table->string('phone');
            $table->text('address');
            $table->string('shipping_option'); // Instant, Next Day, Regular
            $table->decimal('shipping_fee', 12, 2);
            $table->decimal('tax', 12, 2); // 12% PPN
            $table->decimal('total_price', 15, 2);
            $table->string('status')->default('Sedang Dikemas'); // Sedang Dikemas, Dikirim, Selesai
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            $table->string('product_name'); // Snapshot
            $table->decimal('price', 12, 2);  // Snapshot
            $table->integer('quantity');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
