# Joseph Mews Investor Platform — Metrics & Formulas

Reference for all headline metrics shown in the prototype, how they are calculated, and the **exact data fields** required from CRM / admin / assumptions to compute them in production.

> **Note:** Dashboard “capital growth” and projection “total return” use **different definitions** (value change only vs capital + income). This is intentional in the current app.

---

## 1. Portfolio dashboard metrics

| Metric | Formula | Data required |
|--------|---------|---------------|
| **Total portfolio value** | `Σ currentValue` across all investor properties | Per property: `currentValue` (latest valuation, GBP) |
| **Total invested** | `Σ purchasePrice` | Per property: `purchasePrice` |
| **Total equity** | `Σ equity` | Per property: `equity` (= `currentValue − loanBalance`, or supplied directly) |
| **Total loans outstanding** | `Σ loanBalance` | Per property: `loanBalance` |
| **Capital growth (£)** — dashboard hero | `Σ capitalGrowth` where `capitalGrowth = currentValue − purchasePrice` | Per property: `purchasePrice`, `currentValue` (or pre-computed `capitalGrowth`) |
| **Capital growth (%)** — dashboard | `(totalCapitalGrowth / totalInvested) × 100` | `totalCapitalGrowth`, `totalInvested` (as above) |
| **Capital growth over time range** | `endValue − startValue` on filtered portfolio history series | Monthly portfolio snapshots: `month`, `value`, `monthsAgo` (or dated valuations aggregated to portfolio level) |
| **Capital growth % over time range** | `((endValue − startValue) / startValue) × 100` | Same time-series as above |
| **Net yield (portfolio)** | `(netCashFlow × 12 / currentValue) × 100` | Portfolio: `netCashFlow` (monthly), `currentValue`; or derive from properties |
| **Gross yield (portfolio)** | `(monthlyRent × 12 / currentValue) × 100` | Portfolio: `Σ monthlyRent`, `currentValue` |
| **Net cash flow (monthly)** | `Σ netMonthlyIncome` | Per property: `netMonthlyIncome` |
| **Net yield delta** | `currentNetYield − priorPeriodNetYield` (pts) | Net yield for current and comparison period (e.g. prior year) |
| **Net cash flow delta** | `currentNetCashFlow − priorMonthNetCashFlow` | Monthly net cash flow for current and prior month |
| **Property count** | Count of properties linked to investor | Investor–property mapping |
| **Tenanted count** | Count where `status = Tenanted` | Per property: `status` |

---

## 2. Property-level metrics (owned holdings)

| Metric | Formula | Data required |
|--------|---------|---------------|
| **Purchase price** | Stored | `purchasePrice`, `purchaseDate` |
| **Current value** | Stored / latest valuation | `currentValue`, valuation `asOfDate` |
| **Capital growth (£)** | `currentValue − purchasePrice` | `currentValue`, `purchasePrice` |
| **Capital growth (%)** | `(capitalGrowth / purchasePrice) × 100` | Same as above |
| **Equity position** | `currentValue − loanBalance` (or stored `equity`) | `currentValue`, `loanBalance` |
| **Equity % of value** | `(equity / currentValue) × 100` | `equity`, `currentValue` |
| **LTV** | `(loanBalance / currentValue) × 100` or `100 − equity%` | `loanBalance`, `currentValue` |
| **Monthly rental income** | Actual rent received | `monthlyRent` (actual); `expectedRent` for comparison |
| **Annual gross rent** | `monthlyRent × 12` | `monthlyRent` |
| **Monthly service charge** | Stored | `monthlyServiceCharge` |
| **Monthly management fee** | Stored | `monthlyManagementFee` |
| **Monthly mortgage payment** | Stored | `monthlyMortgage` |
| **Net monthly income** | `monthlyRent − serviceCharge − managementFee − mortgage` | All four monthly cost/income fields |
| **Annual net income** | `netMonthlyIncome × 12` or stored | `netMonthlyIncome` or `annualNetIncome` |
| **Gross yield** | `(annualGrossRent / currentValue) × 100` where `annualGrossRent = monthlyRent × 12` | `monthlyRent`, `currentValue` |
| **Net yield** | `(annualNetIncome / currentValue) × 100` | `annualNetIncome`, `currentValue` |
| **Value change (chart range)** | `endValue − startValue` on filtered `valueHistory` | Time series per property: `{ month, value, monthsAgo }` |
| **Value change % (chart range)** | `((end − start) / start) × 100` | Same value history |
| **Occupancy** | Stored % | `occupancy` |
| **Tenancy end** | Stored | `tenancyEnd`, optional `tenantName` |

---

## 3. Calculator & affordability metrics

