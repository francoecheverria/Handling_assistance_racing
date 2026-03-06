import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-brand-primary bg-brand-light/20 text-brand-dark focus:border-brand-primary focus:bg-brand-light/30 focus:text-brand-dark'
                    : 'border-transparent text-brand-dark/75 hover:border-brand-primary/40 hover:bg-brand-light/15 hover:text-brand-dark focus:border-brand-primary/40 focus:bg-brand-light/15 focus:text-brand-dark'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
