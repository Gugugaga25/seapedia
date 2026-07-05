<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['order_id', 'status'])]
class OrderStatusLog extends Model
{
    // Turn off standard timestamps, since we only use created_at
    public $timestamps = false;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->created_at = $model->freshTimestamp();
        });
    }

    /**
     * Get the order associated with this log.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
