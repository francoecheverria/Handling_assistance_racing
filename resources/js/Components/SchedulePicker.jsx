import { useCallback, useEffect, useState } from 'react';
import { FaClock } from 'react-icons/fa';

const DAY_LABELS = [
    { index: 1, short: 'Lun', key: 'lun' },
    { index: 2, short: 'Mar', key: 'mar' },
    { index: 3, short: 'Mié', key: 'mie' },
    { index: 4, short: 'Jue', key: 'jue' },
    { index: 5, short: 'Vie', key: 'vie' },
    { index: 6, short: 'Sáb', key: 'sab' },
    { index: 0, short: 'Dom', key: 'dom' },
];

const TOKEN_TO_INDEX = {
    lun: 1,
    lunes: 1,
    mar: 2,
    martes: 2,
    mie: 3,
    mié: 3,
    miercoles: 3,
    miércoles: 3,
    jue: 4,
    jueves: 4,
    vie: 5,
    viernes: 5,
    sab: 6,
    sáb: 6,
    sabado: 6,
    sábado: 6,
    dom: 0,
    domingo: 0,
};

function parseSchedule(value) {
    if (!value || typeof value !== 'string') {
        return { selectedDayIndices: [], time: '' };
    }
    const normalized = value.trim().toLowerCase();
    const selectedDayIndices = [];
    Object.entries(TOKEN_TO_INDEX).forEach(([token, index]) => {
        if (normalized.includes(token) && !selectedDayIndices.includes(index)) {
            selectedDayIndices.push(index);
        }
    });
    selectedDayIndices.sort((a, b) => a - b);
    const timeMatch = value.match(/(\d{1,2}:\d{2})/);
    const time = timeMatch ? timeMatch[1].padStart(5, '0') : '';
    return { selectedDayIndices, time };
}

function buildSchedule(selectedDayIndices, time) {
    if (selectedDayIndices.length === 0 || !time) return '';
    const order = [1, 2, 3, 4, 5, 6, 0];
    const sorted = [...selectedDayIndices].sort(
        (a, b) => order.indexOf(a) - order.indexOf(b),
    );
    const labels = sorted
        .map((idx) => DAY_LABELS.find((d) => d.index === idx)?.short ?? '')
        .filter(Boolean);
    return `${labels.join('/')} ${time}`;
}

export default function SchedulePicker({ value = '', onChange, id, className = '', error }) {
    const { selectedDayIndices, time } = parseSchedule(value);
    const [selectedDays, setSelectedDays] = useState(() => selectedDayIndices);
    const [timeValue, setTimeValue] = useState(() => time);

    useEffect(() => {
        const parsed = parseSchedule(value);
        setSelectedDays(parsed.selectedDayIndices);
        setTimeValue(parsed.time);
    }, [value]);

    const notify = useCallback(
        (days, t) => {
            const next = buildSchedule(days, t);
            onChange?.(next);
        },
        [onChange],
    );

    const toggleDay = (dayIndex) => {
        const next = selectedDays.includes(dayIndex)
            ? selectedDays.filter((d) => d !== dayIndex)
            : [...selectedDays, dayIndex];
        setSelectedDays(next);
        notify(next, timeValue);
    };

    const handleTimeChange = (e) => {
        const t = e.target.value || '';
        setTimeValue(t);
        notify(selectedDays, t);
    };

    return (
        <div className={`rounded-lg border border-brand-light/50 bg-brand-white p-4 ${className}`}>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-brand-dark">
                <FaClock className="h-4 w-4 text-brand-primary" />
                Días y horario
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
                {DAY_LABELS.map(({ index, short }) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => toggleDay(index)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                            selectedDays.includes(index)
                                ? 'border-brand-primary bg-brand-primary text-white'
                                : 'border-brand-light/50 bg-brand-white text-brand-dark hover:border-brand-primary/50'
                        }`}
                    >
                        {short}
                    </button>
                ))}
            </div>
            <div>
                <label htmlFor={id} className="mb-1 block text-sm text-brand-dark/80">
                    Hora
                </label>
                <input
                    id={id}
                    type="time"
                    value={timeValue}
                    onChange={handleTimeChange}
                    className="w-full max-w-[10rem] rounded border border-brand-light/50 bg-brand-white px-3 py-2 text-brand-dark"
                />
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600">
                    {Array.isArray(error) ? error[0] : error}
                </p>
            )}
        </div>
    );
}
