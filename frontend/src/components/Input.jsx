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

function Combobox({ id, value, onChange, placeholder, disabled, categories = [] }) {
  const [inputValue, setInputValue] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [browseMode, setBrowseMode] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (!open) setInputValue(value || '');
  }, [value, open]);

  useEffect(() => {
    setActiveIndex(-1);
    itemRefs.current = [];
  }, [open, inputValue, browseMode]);

  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setBrowseMode(false);
        setInputValue(value || '');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, value]);

  const allItems = categories.flatMap((cat) =>
    cat.options.map((opt) => ({ label: opt, category: cat.label })),
  );

  const query = inputValue.trim();
  const filtered = !browseMode && query
    ? allItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())).slice(0, 4)
    : null;

  const visibleItems = browseMode
    ? [...allItems, { label: 'Autre structure', isOther: true }]
    : filtered
      ? [...filtered, { label: 'Autre structure', isOther: true }]
      : [];

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setBrowseMode(false);
    setOpen(true);
  };

  const handleSelect = (label) => {
    onChange(label);
    setInputValue(label);
    setOpen(false);
    setBrowseMode(false);
  };

  const handleArrowClick = () => {
    if (open && browseMode) {
      setOpen(false);
      setBrowseMode(false);
    } else {
      setBrowseMode(true);
      setOpen(true);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setBrowseMode(true);
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, visibleItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(visibleItems[activeIndex].label);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setBrowseMode(false);
      setInputValue(value || '');
    }
  };

  const itemClass = (index, isSelected) =>
    `w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
      index === activeIndex
        ? 'bg-[#1294C3] text-white'
        : isSelected
          ? 'bg-[#1294C3]/10 text-[#1294C3] font-medium'
          : 'text-(--text-primary) hover:bg-(--bg-tertiary)'
    }`;

  const otherClass = (index) =>
    `w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
      index === activeIndex
        ? 'bg-[#1294C3] text-white'
        : 'text-(--text-muted) hover:bg-(--bg-tertiary)'
    }`;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => { if (inputValue && !browseMode) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Rechercher ou sélectionner…'}
          disabled={disabled}
          autoComplete="off"
          className={`${fieldClass} pr-9`}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={handleArrowClick}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${open && browseMode ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-(--border) bg-(--bg-primary) shadow-lg overflow-hidden">
          {browseMode ? (
            /* Flèche : liste complète groupée */
            <div className="max-h-56 overflow-y-auto">
              {(() => {
                let idx = 0;
                return (
                  <>
                    {categories.map((cat) => (
                      <div key={cat.label}>
                        <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-(--text-muted) bg-(--bg-secondary) sticky top-0">
                          {cat.label}
                        </div>
                        {cat.options.map((opt) => {
                          const i = idx++;
                          return (
                            <button
                              key={opt}
                              ref={(el) => { itemRefs.current[i] = el; }}
                              type="button"
                              onClick={() => handleSelect(opt)}
                              onMouseEnter={() => setActiveIndex(i)}
                              onMouseLeave={() => setActiveIndex(-1)}
                              className={itemClass(i, value === opt)}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                    <div className="border-t border-(--border)">
                      {(() => {
                        const i = idx++;
                        return (
                          <button
                            ref={(el) => { itemRefs.current[i] = el; }}
                            type="button"
                            onClick={() => handleSelect('Autre structure')}
                            onMouseEnter={() => setActiveIndex(i)}
                            onMouseLeave={() => setActiveIndex(-1)}
                            className={otherClass(i)}
                          >
                            Autre structure…
                          </button>
                        );
                      })()}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : filtered && filtered.length === 0 ? (
            /* Saisie : aucun résultat */
            <div className="px-3 py-2.5 text-sm text-(--text-muted)">Aucun résultat</div>
          ) : filtered ? (
            /* Saisie : max 4 suggestions */
            <ul>
              {filtered.map((item, i) => (
                <li key={item.label}>
                  <button
                    ref={(el) => { itemRefs.current[i] = el; }}
                    type="button"
                    onClick={() => handleSelect(item.label)}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(-1)}
                    className={`${itemClass(i, false)} flex items-baseline justify-between`}
                  >
                    <span>{item.label}</span>
                    <span className={`text-[11px] ml-2 shrink-0 ${i === activeIndex ? 'text-white/70' : 'text-(--text-muted)'}`}>
                      {item.category}
                    </span>
                  </button>
                </li>
              ))}
              <li className="border-t border-(--border)">
                {(() => {
                  const i = filtered.length;
                  return (
                    <button
                      ref={(el) => { itemRefs.current[i] = el; }}
                      type="button"
                      onClick={() => handleSelect('Autre structure')}
                      onMouseEnter={() => setActiveIndex(i)}
                      onMouseLeave={() => setActiveIndex(-1)}
                      className={otherClass(i)}
                    >
                      Autre structure…
                    </button>
                  );
                })()}
              </li>
            </ul>
          ) : null}
        </div>
      )}
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
  // combobox
  categories = [],
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
      ) : type === 'combobox' ? (
        <Combobox
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          categories={categories}
        />
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
