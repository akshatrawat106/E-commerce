import { useState } from "react";

interface VInputProps {
  label?: string;
  value: string;
  onChange?: (val: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
  suffix?: React.ReactNode;
  className?: string;
}

export const VInput = ({ label, value, onChange, type = "text", placeholder, error, readOnly, suffix, className }: VInputProps) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className={className}>
      {label && (
        <label className={`block text-[10px] font-mono tracking-[1.5px] uppercase mb-1.5 transition-colors ${focused ? "text-primary" : "text-text-dim"}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full rounded-lg px-3.5 py-[11px] text-sm font-body outline-none transition-all ${
            readOnly
              ? "bg-abyss text-text-secondary border border-border"
              : `bg-deep border ${error ? "border-destructive" : focused ? "border-primary/40 shadow-[0_0_0_3px_hsl(var(--primary-glow)),inset_0_1px_3px_rgba(0,0,0,0.3)]" : "border-border shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]"} text-foreground`
          }`}
          style={suffix ? { paddingRight: 48 } : undefined}
        />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim text-xs">{suffix}</div>}
      </div>
      {error && <div className="text-[11px] text-destructive mt-1 font-mono">⚠ {error}</div>}
    </div>
  );
};
