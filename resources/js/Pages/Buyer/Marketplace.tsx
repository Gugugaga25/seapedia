import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

interface Product {
    id: number;
    name: string;
    description: string | null;
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

interface MarketplaceProps {
    products: Product[];
}

export default function Marketplace({ products }: MarketplaceProps) {
    const { errors } = usePage().props as any;

    const handleAddToCart = (productId: number) => {
        router.post(route('buyer.cart.store'), {
            product_id: productId,
            quantity: 1
        }, {
            preserveScroll: true
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
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Seapedia Seafood Marketplace
                </h2>
            }
        >
            <Head title="Marketplace Catalog" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {errors?.cart_error && (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-900 shadow-sm flex items-start gap-4">
                            <span className="text-3xl">⚠️</span>
                            <div className="flex-1">
                                <h4 className="font-bold">Gagal Menambahkan ke Keranjang</h4>
                                <p className="text-sm text-rose-700 mt-1">{errors.cart_error}</p>
                                <div className="mt-3 flex gap-3 text-xs font-bold">
                                    <Link 
                                        href={route('buyer.cart.index')}
                                        className="text-indigo-600 hover:text-indigo-800"
                                    >
                                        Lihat Keranjang Saya
                                    </Link>
                                    <button 
                                        onClick={() => router.post(route('buyer.cart.clear'), {}, { preserveScroll: true })}
                                        className="text-rose-600 hover:text-rose-800 cursor-pointer"
                                    >
                                        Kosongkan Keranjang Sekarang
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Daftar Produk Segar</h2>
                            <p className="mt-1 text-sm text-slate-500">Beli hasil laut segar langsung dari tangkapan nelayan tradisional lokal terverifikasi.</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full shrink-0 shadow-sm">
                            🐟 Menampilkan {products.length} Produk Segar
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => {
                            const isOutOfStock = product.stock <= 0;
                            return (
                                <div key={product.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-200">
                                    <div className="relative aspect-video bg-indigo-50 flex items-center justify-center border-b border-slate-50 overflow-hidden shrink-0">
                                        <span className="text-5xl group-hover:scale-110 transition duration-300">
                                            {product.name.toLowerCase().includes('tuna') ? '🐟' :
                                             product.name.toLowerCase().includes('lobster') ? '🦞' :
                                             product.name.toLowerCase().includes('crab') ? '🦀' :
                                             product.name.toLowerCase().includes('shrimp') || product.name.toLowerCase().includes('udang') ? '🦐' : '🦑'}
                                        </span>
                                        <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${
                                            isOutOfStock ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {isOutOfStock ? 'Stok Habis' : `${product.stock} kg Tersedia`}
                                        </span>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-1">
                                            <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider block">
                                                Toko: {product.seller?.shop?.name || product.seller?.name || 'Verified Fishers'}
                                            </span>
                                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                                                {product.description || 'Tidak ada deskripsi produk.'}
                                            </p>
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-xs font-semibold text-slate-400 uppercase">Harga per kg</span>
                                                <span className="text-xl font-black text-indigo-600">{formatIDR(product.price)}</span>
                                            </div>
                                            <button 
                                                disabled={isOutOfStock}
                                                onClick={() => handleAddToCart(product.id)}
                                                className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm tracking-wide transition shadow-sm cursor-pointer ${
                                                    isOutOfStock
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-100'
                                                }`}
                                            >
                                                {isOutOfStock ? 'Stok Habis' : 'Pesan Sekarang'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
