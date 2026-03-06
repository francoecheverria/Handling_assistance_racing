import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, canLogin, canRegister }) {
    return (
        <>
            <Head title="Sistema de Gestion" />
            <div className="flex min-h-screen items-center justify-center bg-brand-white px-6">
                <div className="w-full max-w-3xl rounded-2xl border border-brand-light/40 bg-brand-white p-8 text-center shadow-sm md:p-12">
                    <img
                        src="/images/logo.png"
                        alt="Logo del sistema"
                        className="mx-auto h-24 w-auto md:h-28"
                    />

                    <h1 className="mt-6 text-3xl font-bold text-brand-dark md:text-4xl">
                        Gestion de Alumnos
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-base text-brand-dark/80 md:text-lg">
                        Plataforma para administrar profesores, tiras y alumnos
                        en un solo lugar. Permite centralizar la informacion,
                        mejorar el seguimiento y agilizar la gestion diaria.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-lg bg-brand-primary px-6 py-3 font-semibold text-brand-white transition hover:bg-brand-dark"
                            >
                                Ir al dashboard
                            </Link>
                        ) : (
                            <>
                                {canLogin && (
                                    <Link
                                        href={route('login')}
                                        className="rounded-lg bg-brand-primary px-6 py-3 font-semibold text-brand-white transition hover:bg-brand-dark"
                                    >
                                        Login
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link
                                        href={route('register')}
                                        className="rounded-lg border border-brand-primary px-6 py-3 font-semibold text-brand-primary transition hover:bg-brand-light/20"
                                    >
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
