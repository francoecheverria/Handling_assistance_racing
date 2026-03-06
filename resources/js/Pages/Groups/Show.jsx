import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaEdit, FaPlusCircle, FaSave, FaTrashAlt, FaUsers } from 'react-icons/fa';

const emptyPlayer = {
    nombre: '',
    apellido: '',
    dni: '',
    numero_socio: '',
    fecha_nacimiento: '',
    medical_check: false,
    imagen_compromiso: false,
    registered: false,
    scholarship: '',
    telefono: '',
    mail: '',
    notes: '',
};

export default function GroupsShow({ group, can }) {
    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const createForm = useForm(emptyPlayer);
    const updateForm = useForm(emptyPlayer);

    const onCreatePlayer = (e) => {
        e.preventDefault();
        createForm.post(route('groups.players.store', group.id), {
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

    const startEditing = (player) => {
        setEditingPlayerId(player.id);
        updateForm.setData({
            nombre: player.nombre || '',
            apellido: player.apellido || '',
            dni: player.dni || '',
            numero_socio: player.numero_socio || '',
            fecha_nacimiento: player.fecha_nacimiento
                ? player.fecha_nacimiento.slice(0, 10)
                : '',
            medical_check: Boolean(player.medical_check),
            imagen_compromiso: Boolean(player.imagen_compromiso),
            registered: Boolean(player.registered),
            scholarship: player.scholarship || '',
            telefono: player.telefono || '',
            mail: player.mail || '',
            notes: player.notes || '',
        });
    };

    const cancelEditing = () => {
        setEditingPlayerId(null);
        updateForm.reset();
    };

    const onUpdatePlayer = (e) => {
        e.preventDefault();
        if (!editingPlayerId) return;

        updateForm.put(route('groups.players.update', [group.id, editingPlayerId]), {
            preserveScroll: true,
            onSuccess: () => cancelEditing(),
        });
    };

    const onDeletePlayer = (playerId) => {
        if (!confirm('¿Seguro que deseas eliminar este jugador?')) {
            return;
        }

        router.delete(route('groups.players.destroy', [group.id, playerId]), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-dark">
                        {group.name}
                    </h2>
                    <Link
                        href={route('groups.index')}
                        className="text-sm text-brand-primary hover:underline"
                    >
                        Volver a mis tiras
                    </Link>
                </div>
            }
        >
            <Head title={`Tira ${group.name}`} />

            <div className="py-12">
                <div className="mx-auto grid max-w-7xl gap-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg">
                        <div className="space-y-2 p-6 text-brand-dark">
                            <p>
                                <span className="font-semibold">Horario:</span>{' '}
                                {group.schedule || 'Sin definir'}
                            </p>
                            <p>
                                <span className="font-semibold">Categoría:</span>{' '}
                                {group.category_year || 'Sin definir'}
                            </p>
                            <p>
                                <span className="font-semibold">Profesores:</span>{' '}
                                {(group.coaches || [])
                                    .map((coach) => coach.name)
                                    .join(', ') || 'Sin asignar'}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-lg font-semibold">
                                    <span className="inline-flex items-center gap-2">
                                        <FaUsers className="h-4 w-4 text-brand-primary" />
                                        Jugadores
                                    </span>
                                </h3>
                                {can.createPlayer && (
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(true)}
                                        className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-brand-white hover:bg-brand-dark"
                                    >
                                        <FaPlusCircle className="h-4 w-4" />
                                        Crear jugador en la tira
                                    </button>
                                )}
                            </div>

                            {group.players.length === 0 ? (
                                <p className="text-brand-dark/80">
                                    No hay jugadores cargados.
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
                                                    DNI
                                                </th>
                                                <th className="border px-3 py-2 text-left">
                                                    Socio
                                                </th>
                                                <th className="border px-3 py-2 text-left">
                                                    Ficha médica
                                                </th>
                                                <th className="border px-3 py-2 text-left">
                                                    Fichaje
                                                </th>
                                                <th className="border px-3 py-2 text-left">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.players.map((player) => (
                                                <tr key={player.id}>
                                                    <td className="border px-3 py-2">
                                                        {player.full_name}
                                                    </td>
                                                    <td className="border px-3 py-2">
                                                        {player.dni}
                                                    </td>
                                                    <td className="border px-3 py-2">
                                                        {player.numero_socio || '-'}
                                                    </td>
                                                    <td className="border px-3 py-2">
                                                        {player.medical_check
                                                            ? 'OK'
                                                            : 'Pendiente'}
                                                    </td>
                                                    <td className="border px-3 py-2">
                                                        {player.registered
                                                            ? 'OK'
                                                            : 'Pendiente'}
                                                    </td>
                                                    <td className="border px-3 py-2">
                                                        <div className="flex gap-3">
                                                            {can.editPlayer && (
                                                                <button
                                                                    className="text-brand-primary hover:underline"
                                                                    onClick={() =>
                                                                        startEditing(
                                                                            player,
                                                                        )
                                                                    }
                                                                >
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <FaEdit className="h-3.5 w-3.5" />
                                                                        Editar
                                                                    </span>
                                                                </button>
                                                            )}
                                                            {can.deletePlayer && (
                                                                <button
                                                                    className="text-red-600 hover:underline"
                                                                    onClick={() =>
                                                                        onDeletePlayer(
                                                                            player.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <FaTrashAlt className="h-3.5 w-3.5" />
                                                                        Eliminar
                                                                    </span>
                                                                </button>
                                                            )}
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

            {can.editPlayer && (
                <Modal show={Boolean(editingPlayerId)} onClose={cancelEditing} maxWidth="2xl">
                    <div className="p-6">
                        <h3 className="mb-4 text-lg font-semibold text-brand-dark">
                            Editar jugador
                        </h3>
                        <form onSubmit={onUpdatePlayer} className="grid gap-3 md:grid-cols-2">
                            <input
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Nombre *"
                                value={updateForm.data.nombre}
                                onChange={(e) =>
                                    updateForm.setData('nombre', e.target.value)
                                }
                            />
                            <input
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Apellido"
                                value={updateForm.data.apellido}
                                onChange={(e) =>
                                    updateForm.setData('apellido', e.target.value)
                                }
                            />
                            <input
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="DNI (sin puntos) *"
                                value={updateForm.data.dni}
                                onChange={(e) =>
                                    updateForm.setData('dni', e.target.value)
                                }
                            />
                            <input
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Número de socio"
                                value={updateForm.data.numero_socio}
                                onChange={(e) =>
                                    updateForm.setData('numero_socio', e.target.value)
                                }
                            />
                            <input
                                type="date"
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                value={updateForm.data.fecha_nacimiento}
                                onChange={(e) =>
                                    updateForm.setData('fecha_nacimiento', e.target.value)
                                }
                            />
                            <input
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Teléfono"
                                value={updateForm.data.telefono}
                                onChange={(e) =>
                                    updateForm.setData('telefono', e.target.value)
                                }
                            />
                            <input
                                type="email"
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Mail"
                                value={updateForm.data.mail}
                                onChange={(e) =>
                                    updateForm.setData('mail', e.target.value)
                                }
                            />
                            <input
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Beca (opcional)"
                                value={updateForm.data.scholarship}
                                onChange={(e) =>
                                    updateForm.setData('scholarship', e.target.value)
                                }
                            />
                            <textarea
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Observaciones (opcional)"
                                value={updateForm.data.notes}
                                onChange={(e) =>
                                    updateForm.setData('notes', e.target.value)
                                }
                            />
                            <label className="flex items-center gap-2 text-brand-dark">
                                <input
                                    type="checkbox"
                                    checked={updateForm.data.medical_check}
                                    onChange={(e) =>
                                        updateForm.setData(
                                            'medical_check',
                                            e.target.checked,
                                        )
                                    }
                                />
                                Ficha médica al día
                            </label>
                            <label className="flex items-center gap-2 text-brand-dark">
                                <input
                                    type="checkbox"
                                    checked={updateForm.data.imagen_compromiso}
                                    onChange={(e) =>
                                        updateForm.setData(
                                            'imagen_compromiso',
                                            e.target.checked,
                                        )
                                    }
                                />
                                Imagen y compromiso
                            </label>
                            <label className="flex items-center gap-2 text-brand-dark">
                                <input
                                    type="checkbox"
                                    checked={updateForm.data.registered}
                                    onChange={(e) =>
                                        updateForm.setData('registered', e.target.checked)
                                    }
                                />
                                Fichaje
                            </label>
                            <div className="flex gap-2 md:col-span-2">
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
            )}

            {can.createPlayer && (
                <Modal show={showCreateModal} onClose={closeCreateModal} maxWidth="2xl">
                    <div className="p-6">
                        <h3 className="mb-4 text-lg font-semibold text-brand-dark">
                            Nuevo jugador en la tira
                        </h3>
                        <form
                            onSubmit={onCreatePlayer}
                            className="grid gap-3 md:grid-cols-2"
                        >
                            <input
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Nombre *"
                                value={createForm.data.nombre}
                                onChange={(e) =>
                                    createForm.setData('nombre', e.target.value)
                                }
                            />
                            <input
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Apellido"
                                value={createForm.data.apellido}
                                onChange={(e) =>
                                    createForm.setData('apellido', e.target.value)
                                }
                            />
                            <input
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="DNI (sin puntos) *"
                                value={createForm.data.dni}
                                onChange={(e) =>
                                    createForm.setData('dni', e.target.value)
                                }
                            />
                            <input
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Número de socio"
                                value={createForm.data.numero_socio}
                                onChange={(e) =>
                                    createForm.setData('numero_socio', e.target.value)
                                }
                            />
                            <input
                                type="date"
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                value={createForm.data.fecha_nacimiento}
                                onChange={(e) =>
                                    createForm.setData('fecha_nacimiento', e.target.value)
                                }
                            />
                            <input
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Teléfono"
                                value={createForm.data.telefono}
                                onChange={(e) =>
                                    createForm.setData('telefono', e.target.value)
                                }
                            />
                            <input
                                type="email"
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark md:col-span-2"
                                placeholder="Mail"
                                value={createForm.data.mail}
                                onChange={(e) =>
                                    createForm.setData('mail', e.target.value)
                                }
                            />
                            <input
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Beca (opcional, ej: 50%)"
                                value={createForm.data.scholarship}
                                onChange={(e) =>
                                    createForm.setData('scholarship', e.target.value)
                                }
                            />
                            <textarea
                                className="rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Observaciones (opcional)"
                                value={createForm.data.notes}
                                onChange={(e) =>
                                    createForm.setData('notes', e.target.value)
                                }
                            />
                            <label className="flex items-center gap-2 text-brand-dark">
                                <input
                                    type="checkbox"
                                    checked={createForm.data.medical_check}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'medical_check',
                                            e.target.checked,
                                        )
                                    }
                                />
                                Ficha médica al día
                            </label>
                            <label className="flex items-center gap-2 text-brand-dark">
                                <input
                                    type="checkbox"
                                    checked={createForm.data.imagen_compromiso}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'imagen_compromiso',
                                            e.target.checked,
                                        )
                                    }
                                />
                                Imagen y compromiso
                            </label>
                            <label className="flex items-center gap-2 text-brand-dark">
                                <input
                                    type="checkbox"
                                    checked={createForm.data.registered}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'registered',
                                            e.target.checked,
                                        )
                                    }
                                />
                                Fichaje
                            </label>
                            <div className="flex gap-2 md:col-span-2">
                                <button
                                    type="submit"
                                    className="rounded bg-brand-primary px-4 py-2 text-brand-white hover:bg-brand-dark"
                                    disabled={createForm.processing}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <FaSave className="h-4 w-4" />
                                        Guardar jugador
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
            )}
        </AuthenticatedLayout>
    );
}
