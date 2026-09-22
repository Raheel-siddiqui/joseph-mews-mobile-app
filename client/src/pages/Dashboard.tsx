// Joseph Mews — Dashboard
// Design Philosophy: Private Banking Modernism
// - Hero number is the star (Portfolio Value in serif)
// - Supporting metrics sit as light native surfaces, not a dashboard table
import { AppShell } from "@/components/AppShell";
import { filterByRange, fmt, timeRangeLabels, type TimeRange } from "@/lib/data";
import {
  getActivePortfolio,
  getActivePortfolioHistory,
  getActiveProperties,
  isSingleHolding,
} from "@/lib/holdings";
import { buildIntelligence } from "@/lib/intelligence";
import { propertyImageSrc } from "@/lib/propertyImage";
import { getActiveUser } from "@/lib/session";
import { useEffect, useMemo, useState } from "react";
import { ContactAdvisorSheet } from "@/components/ContactAdvisorSheet";
import { AdvisorBar } from "@/components/dashboard/AdvisorBar";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardHighlights } from "@/components/dashboard/DashboardHighlights";
import { DashboardInsights } from "@/components/dashboard/DashboardInsights";
import { DashboardUpdates } from "@/components/dashboard/DashboardUpdates";
import { HoldingsRail } from "@/components/dashboard/HoldingsRail";

export default function Dashboard() {
  const [greeting, setGreeting] = useState("Good evening");
  const [range, setRange] = useState<TimeRange>("1Y");
  const [contactOpen, setContactOpen] = useState(false);
  const user = getActiveUser();
  const properties = getActiveProperties();
  const portfolio = getActivePortfolio();
  const portfolioHistory = getActivePortfolioHistory();
  const single = isSingleHolding();
  const intelligence = useMemo(
    () => buildIntelligence(properties),
    [properties]
  );

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Filter the portfolio time-series by selected range
  const series = useMemo(
    () => filterByRange(portfolioHistory, range),
    [portfolioHistory, range]
  );

  // Compute return for the selected range from the series
  const rangeReturn = useMemo(() => {
    if (series.length < 2) return { amount: 0, pct: 0 };
    const start = series[0].value;
    const end = series[series.length - 1].value;
    return {
      amount: end - start,
      pct: ((end - start) / start) * 100,
    };
  }, [series]);

  const isAll = range === "ALL";
  const returnAmount = isAll ? portfolio.totalReturn : rangeReturn.amount;
  const returnPct = isAll ? portfolio.totalReturnPct : rangeReturn.pct;

  const sole = properties[0];
  const bannerSlides = properties.map((property) => ({
    id: property.id,
    href: `/property/${property.id}`,
    image: propertyImageSrc(property),
    loc: property.city.split(" ")[0],
    name: property.name,
    value: fmt.currency(property.currentValue),
  }));

  return (
    <AppShell>
      <div className="page-px min-w-0">
        <div className="mb-11 min-w-0">
          <DashboardHero
            greeting={greeting}
            firstName={user.firstName}
            single={single}
            slides={bannerSlides}
            currentValue={portfolio.currentValue}
            returnAmount={returnAmount}
            returnPct={returnPct}
            rangeLabel={timeRangeLabels[range]}
            series={series}
            range={range}
            onRangeChange={setRange}
            invested={portfolio.totalInvested}
            equity={portfolio.totalEquity}
            loans={portfolio.totalLoan}
            grossYield={portfolio.grossYield}
            grossYieldDelta={portfolio.grossYieldDelta}
            netCashFlow={portfolio.netCashFlow}
            netCashFlowDelta={portfolio.netCashFlowDelta}
          />
        </div>

        <HoldingsRail
          properties={properties}
          single={single}
          soleId={sole?.id}
          count={portfolio.propertyCount}
        />
        <DashboardHighlights intelligence={intelligence} />
        <DashboardInsights />
        <DashboardUpdates />

        <AdvisorBar
          name={user.advisor}
          title={user.advisorTitle}
          photo={user.advisorPhoto}
          onContact={() => setContactOpen(true)}
        />
      </div>

      {contactOpen && (
        <ContactAdvisorSheet onClose={() => setContactOpen(false)} />
      )}
    </AppShell>
  );
}



