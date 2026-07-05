<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['order_id', 'product_id', 'product_name', 'price', 'quantity'])]
class OrderItem extends Model
{
    /**
     * Get the order that contains this item.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product details (if it still exists).
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
