import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaEdit, FaPlusCircle, FaSave, FaTrashAlt, FaChalkboardTeacher } from 'react-icons/fa';

const emptyCoach = {
    name: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: '',
    group_ids: [],
};

export default function CoachesIndex({ coaches, groups = [] }) {
    const [editingCoachId, setEditingCoachId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const createForm = useForm(emptyCoach);
    const updateForm = useForm(emptyCoach);

    const onCreateCoach = (e) => {
        e.preventDefault();
        createForm.post(route('coaches.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setShowCreateModal(false);
            },
        });
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        createForm.reset();
    };

    const startEditing = (coach) => {
        setEditingCoachId(coach.id);
        updateForm.setData({
            name: coach.name || '',
            phone: coach.phone || '',
            email: coach.email || coach.user?.email || '',
            password: '',
            password_confirmation: '',
            group_ids: (coach.groups || []).map((g) => g.id),
        });
    };

    const toggleGroupInCreate = (groupId) => {
        const ids = createForm.data.group_ids.includes(groupId)
            ? createForm.data.group_ids.filter((id) => id !== groupId)
            : [...createForm.data.group_ids, groupId];
        createForm.setData('group_ids', ids);
    };

    const toggleGroupInUpdate = (groupId) => {
        const ids = updateForm.data.group_ids.includes(groupId)
            ? updateForm.data.group_ids.filter((id) => id !== groupId)
            : [...updateForm.data.group_ids, groupId];
        updateForm.setData('group_ids', ids);
    };

    const cancelEditing = () => {
        setEditingCoachId(null);
        updateForm.reset();
    };

    const onUpdateCoach = (e) => {
        e.preventDefault();
        if (!editingCoachId) return;

        updateForm.put(route('coaches.update', editingCoachId), {
            preserveScroll: true,
            onSuccess: () => cancelEditing(),
        });
    };

    const onDeleteCoach = (coachId) => {
        if (!confirm('¿Seguro que deseas eliminar este profesor?')) {
            return;
        }

        router.delete(route('coaches.destroy', coachId), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-dark">
                    Profesores
                </h2>
            }
        >
            <Head title="Profesores" />

            <div className="py-12">
                <div className="mx-auto grid max-w-7xl gap-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-lg font-semibold">
                                    <span className="inline-flex items-center gap-2">
                                        <FaChalkboardTeacher className="h-4 w-4 text-brand-primary" />
                                        Listado de profesores
                                    </span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-brand-white hover:bg-brand-dark"
                                >
                                    <FaPlusCircle className="h-4 w-4" />
                                    Crear profesor
                                </button>
                            </div>

                            {coaches.length === 0 ? (
                                <p className="text-brand-dark/80">
                                    No hay profesores cargados.
                                </p>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-brand-light/40">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-brand-light/20">
                                            <tr>
                                                <th className="border px-3 py-2 text-left">
                                                    Nombre
                                                </th>
                                                <th className="border px-3 py-2 text-left">
                                                    Teléfono
                                                </th>
                                                <th className="border px-3 py-2 text-left">
                                                    Tiras
                                                </th>
                                                <th className="border px-3 py-2 text-left">
                                                    Usuario (acceso)
                                                </th>
                                                <th className="border px-3 py-2 text-left">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {coaches.map((coach) => (
                                                <tr key={coach.id}>
                                                    <td className="border px-3 py-2">
                                                        {coach.name}
                                                    </td>
                                                    <td className="border px-3 py-2">
                                                        {coach.phone || '-'}
                                                    </td>
                                                    <td className="border px-3 py-2">
                                                        {(coach.groups && coach.groups.length > 0)
                                                            ? coach.groups.map((g) => g.name).join(', ')
                                                            : '-'}
                                                    </td>
                                                    <td className="border px-3 py-2">
                                                        {coach.email || coach.user?.email || '-'}
                                                    </td>
                                                    <td className="border px-3 py-2">
                                                        <div className="flex gap-3">
                                                            <button
                                                                className="text-brand-primary hover:underline"
                                                                onClick={() =>
                                                                    startEditing(coach)
                                                                }
                                                            >
                                                                <span className="inline-flex items-center gap-1">
                                                                    <FaEdit className="h-3.5 w-3.5" />
                                                                    Editar
                                                                </span>
                                                            </button>
                                                            <button
                                                                className="text-red-600 hover:underline"
                                                                onClick={() =>
                                                                    onDeleteCoach(coach.id)
                                                                }
                                                            >
                                                                <span className="inline-flex items-center gap-1">
                                                                    <FaTrashAlt className="h-3.5 w-3.5" />
                                                                    Eliminar
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={Boolean(editingCoachId)} onClose={cancelEditing} maxWidth="md">
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-brand-dark">
                        Editar profesor
                    </h3>
                    <form onSubmit={onUpdateCoach} className="grid gap-3">
                        <input
                            type="text"
                            className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                            placeholder="Nombre *"
                            value={updateForm.data.name}
                            onChange={(e) =>
                                updateForm.setData('name', e.target.value)
                            }
                        />
                        <InputError message={updateForm.errors.name} className="mt-1" />
                        <div>
                            <label className="mb-1 block text-sm font-medium text-brand-dark">
                                Email (para iniciar sesión)
                            </label>
                            <input
                                type="email"
                                className="w-full rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="profesor@ejemplo.com"
                                value={updateForm.data.email}
                                onChange={(e) =>
                                    updateForm.setData('email', e.target.value)
                                }
                            />
                            <InputError message={updateForm.errors.email} className="mt-1" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-brand-dark">
                                Nueva contraseña (dejar en blanco para no cambiar)
                            </label>
                            <input
                                type="password"
                                className="w-full rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="••••••••"
                                value={updateForm.data.password}
                                onChange={(e) =>
                                    updateForm.setData('password', e.target.value)
                                }
                            />
                            <InputError message={updateForm.errors.password} className="mt-1" />
                            <input
                                type="password"
                                className="mt-2 w-full rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Confirmar nueva contraseña"
                                value={updateForm.data.password_confirmation}
                                onChange={(e) =>
                                    updateForm.setData('password_confirmation', e.target.value)
                                }
                            />
                        </div>
                        <input
                            className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                            placeholder="Teléfono"
                            value={updateForm.data.phone}
                            onChange={(e) =>
                                updateForm.setData('phone', e.target.value)
                            }
                        />
                        {groups.length > 0 && (
                            <div className="rounded border border-brand-light/40 bg-brand-light/10 p-3">
                                <p className="mb-2 text-sm font-medium text-brand-dark">
                                    Tiras asociadas
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {groups.map((group) => (
                                        <label
                                            key={group.id}
                                            className="flex cursor-pointer items-center gap-2 text-sm text-brand-dark"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={updateForm.data.group_ids.includes(group.id)}
                                                onChange={() => toggleGroupInUpdate(group.id)}
                                            />
                                            {group.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="rounded bg-brand-primary px-4 py-2 text-brand-white hover:bg-brand-dark"
                                disabled={updateForm.processing}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FaSave className="h-4 w-4" />
                                    Guardar cambios
                                </span>
                            </button>
                            <button
                                type="button"
                                className="rounded border border-brand-light/50 px-4 py-2 text-brand-dark hover:bg-brand-light/15"
                                onClick={cancelEditing}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={showCreateModal} onClose={closeCreateModal} maxWidth="md">
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-brand-dark">
                        Nuevo profesor
                    </h3>
                    <form onSubmit={onCreateCoach} className="grid gap-3">
                        <input
                            type="text"
                            className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                            placeholder="Nombre *"
                            value={createForm.data.name}
                            onChange={(e) =>
                                createForm.setData('name', e.target.value)
                            }
                        />
                        <InputError message={createForm.errors.name} className="mt-1" />
                        <div>
                            <label className="mb-1 block text-sm font-medium text-brand-dark">
                                Email (para iniciar sesión) *
                            </label>
                            <input
                                type="email"
                                className="w-full rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="profesor@ejemplo.com"
                                value={createForm.data.email}
                                onChange={(e) =>
                                    createForm.setData('email', e.target.value)
                                }
                            />
                            <InputError message={createForm.errors.email} className="mt-1" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-brand-dark">
                                Contraseña * (mín. 8 caracteres)
                            </label>
                            <input
                                type="password"
                                className="w-full rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Contraseña"
                                value={createForm.data.password}
                                onChange={(e) =>
                                    createForm.setData('password', e.target.value)
                                }
                            />
                            <InputError message={createForm.errors.password} className="mt-1" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-brand-dark">
                                Confirmar contraseña *
                            </label>
                            <input
                                type="password"
                                className="w-full rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Repetir contraseña"
                                value={createForm.data.password_confirmation}
                                onChange={(e) =>
                                    createForm.setData('password_confirmation', e.target.value)
                                }
                            />
                            <InputError message={createForm.errors.password_confirmation} className="mt-1" />
                        </div>
                        <input
                            className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                            placeholder="Teléfono"
                            value={createForm.data.phone}
                            onChange={(e) =>
                                createForm.setData('phone', e.target.value)
                            }
                        />
                        {groups.length > 0 && (
                            <div className="rounded border border-brand-light/40 bg-brand-light/10 p-3">
                                <p className="mb-2 text-sm font-medium text-brand-dark">
                                    Tiras a asociar
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {groups.map((group) => (
                                        <label
                                            key={group.id}
                                            className="flex cursor-pointer items-center gap-2 text-sm text-brand-dark"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={createForm.data.group_ids.includes(group.id)}
                                                onChange={() => toggleGroupInCreate(group.id)}
                                            />
                                            {group.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="rounded bg-brand-primary px-4 py-2 text-brand-white hover:bg-brand-dark"
                                disabled={createForm.processing}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FaSave className="h-4 w-4" />
                                    Guardar profesor
                                </span>
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
        </AuthenticatedLayout>
    );
}
