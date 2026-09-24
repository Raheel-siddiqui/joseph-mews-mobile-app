import { FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { fmt, getProperty, type Activity } from "@/lib/data";
import { opportunities } from "@/lib/explore";
import { getActiveActivities } from "@/lib/holdings";
import { opportunityImageSrc, propertyImageSrc } from "@/lib/propertyImage";

type UpdateTab = "property" | "news";

type NewsItem = {
  id: string;
  title: string;
  detail: string;
  when: string;
  href?: string;
  thumb?: string;
  chip?: string;
  amount?: string;
};

const TABS: { id: UpdateTab; label: string }[] = [
  { id: "property", label: "Property" },
  { id: "news", label: "News" },
];

function hrefFor(item: Activity) {
  if (item.property) return `/property/${item.property}`;
  if (item.type === "document") return "/documents";
  return undefined;
}

function thumbFor(item: Activity) {
  if (!item.property) return undefined;
  const property = getProperty(item.property);
  return property ? propertyImageSrc(property) : undefined;
}

function amountLabel(item: Activity) {
  if (item.amount == null) return undefined;
  const value = fmt.currency(item.amount);
  return item.type === "valuation" ? `+${value}` : value;
}

function detailLabel(item: Activity) {
  const amount = amountLabel(item);
  if (!amount) return item.detail;
  return item.detail
    .replace(` · ${amount}`, "")
    .replace(amount, "")
    .replace(/\s·\s*$/, "")
    .trim();
}

function isPropertyUpdate(item: Activity) {
  return Boolean(item.property);
}

export function DashboardUpdates() {
  const [tab, setTab] = useState<UpdateTab>("property");
  const activities = getActiveActivities();

  const propertyItems = useMemo(
    () => activities.filter(isPropertyUpdate),
    [activities]
  );

  const newsItems = useMemo<NewsItem[]>(() => {
    const fromFeed = activities
      .filter((item) => !isPropertyUpdate(item))
      .map((item) => ({
        id: item.id,
        title: item.title,
        detail: detailLabel(item),
        when: item.timestamp,
        href: hrefFor(item),
        thumb: thumbFor(item),
        amount: amountLabel(item),
      }));

    const fromMarket = opportunities
      .filter((opportunity) => opportunity.status !== "Sold Out")
      .map((opportunity) => ({
        id: opportunity.id,
        title: opportunity.name,
        detail: opportunity.tagline,
        when: opportunity.expectedCompletion,
        href: `/explore/${opportunity.id}`,
        thumb: opportunityImageSrc(opportunity),
        chip: opportunity.status === "Available" ? opportunity.status : undefined,
      }));

    return [...fromMarket, ...fromFeed];
  }, [activities]);

  const propertyCount = propertyItems.length;
  const newsCount = newsItems.length;
  if (propertyCount === 0 && newsCount === 0) return null;

  const [featured, ...rest] = newsItems;

  return (
    <section
      className="dash-upd animate-fade-up"
      style={{ animationDelay: "260ms" }}
      aria-label="Updates"
    >
      <div className="dash-upd__head">
        <p className="label-eyebrow">Updates</p>
        <div className="dash-upd__tabs" role="tablist" aria-label="Update type">
          {TABS.map((item) => {
            const selected = tab === item.id;
            const count = item.id === "property" ? propertyCount : newsCount;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`dash-upd__tab tap ${
                  selected ? "dash-upd__tab--on" : ""
                }`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
                <span className="dash-upd__count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tab === "news" ? (
        newsCount === 0 ? (
          <p className="dash-upd__empty">No news updates just now.</p>
        ) : (
          <div className="dash-upd__card">
            {featured && (
              <FeaturedNews item={featured} />
            )}
            {rest.length > 0 && (
              <ul className="dash-upd__list">
                {rest.map((item) => (
                  <NewsRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </div>
        )
      ) : propertyCount === 0 ? (
        <p className="dash-upd__empty">No property updates just now.</p>
      ) : (
        <ul className="dash-upd__card">
          {propertyItems.map((item) => (
            <UpdateRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}

function FeaturedNews({ item }: { item: NewsItem }) {
  const inner = (
    <>
      {item.thumb ? (
        <img src={item.thumb} alt="" className="dash-upd__feature-img" />
      ) : (
        <span className="dash-upd__feature-fallback" aria-hidden>
          <FileText strokeWidth={1.5} />
        </span>
      )}
      <span className="dash-upd__feature-shade" aria-hidden />
      <span className="dash-upd__feature-copy">
        {item.chip && <span className="dash-upd__chip">{item.chip}</span>}
        <span className="dash-upd__feature-title">{item.title}</span>
        <span className="dash-upd__feature-detail">{item.detail}</span>
        <span className="dash-upd__feature-when">{item.when}</span>
      </span>
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="dash-upd__feature tap press"
        aria-label={`${item.title}. ${item.detail}`}
      >
        {inner}
      </Link>
    );
  }

  return <div className="dash-upd__feature">{inner}</div>;
}

function NewsRow({ item }: { item: NewsItem }) {
  const inner = (
    <>
      {item.thumb ? (
        <img src={item.thumb} alt="" className="dash-upd__thumb" />
      ) : (
        <span className="dash-upd__thumb dash-upd__thumb--icon" aria-hidden>
          <FileText className="w-3.5 h-3.5" strokeWidth={1.6} />
        </span>
      )}
      <span className="dash-upd__copy">
        <span className="dash-upd__title">{item.title}</span>
        <span className="dash-upd__detail">{item.detail}</span>
        <span className="dash-upd__when">
          {item.chip ? `${item.chip} · ${item.when}` : item.when}
        </span>
      </span>
      {item.amount && <span className="dash-upd__amount">{item.amount}</span>}
    </>
  );

  if (item.href) {
    return (
      <li>
        <Link href={item.href} className="dash-upd__row tap press">
          {inner}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div className="dash-upd__row">{inner}</div>
    </li>
  );
}

function UpdateRow({ item }: { item: Activity }) {
  const href = hrefFor(item);
  const thumb = thumbFor(item);
  const amount = amountLabel(item);
  const inner = (
    <>
      {thumb ? (
        <img src={thumb} alt="" className="dash-upd__thumb" />
      ) : (
        <span className="dash-upd__thumb dash-upd__thumb--icon" aria-hidden>
          <FileText className="w-3.5 h-3.5" strokeWidth={1.6} />
        </span>
      )}
      <span className="dash-upd__copy">
        <span className="dash-upd__title">
          {item.title}
          {item.isNew && <span className="dash-upd__dot" aria-label="New" />}
        </span>
        <span className="dash-upd__detail">{detailLabel(item)}</span>
        <span className="dash-upd__when">{item.timestamp}</span>
      </span>
      {amount && <span className="dash-upd__amount">{amount}</span>}
    </>
  );

  if (href) {
    return (
      <li>
        <Link href={href} className="dash-upd__row tap press">
          {inner}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div className="dash-upd__row">{inner}</div>
    </li>
  );
}
