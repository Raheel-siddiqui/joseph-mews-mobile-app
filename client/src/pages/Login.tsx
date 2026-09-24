// Joseph Mews — Login Page
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import { AuthScreen } from "@/components/AuthScreen";
import {
  homePathForPersona,
  INVESTOR_EMAIL,
  setSession,
} from "@/lib/session";

export default function Login() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState(INVESTOR_EMAIL);
  const [otp, setOtp] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("otp");
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const persona = setSession(email);
    setLocation(homePathForPersona(persona));
  };

  return (
    <AuthScreen title="Welcome back">
      {step === "email" ? (
        <form
          onSubmit={handleEmailSubmit}
          className="glass glass--pad space-y-6 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <div>
            <label htmlFor="email" className="label-eyebrow block mb-3">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field text-base font-light tracking-wide"
              placeholder="you@example.com"
              required
              autoComplete="email"
              inputMode="email"
            />
          </div>

          <button type="submit" className="tap press btn-gold">
            <span className="text-sm tracking-widest uppercase font-medium">
              Continue
            </span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            A secure verification code will be sent to your email address.
          </p>
          <p className="text-center text-[13px] text-muted-foreground">
            New here?{" "}
            <Link href="/signup" className="text-primary">
              Create an account
            </Link>
          </p>
        </form>
      ) : (
        <form
          onSubmit={handleOtpSubmit}
          className="glass glass--pad space-y-6 animate-fade-up"
        >
          <div>
            <p className="label-eyebrow mb-3">Verification Code</p>
            <p className="text-sm text-muted-foreground mb-6">
              We've sent a six-digit code to{" "}
              <span className="text-foreground">{email}</span>
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="field text-center text-3xl font-mono tracking-[0.5em]"
              placeholder="••••••"
              maxLength={6}
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </div>

          <button type="submit" className="tap press btn-gold">
            <span className="text-sm tracking-widest uppercase font-medium">
              Verify & Sign In
            </span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={() => setStep("email")}
            className="btn-quiet w-full"
          >
            Use a different email
          </button>
        </form>
      )}
    </AuthScreen>
  );
}
