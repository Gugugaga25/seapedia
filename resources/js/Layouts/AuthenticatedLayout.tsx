import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { user, activeRole, roles } = usePage().props.auth;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const getRoleBadge = (role: string | null) => {
        if (!role) return '';
        switch (role.toLowerCase()) {
            case 'admin':
                return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'seller':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'buyer':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'driver':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                                {activeRole === 'Seller' && (
                                    <>
                                        <NavLink
                                            href={route('seller.shop.edit')}
                                            active={route().current('seller.shop.edit')}
                                        >
                                            My Shop
                                        </NavLink>
                                        <NavLink
                                            href={route('seller.products.index')}
                                            active={route().current('seller.products.index')}
                                        >
                                            My Products
                                        </NavLink>
                                        <NavLink
                                            href={route('seller.orders.index')}
                                            active={route().current('seller.orders.index')}
                                        >
                                            Incoming Orders
                                        </NavLink>
                                    </>
                                )}
                                {activeRole === 'Buyer' && (
                                    <>
                                        <NavLink
                                            href={route('buyer.marketplace.index')}
                                            active={route().current('buyer.marketplace.index')}
                                        >
                                            Marketplace
                                        </NavLink>
                                        <NavLink
                                            href={route('buyer.wallet.index')}
                                            active={route().current('buyer.wallet.index')}
                                        >
                                            My Wallet & Addresses
                                        </NavLink>
                                        <NavLink
                                            href={route('buyer.cart.index')}
                                            active={route().current('buyer.cart.index')}
                                        >
                                            My Cart
                                        </NavLink>
                                        <NavLink
                                            href={route('buyer.orders.index')}
                                            active={route().current('buyer.orders.index')}
                                        >
                                            My Orders
                                        </NavLink>
                                    </>
                                )}
                                {activeRole === 'Driver' && (
                                    <>
                                        <NavLink
                                            href={route('driver.jobs.index')}
                                            active={route().current('driver.jobs.index')}
                                        >
                                            Delivery Jobs
                                        </NavLink>
                                    </>
                                )}
                                {activeRole === 'Admin' && (
                                    <>
                                        <NavLink
                                            href={route('admin.dashboard.index')}
                                            active={route().current('admin.dashboard.index')}
                                        >
                                            Admin Panel
                                        </NavLink>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>{user.name}</span>
                                                    {activeRole && (
                                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getRoleBadge(activeRole)}`}>
                                                            {activeRole}
                                                        </span>
                                                    )}
                                                </div>

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        {roles && roles.length > 1 && (
                                            <Dropdown.Link
                                                href={route('role-select')}
                                            >
                                                Switch Role
                                            </Dropdown.Link>
                                        )}
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        {activeRole === 'Seller' && (
                            <>
                                <ResponsiveNavLink
                                    href={route('seller.shop.edit')}
                                    active={route().current('seller.shop.edit')}
                                >
                                    My Shop
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('seller.products.index')}
                                    active={route().current('seller.products.index')}
                                >
                                    My Products
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('seller.orders.index')}
                                    active={route().current('seller.orders.index')}
                                >
                                    Incoming Orders
                                </ResponsiveNavLink>
                            </>
                        )}
                        {activeRole === 'Buyer' && (
                            <>
                                <ResponsiveNavLink
                                    href={route('buyer.marketplace.index')}
                                    active={route().current('buyer.marketplace.index')}
                                >
                                    Marketplace
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('buyer.wallet.index')}
                                    active={route().current('buyer.wallet.index')}
                                >
                                    My Wallet & Addresses
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('buyer.cart.index')}
                                    active={route().current('buyer.cart.index')}
                                >
                                    My Cart
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('buyer.orders.index')}
                                    active={route().current('buyer.orders.index')}
                                >
                                    My Orders
                                </ResponsiveNavLink>
                            </>
                        )}
                        {activeRole === 'Driver' && (
                            <>
                                <ResponsiveNavLink
                                    href={route('driver.jobs.index')}
                                    active={route().current('driver.jobs.index')}
                                >
                                    Delivery Jobs
                                </ResponsiveNavLink>
                            </>
                        )}
                        {activeRole === 'Admin' && (
                            <>
                                <ResponsiveNavLink
                                    href={route('admin.dashboard.index')}
                                    active={route().current('admin.dashboard.index')}
                                >
                                    Admin Panel
                                </ResponsiveNavLink>
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="flex items-center justify-between text-base font-medium text-gray-800">
                                <span>{user.name}</span>
                                {activeRole && (
                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getRoleBadge(activeRole)}`}>
                                        {activeRole}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                             <ResponsiveNavLink href={route('profile.edit')}>
                                 Profile
                             </ResponsiveNavLink>
                             {roles && roles.length > 1 && (
                                 <ResponsiveNavLink href={route('role-select')}>
                                     Switch Role
                                 </ResponsiveNavLink>
                             )}
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
