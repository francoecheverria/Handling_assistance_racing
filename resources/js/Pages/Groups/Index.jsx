import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import SchedulePicker from '@/Components/SchedulePicker';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaCalendarAlt, FaEdit, FaPlusCircle, FaSave, FaUsers } from 'react-icons/fa';

export default function GroupsIndex({ groups, can }) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const createGroupForm = useForm({
        name: '',
        schedule: '',
        description: '',
        category_year: '',
    });

    const onCreateGroup = (e) => {
        e.preventDefault();
        createGroupForm.post(route('groups.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createGroupForm.reset();
                setShowCreateModal(false);
            },
        });
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        createGroupForm.reset();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Mis tiras
                    </h2>
                    {can?.createGroup && (
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
                        >
                            <FaPlusCircle className="h-4 w-4" />
                            Crear tira
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Mis tiras" />

            <div className="py-12">
                <div className="mx-auto grid max-w-7xl gap-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-brand-dark">
                            {groups.length === 0 ? (
                                <p>No tienes tiras asignadas por ahora.</p>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {groups.map((group) => (
                                        <div
                                            key={group.id}
                                            className="rounded-lg border border-brand-light/40 p-4 transition hover:bg-brand-light/15"
                                        >
                                            <Link
                                                href={route('groups.show', group.id)}
                                                className="block"
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
                                            <Link
                                                href={`${route('groups.show', group.id)}?edit=1`}
                                                className="mt-2 inline-flex items-center gap-1 text-sm text-brand-primary hover:underline"
                                            >
                                                <FaEdit className="h-3.5 w-3.5" />
                                                Editar tira
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {can?.createGroup && (
                <Modal
                    show={showCreateModal}
                    onClose={closeCreateModal}
                    maxWidth="lg"
                >
                    <div className="p-6">
                        <h3 className="mb-4 text-lg font-semibold text-brand-dark">
                            Crear nueva tira
                        </h3>
                        <form
                            onSubmit={onCreateGroup}
                            className="flex flex-col gap-4"
                        >
                            <div>
                                <label className="mb-1 block text-sm font-medium text-brand-dark">
                                    Nombre de la tira *
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                    placeholder="Ej: Tira 1"
                                    value={createGroupForm.data.name}
                                    onChange={(e) =>
                                        createGroupForm.setData(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                />
                                {createGroupForm.errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {createGroupForm.errors.name}
                                    </p>
                                )}
                            </div>
                            <SchedulePicker
                                value={createGroupForm.data.schedule}
                                onChange={(v) =>
                                    createGroupForm.setData('schedule', v)
                                }
                                error={createGroupForm.errors.schedule}
                            />
                            <div>
                                <label className="mb-1 block text-sm font-medium text-brand-dark">
                                    Texto / descripción (opcional)
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                    placeholder="Información adicional"
                                    value={createGroupForm.data.description}
                                    onChange={(e) =>
                                        createGroupForm.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-brand-dark">
                                    Categoría (año) *
                                </label>
                                <input
                                    type="number"
                                    min="1990"
                                    max="2100"
                                    className="w-full rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                    placeholder="Ej: 2010"
                                    value={createGroupForm.data.category_year}
                                    onChange={(e) =>
                                        createGroupForm.setData(
                                            'category_year',
                                            e.target.value,
                                        )
                                    }
                                />
                                {createGroupForm.errors.category_year && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {createGroupForm.errors.category_year}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded bg-brand-primary px-4 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-70"
                                    disabled={createGroupForm.processing}
                                >
                                    <FaSave className="h-4 w-4" />
                                    Crear tira
                                </button>
                                <button
                                    type="button"
                                    className="rounded border border-brand-light/50 px-4 py-2 text-brand-dark hover:bg-brand-light/15"
                                    onClick={closeCreateModal}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}
