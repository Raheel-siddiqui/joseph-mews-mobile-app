// Joseph Mews — Login Page
// Design: editorial dark aesthetic, atmospheric hero texture, hairline gold dividers
import { useState } from "react";
import { useLocation } from "wouter";
import { LOGO_URL, HERO_TEXTURE } from "@/lib/data";
import {
  homePathForPersona,
  INVESTOR_EMAIL,
  setSession,
} from "@/lib/session";
import { ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-background grain relative overflow-hidden">
      {/* Atmospheric texture overlay */}
      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: `url(${HERO_TEXTURE})`,
          backgroundSize: "cover",
          backgroundPosition: "top center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />

      <div className="phone-shell relative z-10 flex flex-col min-h-[100dvh] page-px py-10 pt-safe">
        {/* Logo lockup */}
        <div className="flex flex-col items-center pt-12 pb-2 animate-fade-up">
          <img
            src={LOGO_URL}
            alt="Joseph Mews"
            className="w-16 h-16 rounded-[22%] mb-7 shadow-2xl"
          />
          <p className="label-eyebrow mb-3">Investor Platform</p>
          <h1 className="font-serif text-[2rem] sm:text-4xl text-center leading-tight">
            Welcome back
          </h1>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          {step === "email" ? (
            <form
              onSubmit={handleEmailSubmit}
              className="space-y-8 animate-fade-up"
              style={{ animationDelay: "120ms" }}
            >
              <div>
                <label
                  htmlFor="email"
                  className="label-eyebrow block mb-3"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-border pb-3 text-base sm:text-lg font-light tracking-wide focus:outline-none focus:border-primary transition-colors text-foreground"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  inputMode="email"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-between gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-sm active:bg-primary/90 transition-all tap press min-h-[52px]"
              >
                <span className="text-sm tracking-widest uppercase font-medium">
                  Continue
                </span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                A secure verification code will be sent to your email address.
              </p>
            </form>
          ) : (
            <form
              onSubmit={handleOtpSubmit}
              className="space-y-8 animate-fade-up"
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
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full bg-transparent border-0 border-b border-border pb-3 text-3xl font-mono tracking-[0.5em] text-center focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••"
                  maxLength={6}
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-between gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-sm active:bg-primary/90 transition-all tap press min-h-[52px]"
              >
                <span className="text-sm tracking-widest uppercase font-medium">
                  Verify & Sign In
                </span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="block w-full text-center text-xs text-muted-foreground active:text-foreground transition-colors py-3 tap"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>

        <div className="pt-10 pb-4 text-center pb-safe">
          <div className="hairline-gold w-24 mx-auto mb-6" />
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            Established · Joseph Mews · MMXXII
          </p>
        </div>
      </div>
    </div>
  );
}
