import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SchedulePicker from '@/Components/SchedulePicker';
import { Head, Link, useForm } from '@inertiajs/react';
import { FaSave } from 'react-icons/fa';

export default function GroupsEdit({ group }) {
    const form = useForm({
        name: group.name || '',
        schedule: group.schedule || '',
        description: group.description || '',
        category_year: group.category_year ?? '',
    });

    const onSubmit = (e) => {
        e.preventDefault();
        form.put(route('groups.update', group.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-dark">
                        Editar tira
                    </h2>
                    <Link
                        href={route('groups.show', group.id)}
                        className="text-sm text-brand-primary hover:underline"
                    >
                        Volver a la tira
                    </Link>
                </div>
            }
        >
            <Head title={`Editar ${group.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg">
                        <form onSubmit={onSubmit} className="space-y-4 p-6">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-brand-dark">
                                    Nombre de la tira *
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                    placeholder="Ej: Tira 1"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                />
                                {form.errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {form.errors.name}
                                    </p>
                                )}
                            </div>
                            <SchedulePicker
                                value={form.data.schedule}
                                onChange={(v) => form.setData('schedule', v)}
                                error={form.errors.schedule}
                            />
                            <div>
                                <label className="mb-1 block text-sm font-medium text-brand-dark">
                                    Texto / descripción (opcional)
                                </label>
                                <textarea
                                    rows={4}
                                    className="w-full rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                    placeholder="Información adicional de la tira"
                                    value={form.data.description}
                                    onChange={(e) =>
                                        form.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                />
                                {form.errors.description && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {form.errors.description}
                                    </p>
                                )}
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
                                    value={form.data.category_year}
                                    onChange={(e) =>
                                        form.setData(
                                            'category_year',
                                            e.target.value,
                                        )
                                    }
                                />
                                {form.errors.category_year && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {form.errors.category_year}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="rounded bg-brand-primary px-4 py-2 font-semibold text-brand-white hover:bg-brand-dark disabled:opacity-70"
                                    disabled={form.processing}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <FaSave className="h-4 w-4" />
                                        Guardar cambios
                                    </span>
                                </button>
                                <Link
                                    href={route('groups.show', group.id)}
                                    className="rounded border border-brand-light/50 px-4 py-2 text-brand-dark hover:bg-brand-light/15"
                                >
                                    Cancelar
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
