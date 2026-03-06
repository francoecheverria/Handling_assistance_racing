import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FaCalendarCheck, FaChalkboardTeacher, FaClipboardList, FaHome, FaUserShield, FaUsers } from 'react-icons/fa';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const canSeeGroups = (user?.permissions || []).includes('ver tiras');
    const canSeePlayers = (user?.permissions || []).includes('ver jugadores');
    const canSeeAttendances = (user?.permissions || []).includes('ver asistencias');
    const canManageCoaches = (user?.permissions || []).includes('gestionar profesores');
    const canManageAdmins = (user?.permissions || []).includes('gestionar administradores');

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() =>
        document.documentElement.classList.contains('theme-dark'),
    );

    const toggleTheme = () => {
        const nextValue = !isDarkMode;
        setIsDarkMode(nextValue);
        document.documentElement.classList.toggle('theme-dark', nextValue);
        window.localStorage.setItem('theme', nextValue ? 'dark' : 'light');
    };

    return (
        <div className="min-h-screen bg-brand-white">
            <nav className="border-b border-brand-light/40 bg-brand-light">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-brand-dark" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className=" !text-white hover:!text-white/85 !border-brand-primary/40 dark:!text-white dark:hover:!text-white/85"
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <FaHome className="h-4 w-4" />
                                        Inicio
                                    </span>
                                </NavLink>
                                {canManageAdmins && (
                                    <NavLink
                                        href={route('administrators.index')}
                                        active={route().current('administrators.index')}
                                        className=" !text-white hover:!text-white/85 !border-brand-primary/40 dark:!text-white dark:hover:!text-white/85"
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <FaUserShield className="h-4 w-4" />
                                            Administradores
                                        </span>
                                    </NavLink>
                                )}
                                {canManageCoaches && (
                                    <NavLink
                                        href={route('coaches.index')}
                                        active={route().current('coaches.index')}
                                        className=" !text-white hover:!text-white/85 !border-brand-primary/40 dark:!text-white dark:hover:!text-white/85"
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <FaChalkboardTeacher className="h-4 w-4" />
                                            Profesores
                                        </span>
                                    </NavLink>
                                )}
                                {canSeeGroups && (
                                    <NavLink
                                        href={route('groups.index')}
                                        active={
                                            route().current('groups.index') ||
                                            route().current('groups.show') ||
                                            route().current('groups.edit')
                                        }
                                        className=" !text-white hover:!text-white/85 !border-brand-primary/40 dark:!text-white dark:hover:!text-white/85"
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <FaClipboardList className="h-4 w-4" />
                                            Mis tiras
                                        </span>
                                    </NavLink>
                                )}
                                {canSeePlayers && (
                                    <NavLink
                                        href={route('players.mine')}
                                        active={route().current('players.mine')}
                                        className=" !text-white hover:!text-white/85 !border-brand-primary/40 dark:!text-white dark:hover:!text-white/85"
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <FaUsers className="h-4 w-4" />
                                            Mis jugadores
                                        </span>
                                    </NavLink>
                                )}
                                {canSeeAttendances && (
                                    <NavLink
                                        href={route('attendances.index')}
                                        active={route().current('attendances.index')}
                                        className=" !text-white hover:!text-white/85 !border-brand-primary/40 dark:!text-white dark:hover:!text-white/85"
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <FaCalendarCheck className="h-4 w-4" />
                                            Asistencias
                                        </span>
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={isDarkMode}
                                aria-label="Cambiar modo oscuro"
                                className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold text-white"
                                onClick={toggleTheme}
                            >
                                <span className="text-xs text-white">
                                    {isDarkMode ? 'Dark' : 'Light'}
                                </span>
                                <span
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full border border-brand-primary/40 transition ${
                                        isDarkMode
                                            ? 'bg-brand-dark/50'
                                            : 'bg-brand-white/35'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-brand-white transition ${
                                            isDarkMode
                                                ? 'translate-x-6'
                                                : 'translate-x-1'
                                        }`}
                                    />
                                </span>
                            </button>
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-brand-white px-3 py-2 text-sm font-medium leading-4 text-brand-dark/70 transition duration-150 ease-in-out hover:text-brand-dark focus:outline-none dark:bg-brand-dark dark:text-brand-white dark:hover:text-brand-white"
                                            >
                                                {user.name}

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
                                type="button"
                                role="switch"
                                aria-checked={isDarkMode}
                                aria-label="Cambiar modo oscuro"
                                className="me-2 flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold text-white"
                                onClick={toggleTheme}
                            >
                                <span className="text-white">{isDarkMode ? 'Dark' : 'Light'}</span>
                                <span
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full border border-brand-primary/40 transition ${
                                        isDarkMode
                                            ? 'bg-brand-dark/50'
                                            : 'bg-brand-white/35'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-brand-white transition ${
                                            isDarkMode
                                                ? 'translate-x-4'
                                                : 'translate-x-0.5'
                                        }`}
                                    />
                                </span>
                            </button>
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-brand-dark/70 transition duration-150 ease-in-out hover:bg-brand-light/20 hover:text-brand-dark focus:bg-brand-light/20 focus:text-brand-dark focus:outline-none"
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
                            <span className="inline-flex items-center gap-2">
                                <FaHome className="h-4 w-4" />
                                Inicio
                            </span>
                        </ResponsiveNavLink>
                        {canManageAdmins && (
                            <ResponsiveNavLink
                                href={route('administrators.index')}
                                active={route().current('administrators.index')}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FaUserShield className="h-4 w-4" />
                                    Administradores
                                </span>
                            </ResponsiveNavLink>
                        )}
                        {canManageCoaches && (
                            <ResponsiveNavLink
                                href={route('coaches.index')}
                                active={route().current('coaches.index')}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FaChalkboardTeacher className="h-4 w-4" />
                                    Profesores
                                </span>
                            </ResponsiveNavLink>
                        )}
                        {canSeeGroups && (
                            <ResponsiveNavLink
                                href={route('groups.index')}
                                active={
                                    route().current('groups.index') ||
                                    route().current('groups.show')
                                }
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FaClipboardList className="h-4 w-4" />
                                    Mis tiras
                                </span>
                            </ResponsiveNavLink>
                        )}
                        {canSeePlayers && (
                            <ResponsiveNavLink
                                href={route('players.mine')}
                                active={route().current('players.mine')}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FaUsers className="h-4 w-4" />
                                    Mis jugadores
                                </span>
                            </ResponsiveNavLink>
                        )}
                        {canSeeAttendances && (
                            <ResponsiveNavLink
                                href={route('attendances.index')}
                                active={route().current('attendances.index')}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FaCalendarCheck className="h-4 w-4" />
                                    Asistencias
                                </span>
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-brand-light/40 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-brand-dark">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-brand-dark/70">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
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
                <header className="bg-brand-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
