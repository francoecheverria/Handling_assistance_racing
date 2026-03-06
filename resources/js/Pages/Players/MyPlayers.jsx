import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    FaCalendarAlt,
    FaClipboardList,
    FaUserCheck,
    FaUserClock,
    FaUsers,
} from 'react-icons/fa';

export default function MyPlayers({ groups = [] }) {
    const totalPlayers = groups.reduce(
        (acc, group) =>
            acc +
            (group.categories || []).reduce(
                (s, cat) => s + (cat.players?.length || 0),
                0,
            ),
        0,
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-dark">
                    Mis jugadores
                </h2>
            }
        >
            <Head title="Mis jugadores" />

            <div className="py-8 sm:py-12">
                <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
                    {/* Resumen */}
                    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand-light/40 bg-gradient-to-br from-brand-light/15 to-brand-white p-6 shadow-sm">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
                            <FaUsers className="h-7 w-7 text-brand-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-brand-dark">
                                Resumen
                            </h3>
                            <p className="mt-0.5 text-sm text-brand-dark/70">
                                {groups.length} tira{groups.length !== 1 ? 's' : ''} ·{' '}
                                {totalPlayers} jugador{totalPlayers !== 1 ? 'es' : ''}{' '}
                                en total
                            </p>
                        </div>
                    </div>

                    {groups.length === 0 ? (
                        <div className="rounded-2xl border border-brand-light/40 bg-brand-white p-12 text-center shadow-sm">
                            <FaClipboardList className="mx-auto h-12 w-12 text-brand-light" />
                            <p className="mt-4 text-brand-dark">
                                No hay tiras ni jugadores asociados por ahora.
                            </p>
                            <p className="mt-1 text-sm text-brand-dark/70">
                                Asignate tiras desde el perfil de profesor o pedí
                                acceso al administrador.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {groups.map((group) => {
                                const playerCount = (group.categories || []).reduce(
                                    (s, cat) => s + (cat.players?.length || 0),
                                    0,
                                );
                                return (
                                    <section
                                        key={group.id}
                                        className="overflow-hidden rounded-2xl border border-brand-light/40 bg-brand-white shadow-sm"
                                    >
                                        {/* Encabezado de la tira */}
                                        <div className="border-b border-brand-light/30 bg-brand-light/5">
                                            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex min-w-0 flex-1 items-start gap-4">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-brand-primary/30 bg-brand-primary/10">
                                                        <FaClipboardList className="h-6 w-6 text-brand-primary" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-xl font-bold text-brand-dark">
                                                                {group.name}
                                                            </h3>
                                                            <span className="inline-flex items-center rounded-full bg-brand-primary/15 px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
                                                                {playerCount} jugador
                                                                {playerCount !== 1 ? 'es' : ''}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-dark/70">
                                                            {group.schedule && (
                                                                <span className="inline-flex items-center gap-1.5">
                                                                    <FaCalendarAlt className="h-3.5 w-3.5 shrink-0" />
                                                                    {group.schedule}
                                                                </span>
                                                            )}
                                                            {(group.categories || []).length > 0 && (
                                                                <span>
                                                                    Categorías{' '}
                                                                    {(group.categories || [])
                                                                        .map((c) => c.category_year)
                                                                        .join(', ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={route(
                                                        'groups.show',
                                                        group.id,
                                                    )}
                                                    className="shrink-0 rounded-lg border-2 border-brand-primary bg-brand-white px-4 py-2.5 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
                                                >
                                                    Ver tira
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Listado de jugadores por categoría */}
                                        <div className="p-5 space-y-6">
                                            {playerCount === 0 ? (
                                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-light/50 bg-brand-light/5 py-10">
                                                    <FaUsers className="h-10 w-10 text-brand-light" />
                                                    <p className="mt-3 text-sm font-medium text-brand-dark/80">
                                                        Esta tira no tiene
                                                        jugadores cargados
                                                    </p>
                                                    <Link
                                                        href={route(
                                                            'groups.show',
                                                            group.id,
                                                        )}
                                                        className="mt-2 text-sm text-brand-primary hover:underline"
                                                    >
                                                        Ir a la tira para agregar
                                                    </Link>
                                                </div>
                                            ) : (
                                                (group.categories || []).map((category) => (
                                                    <div key={category.id}>
                                                        <h4 className="mb-2 text-sm font-semibold text-brand-dark">
                                                            Categoría {category.category_year}
                                                        </h4>
                                                        <div className="overflow-hidden rounded-xl border border-brand-light/30">
                                                            <table className="min-w-full text-sm">
                                                                <thead>
                                                                    <tr className="bg-brand-light/15">
                                                                        <th className="px-4 py-3 text-left font-semibold text-brand-dark">
                                                                            Jugador
                                                                        </th>
                                                                        <th className="px-4 py-3 text-left font-semibold text-brand-dark">
                                                                            DNI
                                                                        </th>
                                                                        <th className="px-4 py-3 text-left font-semibold text-brand-dark">
                                                                            Socio
                                                                        </th>
                                                                        <th className="px-4 py-3 text-left font-semibold text-brand-dark">
                                                                            Ficha médica
                                                                        </th>
                                                                        <th className="px-4 py-3 text-left font-semibold text-brand-dark">
                                                                            Fichaje
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-brand-light/20">
                                                                    {(category.players || []).map(
                                                                        (player, idx) => (
                                                                            <tr
                                                                                key={player.id}
                                                                                className={
                                                                                    idx % 2 === 0
                                                                                        ? 'bg-brand-white'
                                                                                        : 'bg-brand-light/5'
                                                                                }
                                                                            >
                                                                                <td className="px-4 py-3 font-medium text-brand-dark">
                                                                                    {player.full_name}
                                                                                </td>
                                                                                <td className="px-4 py-3 text-brand-dark/80">
                                                                                    {player.dni}
                                                                                </td>
                                                                                <td className="px-4 py-3 text-brand-dark/80">
                                                                                    {player.numero_socio || '-'}
                                                                                </td>
                                                                                <td className="px-4 py-3">
                                                                                    {player.medical_check ? (
                                                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                                                            <FaUserCheck className="h-3 w-3" />
                                                                                            OK
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                                                                            <FaUserClock className="h-3 w-3" />
                                                                                            Pendiente
                                                                                        </span>
                                                                                    )}
                                                                                </td>
                                                                                <td className="px-4 py-3">
                                                                                    {player.registered ? (
                                                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                                                            <FaUserCheck className="h-3 w-3" />
                                                                                            OK
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                                                                            <FaUserClock className="h-3 w-3" />
                                                                                            Pendiente
                                                                                        </span>
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        ),
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
