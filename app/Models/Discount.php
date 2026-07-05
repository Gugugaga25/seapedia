<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['code', 'type', 'discount_type', 'value', 'quota', 'expires_at'])]
class Discount extends Model
{
    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'quota' => 'integer',
        ];
    }

    /**
     * Check if the discount is active and valid.
     */
    public function isValid(): bool
    {
        // 1. Expiry check
        if ($this->expires_at->isPast()) {
            return false;
        }

        // 2. Quota check (only for vouchers)
        if ($this->type === 'voucher' && !is_null($this->quota) && $this->quota <= 0) {
            return false;
        }

        return true;
    }

    /**
     * Calculate discount amount for a given subtotal.
     */
    public function calculateAmount(float $subtotal): float
    {
        if ($this->discount_type === 'percent') {
            return $subtotal * ($this->value / 100);
        }
        
        // Fixed amount
        return min($this->value, $subtotal);
    }
}
