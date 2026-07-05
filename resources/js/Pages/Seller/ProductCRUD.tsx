import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';

interface Product {
    id: number;
    user_id: number;
    name: string;
    description: string | null;
    price: string;
    stock: number;
}

interface Shop {
    id: number;
    name: string;
}

interface ProductCRUDProps {
    products: Product[];
    shop: Shop | null;
}

export default function ProductCRUD({ products, shop }: ProductCRUDProps) {
    const { flash } = usePage().props as any;
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const { data, setData, post, patch, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        name: '',
        description: '',
        price: '',
        stock: '',
    });

    // Handle form submit (Create or Update)
    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (editingProduct) {
            patch(route('seller.products.update', editingProduct.id), {
                onSuccess: () => {
                    setEditingProduct(null);
                    reset();
                    clearErrors();
                }
            });
        } else {
            post(route('seller.products.store'), {
                onSuccess: () => {
                    reset();
                    clearErrors();
                }
            });
        }
    };

    // Load product into form for editing
    const startEdit = (product: Product) => {
        setEditingProduct(product);
        clearErrors();
        setData({
            name: product.name,
            description: product.description || '',
            price: parseFloat(product.price).toString(),
            stock: product.stock.toString(),
        });
    };

    // Cancel editing mode
    const cancelEdit = () => {
        setEditingProduct(null);
        reset();
        clearErrors();
    };

    // Handle delete product
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this listing?')) {
            destroy(route('seller.products.destroy', id));
        }
    };

    // Format currency helper
    const formatIDR = (priceStr: string) => {
        const num = parseFloat(priceStr);
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
                    Product Management
                </h2>
            }
        >
            <Head title="Manage Products" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Alert if Shop hasn't been set up */}
                    {!shop ? (
                        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="font-bold text-lg">Shop Setup Required!</h3>
                                <p className="text-sm text-amber-700 mt-1">
                                    You need to fill out your shop profile before you can list any fresh catches for sale in the public market.
                                </p>
                            </div>
                            <Link
                                href={route('seller.shop.edit')}
                                className="bg-amber-600 text-white rounded-xl py-2 px-4 text-sm font-bold hover:bg-amber-700 transition"
                            >
                                Setup Shop Profile
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left Pane: Products Table (2/3 col) */}
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Current Seafood Listings</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">Shop Workspace: {shop.name}</p>
                                    </div>
                                    <span className="text-xs bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 px-3 py-1 rounded-full">
                                        {products.length} Products Total
                                    </span>
                                </div>

                                {flash?.status && (
                                    <div className="m-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm font-semibold">
                                        {flash.status}
                                    </div>
                                )}

                                {products.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400">
                                        <span className="text-5xl block mb-3">🎣</span>
                                        No marine listings found. Use the form on the right to list your first catch!
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-700">
                                            <thead className="bg-slate-50 text-xs font-semibold text-slate-400 uppercase border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-3">Product Name</th>
                                                    <th className="px-6 py-3 text-right">Price / kg</th>
                                                    <th className="px-6 py-3 text-center">Stock</th>
                                                    <th className="px-6 py-3 text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {products.map((product) => (
                                                    <tr key={product.id} className="hover:bg-slate-50/60 transition">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-900">{product.name}</div>
                                                            <div className="text-xs text-slate-400 mt-1 max-w-sm truncate">
                                                                {product.description || 'No description.'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-semibold text-indigo-600">
                                                            {formatIDR(product.price)}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                                product.stock <= 0 
                                                                    ? 'bg-rose-100 text-rose-800' 
                                                                    : 'bg-emerald-100 text-emerald-800'
                                                            }`}>
                                                                {product.stock} kg
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="inline-flex gap-3">
                                                                <button
                                                                    onClick={() => startEdit(product)}
                                                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(product.id)}
                                                                    className="text-xs font-bold text-rose-600 hover:text-rose-800"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Right Pane: Form (1/3 col) */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6 h-fit">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {editingProduct ? 'Edit Catch Listing' : 'List New Catch'}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {editingProduct ? 'Update catch price, stock, or description.' : 'Fill out details to publish a new seafood catch.'}
                                    </p>
                                </div>

                                <form onSubmit={submit} className="space-y-4">
                                    {/* Product Name */}
                                    <div>
                                        <InputLabel htmlFor="p_name" value="Product Name" />
                                        <TextInput
                                            id="p_name"
                                            type="text"
                                            value={data.name}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g. Tuna Sirip Kuning Segar"
                                            required
                                        />
                                        <InputError message={errors.name} className="mt-1" />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <InputLabel htmlFor="p_desc" value="Description" />
                                        <textarea
                                            id="p_desc"
                                            value={data.description}
                                            rows={3}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Catch date, location, size, etc..."
                                        />
                                        <InputError message={errors.description} className="mt-1" />
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <InputLabel htmlFor="p_price" value="Price per kg (IDR)" />
                                        <TextInput
                                            id="p_price"
                                            type="number"
                                            value={data.price}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('price', e.target.value)}
                                            placeholder="e.g. 75000"
                                            required
                                        />
                                        <InputError message={errors.price} className="mt-1" />
                                    </div>

                                    {/* Stock */}
                                    <div>
                                        <InputLabel htmlFor="p_stock" value="Stock (kg)" />
                                        <TextInput
                                            id="p_stock"
                                            type="number"
                                            value={data.stock}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('stock', e.target.value)}
                                            placeholder="e.g. 15"
                                            required
                                        />
                                        <InputError message={errors.stock} className="mt-1" />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <PrimaryButton disabled={processing} className="flex-1 justify-center">
                                            {editingProduct ? 'Update Listing' : 'Publish Listing'}
                                        </PrimaryButton>
                                        {editingProduct && (
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-xl text-xs flex items-center justify-center transition"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
