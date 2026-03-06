import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaPlusCircle, FaSave, FaUserShield } from 'react-icons/fa';

const emptyAdmin = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
};

export default function AdministratorsIndex({ administrators }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const createForm = useForm(emptyAdmin);

    const onCreateAdmin = (e) => {
        e.preventDefault();
        createForm.post(route('administrators.store'), {
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

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-dark">
                    Administradores
                </h2>
            }
        >
            <Head title="Administradores" />

            <div className="py-12">
                <div className="mx-auto grid max-w-7xl gap-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-lg font-semibold">
                                    <span className="inline-flex items-center gap-2">
                                        <FaUserShield className="h-4 w-4 text-brand-primary" />
                                        Usuarios administrador
                                    </span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-brand-white hover:bg-brand-dark"
                                >
                                    <FaPlusCircle className="h-4 w-4" />
                                    Crear administrador
                                </button>
                            </div>

                            {administrators.length === 0 ? (
                                <p className="text-brand-dark/80">
                                    No hay administradores cargados.
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
                                                    Email
                                                </th>
                                                <th className="border px-3 py-2 text-left">
                                                    Fecha de alta
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {administrators.map((admin) => (
                                                <tr key={admin.id}>
                                                    <td className="border px-3 py-2 text-brand-dark">
                                                        {admin.name}
                                                    </td>
                                                    <td className="border px-3 py-2 text-brand-dark">
                                                        {admin.email}
                                                    </td>
                                                    <td className="border px-3 py-2 text-brand-dark/80">
                                                        {admin.created_at
                                                            ? new Date(
                                                                  admin.created_at,
                                                              ).toLocaleDateString(
                                                                  'es-AR',
                                                              )
                                                            : '-'}
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

            <Modal
                show={showCreateModal}
                onClose={closeCreateModal}
                maxWidth="md"
            >
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-brand-dark">
                        Nuevo administrador
                    </h3>
                    <form
                        onSubmit={onCreateAdmin}
                        className="flex flex-col gap-3"
                    >
                        <div>
                            <label className="mb-1 block text-sm font-medium text-brand-dark">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                className="w-full rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Nombre completo"
                                value={createForm.data.name}
                                onChange={(e) =>
                                    createForm.setData('name', e.target.value)
                                }
                            />
                            {createForm.errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {createForm.errors.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-brand-dark">
                                Email *
                            </label>
                            <input
                                type="email"
                                className="w-full rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="email@ejemplo.com"
                                value={createForm.data.email}
                                onChange={(e) =>
                                    createForm.setData('email', e.target.value)
                                }
                            />
                            {createForm.errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {createForm.errors.email}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-brand-dark">
                                Contraseña * (mínimo 8 caracteres)
                            </label>
                            <input
                                type="password"
                                className="w-full rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                placeholder="Contraseña"
                                value={createForm.data.password}
                                onChange={(e) =>
                                    createForm.setData(
                                        'password',
                                        e.target.value,
                                    )
                                }
                            />
                            {createForm.errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {createForm.errors.password}
                                </p>
                            )}
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
                                    createForm.setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                            />
                            {createForm.errors.password_confirmation && (
                                <p className="mt-1 text-sm text-red-600">
                                    {
                                        createForm.errors.password_confirmation
                                    }
                                </p>
                            )}
                        </div>
                        <div className="mt-2 flex gap-2">
                            <button
                                type="submit"
                                className="rounded bg-brand-primary px-4 py-2 font-semibold text-brand-white hover:bg-brand-dark disabled:opacity-70"
                                disabled={createForm.processing}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FaSave className="h-4 w-4" />
                                    Crear administrador
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
