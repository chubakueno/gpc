interface RangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  className?: string;
  formatValue?: (v: number) => string;
}

export function RangeSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  className = "",
  formatValue,
}: RangeSliderProps) {
  const displayValue = formatValue ? formatValue(value) : String(value);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm text-[var(--color-muted)]">{label}</label>
        <span className="text-sm font-mono text-[var(--color-accent-2)]">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer
          bg-[var(--color-surface-3)]
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[var(--color-accent)]
          [&::-webkit-slider-thumb]:cursor-pointer"
        style={{
          backgroundImage: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${((value - min) / (max - min)) * 100}%, var(--color-surface-3) ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
    </div>
  );
}
