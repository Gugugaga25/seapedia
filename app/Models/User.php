<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * The roles that belong to the user.
     */
    public function roles(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    /**
     * Get the shop associated with the user (for sellers).
     */
    public function shop(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Shop::class);
    }

    /**
     * Get the wallet associated with the user.
     */
    public function wallet(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    /**
     * Get the shipping addresses for the user.
     */
    public function shippingAddresses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ShippingAddress::class);
    }

    /**
     * Get the cart items for the user.
     */
    public function cartItems(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Get the orders placed by the user.
     */
    public function orders(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Order::class, 'user_id');
    }

    /**
     * Get the current active role from session or default if they only have one.
     */
    public function activeRole(): ?string
    {
        if (session()->has('active_role')) {
            return session('active_role');
        }

        $roles = $this->roles()->pluck('name');
        if ($roles->count() === 1) {
            $role = $roles->first();
            session(['active_role' => $role]);
            return $role;
        }

        return null;
    }

    /**
     * Check if the user has the given active role.
     */
    public function hasActiveRole(string|array $roles): bool
    {
        $activeRole = $this->activeRole();
        if (!$activeRole) {
            return false;
        }

        if (is_array($roles)) {
            return in_array($activeRole, $roles);
        }

        return $activeRole === $roles;
    }
}

