import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    FaCalendarAlt,
    FaCheck,
    FaFilter,
    FaHistory,
    FaMinus,
    FaTimes,
    FaUserEdit,
} from 'react-icons/fa';

const STATUS_CONFIG = {
    present: {
        label: 'Presente',
        icon: FaCheck,
        className: 'bg-green-100 text-green-800',
    },
    absent: {
        label: 'Ausente',
        icon: FaTimes,
        className: 'bg-red-100 text-red-800',
    },
    pending: {
        label: 'Pendiente',
        icon: FaMinus,
        className: 'bg-amber-100 text-amber-800',
    },
};

function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
        >
            <Icon className="h-3 w-3" />
            {config.label}
        </span>
    );
}

function groupRecordsByCategory(records) {
    const byCategory = new Map();
    (records || []).forEach((record) => {
        const year = record.player?.category?.category_year;
        const key = year != null ? year : 'sin_categoria';
        if (!byCategory.has(key)) byCategory.set(key, []);
        byCategory.get(key).push(record);
    });
    const keys = [...byCategory.keys()].sort((a, b) => {
        if (a === 'sin_categoria') return 1;
        if (b === 'sin_categoria') return -1;
        return Number(a) - Number(b);
    });
    return keys.map((key) => ({
        key,
        label: key === 'sin_categoria' ? 'Sin categoría' : `Categoría ${key}`,
        records: byCategory.get(key),
    }));
}

