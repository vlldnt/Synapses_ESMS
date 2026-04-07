import { useState, useRef, useEffect } from 'react';

const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const fieldClass =
  'w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-(--border) bg-(--bg-secondary) text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:ring-2 focus:ring-[#1294C3] focus:border-transparent transition-shadow text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed';

function CalendarPicker({ value, onChange, min, max, onClose }) {
  const today = new Date();
  const parsed = value ? new Date(value + 'T00:00:00') : null;

  const [cursor, setCursor] = useState({
    year: parsed ? parsed.getFullYear() : today.getFullYear(),
    month: parsed ? parsed.getMonth() : today.getMonth(),
  });

  const minDate = min ? new Date(min + 'T00:00:00') : null;
  const maxDate = max ? new Date(max + 'T00:00:00') : null;

  const prevMonth = () =>
    setCursor(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
    );

  const nextMonth = () =>
    setCursor(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
    );

  const firstDay = new Date(cursor.year, cursor.month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isDisabled = (day) => {
    const date = new Date(cursor.year, cursor.month, day);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isSelected = (day) =>
    parsed &&
    parsed.getFullYear() === cursor.year &&
    parsed.getMonth() === cursor.month &&
    parsed.getDate() === day;

  const isToday = (day) =>
    today.getFullYear() === cursor.year &&
    today.getMonth() === cursor.month &&
    today.getDate() === day;

  const selectDay = (day) => {
    if (isDisabled(day)) return;
    const mm = String(cursor.month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${cursor.year}-${mm}-${dd}`);
    onClose();
  };

  return (
    <div className="absolute z-50 mt-1 w-72 rounded-xl border border-(--border) bg-(--bg-primary) shadow-lg p-4">

      {/* Header mois / année */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 rounded-md hover:bg-(--bg-tertiary) text-(--text-secondary) transition-colors cursor-pointer"
        >
          {'‹'}
        </button>
        <span className="text-sm font-semibold text-(--text-primary)">
          {MONTHS[cursor.month]} {cursor.year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 rounded-md hover:bg-(--bg-tertiary) text-(--text-secondary) transition-colors cursor-pointer"
        >
          {'›'}
        </button>
      </div>

      {/* Entêtes jours */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <span key={d} className="text-center text-[11px] font-medium text-(--text-muted) py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Grille jours */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) =>
          day === null ? (
            <span key={`empty-${i}`} />
          ) : (
            <button
              key={day}
              type="button"
              onClick={() => selectDay(day)}
              disabled={isDisabled(day)}
              className={`
                h-8 w-full rounded-md text-xs transition-colors cursor-pointer
                ${isSelected(day)
                  ? 'bg-[#1294C3] text-white font-semibold'
                  : isToday(day)
                    ? 'border border-[#1294C3] text-[#1294C3] font-semibold hover:bg-(--bg-tertiary)'
                    : 'text-(--text-primary) hover:bg-(--bg-tertiary)'
                }
                ${isDisabled(day) ? 'opacity-30 cursor-not-allowed' : ''}
              `}
            >
              {day}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  hint,
  // date
  min,
  max,
  // select
  options = [],
  // textarea
  rows = 5,
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!calendarOpen) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [calendarOpen]);

  const handleChange = (e) => onChange(e.target.value);

  const normalizeOptions = (opts) =>
    opts.map((opt) =>
      typeof opt === 'string' ? { label: opt, value: opt } : opt,
    );

  const formatDisplayDate = (val) => {
    if (!val) return '';
    const [y, m, d] = val.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div ref={type === 'date' ? containerRef : undefined} className="flex flex-col gap-1 md:gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-(--text-secondary)">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {type === 'date' ? (
        <div className="relative">
          <button
            id={id}
            type="button"
            onClick={() => !disabled && setCalendarOpen((o) => !o)}
            disabled={disabled}
            className={`${fieldClass} text-left ${!value ? 'text-(--text-muted)' : ''}`}
          >
            {formatDisplayDate(value) || placeholder || 'Sélectionner une date'}
          </button>
          {calendarOpen && (
            <CalendarPicker
              value={value}
              onChange={onChange}
              min={min}
              max={max}
              onClose={() => setCalendarOpen(false)}
            />
          )}
        </div>
      ) : type === 'select' ? (
        <select
          id={id}
          value={value}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          className={fieldClass}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {normalizeOptions(options).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          className={`${fieldClass} resize-none`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={fieldClass}
        />
      )}

      {hint && (
        <p className="text-xs text-(--text-muted) mt-0.5">{hint}</p>
      )}
    </div>
  );
}

export default Input;
