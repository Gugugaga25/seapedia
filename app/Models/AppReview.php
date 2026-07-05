<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id', 'reviewer_name', 'rating', 'comment'])]
class AppReview extends Model
{
    /**
     * Get the user that left the review, if they were logged in.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