| Metric | Formula | Data required |
|--------|---------|---------------|
| **Buying power / budget** (mortgage) | `deposit / (1 − LTV%)` rounded | Investor input: `deposit`; assumption/input: `LTV` (%) |
| **Buying power** (cash purchase) | `deposit` | `deposit` |
| **Loan amount** | `price × (LTV / 100)` | `price` (unit), `LTV` |
| **Cash deposit (equity at purchase)** | `price − loanAmount` | `price`, `loanAmount` |
| **Mortgage rate** | By nationality: UK vs Non-UK rate table | `nationality`, admin rates: `ukMortgageRate`, `nonUkMortgageRate` |
| **Annual mortgage (interest-only)** | `loanAmount × (mortgageRate / 100)` | `loanAmount`, `mortgageRate` |
| **Annual mortgage (repayment)** | `(loan × r) / (1 − (1+r)^−n)` where `r = rate/100`, `n = 25` years | `loanAmount`, `mortgageRate`, term `n` (default 25) |
| **SDLT (illustrative)** | `price × sdltRate` where UK = 3%, Non-UK = 5% | `price`, `nationality` (production: full SDLT band table) |
| **Legal fees** | Fixed illustrative: `£2,500` | Config / fee schedule |
| **Initial cash required** | `cashDeposit + SDLT + legalFees` | All three components |
| **Annual gross rent (calculator)** | `price × (grossYield / 100)` | Opportunity/unit: `fromPrice`, `grossYield` (%) |
| **Monthly rent (calculator)** | `annualGrossRent / 12` | Derived from above |
| **Annual service charge** | `price × (serviceChargePctOfValue / 100)` default 0.5% | `price`, assumption `serviceChargePctOfValue` |
| **Annual management fee** | `annualGrossRent × (managementFeePctOfRent / 100)` default 10% | `annualGrossRent`, assumption `managementFeePctOfRent` |
| **Annual costs (year 1)** | `serviceCharge + managementFee + annualMortgage` | All three annual figures |
| **Net annual income (year 1)** | `annualGrossRent − annualCosts` | Rent and costs as above |
| **Net monthly income** | `netAnnualIncome / 12` | `netAnnualIncome` |
| **Net yield (calculator)** | `(netAnnualIncome / price) × 100` | `netAnnualIncome`, `price` |
| **Default LTV by risk** | Cautious 55%, Balanced 65%, Growth 75% | Investor selection: `riskAppetite` |

---

## 4. Projection engine metrics (5 / 10 / 15 years)

Used on Property Detail, Explore detail, and Calculator. Source: `lib/projection.ts`.

### Inputs (per scenario)

| Input | Source | Data required |
|-------|--------|---------------|
| `startValue` | Property price or current value | `price` or `currentValue` |
| `annualGrowth` | % p.a. capital growth | Admin assumption by city/property, or derived from 5-yr forecast |
| `annualGrossRent` | Year-1 gross rent | `monthlyRent × 12` or `price × grossYield%` |
| `rentalGrowth` | % p.a. rent growth | Admin assumption (default 3.0%) |
| `annualServiceCharge` | Year-1 | Property data or `price × 0.5%` |
| `annualManagementFee` | Year-1 | Property data or `10% of gross rent` |
| `annualMortgage` | Year-1 | Interest-only or repayment annual payment |
| `costGrowth` | % p.a. on costs | Admin assumption (default 2.5%) |
| `horizon` | Years | User selection: 5, 10, 15 (or any whole year) |

### Per-year calculations (year `y = 1 … horizon`)

| Metric | Formula | Data required |
|--------|---------|---------------|
| **Property value** | `startValue × (1 + annualGrowth/100)^y` | `startValue`, `annualGrowth`, `y` |
| **Gross rent** | `annualGrossRent × (1 + rentalGrowth/100)^(y−1)` | `annualGrossRent`, `rentalGrowth`, `y` |
| **Service charge** | `annualServiceCharge × (1 + costGrowth/100)^(y−1)` | Year-1 service charge, `costGrowth` |
| **Management fee** | `annualManagementFee × (1 + costGrowth/100)^(y−1)` | Year-1 management fee, `costGrowth` |
| **Mortgage** | Held **flat** each year (interest-only style in model) | `annualMortgage` |
| **Total costs** | `serviceCharge + managementFee + mortgage` | Per-year cost components |
| **Net income** | `grossRent − totalCosts` | Per-year rent and costs |
| **Cumulative net income** | Running sum of `netIncome` | Prior years’ net income |
| **Capital gain** | `propertyValue − startValue` | `propertyValue`, `startValue` |
| **Total return** | `capitalGain + cumulativeNetIncome` | Both components |

### Headline outputs at horizon

| Metric | Formula | Data required |
|--------|---------|---------------|
| **End value** | Property value in final year | Full projection inputs |
| **Total capital gain** | `endValue − startValue` | `endValue`, `startValue` |
| **Total net income** | Cumulative net income at horizon | Projection run |
| **Total return** | `totalCapitalGain + totalNetIncome` | Projection run |
| **Total return %** | `(totalReturn / startValue) × 100` | `totalReturn`, `startValue` |

