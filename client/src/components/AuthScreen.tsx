import { ReactNode } from "react";
import { HERO_TEXTURE, LOGO_URL } from "@/lib/data";

export function AuthScreen({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background grain relative">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${HERO_TEXTURE})`,
          backgroundSize: "cover",
          backgroundPosition: "top center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/25 to-background/80 pointer-events-none" />

      <div className="phone-shell relative z-10 flex flex-col min-h-[100dvh] page-px py-10 pt-safe">
        <div className="flex flex-col items-center pt-12 pb-2 animate-fade-up">
          <img
            src={LOGO_URL}
            alt="Mews One"
            className="w-16 h-16 rounded-[22%] mb-7 shadow-2xl"
          />
          <p className="label-eyebrow mb-3">Investor Platform</p>
          <h1 className="page-intro__title text-center">{title}</h1>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          {children}
        </div>

        <div className="pt-10 pb-4 text-center pb-safe">
          <div className="hairline-gold w-24 mx-auto mb-6" />
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            Established · Mews One · MMXXII
          </p>
        </div>
      </div>
    </div>
  );
}
