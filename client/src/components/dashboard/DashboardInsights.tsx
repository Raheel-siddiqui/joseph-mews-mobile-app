import { useMemo, useState } from "react";
import { getPortfolioInsights, type Insight } from "@/lib/insights";
import { isSingleHolding } from "@/lib/holdings";

const PREVIEW_COUNT = 2;

export function DashboardInsights() {
  const insights = useMemo(() => getPortfolioInsights(), []);
  const [expanded, setExpanded] = useState(false);

  if (!insights.length) return null;

  const title = isSingleHolding() ? "Insights" : "Portfolio Insights";
  const preview = insights.slice(0, PREVIEW_COUNT);
  const extra = insights.slice(PREVIEW_COUNT);
  const extraCount = extra.length;

  return (
    <section
      className="dash-ins animate-fade-up"
      style={{ animationDelay: "225ms" }}
      aria-label={title}
    >
      <p className="label-eyebrow">{title}</p>
      <div className="dash-ins__list">
        {preview.map((insight) => (
          <InsightRow key={insight.id} insight={insight} />
        ))}

        {extraCount > 0 && (
          <>
            <div
              id="dash-ins-more"
              className="dash-ins__more"
              data-open={expanded ? "true" : "false"}
            >
              <div className="dash-ins__more-inner">
                {extra.map((insight) => (
                  <InsightRow key={insight.id} insight={insight} />
                ))}
              </div>
            </div>
            <button
              type="button"
              className="dash-ins__toggle tap"
              aria-expanded={expanded}
              aria-controls="dash-ins-more"
              onClick={() => setExpanded((open) => !open)}
            >
              {expanded
                ? "Show less ↑"
                : `View ${extraCount} more insight${
                    extraCount === 1 ? "" : "s"
                  } ↓`}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function InsightRow({ insight }: { insight: Insight }) {
  return (
    <article className="dash-ins__item">
      <span className="dash-ins__mark" aria-hidden />
      <div className="dash-ins__copy">
        <p className="dash-ins__kicker">{insight.category}</p>
        <h3 className="dash-ins__headline">{insight.headline}</h3>
        {insight.body && <p className="dash-ins__body">{insight.body}</p>}
        {insight.context && (
          <p className="dash-ins__context">{insight.context}</p>
        )}
      </div>
      {insight.metric && <p className="dash-ins__metric">{insight.metric}</p>}
    </article>
  );
}