### Explore: 5-year growth → annual rate

| Metric | Formula | Data required |
|--------|---------|---------------|
| **Annual capital growth (from 5-yr forecast)** | `(1 + capitalGrowth5Y/100)^(1/5) − 1` expressed as % | Opportunity: `capitalGrowth5Y` (5-year % forecast) |

---

## 5. Explore / marketplace metrics

| Metric | Formula | Data required |
|--------|---------|---------------|
| **Starting price** | Stored per opportunity | `fromPrice` |
| **Gross yield (estimated)** | Stored % | `grossYield` |
| **Net yield (estimated)** | Stored % | `netYield` |
| **5-year capital growth (forecast)** | Stored % | `capitalGrowth5Y` |
| **Units available** | `unitsAvailable / totalUnits` | Per development: unit counts by type |
| **Filter: budget band** | `fromPrice ≤ budgetBand.max` | `fromPrice`, band config |
| **Filter: yield band** | `grossYield ≥ band.min` | `grossYield`, band config |

---

## 6. Portfolio intelligence & insights

| Metric | Formula | Data required |
|--------|---------|---------------|
| **Best performer** | Highest `performanceScore` | Per property: `netYield`, `capitalGrowthPct` |
| **Performance score** (income-producing) | `netYield × 1.2 + capitalGrowthPct × 0.4` | `netYield`, `capitalGrowthPct` |
| **Performance score** (non-income) | `capitalGrowthPct × 0.4` | `capitalGrowthPct` |
| **Highest gross yield property** | Max `grossYield` among `netYield > 0` | `grossYield`, `netYield` per property |
| **Avg net yield** | Mean `netYield` where `netYield > 0` | `netYield` for income-producing properties |
| **Yield vs portfolio avg** | `property.netYield − avgNetYield` | Property `netYield`, portfolio average |
| **City value share** | `(cityValue / portfolio.currentValue) × 100` | Per property: `city`, `currentValue` |
| **Regional avg net yield** | Mean `netYield` for tenanted properties in city | `city`, `status`, `netYield` |
| **Yield vs target** | Compare `portfolio.netYield` to benchmark (4.0%) | Portfolio net yield, config benchmark |

---

## 7. Data field checklist (CRM / admin minimum)

### Per owned property

| Field | Type | Used for |
|-------|------|----------|
| `purchasePrice` | GBP | Invested, capital growth |
| `currentValue` | GBP | Value, yields, equity |
| `purchaseDate` | Date | Display, tenure |
| `loanBalance` | GBP | LTV, equity, costs |
| `monthlyRent` | GBP | Actual income, gross yield |
| `expectedRent` | GBP | Projected / comparison |
| `monthlyServiceCharge` | GBP | Net income, costs |
| `monthlyManagementFee` | GBP | Net income, costs |
| `monthlyMortgage` | GBP | Net income, costs |
| `status` | Enum | Tenanted / In Build / Vacant |
| `city` | String | Regional insights |
| `valueHistory[]` | `{ month, value }` | Charts, range returns |
| `rentHistory[]` | `{ month, rent }` | Rent charts (optional) |

### Per investor

| Field | Type | Used for |
|-------|------|----------|
| `nationality` | UK / Non-UK | Mortgage rate, SDLT |
| `deposit` (calculator input) | GBP | Budget, affordability |
| Property links | IDs | Portfolio aggregation |

### Admin assumptions (rates table)

| Field | Type | Used for |
|-------|------|----------|
| `capitalGrowth` by city/property | % p.a. | Projections |
| `rentalGrowth` | % p.a. | Projections |
| `costGrowth` | % p.a. | Projections |
| `ukMortgageRate` / `nonUkMortgageRate` | % | Calculator |
| `managementFeePctOfRent` | % | Calculator defaults |
| `serviceChargePctOfValue` | % | Calculator defaults |
| `grossYield` / `netYield` per opportunity | % | Explore, calculator rent |
| `capitalGrowth5Y` per opportunity | % | Explore headline + annualisation |
| SDLT bands | Band table | Production SDLT (prototype uses flat %) |

---

## 8. Important definitions (client alignment)

| Term | Meaning in app | Not the same as |
|------|----------------|-----------------|
| **Capital growth (dashboard)** | Change in property **value** since purchase | Total return (capital + rent) |
| **Total return (projection / calculator)** | Capital gain **+** cumulative rental income | Dashboard capital growth |
| **Gross yield** | Rent before costs ÷ value | Net yield |
| **Net yield** | Income after all costs ÷ value | Gross yield |
| **Actual vs estimated** | Owned = actual where available; Explore = estimated | — |

---

*Generated from prototype codebase (`data.ts`, `projection.ts`, `CalculatorHome.tsx`, `Dashboard.tsx`, `PropertyDetail.tsx`, `intelligence.ts`, `insights.ts`).*
