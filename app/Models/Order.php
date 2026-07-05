<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'user_id',
    'shop_id',
    'driver_id',
    'recipient_name',
    'phone',
    'address',
    'shipping_option',
    'discount_code',
    'discount_amount',
    'shipping_fee',
    'tax',
    'total_price',
    'status'
])]
class Order extends Model
{
    protected static function boot()
    {
        parent::boot();

        // Automatically log initial status upon order creation
        static::created(function ($order) {
            $order->statusLogs()->create([
                'status' => $order->status,
            ]);
        });
    }

    /**
     * Get the buyer (user) that placed the order.
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the driver assigned to this order.
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    /**
     * Get the shop that fullfills the order.
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * Get the items in this order.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the status logs for this order.
     */
    public function statusLogs(): HasMany
    {
        return $this->hasMany(OrderStatusLog::class);
    }
}
