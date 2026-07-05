import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface Shop {
    id: number;
    name: string;
    description: string | null;
    address: string;
    owner: User | null;
}

interface Product {
    id: number;
    name: string;
    price: string;
    stock: number;
    seller: {
        id: number;
        name: string;
        shop: {
            name: string;
        } | null;
    } | null;
}

interface OrderItem {
    id: number;
    product_name: string;
    price: string;
    quantity: number;
}

interface Order {
    id: number;
    recipient_name: string;
    phone: string;
    address: string;
    shipping_option: string;
    discount_code: string | null;
    discount_amount: string;
    shipping_fee: string;
    tax: string;
    total_price: string;
    status: string;
    created_at: string;
    buyer: User | null;
    shop: Shop | null;
    driver: User | null;
    items: OrderItem[];
}

interface Discount {
    id: number;
    code: string;
    type: string;
    discount_type: string;
    value: string;
    quota: number | null;
    expires_at: string;
}

interface Stats {
    users_count: number;
    shops_count: number;
    products_count: number;
    orders_count: number;
    discounts_count: number;
}

interface DashboardProps {
    users: User[];
    shops: Shop[];
    products: Product[];
    orders: Order[];
    discounts: Discount[];
    stats: Stats;
}

export default function Dashboard({ users, shops, products, orders, discounts, stats }: DashboardProps) {
    const { flash, errors } = usePage().props as any;
    const [activeTab, setActiveTab] = useState<'users' | 'shops' | 'products' | 'orders' | 'discounts'>('orders');

    // Form for Voucher/Promo creation
    const discountForm = useForm({
        code: '',
        type: 'promo', // promo or voucher
        discount_type: 'percent', // percent or fixed
        value: '',
        quota: '',
        expires_at: '',
    });

    const handleCreateDiscount: FormEventHandler = (e) => {
        e.preventDefault();
        discountForm.post(route('admin.discounts.store'), {
            onSuccess: () => discountForm.reset(),
        });
    };

    const handleTriggerOverdue = (orderId: number) => {
        if (confirm('Simulasikan status Overdue (Terlambat) untuk pesanan ini? Hal ini otomatis mengembalikan dana pembeli, memulihkan stok produk, dan membatalkan pesanan.')) {
            router.post(route('admin.orders.overdue', orderId));
        }
    };

    const formatIDR = (priceStr: string | number) => {
        const num = typeof priceStr === 'string' ? parseFloat(priceStr) : priceStr;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Admin System Console & Workspace
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {flash?.status && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm font-semibold shadow-sm">
                            {flash.status}
                        </div>
                    )}

                    {errors?.overdue_error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm font-semibold shadow-sm">
                            ⚠️ {errors.overdue_error}
                        </div>
                    )}

                    {/* Stats counters */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { name: 'Total Users', count: stats.users_count, icon: '👤', color: 'border-blue-100 text-blue-600' },
                            { name: 'Registered Shops', count: stats.shops_count, icon: '🏪', color: 'border-teal-100 text-teal-600' },
                            { name: 'Total Products', count: stats.products_count, icon: '🐟', color: 'border-amber-100 text-amber-600' },
                            { name: 'All Orders', count: stats.orders_count, icon: '📦', color: 'border-indigo-100 text-indigo-600' },
                            { name: 'Discounts Active', count: stats.discounts_count, icon: '🏷️', color: 'border-purple-100 text-purple-600' },
                        ].map((stat) => (
                            <div key={stat.name} className={`bg-white p-5 rounded-2xl border ${stat.color} shadow-sm space-y-1`}>
                                <span className="text-2xl block">{stat.icon}</span>
                                <span className="text-xs font-semibold text-slate-400 block">{stat.name}</span>
                                <span className="text-2xl font-black text-slate-900 block">{stat.count}</span>
                            </div>
                        ))}
                    </div>

                    {/* Tab menu */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 bg-slate-50/50 p-2 flex flex-wrap gap-2 text-xs font-bold">
                            {[
                                { id: 'orders', label: '📦 Orders & Overdue Simulation' },
                                { id: 'discounts', label: '🏷️ Vouchers & Promos' },
                                { id: 'users', label: '👤 Users' },
                                { id: 'shops', label: '🏪 Shops' },
                                { id: 'products', label: '🐟 Products' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                                        activeTab === tab.id 
                                            ? 'bg-indigo-600 text-white shadow-sm' 
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content Panel */}
                        <div className="p-6">
                            
                            {/* 1. Orders Panel */}
                            {activeTab === 'orders' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                                        <h3 className="font-extrabold text-slate-900">Order Logs & Overdue Simulation</h3>
                                        <span className="text-xs text-slate-400">Force system refunds for testing purposes.</span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                                                    <th className="py-3 px-2">Order ID</th>
                                                    <th className="py-3 px-2">Buyer</th>
                                                    <th className="py-3 px-2">Shop (Seller)</th>
                                                    <th className="py-3 px-2">Driver</th>
                                                    <th className="py-3 px-2">Total Paid</th>
                                                    <th className="py-3 px-2">Shipping</th>
                                                    <th className="py-3 px-2">Status</th>
                                                    <th className="py-3 px-2 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 font-medium">
                                                {orders.map((ord) => (
                                                    <tr key={ord.id} className="hover:bg-slate-50/40">
                                                        <td className="py-4 px-2 font-bold">#SP-{ord.id}</td>
                                                        <td className="py-4 px-2">
                                                            <span className="block font-bold text-slate-800">{ord.buyer?.name}</span>
                                                            <span className="text-[10px] text-slate-400">{ord.buyer?.email}</span>
                                                        </td>
                                                        <td className="py-4 px-2 text-slate-700">{ord.shop?.name || 'Verified Fisher'}</td>
                                                        <td className="py-4 px-2 text-slate-600">
                                                            {ord.driver ? `🛵 ${ord.driver.name}` : 'Not assigned'}
                                                        </td>
                                                        <td className="py-4 px-2 text-indigo-600 font-extrabold">{formatIDR(ord.total_price)}</td>
                                                        <td className="py-4 px-2 text-slate-500">{ord.shipping_option} ({formatIDR(ord.shipping_fee)})</td>
                                                        <td className="py-4 px-2">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                                ord.status === 'Sedang Dikemas' ? 'bg-blue-50 text-blue-800 border-blue-100' :
                                                                ord.status === 'Menunggu Pengirim' ? 'bg-purple-50 text-purple-800 border-purple-100' :
                                                                ord.status === 'Sedang Dikirim' ? 'bg-amber-50 text-amber-800 border-amber-100' :
                                                                ord.status === 'Selesai' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                                                                'bg-rose-50 text-rose-800 border-rose-100'
                                                            }`}>
                                                                {ord.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-2 text-right">
                                                            {!['Selesai', 'Dibatalkan', 'Dikembalikan'].includes(ord.status) ? (
                                                                <button
                                                                    onClick={() => handleTriggerOverdue(ord.id)}
                                                                    className="bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-lg transition text-[10px] cursor-pointer"
                                                                >
                                                                    🚨 Trigger Overdue
                                                                </button>
                                                            ) : (
                                                                <span className="text-[10px] text-slate-400 font-normal">Closed</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* 2. Discounts Panel */}
                            {activeTab === 'discounts' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                    
                                    {/* Create Form (1/3) */}
                                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                                        <h4 className="font-extrabold text-slate-900">Create Voucher / Promo</h4>
                                        
                                        <form onSubmit={handleCreateDiscount} className="space-y-4">
                                            {/* Code */}
                                            <div>
                                                <InputLabel htmlFor="code" value="Discount Code" />
                                                <TextInput
                                                    id="code"
                                                    type="text"
                                                    value={discountForm.data.code}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => discountForm.setData('code', e.target.value.toUpperCase())}
                                                    placeholder="e.g. SEAFRESH20"
                                                    required
                                                />
                                                <InputError message={discountForm.errors.code} className="mt-1" />
                                            </div>

                                            {/* Type */}
                                            <div>
                                                <InputLabel htmlFor="type" value="Discount Type" />
                                                <select
                                                    id="type"
                                                    value={discountForm.data.type}
                                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                                    onChange={(e) => discountForm.setData('type', e.target.value)}
                                                >
                                                    <option value="promo">Promo (No quota limit)</option>
                                                    <option value="voucher">Voucher (Has usage quota)</option>
                                                </select>
                                                <InputError message={discountForm.errors.type} className="mt-1" />
                                            </div>

                                            {/* Value Type */}
                                            <div>
                                                <InputLabel htmlFor="discount_type" value="Deduction Form" />
                                                <select
                                                    id="discount_type"
                                                    value={discountForm.data.discount_type}
                                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                                    onChange={(e) => discountForm.setData('discount_type', e.target.value)}
                                                >
                                                    <option value="percent">Percentage (%)</option>
                                                    <option value="fixed">Fixed Amount (IDR)</option>
                                                </select>
                                                <InputError message={discountForm.errors.discount_type} className="mt-1" />
                                            </div>

                                            {/* Value */}
                                            <div>
                                                <InputLabel htmlFor="value" value="Value Amount" />
                                                <TextInput
                                                    id="value"
                                                    type="number"
                                                    value={discountForm.data.value}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => discountForm.setData('value', e.target.value)}
                                                    placeholder="e.g. 10 or 15000"
                                                    required
                                                />
                                                <InputError message={discountForm.errors.value} className="mt-1" />
                                            </div>

                                            {/* Quota */}
                                            {discountForm.data.type === 'voucher' && (
                                                <div>
                                                    <InputLabel htmlFor="quota" value="Usage Quota" />
                                                    <TextInput
                                                        id="quota"
                                                        type="number"
                                                        value={discountForm.data.quota}
                                                        className="mt-1 block w-full"
                                                        onChange={(e) => discountForm.setData('quota', e.target.value)}
                                                        placeholder="e.g. 50"
                                                        required
                                                    />
                                                    <InputError message={discountForm.errors.quota} className="mt-1" />
                                                </div>
                                            )}

                                            {/* Expiry Date */}
                                            <div>
                                                <InputLabel htmlFor="expires_at" value="Expiry Date" />
                                                <TextInput
                                                    id="expires_at"
                                                    type="date"
                                                    value={discountForm.data.expires_at}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => discountForm.setData('expires_at', e.target.value)}
                                                    required
                                                />
                                                <InputError message={discountForm.errors.expires_at} className="mt-1" />
                                            </div>

                                            <PrimaryButton disabled={discountForm.processing} className="w-full justify-center">
                                                Create Code
                                            </PrimaryButton>
                                        </form>
                                    </div>

                                    {/* List Panel (2/3) */}
                                    <div className="lg:col-span-2 space-y-4">
                                        <h4 className="font-extrabold text-slate-900">Active Discount Vouchers & Promos</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                                                        <th className="py-2 px-1">Code</th>
                                                        <th className="py-2 px-1">Type</th>
                                                        <th className="py-2 px-1">Value</th>
                                                        <th className="py-2 px-1">Quota</th>
                                                        <th className="py-2 px-1">Expiry Date</th>
                                                        <th className="py-2 px-1 text-right">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 font-medium">
                                                    {discounts.map((disc) => {
                                                        const isExpired = new Date(disc.expires_at) < new Date();
                                                        const quotaExhausted = disc.type === 'voucher' && disc.quota !== null && disc.quota <= 0;
                                                        const isValid = !isExpired && !quotaExhausted;
                                                        
                                                        return (
                                                            <tr key={disc.id} className="hover:bg-slate-50/40">
                                                                <td className="py-3 px-1 font-bold text-slate-900">{disc.code}</td>
                                                                <td className="py-3 px-1">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                                                        disc.type === 'voucher' 
                                                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                                                                            : 'bg-teal-50 text-teal-700 border-teal-100'
                                                                    }`}>
                                                                        {disc.type}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-1 text-slate-700">
                                                                    {disc.discount_type === 'percent' ? `${disc.value}%` : formatIDR(disc.value)}
                                                                </td>
                                                                <td className="py-3 px-1 text-slate-600">
                                                                    {disc.type === 'voucher' ? `${disc.quota} left` : 'Unlimited'}
                                                                </td>
                                                                <td className="py-3 px-1 text-slate-500">
                                                                    {new Date(disc.expires_at).toLocaleDateString('id-ID')}
                                                                </td>
                                                                <td className="py-3 px-1 text-right">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                                                        isValid 
                                                                            ? 'bg-emerald-50 text-emerald-800' 
                                                                            : 'bg-rose-50 text-rose-800'
                                                                    }`}>
                                                                        {isValid ? 'Valid' : isExpired ? 'Expired' : 'Exhausted'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* 3. Users Panel */}
                            {activeTab === 'users' && (
                                <div className="space-y-4">
                                    <h3 className="font-extrabold text-slate-900">User Directory</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                                                    <th className="py-2 px-1">ID</th>
                                                    <th className="py-2 px-1">Name</th>
                                                    <th className="py-2 px-1">Email</th>
                                                    <th className="py-2 px-1">Attached Roles</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 font-medium">
                                                {users.map((usr) => (
                                                    <tr key={usr.id} className="hover:bg-slate-50/40">
                                                        <td className="py-3 px-1 text-slate-400">#{usr.id}</td>
                                                        <td className="py-3 px-1 font-bold text-slate-800">{usr.name}</td>
                                                        <td className="py-3 px-1 text-slate-600">{usr.email}</td>
                                                        <td className="py-3 px-1 flex gap-1.5 flex-wrap">
                                                            {usr.roles.map((role) => (
                                                                <span 
                                                                    key={role.id}
                                                                    className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-200 uppercase"
                                                                >
                                                                    {role.name}
                                                                </span>
                                                            ))}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* 4. Shops Panel */}
                            {activeTab === 'shops' && (
                                <div className="space-y-4">
                                    <h3 className="font-extrabold text-slate-900">Seller Shops Directory</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                                                     <th className="py-2 px-1">Shop Name</th>
                                                     <th className="py-2 px-1">Owner</th>
                                                     <th className="py-2 px-1">Pickup Address</th>
                                                     <th className="py-2 px-1">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                                                {shops.map((shp) => (
                                                    <tr key={shp.name} className="hover:bg-slate-50/40">
                                                        <td className="py-3 px-1 font-bold text-indigo-700">🏪 {shp.name}</td>
                                                        <td className="py-3 px-1 text-slate-800">
                                                            <span className="block font-semibold">{shp.owner?.name}</span>
                                                            <span className="text-[10px] text-slate-400">{shp.owner?.email}</span>
                                                        </td>
                                                        <td className="py-3 px-1 text-xs">{shp.address}</td>
                                                        <td className="py-3 px-1 font-light text-slate-500 truncate max-w-xs">{shp.description}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* 5. Products Panel */}
                            {activeTab === 'products' && (
                                <div className="space-y-4">
                                    <h3 className="font-extrabold text-slate-900">Product Inventory</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                                                    <th className="py-2 px-1">Product Name</th>
                                                    <th className="py-2 px-1">Shop Origin</th>
                                                    <th className="py-2 px-1">Stock Availability</th>
                                                    <th className="py-2 px-1">Unit Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 font-medium text-slate-700 font-medium">
                                                {products.map((prod) => (
                                                    <tr key={prod.id} className="hover:bg-slate-50/40">
                                                        <td className="py-3 px-1 font-bold text-slate-950">{prod.name}</td>
                                                        <td className="py-3 px-1 text-slate-500">🏪 {prod.seller?.shop?.name || prod.seller?.name}</td>
                                                        <td className="py-3 px-1 font-bold">
                                                            {prod.stock > 0 ? (
                                                                <span className="text-emerald-600">{prod.stock} kg</span>
                                                            ) : (
                                                                <span className="text-rose-500">Out of Stock</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-1 text-indigo-600 font-extrabold">{formatIDR(prod.price)} / kg</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
