import { HTMLAttributes } from 'react';

export default function ApplicationLogo({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    // Check if the logo is rendered in the navbar (h-9) vs guest screens (h-20)
    const isNavbar = className.includes('h-9');

    return (
        <div
            {...props}
            className={`flex items-center gap-2 select-none whitespace-nowrap ${className}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: isNavbar ? '2.25rem' : '4rem',
                width: 'auto',
            }}
        >
            <span className={isNavbar ? 'text-xl' : 'text-4xl'}>🌊</span>
            <span
                className={`font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight ${
                    isNavbar ? 'text-lg' : 'text-3xl'
                }`}
            >
                SEAPEDIA
            </span>
        </div>
    );
}
