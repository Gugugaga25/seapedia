import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';

interface OrderItem {
    id: number;
    product_name: string;
    price: string;
    quantity: number;
}

interface Buyer {
    id: number;
    name: string;
    email: string;
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
    buyer: Buyer | null;
    items: OrderItem[];
    status_logs: StatusLog[];
}

interface IncomingOrdersProps {
    orders: Order[];
    shop: Shop;
}

export default function IncomingOrders({ orders, shop }: IncomingOrdersProps) {
    const { flash } = usePage().props as any;

    const handleStatusChange = (orderId: number, status: string) => {
        router.patch(route('seller.orders.updateStatus', orderId), { status }, {
            preserveScroll: true,
        });
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
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Incoming Orders
                    </h2>
                    <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-bold">
                        Shop: {shop.name}
                    </span>
                </div>
            }
        >
            <Head title="Incoming Orders" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {flash?.status && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm font-semibold shadow-sm">
                            {flash.status}
                        </div>
                    )}

                    {orders.length === 0 ? (
                        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto space-y-4">
                            <span className="text-6xl block">📥</span>
                            <h3 className="text-lg font-bold text-slate-800">No Incoming Orders</h3>
                            <p className="text-sm text-slate-400">
                                Your shop hasn't received any orders yet. Listed seafood catches will appear here once purchased.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                                    
                                    {/* Left pane: Buyer & Shipping Info (1/3) */}
                                    <div className="p-6 space-y-4">
                                        <div className="space-y-1">
                                            <span className="text-xs text-slate-400 font-bold uppercase block tracking-wider">
                                                Order ID: #SP-{order.id}
                                            </span>
                                            <span className="text-xs text-slate-400 block">
                                                Placed on: {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        <div className="space-y-2 border-t border-slate-50 pt-3">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer</span>
                                            <span className="text-xs font-bold text-slate-800 block">
                                                {order.buyer?.name} ({order.buyer?.email})
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recipient & Address</span>
                                            <span className="text-xs font-bold text-slate-800 block">
                                                {order.recipient_name} ({order.phone})
                                            </span>
                                            <p className="text-xs text-slate-500 leading-relaxed font-light">
                                                {order.address}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Middle pane: Items Ordered & Prices (1/3) */}
                                    <div className="p-6 space-y-4">
                                        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Items Summary</h4>
                                        <div className="divide-y divide-slate-50">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                                                    <div>
                                                        <span className="font-bold text-slate-900">{item.product_name}</span>
                                                        <span className="text-slate-400 block mt-0.5">
                                                            {item.quantity} kg @ {formatIDR(item.price)}
                                                        </span>
                                                    </div>
                                                    <span className="font-bold text-slate-700">
                                                        {formatIDR(parseFloat(item.price) * item.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-500">
                                            <div className="flex justify-between">
                                                <span>Delivery: {order.shipping_option}</span>
                                                <span className="font-semibold text-slate-800">{formatIDR(order.shipping_fee)}</span>
                                            </div>
                                            {parseFloat(order.discount_amount) > 0 && (
                                                <div className="flex justify-between text-emerald-600 font-bold">
                                                    <span>Discount ({order.discount_code})</span>
                                                    <span>-{formatIDR(order.discount_amount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span>PPN (12% tax)</span>
                                                <span className="font-semibold text-slate-800">{formatIDR(order.tax)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-50 pt-2">
                                                <span>Total Earnings</span>
                                                <span className="text-indigo-600 font-extrabold">{formatIDR(order.total_price)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right pane: Status Management Actions (1/3) */}
                                    <div className="p-6 space-y-4 bg-slate-50/20">
                                        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Status & Operations</h4>
                                        
                                        <div className="space-y-1">
                                            <span className="text-xs text-slate-400">Current Status:</span>
                                            <span className={`block font-bold text-sm mt-1 border px-2.5 py-1 rounded-lg w-fit ${
                                                order.status === 'Sedang Dikemas' ? 'bg-blue-50 text-blue-800 border-blue-100' :
                                                order.status === 'Menunggu Pengirim' ? 'bg-purple-50 text-purple-800 border-purple-100' :
                                                order.status === 'Dikirim' ? 'bg-amber-50 text-amber-800 border-amber-100' :
                                                order.status === 'Selesai' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                                                'bg-rose-50 text-rose-800 border-rose-100'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        {/* Main "Proses Pesanan" primary action */}
                                        {order.status === 'Sedang Dikemas' && (
                                            <button
                                                type="button"
                                                onClick={() => handleStatusChange(order.id, 'Menunggu Pengirim')}
                                                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition shadow-sm hover:shadow-indigo-100 mb-2 cursor-pointer text-center block"
                                            >
                                                ⚡ Proses Pesanan (Siap Dikirim)
                                            </button>
                                        )}

                                        <div className="space-y-2 pt-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transition Status To:</span>
                                            <div className="flex flex-col gap-2">
                                                {['Sedang Dikemas', 'Menunggu Pengirim', 'Dikirim', 'Selesai', 'Dibatalkan'].map((status) => {
                                                    const isCurrent = order.status === status;
                                                    return (
                                                        <button
                                                            key={status}
                                                            type="button"
                                                            disabled={isCurrent}
                                                            onClick={() => handleStatusChange(order.id, status)}
                                                            className={`py-2 px-3 text-xs rounded-xl font-semibold border text-center transition cursor-pointer ${
                                                                isCurrent 
                                                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                                                                    : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 hover:border-indigo-300'
                                                            }`}
                                                        >
                                                            {status}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Status Logs Timeline */}
                                        {order.status_logs && order.status_logs.length > 0 && (
                                            <div className="border-t border-slate-100 pt-3 space-y-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Change History Logs</span>
                                                <div className="space-y-1.5 pl-2 border-l border-indigo-100">
                                                    {order.status_logs.map((log) => (
                                                        <div key={log.id} className="text-[10px] text-slate-500 flex justify-between gap-2">
                                                            <span>• {log.status}</span>
                                                            <span className="text-slate-400 font-light shrink-0">
                                                                {new Date(log.created_at).toLocaleTimeString('id-ID', {
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

                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
