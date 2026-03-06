import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import SchedulePicker from '@/Components/SchedulePicker';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaCalendarAlt, FaEdit, FaPlusCircle, FaSave, FaTrashAlt, FaUsers } from 'react-icons/fa';

export default function GroupsIndex({ groups = [], coaches = [], can }) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const createGroupForm = useForm({
        name: '',
        schedule: '',
        description: '',
        categories: [new Date().getFullYear()],
        coach_ids: [],
    });

    const toggleCoachInCreate = (coachId) => {
        const ids = createGroupForm.data.coach_ids.includes(coachId)
            ? createGroupForm.data.coach_ids.filter((id) => id !== coachId)
            : [...createGroupForm.data.coach_ids, coachId];
        createGroupForm.setData('coach_ids', ids);
    };

    const onCreateGroup = (e) => {
        e.preventDefault();
        const payload = {
            ...createGroupForm.data,
            categories: createGroupForm.data.categories.filter((y) => y !== '' && y != null).map(Number),
            coach_ids: createGroupForm.data.coach_ids || [],
        };
        if (payload.categories.length === 0) payload.categories = [new Date().getFullYear()];
        router.post(route('groups.store'), payload, {
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
                                                Categorías:{' '}
                                                {(group.categories || [])
                                                    .map((c) => c.category_year)
                                                    .filter(Boolean)
                                                    .join(', ') || 'Sin definir'}
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
                                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                                <Link
                                                    href={`${route('groups.show', group.id)}?edit=1`}
                                                    className="inline-flex items-center gap-1 text-sm text-brand-primary hover:underline"
                                                >
                                                    <FaEdit className="h-3.5 w-3.5" />
                                                    Editar tira
                                                </Link>
                                                {can?.deleteGroup && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (!confirm('¿Eliminar esta tira? Se borrarán también sus jugadores y asistencias.')) return;
                                                            router.delete(route('groups.destroy', group.id), { preserveScroll: true });
                                                        }}
                                                        className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline"
                                                    >
                                                        <FaTrashAlt className="h-3.5 w-3.5" />
                                                        Borrar tira
                                                    </button>
                                                )}
                                            </div>
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
                                <InputError message={createGroupForm.errors.name} className="mt-1" />
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
                                    Categorías (años) *
                                </label>
                                {(createGroupForm.data.categories || []).map((year, idx) => (
                                    <div key={idx} className="mb-2 flex gap-2">
                                        <input
                                            type="number"
                                            min="1990"
                                            max="2100"
                                            className="w-28 rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                            placeholder="Ej: 2010"
                                            value={year === '' ? '' : year}
                                            onChange={(e) => {
                                                const next = [...(createGroupForm.data.categories || [])];
                                                next[idx] = e.target.value === '' ? '' : Number(e.target.value);
                                                createGroupForm.setData('categories', next);
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="rounded border border-red-300 px-2 text-red-600 hover:bg-red-50"
                                            onClick={() => {
                                                const next = (createGroupForm.data.categories || []).filter((_, i) => i !== idx);
                                                if (next.length === 0) next.push(new Date().getFullYear());
                                                createGroupForm.setData('categories', next);
                                            }}
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="mt-1 text-sm text-brand-primary hover:underline"
                                    onClick={() =>
                                        createGroupForm.setData('categories', [
                                            ...(createGroupForm.data.categories || []),
                                            new Date().getFullYear(),
                                        ])
                                    }
                                >
                                    + Añadir categoría
                                </button>
                                <InputError message={createGroupForm.errors.categories} className="mt-1" />
                            </div>
                            {coaches.length > 0 && (
                                <div className="rounded border border-brand-light/40 bg-brand-light/10 p-3">
                                    <p className="mb-2 text-sm font-medium text-brand-dark">
                                        Profesores a asignar
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {coaches.map((coach) => (
                                            <label
                                                key={coach.id}
                                                className="flex cursor-pointer items-center gap-2 text-sm text-brand-dark"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={(createGroupForm.data.coach_ids || []).includes(coach.id)}
                                                    onChange={() => toggleCoachInCreate(coach.id)}
                                                />
                                                {coach.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
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
