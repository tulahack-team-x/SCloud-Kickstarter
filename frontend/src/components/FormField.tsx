import clsx from "clsx";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type FieldShellProps = {
  label: string;
  id: string;
  hint?: string;
  error?: string;
};

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & FieldShellProps;

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  FieldShellProps;

function FieldLabel({ id, label }: { id: string; label: string }) {
  return (
    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-stone-900">
      {label}
    </label>
  );
}

function FieldMessages({
  hint,
  error,
}: {
  hint?: string;
  error?: string;
}) {
  if (error) {
    return <p className="mt-1 text-xs text-red-600">{error}</p>;
  }

  if (hint) {
    return <p className="mt-1 text-xs text-stone-500">{hint}</p>;
  }

  return null;
}

export function FormField({
  label,
  id,
  hint,
  error,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div>
      <FieldLabel id={id} label={label} />
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        className={clsx(
          "focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 transition placeholder:text-stone-400",
          error && "border-red-300",
          className,
        )}
        {...props}
      />
      <FieldMessages hint={hint} error={error} />
    </div>
  );
}

export function TextareaField({
  label,
  id,
  hint,
  error,
  className,
  ...props
}: TextareaFieldProps) {
  return (
    <div>
      <FieldLabel id={id} label={label} />
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        className={clsx(
          "focus-ring min-h-28 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 transition placeholder:text-stone-400",
          error && "border-red-300",
          className,
        )}
        {...props}
      />
      <FieldMessages hint={hint} error={error} />
    </div>
  );
}


type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> &
  FieldShellProps;

export function SelectField({
  label,
  id,
  hint,
  error,
  className,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <div>
      <FieldLabel id={id} label={label} />
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        className={clsx(
          "focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 transition",
          error && "border-red-300",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <FieldMessages hint={hint} error={error} />
    </div>
  );
}
