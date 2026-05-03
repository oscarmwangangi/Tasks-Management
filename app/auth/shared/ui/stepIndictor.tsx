export function StepIndicator({ current }: { current: "register" | "verify" }) {
  const steps = ["register", "verify"] as const;
  return (
    <div className="flex items-center gap-2" aria-label="Registration progress">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full transition-colors duration-300"
            style={{
              background: current === s || (s === "register" && current === "verify")
                ? "var(--color-step-active)"
                : "var(--color-step-inactive)",
            }}
          />
          {i < steps.length - 1 && (
            <div
              className="h-px w-8 transition-colors duration-300"
              style={{
                background: current === "verify"
                  ? "var(--color-step-active)"
                  : "var(--color-step-inactive)",
              }}
            />
          )}
        </div>
      ))}
      <span className="ml-1 text-xs text-(--color-text-muted)">
        {current === "register" ? "Step 1 of 2" : "Step 2 of 2"}
      </span>
    </div>
  );
}