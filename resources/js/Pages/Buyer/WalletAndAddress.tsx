import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

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

interface WalletAndAddressProps {
    wallet: Wallet;
    addresses: ShippingAddress[];
}

export default function WalletAndAddress({ wallet, addresses }: WalletAndAddressProps) {
    const { flash } = usePage().props as any;
    const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);

    // Form for Top-up
    const topUpForm = useForm({
        amount: '',
    });

    // Form for Address
    const addressForm = useForm({
        recipient_name: '',
        phone: '',
        address: '',
        is_default: false,
    });

    const handleTopUpSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        topUpForm.post(route('buyer.wallet.topup'), {
            onSuccess: () => topUpForm.reset(),
        });
    };

    const handleQuickTopUp = (amount: number) => {
        topUpForm.setData('amount', amount.toString());
        topUpForm.post(route('buyer.wallet.topup'));
    };

    const handleAddressSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (editingAddress) {
            addressForm.patch(route('buyer.address.update', editingAddress.id), {
                onSuccess: () => {
                    setEditingAddress(null);
                    addressForm.reset();
                }
            });
        } else {
            addressForm.post(route('buyer.address.store'), {
                onSuccess: () => addressForm.reset(),
            });
        }
    };

    const startEditAddress = (addr: ShippingAddress) => {
        setEditingAddress(addr);
        addressForm.setData({
            recipient_name: addr.recipient_name,
            phone: addr.phone,
            address: addr.address,
            is_default: addr.is_default,
        });
    };

    const cancelEditAddress = () => {
        setEditingAddress(null);
        addressForm.reset();
    };

    const handleDeleteAddress = (id: number) => {
        if (confirm('Are you sure you want to delete this address?')) {
            addressForm.delete(route('buyer.address.destroy', id));
        }
    };

    const formatIDR = (balance: string) => {
        const num = parseFloat(balance);
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
                    Wallet & Addresses
                </h2>
            }
        >
            <Head title="Wallet and Address" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {flash?.status && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm font-semibold">
                            {flash.status}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Left Column: Wallet Balance & Top Up (1/3) */}
                        <div className="space-y-6">
                            
                            {/* Balance Card */}
                            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl p-6 shadow-sm space-y-4">
                                <div>
                                    <span className="text-xs uppercase tracking-wider text-indigo-200 block">Seapedia Balance</span>
                                    <p className="text-3xl font-black mt-1">{formatIDR(wallet.wallet_balance)}</p>
                                </div>
                                <div className="text-xs text-indigo-200/90 leading-relaxed bg-white/10 p-3 rounded-lg border border-white/10">
                                    💳 Dompet elektronik ini digunakan untuk simulasi transaksi langsung di marketplace SEAPEDIA.
                                </div>
                            </div>

                            {/* Top Up Form */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
                                <h3 className="font-bold text-slate-900">Simulate Top-Up</h3>
                                <p className="text-xs text-slate-400">Add funds instantly to your Seapedia account wallet.</p>

                                <div className="grid grid-cols-2 gap-2">
                                    {[50000, 100000, 200000, 500000].map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => handleQuickTopUp(amt)}
                                            className="py-2 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 text-xs font-semibold rounded-lg text-slate-700 hover:text-indigo-600 transition"
                                        >
                                            +{formatIDR(amt.toString()).replace('Rp', '')}
                                        </button>
                                    ))}
                                </div>

                                <form onSubmit={handleTopUpSubmit} className="space-y-3 pt-2">
                                    <div>
                                        <InputLabel htmlFor="amount" value="Or Custom Amount (IDR)" />
                                        <TextInput
                                            id="amount"
                                            type="number"
                                            name="amount"
                                            value={topUpForm.data.amount}
                                            className="mt-1 block w-full"
                                            onChange={(e) => topUpForm.setData('amount', e.target.value)}
                                            placeholder="e.g. 150000"
                                            required
                                        />
                                        <InputError message={topUpForm.errors.amount} className="mt-1" />
                                    </div>
                                    <PrimaryButton disabled={topUpForm.processing} className="w-full justify-center">
                                        Top Up Wallet
                                    </PrimaryButton>
                                </form>
                            </div>
                        </div>

                        {/* Right Columns: Shipping Addresses Management (2/3) */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            
                            {/* Saved Addresses List */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                                <h3 className="font-bold text-slate-900">Saved Addresses</h3>
                                <p className="text-xs text-slate-400">Manage destination points for fish catch delivery.</p>

                                {addresses.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                                        No shipping addresses saved yet.
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin">
                                        {addresses.map((addr) => (
                                            <div key={addr.id} className={`p-4 rounded-xl border transition ${
                                                addr.is_default 
                                                    ? 'border-indigo-600 bg-indigo-50/20 shadow-sm' 
                                                    : 'border-slate-100 hover:border-slate-200'
                                            }`}>
                                                <div className="flex justify-between items-start gap-3">
                                                    <div>
                                                        <span className="font-bold text-slate-900 block text-sm">
                                                            {addr.recipient_name}
                                                        </span>
                                                        <span className="text-xs text-slate-400 block mt-0.5">
                                                            {addr.phone}
                                                        </span>
                                                    </div>
                                                    {addr.is_default && (
                                                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                                    {addr.address}
                                                </p>
                                                
                                                <div className="flex gap-3 justify-end border-t border-slate-100/50 mt-3 pt-2 text-[11px] font-bold">
                                                    <button
                                                        onClick={() => startEditAddress(addr)}
                                                        className="text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAddress(addr.id)}
                                                        className="text-rose-600 hover:text-rose-800"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Add/Edit Address Form */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
                                <h3 className="font-bold text-slate-900">
                                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    {editingAddress ? 'Update the selected shipping address details.' : 'Provide details of a new delivery location.'}
                                </p>

                                <form onSubmit={handleAddressSubmit} className="space-y-4">
                                    {/* Recipient Name */}
                                    <div>
                                        <InputLabel htmlFor="recipient_name" value="Recipient Name" />
                                        <TextInput
                                            id="recipient_name"
                                            type="text"
                                            value={addressForm.data.recipient_name}
                                            className="mt-1 block w-full"
                                            onChange={(e) => addressForm.setData('recipient_name', e.target.value)}
                                            placeholder="e.g. Banu Pandara"
                                            required
                                        />
                                        <InputError message={addressForm.errors.recipient_name} className="mt-1" />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <InputLabel htmlFor="phone" value="Phone Number" />
                                        <TextInput
                                            id="phone"
                                            type="text"
                                            value={addressForm.data.phone}
                                            className="mt-1 block w-full"
                                            onChange={(e) => addressForm.setData('phone', e.target.value)}
                                            placeholder="e.g. 081234567890"
                                            required
                                        />
                                        <InputError message={addressForm.errors.phone} className="mt-1" />
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <InputLabel htmlFor="address_text" value="Address Details" />
                                        <textarea
                                            id="address_text"
                                            value={addressForm.data.address}
                                            rows={3}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                            onChange={(e) => addressForm.setData('address', e.target.value)}
                                            placeholder="e.g. Jalan Menteng Raya No. 45, Jakarta Pusat"
                                            required
                                        />
                                        <InputError message={addressForm.errors.address} className="mt-1" />
                                    </div>

                                    {/* Is Default */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="is_default"
                                            type="checkbox"
                                            checked={addressForm.data.is_default}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            onChange={(e) => addressForm.setData('is_default', e.target.checked)}
                                        />
                                        <label htmlFor="is_default" className="text-xs font-semibold text-slate-600">
                                            Set as default shipping address
                                        </label>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <PrimaryButton disabled={addressForm.processing} className="flex-1 justify-center">
                                            {editingAddress ? 'Update Address' : 'Save Address'}
                                        </PrimaryButton>
                                        {editingAddress && (
                                            <button
                                                type="button"
                                                onClick={cancelEditAddress}
                                                className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs flex items-center justify-center transition"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
