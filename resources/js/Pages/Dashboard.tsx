import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { activeRole } = usePage().props.auth;

    // Helper to render role-specific widgets
    const renderRoleContent = () => {
        switch (activeRole?.toLowerCase()) {
            case 'admin':
                return (
                    <div className="space-y-6">
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 text-rose-900 shadow-sm flex items-center gap-4">
                            <span className="text-4xl">🛡️</span>
                            <div>
                                <h3 className="text-lg font-bold">Admin Console</h3>
                                <p className="text-sm text-rose-700 mt-1">
                                    You are authorized as System Administrator. You have full access to platform metrics, users database, and audit logs.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Sales</span>
                                <p className="text-2xl font-bold text-gray-900 mt-2">Rp 373.350.000</p>
                                <span className="text-xs font-semibold text-emerald-500 mt-1 inline-block">↑ 12% this week</span>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Users</span>
                                <p className="text-2xl font-bold text-gray-900 mt-2">1,248 users</p>
                                <span className="text-xs font-semibold text-emerald-500 mt-1 inline-block">↑ 45 new today</span>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Drivers</span>
                                <p className="text-2xl font-bold text-gray-900 mt-2">14 on duty</p>
                                <span className="text-xs font-semibold text-amber-500 mt-1 inline-block">2 standby</span>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System Status</span>
                                <p className="text-2xl font-bold text-emerald-600 mt-2">HEALTHY</p>
                                <span className="text-xs font-semibold text-gray-400 mt-1 inline-block">All systems operational</span>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h4 className="font-bold text-gray-950">System Logs & Moderation</h4>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                        <span className="font-medium text-gray-800">Database backup executed successfully</span>
                                    </div>
                                    <span className="text-xs text-gray-400">10 mins ago</span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                                        <span className="font-medium text-gray-800">New driver application from Alex Rivera</span>
                                    </div>
                                    <span className="text-xs text-gray-400">1 hour ago</span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                        <span className="font-medium text-gray-800">Flagged product "Illegal Catch" removed from Seller 03</span>
                                    </div>
                                    <span className="text-xs text-gray-400">4 hours ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'seller':
                return (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-900 shadow-sm flex items-center gap-4">
                            <span className="text-4xl">🛍️</span>
                            <div>
                                <h3 className="text-lg font-bold">Seller Portal</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    Manage your catches, check customer orders, and update shop inventory directly.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Inventory */}
                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                    <h4 className="font-bold text-gray-900">Your Fresh Catches</h4>
                                    <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">+ Add Catch</button>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-700">🐟 Fresh Yellowfin Tuna</span>
                                        <span className="text-gray-500">12 kg @ Rp 225.000/kg</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-700">🦞 Giant Tiger Lobster</span>
                                        <span className="text-gray-500">4 kg @ Rp 675.000/kg</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-700">🦑 Calamari Squid</span>
                                        <span className="text-gray-500">20 kg @ Rp 120.000/kg</span>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Orders */}
                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                    <h4 className="font-bold text-gray-900">Incoming Orders</h4>
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">2 New</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-bold text-gray-800">Order #1204</span>
                                            <span className="text-blue-600 font-semibold">Accept</span>
                                        </div>
                                        <p className="text-xs text-gray-500">Buyer: Jane Smith • 3kg Yellowfin Tuna</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-bold text-gray-800">Order #1203</span>
                                            <span className="text-gray-400">Awaiting Pickup</span>
                                        </div>
                                        <p className="text-xs text-gray-500">Driver: John Doe • 2kg Lobster</p>
                                    </div>
                                </div>
                            </div>

                            {/* Seller stats */}
                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                                <h4 className="font-bold text-gray-900 border-b border-gray-50 pb-2">Shop Earnings</h4>
                                <div className="space-y-2">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider block">Wallet Balance</span>
                                    <p className="text-3xl font-extrabold text-gray-900">Rp 12.678.000</p>
                                    <button className="w-full mt-3 bg-indigo-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-indigo-700 transition">
                                        Withdraw Earnings
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'buyer':
                return (
                    <div className="space-y-6">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-emerald-900 shadow-sm flex items-center gap-4">
                            <span className="text-4xl">🛒</span>
                            <div>
                                <h3 className="text-lg font-bold">Buyer Marketplace</h3>
                                <p className="text-sm text-emerald-700 mt-1">
                                    Browse the freshest seafood caught by local fishers, check orders, and track your active delivery status.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Market Catalog */}
                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm md:col-span-2 space-y-4">
                                <h4 className="font-bold text-gray-950 border-b border-gray-50 pb-2">Catch of the Day</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border border-gray-100 rounded-lg p-3 hover:border-emerald-300 transition">
                                        <div className="flex justify-between font-semibold text-gray-900">
                                            <span>🐟 Fresh Red Snapper</span>
                                            <span className="text-emerald-600">Rp 180.000/kg</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Caught by Seller Banu • 8kg available</p>
                                        <button className="mt-3 w-full bg-emerald-50 text-emerald-700 font-bold py-1 px-3 rounded-lg text-xs hover:bg-emerald-100 transition">
                                            Add to Cart
                                        </button>
                                    </div>
                                    <div className="border border-gray-100 rounded-lg p-3 hover:border-emerald-300 transition">
                                        <div className="flex justify-between font-semibold text-gray-900">
                                            <span>🦞 Premium Blue Crab</span>
                                            <span className="text-emerald-600">Rp 270.000/kg</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Caught by Nusantara Catch • 5kg available</p>
                                        <button className="mt-3 w-full bg-emerald-50 text-emerald-700 font-bold py-1 px-3 rounded-lg text-xs hover:bg-emerald-100 transition">
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Active purchases */}
                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                                <h4 className="font-bold text-gray-950 border-b border-gray-50 pb-2">My Orders</h4>
                                <div className="space-y-3">
                                    <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-gray-800">Order #1203</span>
                                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">In Transit</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">2kg Tiger Lobster • Driver: John Doe</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-gray-800">Order #1198</span>
                                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">Delivered</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">5kg Calamari Squid • June 29, 2026</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'driver':
                return (
                    <div className="space-y-6">
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-amber-900 shadow-sm flex items-center gap-4">
                            <span className="text-4xl">🚚</span>
                            <div>
                                <h3 className="text-lg font-bold">Logistics Hub</h3>
                                <p className="text-sm text-amber-700 mt-1">
                                    View delivery requests, update route status, and track your shipping earnings.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Available gigs */}
                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm md:col-span-2 space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                    <h4 className="font-bold text-gray-950">Nearby Delivery Requests</h4>
                                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">2 Available</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="border border-gray-100 hover:border-amber-300 rounded-lg p-4 transition space-y-3">
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span className="text-gray-900">📦 Catch Delivery - 5.4 km</span>
                                            <span className="text-amber-600 font-bold">Rp 187.500 Est.</span>
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <p>📍 <strong>Pickup:</strong> Muara Baru Harbor (Seller Banu)</p>
                                            <p>🏁 <strong>Dropoff:</strong> Menteng Residences (Buyer Jane)</p>
                                        </div>
                                        <button className="w-full bg-amber-500 text-white font-bold py-2 rounded-lg text-xs hover:bg-amber-600 transition">
                                            Accept Job
                                        </button>
                                    </div>
                                    <div className="border border-gray-100 hover:border-amber-300 rounded-lg p-4 transition space-y-3">
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span className="text-gray-900">📦 Catch Delivery - 2.1 km</span>
                                            <span className="text-amber-600 font-bold">Rp 90.000 Est.</span>
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <p>📍 <strong>Pickup:</strong> Fish Market PIK (Seller SeafoodIndo)</p>
                                            <p>🏁 <strong>Dropoff:</strong> Pluit Condominiums (Buyer Andi)</p>
                                        </div>
                                        <button className="w-full bg-amber-500 text-white font-bold py-2 rounded-lg text-xs hover:bg-amber-600 transition">
                                            Accept Job
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Driver Stats */}
                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                                <h4 className="font-bold text-gray-950 border-b border-gray-50 pb-2">Driver Stats</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Today's Trips</span>
                                        <span className="font-semibold text-gray-900">4 Completed</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Hours Online</span>
                                        <span className="font-semibold text-gray-900">3.5 hrs</span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-50 pt-2 font-bold text-gray-900">
                                        <span>Today's Earnings</span>
                                        <span className="text-amber-600">Rp 642.000</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="p-6 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl">
                        No active role was resolved. Please switch or select your workspace active role.
                    </div>
                );
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Seapedia Workspace
                    </h2>
                    {activeRole && (
                        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-sm font-semibold text-indigo-700 border border-indigo-100 shadow-sm uppercase tracking-wide">
                            Active: {activeRole}
                        </span>
                    )}
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {renderRoleContent()}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
