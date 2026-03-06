import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function MyPlayers({ groups = [] }) {
    const totalPlayers = groups.reduce(
        (acc, group) => acc + (group.players?.length || 0),
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

            <div className="py-12">
                <div className="mx-auto grid max-w-7xl gap-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-brand-dark">
                            <p className="text-sm text-brand-dark/80">
                                Total de alumnos asociados: {totalPlayers}
                            </p>
                        </div>
                    </div>

                    {groups.length === 0 ? (
                        <div className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-brand-dark">
                                No hay tiras/alumnos asociados por ahora.
                            </div>
                        </div>
                    ) : (
                        groups.map((group) => (
                            <div
                                key={group.id}
                                className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg"
                            >
                                <div className="border-b border-brand-light/40 p-6">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-brand-dark">
                                                {group.name}
                                            </h3>
                                            <p className="text-sm text-brand-dark/80">
                                                Horario: {group.schedule || 'Sin definir'}
                                            </p>
                                        </div>
                                        <Link
                                            href={route('groups.show', group.id)}
                                            className="rounded-md border border-brand-primary px-3 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-light/20"
                                        >
                                            Ver tira
                                        </Link>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {(group.players?.length || 0) === 0 ? (
                                        <p className="text-sm text-brand-dark/80">
                                            Esta tira no tiene alumnos cargados.
                                        </p>
                                    ) : (
                                        <div className="overflow-x-auto rounded-xl border border-brand-light/40">
                                            <table className="min-w-full text-sm">
                                                <thead className="bg-brand-light/20">
                                                    <tr>
                                                        <th className="border border-brand-light/40 px-3 py-2 text-left">
                                                            Nombre
                                                        </th>
                                                        <th className="border border-brand-light/40 px-3 py-2 text-left">
                                                            DNI
                                                        </th>
                                                        <th className="border border-brand-light/40 px-3 py-2 text-left">
                                                            Socio
                                                        </th>
                                                        <th className="border border-brand-light/40 px-3 py-2 text-left">
                                                            Ficha médica
                                                        </th>
                                                        <th className="border border-brand-light/40 px-3 py-2 text-left">
                                                            Fichaje
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.players.map((player) => (
                                                        <tr key={player.id}>
                                                            <td className="border border-brand-light/40 px-3 py-2">
                                                                {player.full_name}
                                                            </td>
                                                            <td className="border border-brand-light/40 px-3 py-2">
                                                                {player.dni}
                                                            </td>
                                                            <td className="border border-brand-light/40 px-3 py-2">
                                                                {player.numero_socio || '-'}
                                                            </td>
                                                            <td className="border border-brand-light/40 px-3 py-2">
                                                                {player.medical_check
                                                                    ? 'OK'
                                                                    : 'Pendiente'}
                                                            </td>
                                                            <td className="border border-brand-light/40 px-3 py-2">
                                                                {player.registered
                                                                    ? 'OK'
                                                                    : 'Pendiente'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
