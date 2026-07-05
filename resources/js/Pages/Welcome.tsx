import { PageProps } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';

interface Product {
    id: number;
    user_id: number;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    image_url: string | null;
    seller?: {
        id: number;
        name: string;
        shop?: {
            id: number;
            name: string;
        } | null;
    };
}

interface AppReview {
    id: number;
    user_id: number | null;
    reviewer_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface WelcomeProps extends PageProps {
    products: Product[];
    reviews: AppReview[];
    canLogin: boolean;
    canRegister: boolean;
}

export default function Welcome({ products, reviews, canLogin, canRegister }: WelcomeProps) {
    const { auth, flash, errors } = usePage<any>().props;
    const user = auth.user;

    const { data, setData, post, processing, reset, errors: reviewErrors } = useForm({
        reviewer_name: user ? user.name : '',
        rating: 5,
        comment: '',
    });

    const handleAddToCart = (productId: number) => {
        if (!user) {
            router.get(route('login'));
            return;
        }

        if (auth.activeRole !== 'Buyer') {
            alert('Silakan ubah peran aktif Anda ke "Buyer" terlebih dahulu untuk melakukan pembelian.');
            return;
        }

        router.post(route('buyer.cart.store'), {
            product_id: productId,
            quantity: 1,
        }, {
            preserveScroll: true,
        });
    };

    // Reset comment and rating on success, but keep name if logged in
    useEffect(() => {
        if (flash.status) {
            reset('comment');
            setData('rating', 5);
        }
    }, [flash.status]);

    const submitReview: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('reviews.store'), {
            preserveScroll: true,
        });
    };

    // Calculate average app rating
    const avgRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    // Format currency to IDR
    const formatIDR = (priceStr: string) => {
        const num = parseFloat(priceStr);
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    return (
        <>
            <Head title="Welcome to SEAPEDIA" />
            
            <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
                
                {/* Header Navbar */}
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            
                            {/* Logo */}
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🌊</span>
                                <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                                    SEAPEDIA
                                </span>
                            </div>

                            {/* Nav Actions */}
                            <nav className="flex items-center gap-4">
                                {user ? (
                                    <div className="flex items-center gap-3">
                                        <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase">
                                            Active: {auth.activeRole || 'None'}
                                        </span>
                                        <Link
                                            href={route('dashboard')}
                                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition duration-150 shadow-sm"
                                        >
                                            Dashboard
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        {canLogin && (
                                            <Link
                                                href={route('login')}
                                                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
                                            >
                                                Log in
                                            </Link>
                                        )}
                                        {canRegister && (
                                            <Link
                                                href={route('register')}
                                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition duration-150 shadow-sm"
                                            >
                                                Register
                                            </Link>
                                        )}
                                    </>
                                )}
                            </nav>

                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white py-20 sm:py-32">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.2),transparent)]"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">
                            🚀 Modern Marine Marketplace
                        </span>
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
                            Connecting Local Fishers Directly to Your Kitchen
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                            Buy fresh catches, sell sustainably, and arrange fast logistics in one open marine ecosystem.
                        </p>
                        <div className="pt-4 flex flex-wrap justify-center gap-4">
                            <a 
                                href="#marketplace" 
                                className="inline-flex items-center justify-center px-6 py-3 font-semibold text-indigo-900 bg-white rounded-xl hover:bg-slate-100 transition shadow-lg"
                            >
                                Browse Marketplace
                            </a>
                            <a 
                                href="#reviews" 
                                className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white bg-indigo-600/30 border border-indigo-400/30 rounded-xl hover:bg-indigo-600/40 transition"
                            >
                                Read App Reviews
                            </a>
                        </div>
                    </div>
                </section>

                {/* Marketplace Catalog Section */}
                <section id="marketplace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 scroll-mt-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Marketplace Catalog</h2>
                            <p className="mt-1 text-sm text-slate-500">Explore fresh seafood catches directly listed by local verified sellers.</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full shrink-0 shadow-sm">
                            🐟 Showing {products.length} Fresh Listings
                        </span>
                    </div>

                    {errors?.cart_error && (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-900 shadow-sm flex items-start gap-4 mb-6">
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
                                            {isOutOfStock ? 'Out of Stock' : `${product.stock} kg Available`}
                                        </span>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-1">
                                            <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider block">
                                                Shop: {product.seller?.shop?.name || product.seller?.name || 'Verified Fishers'}
                                            </span>
                                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                                                {product.description || 'No description provided.'}
                                            </p>
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-xs font-semibold text-slate-400 uppercase">Price per kg</span>
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
                                                {isOutOfStock ? 'Out of Stock' : 'Order Now'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* App Reviews Section */}
                <section id="reviews" className="bg-slate-100 border-t border-slate-200/50 py-16 scroll-mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                        
                        {/* Review Input Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <div>
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Share Your Voice</span>
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">App Feedback</h2>
                                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                                    Rate your experience using SEAPEDIA. Your feedback helps us shape a better community marketplace.
                                </p>
                            </div>

                            {/* Average score card */}
                            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 uppercase">Average App Rating</span>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-4xl font-extrabold text-slate-900">{avgRating}</span>
                                        <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex text-amber-400 text-lg">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <span key={s}>
                                                {s <= Math.round(parseFloat(avgRating)) ? '★' : '☆'}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-xs text-slate-400 mt-1 block">{reviews.length} reviews submitted</span>
                                </div>
                            </div>

                            {/* Submission Form */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4">
                                <h3 className="font-bold text-slate-900">Leave a Review</h3>
                                
                                {flash.status && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-sm font-semibold">
                                        {flash.status}
                                    </div>
                                )}

                                <form onSubmit={submitReview} className="space-y-4">
                                    
                                    {/* Reviewer Name */}
                                    {user ? (
                                        <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs font-medium text-indigo-800 flex justify-between items-center">
                                            <span>Reviewing as: <strong>{user.name}</strong></span>
                                            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Logged In</span>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Name</label>
                                            <input 
                                                type="text" 
                                                value={data.reviewer_name}
                                                onChange={(e) => setData('reviewer_name', e.target.value)}
                                                placeholder="e.g. John Doe"
                                                className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                                required
                                            />
                                            {reviewErrors.reviewer_name && (
                                                <p className="text-xs text-rose-500 mt-1">{reviewErrors.reviewer_name}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Rating */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rating</label>
                                        <div className="flex gap-2 text-2xl">
                                            {[1, 2, 3, 4, 5].map((val) => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => setData('rating', val)}
                                                    className="cursor-pointer transition hover:scale-110"
                                                >
                                                    <span className={val <= data.rating ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}>
                                                        ★
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        {reviewErrors.rating && (
                                            <p className="text-xs text-rose-500 mt-1">{reviewErrors.rating}</p>
                                        )}
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Comment</label>
                                        <textarea
                                            value={data.comment}
                                            onChange={(e) => setData('comment', e.target.value)}
                                            placeholder="Tell us about your experience..."
                                            rows={4}
                                            className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        ></textarea>
                                        {reviewErrors.comment && (
                                            <p className="text-xs text-rose-500 mt-1">{reviewErrors.comment}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-indigo-700 transition shadow-sm hover:shadow-indigo-100"
                                    >
                                        Submit Feedback
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Review List Column */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center justify-between">
                                <span>Recent Feedback Reviews</span>
                                <span className="text-xs font-bold text-slate-400">{reviews.length} Total</span>
                            </h3>

                            {reviews.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/50">
                                    No reviews submitted yet. Be the first to share your experience!
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[620px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="p-5 bg-white border border-slate-200/50 rounded-2xl shadow-sm space-y-3 hover:border-slate-300 transition">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <span className="font-bold text-slate-800 block text-base leading-snug">
                                                        {review.reviewer_name}
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-400">
                                                        {new Date(review.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex text-amber-400">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <span key={s}>
                                                            {s <= review.rating ? '★' : '☆'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed font-light">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
                        <p className="font-bold text-white tracking-wide">SEAPEDIA</p>
                        <p className="text-sm font-light">Connecting local fisheries with global values. Built for sustainability.</p>
                        <p className="text-xs text-slate-600 pt-4">© 2026 SEAPEDIA. All rights reserved.</p>
                    </div>
                </footer>

            </div>
        </>
    );
}
