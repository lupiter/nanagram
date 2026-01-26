import React from "react";
import clsx from "clsx";
import "./ToggleGroup.css";

interface ToggleGroupOption<T> {
  value: T;
  label: string | React.ReactNode;
  ariaLabel?: string;
}

interface ToggleGroupProps<T> {
  value: T;
  onChange: (value: T) => void;
  options: ToggleGroupOption<T>[];
  name: string;
  title?: string;
  disabled?: boolean;
}

export default function ToggleGroup<T>({ value, onChange, options, name, title, disabled }: ToggleGroupProps<T>) {
  return (
    <div className="toggle-group-container">
      {title && <div className="toggle-group-title">{title}</div>}
      <div className={clsx('toggle-group', { 'toggle-group-disabled': disabled })}>
        {options.map((option) => (
          <label key={String(option.value)} className={clsx('toggle-button', { disabled })}>
            <input
              type="radio"
              name={name}
              value={String(option.value)}
              checked={value === option.value}
              disabled={disabled}
              onChange={() => {
                onChange(option.value);
              }}
              aria-label={typeof option.label === 'string' ? (option.ariaLabel ?? option.label) : option.ariaLabel}
            />
            <span className="toggle-button-label">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
} 