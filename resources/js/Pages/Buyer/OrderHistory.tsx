import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

interface OrderItem {
    id: number;
    product_name: string;
    price: string;
    quantity: number;
}

interface Shop {
    id: number;
    name: string;
}

interface StatusLog {
    id: number;
    status: string;
    created_at: string;
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
    shop: Shop | null;
    items: OrderItem[];
    statusLogs: StatusLog[];
}

interface OrderHistoryProps {
    orders: Order[];
}

export default function OrderHistory({ orders }: OrderHistoryProps) {
    const { flash } = usePage().props as any;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Sedang Dikemas':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Menunggu Pengirim':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Dikirim':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Selesai':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Dibatalkan':
                return 'bg-rose-100 text-rose-800 border-rose-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
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
                    My Order History
                </h2>
            }
        >
            <Head title="Order History" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {flash?.status && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm font-semibold shadow-sm">
                            {flash.status}
                        </div>
                    )}

                    {orders.length === 0 ? (
                        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto space-y-4">
                            <span className="text-6xl block">📦</span>
                            <h3 className="text-lg font-bold text-slate-800">No Orders Found</h3>
                            <p className="text-sm text-slate-400">
                                You haven't made any purchases yet. When you buy fresh catches from the market, they will show up here.
                            </p>
                            <Link
                                href={route('home')}
                                className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition"
                            >
                                Shop Seafood
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    
                                    {/* Order Header */}
                                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-wrap justify-between items-center gap-4">
                                        <div className="space-y-1">
                                            <span className="text-xs text-slate-400 font-semibold block">
                                                Order ID: #SP-{order.id} • {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            <span className="text-sm font-bold text-indigo-700">
                                                🏪 Store: {order.shop?.name || 'Verified Fisher'}
                                            </span>
                                        </div>
 
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
 
                                    {/* Order Body Split */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                                        
                                        {/* Items List (2/3) */}
                                        <div className="md:col-span-2 space-y-4">
                                            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Ordered Items</h4>
                                            <div className="divide-y divide-slate-100">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                                                        <div>
                                                            <span className="font-bold text-slate-900">{item.product_name}</span>
                                                            <span className="text-slate-400 text-xs block mt-0.5">
                                                                {item.quantity} kg @ {formatIDR(item.price)} / kg
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-slate-800">
                                                            {formatIDR(parseFloat(item.price) * item.quantity)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
 
                                            {/* Status logs timeline */}
                                            {order.statusLogs && order.statusLogs.length > 0 && (
                                                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                                                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery & Process Tracking</h5>
                                                    <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-indigo-50">
                                                        {order.statusLogs.map((log) => (
                                                            <div key={log.id} className="relative flex items-center justify-between text-xs">
                                                                <span className="absolute left-[-22px] w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white"></span>
                                                                <span className="font-bold text-slate-800">{log.status}</span>
                                                                <span className="text-slate-400 text-[10px]">
                                                                    {new Date(log.created_at).toLocaleString('id-ID', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Shipping & Payment Summary (1/3) */}
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 space-y-4">
                                            
                                            {/* Shipping */}
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shipping Details</span>
                                                <span className="text-xs font-bold text-slate-800 block">
                                                    {order.recipient_name} ({order.phone})
                                                </span>
                                                <span className="text-xs text-slate-500 block leading-relaxed">
                                                    {order.address}
                                                </span>
                                                <span className="text-[10px] inline-block font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md mt-1 border border-indigo-100">
                                                    Method: {order.shipping_option}
                                                </span>
                                            </div>

                                            {/* Pricing details */}
                                            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                                                {parseFloat(order.discount_amount) > 0 && (
                                                    <div className="flex justify-between text-emerald-600 font-bold">
                                                        <span>Discount ({order.discount_code})</span>
                                                        <span>-{formatIDR(order.discount_amount)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-slate-500">
                                                    <span>Delivery Fee</span>
                                                    <span className="font-bold text-slate-700">{formatIDR(order.shipping_fee)}</span>
                                                </div>
                                                <div className="flex justify-between text-slate-500">
                                                    <span>PPN (12% Tax)</span>
                                                    <span className="font-bold text-slate-700">{formatIDR(order.tax)}</span>
                                                </div>
                                                <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-bold text-slate-900">
                                                    <span>Paid Amount</span>
                                                    <span className="text-indigo-600 font-extrabold">{formatIDR(order.total_price)}</span>
                                                </div>
                                            </div>

                                        </div>

                                    </div>

                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
