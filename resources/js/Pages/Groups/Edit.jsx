import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import SchedulePicker from '@/Components/SchedulePicker';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FaSave } from 'react-icons/fa';

export default function GroupsEdit({ group, coaches = [] }) {
    const form = useForm({
        name: group.name || '',
        schedule: group.schedule || '',
        description: group.description || '',
        categories: (group.categories || []).map((c) => c.category_year).filter(Boolean).length
            ? (group.categories || []).map((c) => c.category_year)
            : [new Date().getFullYear()],
        coach_ids: (group.coaches || []).map((c) => c.id),
    });

    const toggleCoach = (coachId) => {
        const ids = form.data.coach_ids.includes(coachId)
            ? form.data.coach_ids.filter((id) => id !== coachId)
            : [...form.data.coach_ids, coachId];
        form.setData('coach_ids', ids);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...form.data,
            categories: form.data.categories.filter((y) => y !== '' && y != null).map(Number),
            coach_ids: form.data.coach_ids || [],
        };
        if (payload.categories.length === 0) payload.categories = [new Date().getFullYear()];
        router.put(route('groups.update', group.id), payload);
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
                                <InputError message={form.errors.name} className="mt-1" />
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
                                <InputError message={form.errors.description} className="mt-1" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-brand-dark">
                                    Categorías (años) *
                                </label>
                                {(form.data.categories || []).map((year, idx) => (
                                    <div key={idx} className="mb-2 flex gap-2">
                                        <input
                                            type="number"
                                            min="1990"
                                            max="2100"
                                            className="w-28 rounded border-brand-light/50 bg-brand-white text-brand-dark"
                                            placeholder="Ej: 2010"
                                            value={year === '' ? '' : year}
                                            onChange={(e) => {
                                                const next = [...(form.data.categories || [])];
                                                next[idx] = e.target.value === '' ? '' : Number(e.target.value);
                                                form.setData('categories', next);
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="rounded border border-red-300 px-2 text-red-600 hover:bg-red-50"
                                            onClick={() => {
                                                const next = (form.data.categories || []).filter((_, i) => i !== idx);
                                                if (next.length === 0) next.push(new Date().getFullYear());
                                                form.setData('categories', next);
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
                                        form.setData('categories', [
                                            ...(form.data.categories || []),
                                            new Date().getFullYear(),
                                        ])
                                    }
                                >
                                    + Añadir categoría
                                </button>
                                <InputError message={form.errors.categories} className="mt-1" />
                            </div>
                            {coaches.length > 0 && (
                                <div className="rounded border border-brand-light/40 bg-brand-light/10 p-3">
                                    <p className="mb-2 text-sm font-medium text-brand-dark">
                                        Profesores asignados
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {coaches.map((coach) => (
                                            <label
                                                key={coach.id}
                                                className="flex cursor-pointer items-center gap-2 text-sm text-brand-dark"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={(form.data.coach_ids || []).includes(coach.id)}
                                                    onChange={() => toggleCoach(coach.id)}
                                                />
                                                {coach.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
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
