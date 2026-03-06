import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
    FaArrowLeft,
    FaArrowRight,
    FaCalendarCheck,
    FaCheck,
    FaMinus,
    FaTimes,
} from 'react-icons/fa';

const dayMap = {
    dom: 0,
    domingo: 0,
    lun: 1,
    lunes: 1,
    mar: 2,
    martes: 2,
    mie: 3,
    miercoles: 3,
    miércoles: 3,
    jue: 4,
    jueves: 4,
    vie: 5,
    viernes: 5,
    sab: 6,
    sábado: 6,
    sabado: 6,
};

const attendanceStatusOptions = [
    { value: 'pending', label: 'Pendiente', icon: FaMinus },
    { value: 'present', label: 'Presente', icon: FaCheck },
    { value: 'absent', label: 'Ausente', icon: FaTimes },
];

function parseScheduleDays(schedule = '') {
    const normalized = schedule.toLowerCase();

    return Object.entries(dayMap)
        .filter(([token]) => normalized.includes(token))
        .map(([, dayIndex]) => dayIndex)
        .filter((dayIndex, index, list) => list.indexOf(dayIndex) === index);
}

function extractTime(schedule = '') {
    const match = schedule.match(/(\d{1,2}:\d{2})/);
    if (!match) return null;
    return match[1].padStart(5, '0');
}

function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatNowTime(date = new Date()) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function timeToMinutes(time = '') {
    const parts = time.split(':');
    if (parts.length !== 2) return null;

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
}

function parseScheduleMetadata(schedule = '') {
    if (!schedule) {
        return {
            days: [],
            time: null,
            exactDate: null,
            exactDateTime: null,
        };
    }

    const parsedDate = new Date(schedule);
    const looksLikeDateTime = !Number.isNaN(parsedDate.getTime()) && schedule.includes('T');

    if (looksLikeDateTime) {
        const exactDate = formatDateLocal(parsedDate);
        const exactDateTime = `${exactDate}T${formatNowTime(parsedDate)}`;

        return {
            days: [parsedDate.getDay()],
            time: formatNowTime(parsedDate),
            exactDate,
            exactDateTime,
        };
    }

    return {
        days: parseScheduleDays(schedule),
        time: extractTime(schedule),
        exactDate: null,
        exactDateTime: null,
    };
}

