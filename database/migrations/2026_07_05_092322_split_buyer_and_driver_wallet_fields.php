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
        Schema::table('wallets', function (Blueprint $table) {
            $table->renameColumn('balance', 'wallet_balance');
            $table->decimal('driver_earnings', 15, 2)->default(0.00)->after('balance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            $table->renameColumn('wallet_balance', 'balance');
            $table->dropColumn('driver_earnings');
        });
    }
};
