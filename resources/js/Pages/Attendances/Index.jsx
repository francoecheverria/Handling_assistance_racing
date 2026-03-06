import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FaFilter, FaHistory } from 'react-icons/fa';

export default function AttendancesIndex({ sessions = [], groups = [], filters = {} }) {
    const filterForm = useForm({
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        group_id: filters.group_id || '',
    });

    const onFilter = (e) => {
        e.preventDefault();

        router.get(route('attendances.index'), filterForm.data, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-dark">
                    <span className="inline-flex items-center gap-2">
                        <FaHistory className="h-4 w-4 text-brand-primary" />
                        Asistencias
                    </span>
                </h2>
            }
        >
            <Head title="Asistencias" />

            <div className="py-12">
                <div className="mx-auto grid max-w-7xl gap-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-4 text-lg font-semibold text-brand-dark">
                                Filtros
                            </h3>
                            <form
                                onSubmit={onFilter}
                                className="grid gap-3 md:grid-cols-4"
                            >
                                <input
                                    type="date"
                                    className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                    value={filterForm.data.date_from}
                                    onChange={(e) =>
                                        filterForm.setData('date_from', e.target.value)
                                    }
                                />
                                <input
                                    type="date"
                                    className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                    value={filterForm.data.date_to}
                                    onChange={(e) =>
                                        filterForm.setData('date_to', e.target.value)
                                    }
                                />
                                <select
                                    className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                    value={filterForm.data.group_id}
                                    onChange={(e) =>
                                        filterForm.setData('group_id', e.target.value)
                                    }
                                >
                                    <option value="">Todas las tiras</option>
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="submit"
                                    className="rounded bg-brand-primary px-4 py-2 font-semibold text-brand-white hover:bg-brand-dark"
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <FaFilter className="h-3.5 w-3.5" />
                                        Filtrar
                                    </span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {sessions.length === 0 ? (
                        <div className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-brand-dark/80">
                                No hay asistencias registradas.
                            </div>
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <div
                                key={session.id}
                                className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg"
                            >
                                <div className="border-b border-brand-light/40 p-6">
                                    <h3 className="text-lg font-semibold text-brand-dark">
                                        {session.group?.name || 'Tira'}
                                    </h3>
                                    <p className="text-sm text-brand-dark/80">
                                        Fecha y hora:{' '}
                                        {new Date(session.scheduled_at).toLocaleString(
                                            'es-AR',
                                        )}
                                    </p>
                                    <p className="text-sm text-brand-dark/80">
                                        Cargado por:{' '}
                                        {session.taken_by_user?.name || 'Sistema'}
                                    </p>
                                </div>

                                <div className="p-6">
                                    <div className="overflow-x-auto rounded-xl border border-brand-light/40">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-brand-light/20">
                                                <tr>
                                                    <th className="border border-brand-light/40 px-3 py-2 text-left">
                                                        Alumno
                                                    </th>
                                                    <th className="border border-brand-light/40 px-3 py-2 text-left">
                                                        DNI
                                                    </th>
                                                    <th className="border border-brand-light/40 px-3 py-2 text-left">
                                                        Estado
                                                    </th>
                                                    <th className="border border-brand-light/40 px-3 py-2 text-left">
                                                        Observaciones
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(session.records || []).map((record) => (
                                                    <tr key={record.id}>
                                                        <td className="border border-brand-light/40 px-3 py-2">
                                                            {record.player?.full_name}
                                                        </td>
                                                        <td className="border border-brand-light/40 px-3 py-2">
                                                            {record.player?.dni}
                                                        </td>
                                                        <td className="border border-brand-light/40 px-3 py-2 capitalize">
                                                            {record.status}
                                                        </td>
                                                        <td className="border border-brand-light/40 px-3 py-2">
                                                            {record.notes || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