export default function Dashboard({ groups = [] }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeTodayGroupIndex, setActiveTodayGroupIndex] = useState(0);
    const [scheduledAt, setScheduledAt] = useState('');
    const [attendanceSession, setAttendanceSession] = useState(null);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [isOpeningSession, setIsOpeningSession] = useState(false);
    const [isSavingAttendance, setIsSavingAttendance] = useState(false);
    const [attendanceMessage, setAttendanceMessage] = useState('');
    const [attendanceError, setAttendanceError] = useState('');
    const loadedSessionKeyRef = useRef('');

    const groupsWithDays = useMemo(
        () =>
            groups.map((group) => ({
                ...group,
                ...parseScheduleMetadata(group.schedule || ''),
            })),
        [groups],
    );

    const groupsForSelectedDate = useMemo(
        () =>
            groupsWithDays.filter((group) =>
                group.days.includes(selectedDate.getDay()),
            ),
        [groupsWithDays, selectedDate],
    );

    const highlightedWeekDays = useMemo(
        () => new Set(groupsWithDays.flatMap((group) => group.days)),
        [groupsWithDays],
    );

    const groupsByWeekDay = useMemo(() => {
        const map = new Map();

        groupsWithDays.forEach((group) => {
            group.days.forEach((day) => {
                const current = map.get(day) || [];
                map.set(day, [...current, group]);
            });
        });

        return map;
    }, [groupsWithDays]);

    const todayGroups = useMemo(() => {
        const today = new Date();
        const todayDate = formatDateLocal(today);
        const todayDay = today.getDay();

        return groupsWithDays
            .filter((group) => {
                if (group.exactDate) {
                    return group.exactDate === todayDate;
                }

                return group.days.includes(todayDay);
            })
            .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
    }, [groupsWithDays]);

    const activeTodayGroup = todayGroups[activeTodayGroupIndex] || null;

    useEffect(() => {
        if (todayGroups.length === 0) {
            setActiveTodayGroupIndex(0);
            setScheduledAt('');
            setAttendanceSession(null);
            setAttendanceRecords([]);
            return;
        }

        const nowMinutes = timeToMinutes(formatNowTime(new Date())) ?? 0;
        const closestFutureIndex = todayGroups.findIndex((group) => {
            const groupMinutes = timeToMinutes(group.time || '');
            return groupMinutes !== null && groupMinutes >= nowMinutes;
        });

        if (closestFutureIndex >= 0) {
            setActiveTodayGroupIndex(closestFutureIndex);
            return;
        }

        setActiveTodayGroupIndex(todayGroups.length - 1);
    }, [todayGroups]);

    useEffect(() => {
        if (!activeTodayGroup) {
            setScheduledAt('');
            setAttendanceSession(null);
            setAttendanceRecords([]);
            return;
        }

        if (activeTodayGroup.exactDateTime) {
            setScheduledAt(activeTodayGroup.exactDateTime);
            return;
        }

        const now = new Date();
        const datePart = formatDateLocal(now);
        const timePart = activeTodayGroup.time || formatNowTime(now);
        setScheduledAt(`${datePart}T${timePart}`);
        setAttendanceSession(null);
        setAttendanceRecords([]);
        loadedSessionKeyRef.current = '';
    }, [activeTodayGroup?.exactDateTime, activeTodayGroup?.id, activeTodayGroup?.time]);

    const openOrCreateAttendanceSession = async (groupId, sessionDateTime) => {
        if (!groupId || !sessionDateTime) {
            return;
        }

        setIsOpeningSession(true);
        setAttendanceError('');
        setAttendanceMessage('');

        try {
            const payload = await window.axios
                .post(route('attendances.sessions.store'), {
                    group_id: groupId,
                    scheduled_at: sessionDateTime,
                })
                .then((response) => response.data);

            const session = payload.session;
            setAttendanceSession(session);
            setAttendanceRecords(
                (session.records || []).map((record) => ({
                    player_id: record.player_id,
                    player: record.player,
                    status: record.status,
                    notes: record.notes || '',
                })),
            );
            setAttendanceMessage('Sesión lista para fichar asistencia.');
        } catch (error) {
            if (error?.response?.status === 419) {
                setAttendanceError(
                    'Tu sesión expiró. Recarga la página e intenta nuevamente.',
                );
            } else {
                setAttendanceError('No se pudo abrir la sesión de asistencia.');
            }
        } finally {
            setIsOpeningSession(false);
        }
    };

    useEffect(() => {
        if (!activeTodayGroup || !scheduledAt) {
            return;
        }

        const sessionKey = `${activeTodayGroup.id}|${scheduledAt}`;
        if (loadedSessionKeyRef.current === sessionKey) {
            return;
        }

        loadedSessionKeyRef.current = sessionKey;
        openOrCreateAttendanceSession(activeTodayGroup.id, scheduledAt);
    }, [activeTodayGroup, scheduledAt]);

    const setPlayerStatus = (playerId, status) => {
        setAttendanceRecords((prev) =>
            prev.map((record) =>
                record.player_id === playerId ? { ...record, status } : record,
            ),
        );
    };

    const saveAttendance = async () => {
        if (!attendanceSession) return;

        setIsSavingAttendance(true);
        setAttendanceError('');
        setAttendanceMessage('');

        try {
            await window.axios.put(
                route('attendances.sessions.records.update', attendanceSession.id),
                {
                    records: attendanceRecords.map((record) => ({
                        player_id: record.player_id,
                        status: record.status,
                        notes: record.notes,
                    })),
                },
            );

            setAttendanceMessage('Asistencia guardada correctamente.');
        } catch (error) {
            if (error?.response?.status === 419) {
                setAttendanceError(
                    'Tu sesión expiró. Recarga la página e intenta nuevamente.',
                );
            } else {
                setAttendanceError('No se pudo guardar la asistencia.');
            }
        } finally {
            setIsSavingAttendance(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-dark">
                    Inicio
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto grid max-w-7xl gap-6 sm:px-6 lg:grid-cols-2 lg:px-8">
                    <div className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg lg:col-span-2">
                        <div className="p-6 text-brand-dark">
                            <h3 className="mb-2 text-lg font-semibold">
                                <span className="inline-flex items-center gap-2">
                                    <FaCalendarCheck className="h-4 w-4 text-brand-primary" />
                                    Fichaje de Asistencia
                                </span>
                            </h3>
                            <p className="text-sm text-brand-dark/80">
                                Muestra la tira actual del día y su lista de alumnos
                                para marcar presente/ausente.
                            </p>

                            {todayGroups.length === 0 ? (
                                <p className="mt-4 rounded-md border border-brand-light/40 p-3 text-sm text-brand-dark/80">
                                    No tienes tiras programadas para hoy.
                                </p>
                            ) : (
                                <>
                                    <div className="mt-4 flex items-center gap-3">
                                        <button
                                            type="button"
                                            className="rounded border border-brand-light/50 px-3 py-2 text-sm text-brand-dark hover:bg-brand-light/15"
                                            onClick={() =>
                                                setActiveTodayGroupIndex((prev) =>
                                                    prev === 0
                                                        ? todayGroups.length - 1
                                                        : prev - 1,
                                                )
                                            }
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                <FaArrowLeft className="h-3.5 w-3.5" />
                                                <span className="hidden sm:inline">
                                                    Anterior
                                                </span>
                                            </span>
                                        </button>
                                        <div className="flex-1 rounded-lg border border-brand-light/40 p-3">
                                            <p className="font-semibold">
                                                {activeTodayGroup?.name}
                                            </p>
                                            <p className="text-sm text-brand-dark/80">
                                                Horario:{' '}
                                                {activeTodayGroup?.schedule ||
                                                    'Sin definir'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            className="rounded border border-brand-light/50 px-3 py-2 text-sm text-brand-dark hover:bg-brand-light/15"
                                            onClick={() =>
                                                setActiveTodayGroupIndex((prev) =>
                                                    prev === todayGroups.length - 1
                                                        ? 0
                                                        : prev + 1,
                                                )
                                            }
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                <span className="hidden sm:inline">
                                                    Siguiente
                                                </span>
                                                <FaArrowRight className="h-3.5 w-3.5" />
                                            </span>
                                        </button>
                                    </div>

                                    <div className="mt-4 rounded border border-brand-light/40 bg-brand-light/10 px-3 py-2 text-sm text-brand-dark/80">
                                        Sesión cargada automáticamente para:{' '}
                                        {scheduledAt
                                            ? new Date(scheduledAt).toLocaleString(
                                                  'es-AR',
                                              )
                                            : 'sin horario'}
                                    </div>

                                    {attendanceMessage && (
                                        <p className="mt-3 text-sm text-green-700">
                                            {attendanceMessage}
                                        </p>
                                    )}
                                    {attendanceError && (
                                        <p className="mt-3 text-sm text-red-600">
                                            {attendanceError}
                                        </p>
                                    )}
                                    {isOpeningSession && (
                                        <p className="mt-3 text-sm text-brand-dark/80">
                                            Cargando alumnos de la tira...
                                        </p>
                                    )}

                                    {attendanceSession && (
                                        <div className="mt-5 space-y-3">
                                            <h4 className="font-semibold">
                                                Alumnos de {attendanceSession.group?.name}
                                            </h4>
                                            <div className="space-y-3 md:hidden">
                                                {attendanceRecords.map((record) => (
                                                    <div
                                                        key={record.player_id}
                                                        className="rounded-xl border border-brand-light/40 p-3"
                                                    >
                                                        <p className="mb-3 font-semibold">
                                                            {record.player?.full_name}
                                                        </p>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {attendanceStatusOptions.map(
                                                                (option) => {
                                                                    const Icon =
                                                                        option.icon;
                                                                    const isActive =
                                                                        record.status ===
                                                                        option.value;
                                                                    return (
                                                                        <button
                                                                            key={
                                                                                option.value
                                                                            }
                                                                            type="button"
                                                                            className={`inline-flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold ${
                                                                                isActive
                                                                                    ? 'bg-brand-primary text-brand-white'
                                                                                    : 'border border-brand-light/50 text-brand-dark hover:bg-brand-light/20'
                                                                            }`}
                                                                            onClick={() =>
                                                                                setPlayerStatus(
                                                                                    record.player_id,
                                                                                    option.value,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Icon className="h-3.5 w-3.5" />
                                                                            <span>
                                                                                {
                                                                                    option.label
                                                                                }
                                                                            </span>
                                                                        </button>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="hidden overflow-x-auto rounded-xl border border-brand-light/40 md:block">
                                                <table className="min-w-full text-sm">
                                                    <thead className="bg-brand-light/20">
                                                        <tr>
                                                            <th className="border border-brand-light/40 px-3 py-2 text-left">
                                                                Alumno
                                                            </th>
                                                            <th className="border border-brand-light/40 px-3 py-2 text-left">
                                                                Estado
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {attendanceRecords.map((record) => (
                                                            <tr key={record.player_id}>
                                                                <td className="border border-brand-light/40 px-3 py-2">
                                                                    {
                                                                        record.player
                                                                            ?.full_name
                                                                    }
                                                                </td>
                                                                <td className="border border-brand-light/40 px-3 py-2">
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {attendanceStatusOptions.map(
                                                                            (option) => {
                                                                                const Icon =
                                                                                    option.icon;
                                                                                const isActive =
                                                                                    record.status ===
                                                                                    option.value;
                                                                                return (
                                                                                    <button
                                                                                        key={
                                                                                            option.value
                                                                                        }
                                                                                        type="button"
                                                                                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${
                                                                                            isActive
                                                                                                ? 'bg-brand-primary text-brand-white'
                                                                                                : 'border border-brand-light/50 text-brand-dark hover:bg-brand-light/20'
                                                                                        }`}
                                                                                        onClick={() =>
                                                                                            setPlayerStatus(
                                                                                                record.player_id,
                                                                                                option.value,
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <Icon className="h-3.5 w-3.5" />
                                                                                        <span>
                                                                                            {
                                                                                                option.label
                                                                                            }
                                                                                        </span>
                                                                                    </button>
                                                                                );
                                                                            },
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <button
                                                type="button"
                                                className="w-full rounded bg-brand-primary px-4 py-3 font-semibold text-brand-white hover:bg-brand-dark disabled:opacity-60 md:w-auto md:py-2"
                                                onClick={saveAttendance}
                                                disabled={isSavingAttendance}
                                            >
                                                {isSavingAttendance
                                                    ? 'Guardando...'
                                                    : 'Guardar asistencia'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-brand-dark">
                            <h3 className="mb-4 text-lg font-semibold">
                                Calendario de tiras
                            </h3>
                            <div className="rounded-lg border border-brand-light/40 p-3">
                                <Calendar
                                    className="calendar-brand"
                                    onChange={setSelectedDate}
                                    value={selectedDate}
                                    locale="es-AR"
                                    tileClassName={({ date, view }) => {
                                        if (view !== 'month') return null;
                                        return highlightedWeekDays.has(date.getDay())
                                            ? 'bg-brand-light/25 text-brand-dark font-semibold rounded-md'
                                            : null;
                                    }}
                                    tileContent={({ date, view }) => {
                                        if (view !== 'month') return null;

                                        const dayGroups =
                                            groupsByWeekDay.get(date.getDay()) || [];

                                        if (dayGroups.length === 0) return null;

                                        const visible = dayGroups.slice(0, 2);
                                        const remaining = dayGroups.length - visible.length;

                                        return (
                                            <div className="mt-1 space-y-0.5 text-[10px] font-medium leading-tight text-brand-dark">
                                                {visible.map((group) => (
                                                    <div
                                                        key={`${date.toDateString()}-${group.id}`}
                                                        className="truncate rounded bg-brand-primary/15 px-1"
                                                        title={group.name}
                                                    >
                                                        {group.name}
                                                    </div>
                                                ))}
                                                {remaining > 0 && (
                                                    <div className="text-[10px] text-brand-dark/70">
                                                        +{remaining} más
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                            <p className="mt-3 text-sm text-brand-dark/80">
                                Los días resaltados indican que tienes al menos una
                                tira programada.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-brand-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-brand-dark">
                            <h3 className="text-lg font-semibold">
                                Tiras del día seleccionado
                            </h3>
                            <p className="mt-1 text-sm text-brand-dark/80">
                                {selectedDate.toLocaleDateString('es-AR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>

                            {groupsForSelectedDate.length === 0 ? (
                                <p className="mt-4 rounded-md border border-brand-light/40 p-3 text-sm text-brand-dark/80">
                                    No hay tiras para este día.
                                </p>
                            ) : (
                                <div className="mt-4 space-y-3">
                                    {groupsForSelectedDate.map((group) => (
                                        <div
                                            key={group.id}
                                            className="rounded-lg border border-brand-light/40 p-3"
                                        >
                                            <p className="font-semibold text-brand-dark">
                                                {group.name}
                                            </p>
                                            <p className="text-sm text-brand-dark/80">
                                                Horario: {group.schedule || 'Sin definir'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6">
                                <h4 className="font-semibold">Todas mis tiras</h4>
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-brand-dark/80">
                                    {groups.map((group) => (
                                        <li key={group.id}>
                                            {group.name} -{' '}
                                            {group.schedule || 'Sin horario'}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
