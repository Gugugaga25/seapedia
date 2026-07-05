import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

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
    address: string;
}

interface Order {
    id: number;
    recipient_name: string;
    phone: string;
    address: string;
    shipping_option: string;
    shipping_fee: string;
    total_price: string;
    status: string;
    updated_at: string;
    buyer: Buyer | null;
    shop: Shop | null;
    items: OrderItem[];
}

interface Wallet {
    id: number;
    driver_earnings: string;
}

interface JobsIndexProps {
    availableJobs: Order[];
    activeJobs: Order[];
    completedJobs: Order[];
    wallet: Wallet;
}

export default function JobsIndex({ availableJobs, activeJobs, completedJobs, wallet }: JobsIndexProps) {
    const { flash, errors } = usePage().props as any;

    const handleAcceptJob = (orderId: number) => {
        if (confirm('Ambil pekerjaan pengiriman ini?')) {
            router.post(route('driver.jobs.accept', orderId), {}, {
                preserveScroll: true
            });
        }
    };

    const handleCompleteJob = (orderId: number) => {
        if (confirm('Selesaikan pekerjaan pengiriman ini? Upah kirim akan langsung masuk ke dompet Anda.')) {
            router.post(route('driver.jobs.complete', orderId), {}, {
                preserveScroll: true
            });
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
                    Delivery Driver Workspace
                </h2>
            }
        >
            <Head title="Driver Delivery Jobs" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {flash?.status && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm font-semibold shadow-sm">
                            {flash.status}
                        </div>
                    )}

                    {errors?.job_error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm font-semibold shadow-sm">
                            ⚠️ {errors.job_error}
                        </div>
                    )}

                    {/* Dashboard Earnings Summary */}
                    <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <span className="text-xs uppercase tracking-wider text-purple-200 block">Total Driver Earnings (Wallet)</span>
                            <p className="text-3xl font-black mt-1">{formatIDR(wallet.driver_earnings)}</p>
                        </div>
                        <div className="text-xs text-purple-200/90 leading-relaxed bg-white/10 p-3 rounded-lg border border-white/10 max-w-md">
                            💰 Ongkos kirim dari pesanan yang Anda selesaikan akan langsung disetorkan ke dompet elektronik ini secara real-time.
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        
                        {/* Left & Middle Column: Available & Active Jobs (2/3) */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Section: Active Deliveries */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
                                <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
                                    My Active Deliveries ({activeJobs.length})
                                </h3>
                                <p className="text-xs text-slate-400">Deliveries you are currently dispatching. Deliver to recipient and mark as complete.</p>

                                {activeJobs.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                                        No active deliveries. Claim a job below.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {activeJobs.map((job) => (
                                            <div key={job.id} className="p-5 rounded-xl border border-amber-200 bg-amber-50/10 shadow-sm space-y-4">
                                                <div className="flex justify-between items-start border-b border-slate-50 pb-3 gap-2">
                                                    <div>
                                                        <span className="text-xs text-slate-400 font-bold block uppercase">Order ID: #SP-{job.id}</span>
                                                        <span className="text-xs inline-block font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md mt-1">
                                                            Shipping: {job.shipping_option}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-black text-indigo-600">{formatIDR(job.shipping_fee)}</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                    {/* Pickup location */}
                                                    <div className="space-y-1">
                                                        <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Pickup From (Shop)</span>
                                                        <span className="font-bold text-slate-800 block">🏪 {job.shop?.name}</span>
                                                        <span className="text-slate-500 block leading-snug">{job.shop?.address}</span>
                                                    </div>

                                                    {/* Dropoff location */}
                                                    <div className="space-y-1">
                                                        <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Deliver To (Buyer)</span>
                                                        <span className="font-bold text-slate-800 block">👤 {job.recipient_name} ({job.phone})</span>
                                                        <span className="text-slate-500 block leading-snug">{job.address}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <button
                                                        onClick={() => handleCompleteJob(job.id)}
                                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-sm hover:shadow-emerald-100 transition cursor-pointer text-center block"
                                                    >
                                                        ✅ Mark as Delivered (Selesaikan Pekerjaan)
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Section: Job Search board */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
                                <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 block"></span>
                                    Available Delivery Jobs ({availableJobs.length})
                                </h3>
                                <p className="text-xs text-slate-400">Claims jobs awaiting dispatcher pickup. First come, first served.</p>

                                {availableJobs.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                                        No delivery jobs available right now. Check back later!
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {availableJobs.map((job) => (
                                            <div key={job.id} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition bg-slate-50/20 flex flex-col justify-between gap-4">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div>
                                                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Order ID: #SP-{job.id}</span>
                                                            <span className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                                                                {job.shipping_option}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-black text-indigo-600">{formatIDR(job.shipping_fee)}</span>
                                                    </div>

                                                    <div className="text-xs space-y-2 border-t border-slate-50 pt-2 leading-relaxed">
                                                        <div>
                                                            <span className="text-[9px] font-bold text-slate-400 block uppercase">Pickup:</span>
                                                            <span className="font-bold text-slate-700 block text-xs truncate">🏪 {job.shop?.name}</span>
                                                            <span className="text-[11px] text-slate-500 line-clamp-1">{job.shop?.address}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[9px] font-bold text-slate-400 block uppercase">Dropoff:</span>
                                                            <span className="font-bold text-slate-700 block text-xs truncate">👤 {job.recipient_name}</span>
                                                            <span className="text-[11px] text-slate-500 line-clamp-1">{job.address}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleAcceptJob(job.id)}
                                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer text-center block"
                                                >
                                                    ⚡ Accept Delivery Job (Ambil)
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Right Column: Earnings History log (1/3) */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
                            <h3 className="font-extrabold text-slate-900">Earnings History</h3>
                            <p className="text-xs text-slate-400 font-medium">Record of completed delivery payments.</p>

                            {completedJobs.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl text-xs">
                                    No completed earnings record yet.
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                                    {completedJobs.map((job) => (
                                        <div key={job.id} className="p-3 border border-slate-100 rounded-xl text-xs flex justify-between items-center gap-3">
                                            <div>
                                                <span className="font-bold text-slate-800 block">#SP-{job.id} • {job.recipient_name}</span>
                                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                                    Done on: {new Date(job.updated_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </span>
                                            </div>
                                            <span className="font-bold text-emerald-600 shrink-0">
                                                +{formatIDR(job.shipping_fee)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
