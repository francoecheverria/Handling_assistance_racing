import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center rounded-md border-b-2 px-3 py-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-brand-dark bg-brand-dark/50 text-brand-white focus:border-brand-dark'
                    : 'border-transparent text-brand-white hover:border-brand-primary/40 hover:text-brand-white/85 focus:border-brand-primary/40 focus:text-brand-white') +
                className
            }
        >
            {children}
        </Link>
    );
}
