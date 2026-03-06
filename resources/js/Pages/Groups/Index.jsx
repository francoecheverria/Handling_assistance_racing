import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FaCalendarAlt, FaPlusCircle, FaUsers } from 'react-icons/fa';

export default function GroupsIndex({ groups, can }) {
    const createGroupForm = useForm({
        name: '',
        schedule: '',
        category_year: '',
    });

    const onCreateGroup = (e) => {
        e.preventDefault();
        createGroupForm.post(route('groups.store'), {
            preserveScroll: true,
            onSuccess: () => createGroupForm.reset(),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Mis tiras
                </h2>
            }
        >
            <Head title="Mis tiras" />

            <div className="py-12">
                <div className="mx-auto grid max-w-7xl gap-6 sm:px-6 lg:px-8">
                    {can?.createGroup && (
                        <div className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-brand-dark">
                                <h3 className="mb-4 text-lg font-semibold">
                                    <span className="inline-flex items-center gap-2">
                                        <FaPlusCircle className="h-4 w-4 text-brand-primary" />
                                        Crear nueva tira
                                    </span>
                                </h3>
                                <form
                                    onSubmit={onCreateGroup}
                                    className="grid gap-3 md:grid-cols-4"
                                >
                                    <input
                                        className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                        placeholder="Nombre de la tira (ej: Tira 1)"
                                        value={createGroupForm.data.name}
                                        onChange={(e) =>
                                            createGroupForm.setData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <input
                                        type="datetime-local"
                                        className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                        title="Fecha y horario"
                                        value={createGroupForm.data.schedule}
                                        onChange={(e) =>
                                            createGroupForm.setData(
                                                'schedule',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <input
                                        type="number"
                                        className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                        placeholder="Categoría (ej: 2010)"
                                        value={createGroupForm.data.category_year}
                                        onChange={(e) =>
                                            createGroupForm.setData(
                                                'category_year',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <button
                                        type="submit"
                                        className="rounded bg-brand-primary px-4 py-2 font-semibold text-brand-white transition hover:bg-brand-dark"
                                        disabled={createGroupForm.processing}
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <FaPlusCircle className="h-4 w-4" />
                                            Crear tira
                                        </span>
                                    </button>
                                </form>
                                {createGroupForm.errors.name && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {createGroupForm.errors.name}
                                    </p>
                                )}
                                {createGroupForm.errors.schedule && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {createGroupForm.errors.schedule}
                                    </p>
                                )}
                                {createGroupForm.errors.category_year && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {createGroupForm.errors.category_year}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-brand-dark">
                            {groups.length === 0 ? (
                                <p>No tienes tiras asignadas por ahora.</p>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {groups.map((group) => (
                                        <Link
                                            key={group.id}
                                            href={route('groups.show', group.id)}
                                            className="rounded-lg border border-brand-light/40 p-4 transition hover:bg-brand-light/15"
                                        >
                                            <h3 className="text-lg font-semibold text-brand-dark">
                                                {group.name}
                                            </h3>
                                            <p className="mt-2 text-sm text-brand-dark/80">
                                                <span className="inline-flex items-center gap-1">
                                                    <FaCalendarAlt className="h-3.5 w-3.5" />
                                                    Horario:
                                                </span>{' '}
                                                {group.schedule || 'Sin definir'}
                                            </p>
                                            <p className="text-sm text-brand-dark/80">
                                                Categoría:{' '}
                                                {group.category_year || 'Sin definir'}
                                            </p>
                                            <p className="text-sm text-brand-dark/80">
                                                <span className="inline-flex items-center gap-1">
                                                    <FaUsers className="h-3.5 w-3.5" />
                                                    Jugadores:
                                                </span>{' '}
                                                {group.players_count ?? 0}
                                            </p>
                                            <p className="mt-1 text-sm text-brand-dark/80">
                                                Profes:{' '}
                                                {(group.coaches || [])
                                                    .map((coach) => coach.name)
                                                    .join(', ') || 'Sin asignar'}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
