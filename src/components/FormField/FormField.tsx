import { ReactNode } from "react";
import clsx from "clsx";
import "./FormField.css";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

export default function FormField({
  label,
  htmlFor,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={clsx('form-field', className)}>
      <label className="form-field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