export default function AttendancesIndex({
    sessions = [],
    groups = [],
    filters = {},
}) {
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

    const totalRecords = sessions.reduce(
        (acc, s) => acc + (s.records?.length || 0),
        0,
    );

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

            <div className="py-8 sm:py-12">
                <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
                    {/* Resumen */}
                    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand-light/40 bg-gradient-to-br from-brand-light/15 to-brand-white p-6 shadow-sm">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
                            <FaHistory className="h-7 w-7 text-brand-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-brand-dark">
                                Historial de asistencias
                            </h3>
                            <p className="mt-0.5 text-sm text-brand-dark/70">
                                {sessions.length} sesión{sessions.length !== 1 ? 'es' : ''} ·{' '}
                                {totalRecords} registro{totalRecords !== 1 ? 's' : ''} en total
                            </p>
                        </div>
                    </div>

                    {/* Filtros */}
                    <section className="overflow-hidden rounded-2xl border border-brand-light/40 bg-brand-white shadow-sm">
                        <div className="border-b border-brand-light/30 bg-brand-light/5 px-5 py-4">
                            <h3 className="text-base font-semibold text-brand-dark">
                                Filtros
                            </h3>
                        </div>
                        <form onSubmit={onFilter} className="p-5">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-brand-dark/80">
                                        Desde
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full rounded-lg border border-brand-light/50 bg-brand-white px-3 py-2 text-brand-dark"
                                        value={filterForm.data.date_from}
                                        onChange={(e) =>
                                            filterForm.setData(
                                                'date_from',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-brand-dark/80">
                                        Hasta
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full rounded-lg border border-brand-light/50 bg-brand-white px-3 py-2 text-brand-dark"
                                        value={filterForm.data.date_to}
                                        onChange={(e) =>
                                            filterForm.setData(
                                                'date_to',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-brand-dark/80">
                                        Tira
                                    </label>
                                    <select
                                        className="w-full rounded-lg border border-brand-light/50 bg-brand-white px-3 py-2 text-brand-dark"
                                        value={filterForm.data.group_id}
                                        onChange={(e) =>
                                            filterForm.setData(
                                                'group_id',
                                                e.target.value,
                                            )
                                        }
                                    >
                                        <option value="">
                                            Todas las tiras
                                        </option>
                                        {groups.map((group) => (
                                            <option
                                                key={group.id}
                                                value={group.id}
                                            >
                                                {group.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        className="w-full rounded-lg bg-brand-primary px-4 py-2.5 font-semibold text-white transition hover:bg-brand-dark sm:w-auto"
                                    >
                                        <span className="inline-flex items-center justify-center gap-2">
                                            <FaFilter className="h-4 w-4" />
                                            Filtrar
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </section>

                    {sessions.length === 0 ? (
                        <div className="rounded-2xl border border-brand-light/40 bg-brand-white p-12 text-center shadow-sm">
                            <FaHistory className="mx-auto h-12 w-12 text-brand-light" />
                            <p className="mt-4 text-brand-dark">
                                No hay asistencias registradas con los filtros
                                actuales.
                            </p>
                            <p className="mt-1 text-sm text-brand-dark/70">
                                Probá ampliar el rango de fechas o elegir otra
                                tira.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {sessions.map((session) => {
                                const recordCount =
                                    session.records?.length || 0;
                                const scheduledAt = session.scheduled_at
                                    ? new Date(session.scheduled_at)
                                    : null;
                                const dateStr = scheduledAt
                                    ? scheduledAt.toLocaleDateString('es-AR', {
                                          weekday: 'short',
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                      })
                                    : '';
                                const timeStr = scheduledAt
                                    ? scheduledAt.toLocaleTimeString('es-AR', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                      })
                                    : '';

                                return (
                                    <section
                                        key={session.id}
                                        className="overflow-hidden rounded-2xl border border-brand-light/40 bg-brand-white shadow-sm"
                                    >
                                        {/* Encabezado de la sesión */}
                                        <div className="border-b border-brand-light/30 bg-brand-light/5">
                                            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex min-w-0 flex-1 items-start gap-4">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-brand-primary/30 bg-brand-primary/10">
                                                        <FaCalendarAlt className="h-6 w-6 text-brand-primary" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-xl font-bold text-brand-dark">
                                                                {session.group?.name || 'Tira'}
                                                            </h3>
                                                            <span className="inline-flex items-center rounded-full bg-brand-primary/15 px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
                                                                {recordCount} registro
                                                                {recordCount !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-dark/70">
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <FaCalendarAlt className="h-3.5 w-3.5 shrink-0" />
                                                                {dateStr}
                                                                {timeStr && ` · ${timeStr}`}
                                                            </span>
                                                            {session.taken_by_user?.name && (
                                                                <span className="inline-flex items-center gap-1.5">
                                                                    <FaUserEdit className="h-3.5 w-3.5 shrink-0" />
                                                                    {session.taken_by_user.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Listado de registros por categoría */}
                                        <div className="p-5 space-y-6">
                                            {recordCount === 0 ? (
                                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-light/50 bg-brand-light/5 py-10">
                                                    <p className="text-sm font-medium text-brand-dark/80">
                                                        Esta sesión no tiene
                                                        registros cargados.
                                                    </p>
                                                </div>
                                            ) : (
                                                groupRecordsByCategory(session.records).map(({ key, label, records: categoryRecords }) => (
                                                    <div key={key}>
                                                        <h4 className="mb-2 text-sm font-semibold text-brand-dark">
                                                            {label}
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
                                                                            Estado
                                                                        </th>
                                                                        <th className="px-4 py-3 text-left font-semibold text-brand-dark">
                                                                            Observaciones
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-brand-light/20">
                                                                    {categoryRecords.map((record, idx) => (
                                                                        <tr
                                                                            key={record.id}
                                                                            className={
                                                                                idx % 2 === 0
                                                                                    ? 'bg-brand-white'
                                                                                    : 'bg-brand-light/5'
                                                                            }
                                                                        >
                                                                            <td className="px-4 py-3 font-medium text-brand-dark">
                                                                                {record.player?.full_name ?? '-'}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-brand-dark/80">
                                                                                {record.player?.dni ?? '-'}
                                                                            </td>
                                                                            <td className="px-4 py-3">
                                                                                <StatusBadge status={record.status} />
                                                                            </td>
                                                                            <td className="px-4 py-3 text-brand-dark/80">
                                                                                {record.notes || '-'}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
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
