
export function Field({
  id,
  name,
  label,
  type = "text",
  placeholder,
  inputMode,
  maxLength,
  pattern,
  onChange
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  pattern?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-(--color-text-muted) uppercase tracking-wide">
        {label}
      </label>
      <input
        data-form-input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        pattern={pattern}
        onChange={onChange}
        required
        autoComplete={type === "password" ? "new-password" : undefined}
      />
    </div>
  );
}