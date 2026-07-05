import GuestLayout from '@/Layouts/GuestLayout';
import { Head, router } from '@inertiajs/react';

interface SelectRoleProps {
    roles: string[];
    activeRole: string | null;
}

export default function SelectRole({ roles, activeRole }: SelectRoleProps) {
    const handleSelectRole = (role: string) => {
        // Direct submit on click for a smoother UX
        router.post(route('role-select.store'), { role });
    };

    // Helper to get styling for roles
    const getRoleDetails = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return {
                    color: 'from-rose-500 to-red-600',
                    bgLight: 'bg-rose-50 border-rose-200 hover:border-rose-400 text-rose-700',
                    icon: '🛡️',
                    desc: 'Manage the platform, oversee users, and adjust system configurations.',
                };
            case 'seller':
                return {
                    color: 'from-blue-500 to-indigo-600',
                    bgLight: 'bg-blue-50 border-blue-200 hover:border-blue-400 text-blue-700',
                    icon: '🛍️',
                    desc: 'List your marine products, manage inventory, and process customer orders.',
                };
            case 'buyer':
                return {
                    color: 'from-emerald-500 to-teal-600',
                    bgLight: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 text-emerald-700',
                    icon: '🛒',
                    desc: 'Browse fresh catches, place orders, and coordinate with trusted local sellers.',
                };
            case 'driver':
                return {
                    color: 'from-amber-500 to-orange-600',
                    bgLight: 'bg-amber-50 border-amber-200 hover:border-amber-400 text-amber-700',
                    icon: '🚚',
                    desc: 'Accept logistics requests, manage delivery routes, and ship orders safely.',
                };
            default:
                return {
                    color: 'from-gray-500 to-slate-600',
                    bgLight: 'bg-gray-50 border-gray-200 hover:border-gray-400 text-gray-700',
                    icon: '👤',
                    desc: 'Access standard user actions and customize your profile.',
                };
        }
    };

    return (
        <GuestLayout>
            <Head title="Select Active Role" />

            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Welcome to SEAPEDIA
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Your account has multiple roles. Please select your active workspace role for this session:
                </p>
            </div>

            <div className="space-y-4">
                {roles.map((role) => {
                    const details = getRoleDetails(role);
                    const isActive = activeRole === role;

                    return (
                        <button
                            key={role}
                            onClick={() => handleSelectRole(role)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex items-start gap-4 ${
                                isActive 
                                    ? 'border-indigo-600 ring-2 ring-indigo-500 ring-offset-1 bg-indigo-50/30' 
                                    : 'border-gray-200 bg-white hover:border-indigo-300'
                            }`}
                        >
                            <span className="text-3xl p-2 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                {details.icon}
                            </span>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-lg text-gray-900">
                                        {role}
                                    </span>
                                    {isActive && (
                                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                                    {details.desc}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                    You can switch your active role at any time from your dashboard menu.
                </p>
            </div>
        </GuestLayout>
    );
}
