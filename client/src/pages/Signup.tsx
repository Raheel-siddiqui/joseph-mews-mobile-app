import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { AuthScreen } from "@/components/AuthScreen";
import { homePathForPersona, setSession } from "@/lib/session";

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

export default function Signup() {
  const [, setLocation] = useLocation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate(fullName, email, password, confirm);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const persona = setSession(email, fullName.trim());
    setLocation(homePathForPersona(persona));
  }

  return (
    <AuthScreen title="Create your account">
      <form
        onSubmit={handleSubmit}
        className="glass glass--pad space-y-4 animate-fade-up"
        noValidate
      >
        <Field
          id="full-name"
          label="Full name"
          value={fullName}
          autoComplete="name"
          error={errors.name}
          onChange={(value) => {
            setFullName(value);
            setErrors((current) => ({ ...current, name: undefined }));
          }}
        />
        <Field
          id="signup-email"
          label="Email address"
          type="email"
          value={email}
          autoComplete="email"
          inputMode="email"
          error={errors.email}
          onChange={(value) => {
            setEmail(value);
            setErrors((current) => ({ ...current, email: undefined }));
          }}
        />
        <Field
          id="signup-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          autoComplete="new-password"
          error={errors.password}
          hint="At least 8 characters."
          onToggleVisible={() => setShowPassword((current) => !current)}
          visible={showPassword}
          onChange={(value) => {
            setPassword(value);
            setErrors((current) => ({ ...current, password: undefined }));
          }}
        />
        <Field
          id="signup-confirm"
          label="Confirm password"
          type={showConfirm ? "text" : "password"}
          value={confirm}
          autoComplete="new-password"
          error={errors.confirm}
          onToggleVisible={() => setShowConfirm((current) => !current)}
          visible={showConfirm}
          onChange={(value) => {
            setConfirm(value);
            setErrors((current) => ({ ...current, confirm: undefined }));
          }}
        />
        <button type="submit" className="tap press btn-gold">
          <span>Create account</span>
          <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          No portfolio is linked until your advisor completes set-up.
        </p>
        <p className="text-center text-[13px] text-muted-foreground">
          Already a member?{" "}
          <Link href="/" className="text-primary">
            Sign in
          </Link>
        </p>
      </form>
    </AuthScreen>
  );
}

function validate(
  fullName: string,
  email: string,
  password: string,
  confirm: string,
): Errors {
  const errors: Errors = {};
  const name = fullName.trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length < 2 || parts.some((part) => part.length < 2)) {
    errors.name = "Enter your full name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }
  if (!confirm) {
    errors.confirm = "Confirm your password.";
  } else if (confirm !== password) {
    errors.confirm = "Passwords do not match.";
  }
  return errors;
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  error,
  hint,
  visible,
  onToggleVisible,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: "email" | "text";
  error?: string;
  hint?: string;
  visible?: boolean;
  onToggleVisible?: () => void;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div>
      <label htmlFor={id} className="label-eyebrow block mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`field text-base ${onToggleVisible ? "pr-12" : ""}`}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
        />
        {onToggleVisible && (
          <button
            type="button"
            onClick={onToggleVisible}
            className="tap absolute right-0.5 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-muted-foreground"
            aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          >
            {visible ? (
              <EyeOff className="w-4 h-4" strokeWidth={1.5} />
            ) : (
              <Eye className="w-4 h-4" strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-[12px] text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-[13px] text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
