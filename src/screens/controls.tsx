// Form controls shared by Setup and Profile.

export function ChipMulti<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  labels: Record<T, string>
  value: readonly T[]
  onChange: (next: T[]) => void
}) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => {
        const on = value.includes(o)
        return (
          <button
            key={o}
            type="button"
            className={on ? 'chip chip--on' : 'chip'}
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}
          >
            {labels[o]}
          </button>
        )
      })}
    </div>
  )
}

export function ChipOne<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  labels: Record<T, string>
  value: T | null
  onChange: (next: T | null) => void
}) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => {
        const on = value === o
        return (
          <button
            key={o}
            type="button"
            className={on ? 'chip chip--on' : 'chip'}
            aria-pressed={on}
            onClick={() => onChange(on ? null : o)}
          >
            {labels[o]}
          </button>
        )
      })}
    </div>
  )
}

export function Segmented<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
  tone,
}: {
  label: string
  options: readonly T[]
  labels: Record<T, string>
  value: T
  onChange: (next: T) => void
  /** Optional extra class per option when selected (e.g. warning tones). */
  tone?: Partial<Record<T, string>>
}) {
  return (
    <div
      className="segmented"
      role="group"
      aria-label={label}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          className={value === o ? (tone?.[o] ?? '') : ''}
          onClick={() => onChange(o)}
        >
          {labels[o]}
        </button>
      ))}
    </div>
  )
}

export function Stepper({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (next: number) => void
}) {
  return (
    <div className="stepper">
      <span className="stepper__label">{label}</span>
      <div className="stepper__controls">
        <button
          type="button"
          aria-label={`Less: ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - step))}
        >
          −
        </button>
        <span aria-live="polite">
          {value} {unit}
        </span>
        <button
          type="button"
          aria-label={`More: ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + step))}
        >
          +
        </button>
      </div>
    </div>
  )
}
