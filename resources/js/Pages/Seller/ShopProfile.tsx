import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Shop {
    id: number;
    user_id: number;
    name: string;
    description: string | null;
    address: string | null;
}

interface ShopProfileProps {
    shop: Shop | null;
}

export default function ShopProfile({ shop }: ShopProfileProps) {
    const { flash } = usePage().props as any;

    const { data, setData, post, processing, errors } = useForm({
        name: shop ? shop.name : '',
        description: shop ? shop.description || '' : '',
        address: shop ? shop.address || '' : '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('seller.shop.update'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    My Shop Profile
                </h2>
            }
        >
            <Head title="Shop Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg border border-slate-100 max-w-2xl">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Shop Information</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Update your unique shop name and description. This name will appear next to your listings in the marketplace.
                            </p>
                        </div>

                        {flash?.status && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm font-semibold">
                                {flash.status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            {/* Shop Name */}
                            <div>
                                <InputLabel htmlFor="name" value="Shop Name (Must be unique)" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            {/* Description */}
                            <div>
                                <InputLabel htmlFor="description" value="Description" />
                                <textarea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    rows={4}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Explain what your shop sells, catch schedules, etc..."
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {/* Address */}
                            <div>
                                <InputLabel htmlFor="address" value="Pickup Location / Port Address" />
                                <textarea
                                    id="address"
                                    name="address"
                                    value={data.address}
                                    rows={3}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="e.g. Dermaga 3, Pelabuhan Muara Baru, Jakarta"
                                />
                                <InputError message={errors.address} className="mt-2" />
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing}>
                                    Save Profile
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
