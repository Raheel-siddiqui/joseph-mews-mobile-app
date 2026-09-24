// Joseph Mews — App Shell with phone-style frame and bottom navigation
// Design: deep navy background, hairline dividers, champagne gold accents
import { Link, useLocation } from "wouter";
import {
  LayoutGrid,
  Building2,
  FileText,
  ChevronLeft,
  Compass,
  Calculator as CalculatorIcon,
} from "lucide-react";
import { LOGO_URL } from "@/lib/data";
import {
  getActiveUser,
  homePathForPersona,
  isInvestor,
  userInitials,
} from "@/lib/session";
import { ReactNode, useEffect, useState } from "react";

const GRADIENT_KEY = "jm_screen_gradient";

function readScreenGradient(): boolean {
  try {
    return localStorage.getItem(GRADIENT_KEY) === "on";
  } catch {
    return false;
  }
}

interface AppShellProps {
  children: ReactNode;
  showNav?: boolean;
  showHeader?: boolean;
  backTo?: string;
  title?: string;
}

export function AppShell({
  children,
  showNav = true,
  showHeader = true,
  backTo,
  title,
}: AppShellProps) {
  const [location] = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, [location]);
  const [gradientOn, setGradientOn] = useState(readScreenGradient);

  useEffect(() => {
    const sync = () => setGradientOn(readScreenGradient());
    window.addEventListener("jm-screen-gradient", sync);
    return () => window.removeEventListener("jm-screen-gradient", sync);
  }, []);
  const investorMode = isInvestor();
  const homePath = homePathForPersona();
  const user = getActiveUser();

  return (
    <div className="min-h-screen bg-background grain">
      <div className="phone-shell bg-background relative">
        <div
          className={`phone-wash${gradientOn ? " phone-wash--on" : ""}`}
          aria-hidden="true"
        />
        {showHeader && (
          <header
            className={`sticky top-0 z-40 backdrop-blur-xl pt-safe ${
              backTo ? "bg-background/92" : "bg-background/30"
            }`}
          >
            <div className="relative flex items-center justify-between page-px h-14">
              {backTo ? (
                <Link
                  href={backTo}
                  className="tap flex items-center gap-1.5 text-muted-foreground active:text-foreground transition-colors -ml-2 px-2 h-11"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-sm">Back</span>
                </Link>
              ) : (
                <Link href={homePath} className="tap flex items-center gap-2.5 -ml-1 h-11 px-1">
                  <img
                    src={LOGO_URL}
                    alt="Mews One"
                    className="app-header__logo"
                  />
                  <span className="font-serif text-[15px] tracking-tight leading-none">
                    Mews One
                  </span>
                </Link>
              )}
              {title && (
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-serif text-base">
                  {title}
                </span>
              )}
              {!title && !backTo && (
                <Link
                  href="/profile"
                  className="tap w-11 h-11 -mr-1 rounded-full flex items-center justify-center active:opacity-70 transition-opacity"
                  aria-label="Profile"
                >
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt=""
                      className="app-header__photo"
                    />
                  ) : (
                    <span className="app-header__avatar">
                      {userInitials(user)}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </header>
        )}

        <main className={showNav ? "pb-28" : "pb-8"}>{children}</main>

        {showNav && (
          <nav className="app-tabbar" aria-label="Primary">
            <div className="app-tabbar__bar">
              {investorMode ? (
                <>
                  <NavItem
                    href="/dashboard"
                    label="Overview"
                    icon={LayoutGrid}
                    active={location === "/dashboard" || location === "/"}
                  />
                  <NavItem
                    href="/portfolio"
                    label="Portfolio"
                    icon={Building2}
                    active={
                      location === "/portfolio" ||
                      location.startsWith("/property")
                    }
                  />
                  <NavItem
                    href="/explore"
                    label="Explore"
                    icon={Compass}
                    active={location.startsWith("/explore")}
                  />
                  <NavItem
                    href="/calculator"
                    label="Calc"
                    icon={CalculatorIcon}
                    active={location.startsWith("/calculator")}
                  />
                  <NavItem
                    href="/documents"
                    label="Docs"
                    icon={FileText}
                    active={location === "/documents"}
                  />
                </>
              ) : (
                <>
                  <NavItem
                    href="/explore"
                    label="Explore"
                    icon={Compass}
                    active={location.startsWith("/explore")}
                  />
                  <NavItem
                    href="/calculator"
                    label="Calc"
                    icon={CalculatorIcon}
                    active={location.startsWith("/calculator")}
                  />
                </>
              )}
            </div>
          </nav>
        )}

      </div>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="app-tabbar__item tap"
      aria-current={active ? "page" : undefined}
    >
      <Icon
        className={`w-[1.125rem] h-[1.125rem] transition-colors ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
        strokeWidth={1.5}
      />
      <span
        className={`text-[11px] tracking-[0.1em] uppercase whitespace-nowrap transition-colors ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
