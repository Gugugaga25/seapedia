import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import axios from 'axios';

interface Shop {
    id: number;
    name: string;
}

interface Seller {
    id: number;
    name: string;
    shop: Shop | null;
}

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    seller?: Seller;
}

interface CartItem {
    id: number;
    product_id: number;
    quantity: number;
    product: Product;
}

interface Wallet {
    id: number;
    wallet_balance: string;
}

interface ShippingAddress {
    id: number;
    recipient_name: string;
    phone: string;
    address: string;
    is_default: boolean;
}

interface CartIndexProps {
    cartItems: CartItem[];
    wallet: Wallet;
    addresses: ShippingAddress[];
}

export default function CartIndex({ cartItems, wallet, addresses }: CartIndexProps) {
    const { flash, errors } = usePage().props as any;

    const updateForm = useForm({
        quantity: 1,
    });

    const clearForm = useForm({});

    const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];

    // Discount state
    const [codeText, setCodeText] = useState('');
    const [discountInfo, setDiscountInfo] = useState<any>(null);
    const [discountError, setDiscountError] = useState('');

    // Form for checkout
    const checkoutForm = useForm({
        shipping_address_id: defaultAddress ? defaultAddress.id : '',
        shipping_option: 'Regular',
        discount_code: '',
    });

    // Make sure we update shipping_address_id if default address loaded asynchronously
    useEffect(() => {
        if (defaultAddress) {
            checkoutForm.setData('shipping_address_id', defaultAddress.id);
        }
    }, [defaultAddress]);

    const handleUpdateQuantity = (item: CartItem, newQty: number) => {
        if (newQty < 1) return;
        if (newQty > item.product.stock) {
            alert('Cannot add more. Exceeds available stock.');
            return;
        }

        updateForm.setData('quantity', newQty);
        updateForm.patch(route('buyer.cart.update', item.id));
    };

    const handleDeleteItem = (id: number) => {
        if (confirm('Remove item from cart?')) {
            updateForm.delete(route('buyer.cart.destroy', id));
        }
    };

    const handleClearCart = () => {
        if (confirm('Clear all items from your cart?')) {
            clearForm.post(route('buyer.cart.clear'));
        }
    };

    const handleApplyDiscount = () => {
        setDiscountError('');
        if (!codeText.trim()) {
            setDiscountInfo(null);
            checkoutForm.setData('discount_code', '');
            return;
        }

        axios.post(route('buyer.discounts.validate'), { code: codeText })
            .then(res => {
                if (res.data.valid) {
                    setDiscountInfo(res.data);
                    checkoutForm.setData('discount_code', res.data.code);
                } else {
                    setDiscountInfo(null);
                    checkoutForm.setData('discount_code', '');
                    setDiscountError(res.data.message);
                }
            })
            .catch(() => {
                setDiscountInfo(null);
                checkoutForm.setData('discount_code', '');
                setDiscountError('Gagal memvalidasi kode promo.');
            });
    };

    const handleCheckoutSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        checkoutForm.post(route('buyer.checkout.store'));
    };

    // Calculate subtotal
    const calculateSubtotal = () => {
        return cartItems.reduce((acc, item) => {
            const price = parseFloat(item.product.price);
            return acc + (price * item.quantity);
        }, 0);
    };

    // Shipping fee rule
    const getDeliveryFee = () => {
        if (cartItems.length === 0) return 0;
        const opt = checkoutForm.data.shipping_option;
        if (opt === 'Instant') return 25000;
        if (opt === 'Next Day') return 15000;
        return 10000; // Regular default
    };

    const subtotal = calculateSubtotal();

    // Calculate Discount Deduction
    const getDiscountAmount = () => {
        if (!discountInfo) return 0;
        if (discountInfo.discount_type === 'percent') {
            return subtotal * (discountInfo.value / 100);
        }
        return Math.min(discountInfo.value, subtotal);
    };

    const discountAmount = getDiscountAmount();
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);

    const deliveryFee = getDeliveryFee();
    const tax = discountedSubtotal * 0.12; // 12% PPN calculated on discounted subtotal
    const grandTotal = discountedSubtotal + deliveryFee + tax;

    const canPay = parseFloat(wallet.wallet_balance) >= grandTotal;

    const formatIDR = (amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    // Find the current active shop name
    const shopName = cartItems.length > 0
        ? (cartItems[0].product.seller?.shop?.name || cartItems[0].product.seller?.name || 'Verified Fisher')
        : null;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    My Shopping Cart
                </h2>
            }
        >
            <Head title="Shopping Cart" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {flash?.status && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm font-semibold shadow-sm">
                            {flash.status}
                        </div>
                    )}

                    {errors?.checkout && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm font-semibold shadow-sm">
                            {errors.checkout}
                        </div>
                    )}

                    {errors?.discount && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm font-semibold shadow-sm">
                            {errors.discount}
                        </div>
                    )}

                    {errors?.cart_error && (
                        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 shadow-sm flex items-start gap-4">
                            <span className="text-3xl">⚠️</span>
                            <div>
                                <h4 className="font-bold">Cart Store Conflict</h4>
                                <p className="text-sm text-rose-700 mt-1">{errors.cart_error}</p>
                            </div>
                        </div>
                    )}

                    {cartItems.length === 0 ? (
                        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm space-y-4 max-w-xl mx-auto">
                            <span className="text-6xl block">🛒</span>
                            <h3 className="text-lg font-bold text-slate-800">Your Cart is Empty</h3>
                            <p className="text-sm text-slate-400">
                                You haven't added any fresh seafood listings yet. Go to the marketplace to search for catches.
                            </p>
                            <Link
                                href={route('home')}
                                className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition cursor-pointer"
                            >
                                Browse Marketplace
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                            
                            {/* Left Column: Cart Items List (2/3) */}
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                
                                {/* Shop header */}
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <div>
                                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Ordering From</span>
                                        <span className="font-extrabold text-indigo-700 text-lg">🏪 {shopName}</span>
                                    </div>
                                    <button
                                        onClick={handleClearCart}
                                        className="text-xs font-bold text-rose-600 hover:text-rose-800 border border-rose-100 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                                    >
                                        Empty Cart
                                    </button>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/30 transition">
                                            
                                            {/* Info */}
                                            <div className="flex-1 space-y-1">
                                                <h4 className="font-bold text-slate-900 text-base">{item.product.name}</h4>
                                                <p className="text-xs text-slate-400 font-semibold">
                                                    Price: {formatIDR(item.product.price)} / kg
                                                </p>
                                                {item.product.description && (
                                                    <p className="text-xs text-slate-500 line-clamp-1 max-w-md font-light leading-relaxed">
                                                        {item.product.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Quantity & Actions */}
                                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                                
                                                {/* Quantity Selector */}
                                                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                                        className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 font-bold border-r border-slate-200 transition cursor-pointer"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-4 py-1 text-sm font-semibold text-slate-800">
                                                        {item.quantity} kg
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                                        className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 font-bold border-l border-slate-200 transition cursor-pointer"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* Total Price & Delete */}
                                                <div className="text-right shrink-0">
                                                    <span className="font-extrabold text-indigo-600 block">
                                                        {formatIDR(parseFloat(item.product.price) * item.quantity)}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        className="text-xs text-rose-500 hover:text-rose-700 font-bold mt-1 inline-block cursor-pointer"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-medium">
                                    <span>⚠️ Checkout enforces strict single-store rule.</span>
                                    <span>Stock availability is locked temporarily.</span>
                                </div>
                            </div>

                            {/* Right Column: Checkout Summary Pane (1/3) */}
                            <div className="space-y-6">
                                
                                {/* Checkout Summary */}
                                <form onSubmit={handleCheckoutSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
                                    <h3 className="font-bold text-slate-900 border-b border-slate-50 pb-2">Checkout Summary</h3>
                                    
                                    {/* Shipping Option Selector */}
                                    <div className="space-y-2">
                                        <InputLabel value="Select Shipping Option" />
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { name: 'Regular', fee: 10000, desc: '3-5 Days' },
                                                { name: 'Next Day', fee: 15000, desc: '1 Day' },
                                                { name: 'Instant', fee: 25000, desc: '3 Hours' },
                                            ].map((opt) => {
                                                const isSelected = checkoutForm.data.shipping_option === opt.name;
                                                return (
                                                    <button
                                                        key={opt.name}
                                                        type="button"
                                                        onClick={() => checkoutForm.setData('shipping_option', opt.name)}
                                                        className={`p-2 rounded-xl border text-center font-medium transition cursor-pointer text-[10px] flex flex-col items-center justify-center ${
                                                            isSelected 
                                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold ring-2 ring-indigo-500/20' 
                                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <span className="font-bold">{opt.name}</span>
                                                        <span className="text-[9px] text-slate-400 mt-0.5">{formatIDR(opt.fee)}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Voucher / Promo Code Input */}
                                    <div className="space-y-2 pt-2">
                                        <InputLabel value="Have a Promo / Voucher Code?" />
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={codeText}
                                                onChange={(e) => setCodeText(e.target.value.toUpperCase())}
                                                placeholder="e.g. MERDEKA17"
                                                className="flex-1 text-xs rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleApplyDiscount}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        {discountError && (
                                            <span className="text-[10px] text-rose-500 font-semibold block">
                                                ❌ {discountError}
                                            </span>
                                        )}
                                        {discountInfo && (
                                            <span className="text-[10px] text-emerald-700 font-bold block bg-emerald-50 border border-emerald-100 p-2 rounded-xl leading-relaxed">
                                                🎉 Code "{discountInfo.code}" applied! (Discount: {discountInfo.discount_type === 'percent' ? `${discountInfo.value}%` : formatIDR(discountInfo.value)})
                                            </span>
                                        )}
                                    </div>

                                    {/* Subtotal table */}
                                    <div className="space-y-3 text-sm border-t border-b border-slate-50 py-3">
                                        <div className="flex justify-between text-slate-500">
                                            <span>Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} kg)</span>
                                            <span className="font-semibold text-slate-900">{formatIDR(subtotal)}</span>
                                        </div>
                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-emerald-600 font-bold">
                                                <span>Discount Applied</span>
                                                <span>-{formatIDR(discountAmount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-slate-500">
                                            <span>Shipping Fee ({checkoutForm.data.shipping_option})</span>
                                            <span className="font-semibold text-slate-900">{formatIDR(deliveryFee)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500">
                                            <span>PPN (12% tax)</span>
                                            <span className="font-semibold text-slate-900">{formatIDR(tax)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-955">
                                            <span>Grand Total</span>
                                            <span className="text-indigo-600 font-black">{formatIDR(grandTotal)}</span>
                                        </div>
                                    </div>

                                    {/* Shipping Address Panel */}
                                    <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-2">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Shipping Destination</span>
                                        {defaultAddress ? (
                                            <div>
                                                <span className="text-xs font-bold text-slate-800 block">
                                                    {defaultAddress.recipient_name} ({defaultAddress.phone})
                                                </span>
                                                <span className="text-xs text-slate-500 block leading-snug mt-1">
                                                    {defaultAddress.address}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <span className="text-xs text-rose-500 font-semibold block">⚠️ No shipping address selected.</span>
                                                <Link
                                                    href={route('buyer.wallet.index')}
                                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline block cursor-pointer"
                                                >
                                                    Manage Shipping Addresses
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment Section */}
                                    <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex justify-between items-center">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Wallet Balance</span>
                                            <span className="font-extrabold text-slate-800 text-sm">{formatIDR(wallet.wallet_balance)}</span>
                                        </div>
                                        <Link
                                            href={route('buyer.wallet.index')}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                                        >
                                            Top Up
                                        </Link>
                                    </div>

                                    {/* Submit checkout */}
                                    {defaultAddress && (
                                        <div className="pt-2">
                                            {canPay ? (
                                                <PrimaryButton 
                                                    disabled={checkoutForm.processing}
                                                    className="w-full justify-center py-3 text-center"
                                                >
                                                    Pay & Checkout (Simulated)
                                                </PrimaryButton>
                                            ) : (
                                                <div className="space-y-2">
                                                    <button
                                                        disabled
                                                        className="w-full bg-slate-100 text-slate-400 cursor-not-allowed rounded-xl py-3 text-sm font-bold text-center block"
                                                    >
                                                        Insufficient Balance
                                                    </button>
                                                    <span className="text-[10px] text-rose-500 font-semibold text-center block">
                                                        Top up another {formatIDR(grandTotal - parseFloat(wallet.wallet_balance))} to check out.
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </form>
                            </div>

                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
