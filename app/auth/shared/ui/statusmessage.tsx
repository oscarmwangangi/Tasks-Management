export function StatusMessage({ state }: { state: { success: boolean; message: string } }) {
  if (!state.message) return null;
  return (
    <p
      role="alert"
      className={`text-sm rounded-lg px-3 py-2 ${
        state.success
          ? "bg-green-50 dark:bg-green-950 text-(--color-success)"
          : "bg-red-50 dark:bg-red-950 text-(--color-error)"
      }`}
    >
      {state.success ? "✓ " : "⚠ "}
      {state.message}
    </p>
  );
}