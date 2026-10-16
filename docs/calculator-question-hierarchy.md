# Calculator question hierarchy

Sirf questions aur options. Arrow tab hai jab option agla sawal badalta hai. Jo options flow nahi badalte, woh usi question ke box mein hain.

Source: calculator journey (`client/src/lib/investorJourney.ts`).

## Start

```mermaid
flowchart TD
  goal["What are you looking to achieve through property?"]
  goal --> income["Generate passive income"]
  goal --> wealth["Build long-term wealth"]
  goal --> portfolio["Grow an existing portfolio"]
  goal --> retirement["Plan for retirement"]
  goal --> family["Invest for my family / future"]
  goal --> unsure["Not sure yet"]
```

---

## Generate passive income

```mermaid
flowchart TD
  exp["What is your property investment experience?"]
  exp --> first["This is my first investment"]
  exp --> home["I own my home but no investment property"]
  exp --> own12["I own 1–2 investment properties"]
  exp --> own3["I own 3+ investment properties"]

  first --> aim["What level of monthly property income are you aiming for?<br/>Up to £500 · £500–£1,000 · £1,000–£2,000<br/>£2,000–£5,000 · £5,000+ · Not sure yet"]
  home --> aim
  own12 --> aimOwn["What level of monthly property income are you aiming for?<br/>Up to £500 · £500–£1,000 · £1,000–£2,000<br/>£2,000–£5,000 · £5,000+ · Not sure yet"]
  own3 --> aimOwn

  aim --> when["How soon would you like to reach this level?<br/>Within 5 years · 5–10 years · 10–15 years<br/>15+ years · Flexible"]
  aimOwn --> whenOwn["How soon would you like to reach this level?<br/>Within 5 years · 5–10 years · 10–15 years<br/>15+ years · Flexible"]

  when --> capital["Capital"]
  whenOwn --> current["Do you already receive income from investment property?<br/>No · Up to £500/month · £500–£1,000/month<br/>£1,000–£2,000/month · £2,000+/month"]
  current --> capital
  capital --> more["Contributions"]
  more --> finance["Finance"]
```

---

## Build long-term wealth

```mermaid
flowchart TD
  exp["What is your property investment experience?"]
  exp --> first["This is my first investment"]
  exp --> home["I own my home but no investment property"]
  exp --> own12["I own 1–2 investment properties"]
  exp --> own3["I own 3+ investment properties"]

  first --> growth["What matters most in the way your property wealth grows?<br/>Steady long-term growth · Maximise long-term growth<br/>Balance growth and income · Build a multi-property portfolio · Not sure yet"]
  home --> growth
  own12 --> growthOwn["What matters most in the way your property wealth grows?<br/>Steady long-term growth · Maximise long-term growth<br/>Balance growth and income · Build a multi-property portfolio · Not sure yet"]
  own3 --> growthOwn

  growth --> horizon["How long are you comfortable investing for?<br/>5 years · 10 years · 15 years · 15+ years"]
  growthOwn --> horizonOwn["How long are you comfortable investing for?<br/>5 years · 10 years · 15 years · 15+ years"]

  horizon --> target["Do you have a target level of property wealth in mind?<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · No fixed target"]
  horizonOwn --> targetOwn["Do you have a target level of property wealth in mind?<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · No fixed target"]

  target --> capital["Capital"]
  targetOwn --> current["What is the approximate value of your current investment-property portfolio?<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · Not sure yet"]
  current --> capital
  capital --> more["Contributions"]
  more --> finance["Finance"]
```

---

## Grow an existing portfolio

```mermaid
flowchart TD
  size["How many investment properties do you currently own?<br/>1–2 properties · 3–5 properties · 6+ properties"]
  size --> obj["What should your next investment improve most?"]

  obj --> income["Increase rental income"]
  obj --> balanced["Balance income and growth"]
  obj --> unsure["Not sure yet"]
  obj --> growth["Increase long-term growth"]
  obj --> diversify["Diversify my portfolio"]
  obj --> scale["Grow the number of properties"]

  income --> valueAsk["What is the approximate value of your current investment-property portfolio?<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · Not sure yet"]
  balanced --> valueAsk
  unsure --> valueAsk
  growth --> valueOnly["What is the approximate value of your current investment-property portfolio?<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · Not sure yet"]
  diversify --> valueOnly
  scale --> valueOnly

  valueAsk --> rent["What level of monthly rental income does the portfolio currently produce?<br/>Under £500 · £500–£1,000 · £1,000–£2,000<br/>£2,000–£5,000 · Prefer not to use this"]
  rent --> capital["Capital"]
  valueOnly --> capital
  capital --> more["Contributions"]
  more --> finance["Finance"]
```

---

## Plan for retirement

```mermaid
flowchart TD
  exp["What is your property investment experience?"]
  exp --> first["This is my first investment"]
  exp --> home["I own my home but no investment property"]
  exp --> own12["I own 1–2 investment properties"]
  exp --> own3["I own 3+ investment properties"]

  first --> window["When are you planning for retirement?<br/>Within 5 years · 5–10 years · 10–20 years · 20+ years"]
  home --> window
  own12 --> windowOwn["When are you planning for retirement?<br/>Within 5 years · 5–10 years · 10–20 years · 20+ years"]
  own3 --> windowOwn

  window --> out["What would you most want property to provide at retirement?"]
  windowOwn --> outOwn["What would you most want property to provide at retirement?"]
```

### First investment, or home only

```mermaid
flowchart TD
  out["What would you most want property to provide at retirement?"]
  out --> incOpt["Regular monthly income"]
  out --> valOpt["A valuable property portfolio"]
  out --> legacy["An asset to pass on"]
  out --> both["Both income and growth"]
  out --> unsure["Not sure yet"]

  incOpt --> inc["What level of monthly income would you like property to provide?<br/>Up to £500 · £500–£1,000 · £1,000–£2,000<br/>£2,000–£5,000 · £5,000+ · Not sure yet"]
  valOpt --> val["What level of portfolio value would you like to work towards?<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · Not sure yet"]
  legacy --> val

  both --> bothInc["What level of monthly income would you like property to provide?<br/>Up to £500 · £500–£1,000 · £1,000–£2,000<br/>£2,000–£5,000 · £5,000+ · Not sure yet"]
  unsure --> bothInc
  bothInc --> bothVal["What level of portfolio value would you like to work towards?<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · Not sure yet"]

  inc --> capital["Capital"]
  val --> capital
  bothVal --> capital
  capital --> more["Contributions"]
  more --> finance["Finance"]
```

### Owns 1–2 or 3+ investment properties

```mermaid
flowchart TD
  out["What would you most want property to provide at retirement?"]
  out --> incOpt["Regular monthly income"]
  out --> valOpt["A valuable property portfolio"]
  out --> legacy["An asset to pass on"]
  out --> both["Both income and growth"]
  out --> unsure["Not sure yet"]

  incOpt --> inc["Monthly income target<br/>Up to £500 · £500–£1,000 · £1,000–£2,000<br/>£2,000–£5,000 · £5,000+ · Not sure yet"]
  inc --> curInc["Do you already receive income from investment property?<br/>No · Up to £500/month · £500–£1,000/month<br/>£1,000–£2,000/month · £2,000+/month"]

  valOpt --> val["Portfolio value target<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · Not sure yet"]
  legacy --> val
  val --> curVal["Approximate value of your current portfolio?<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · Not sure yet"]

  both --> bothInc["Monthly income target<br/>Up to £500 · £500–£1,000 · £1,000–£2,000<br/>£2,000–£5,000 · £5,000+ · Not sure yet"]
  unsure --> bothInc
  bothInc --> bothVal["Portfolio value target<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · Not sure yet"]
  bothVal --> curInc2["Do you already receive income from investment property?<br/>No · Up to £500/month · £500–£1,000/month<br/>£1,000–£2,000/month · £2,000+/month"]
  curInc2 --> curVal2["Approximate value of your current portfolio?<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · Not sure yet"]

  curInc --> capital["Capital"]
  curVal --> capital
  curVal2 --> capital
  capital --> more["Contributions"]
  more --> finance["Finance"]
```

---

## Invest for my family / future

```mermaid
flowchart TD
  exp["What is your property investment experience?"]
  exp --> first["This is my first investment"]
  exp --> home["I own my home but no investment property"]
  exp --> own12["I own 1–2 investment properties"]
  exp --> own3["I own 3+ investment properties"]

  first --> mile["What is this investment mainly for?<br/>Children · Family security · Legacy · A future lump sum"]
  home --> mile
  own12 --> mileOwn["What is this investment mainly for?<br/>Children · Family security · Legacy · A future lump sum"]
  own3 --> mileOwn

  mile --> when["When do you expect this investment to start serving that goal?<br/>Within 5 years · 5–10 years · 10–15 years<br/>15–20 years · 20+ years"]
  mileOwn --> whenOwn["When do you expect this investment to start serving that goal?<br/>Within 5 years · 5–10 years · 10–15 years<br/>15–20 years · 20+ years"]

  when --> out["What matters most at that point?"]
  whenOwn --> outOwn["What matters most at that point?"]
```

### First investment, or home only

```mermaid
flowchart TD
  out["What matters most at that point?"]
  out --> valueOpt["A lump-sum asset value"]
  out --> ownOpt["Owning a long-term property asset"]
  out --> incOpt["Ongoing monthly income"]
  out --> mix["A mix of income and value"]
  out --> unsure["Not sure yet"]

  valueOpt --> val["What level of value would you like to work towards?<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · Not sure yet"]
  ownOpt --> val
  incOpt --> inc["What level of monthly income would you like the portfolio to provide?<br/>Up to £500 · £500–£1,000 · £1,000–£2,000<br/>£2,000–£5,000 · £5,000+ · Not sure yet"]

  mix --> mixVal["What level of value would you like to work towards?<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · Not sure yet"]
  unsure --> mixVal
  mixVal --> mixInc["What level of monthly income would you like the portfolio to provide?<br/>Up to £500 · £500–£1,000 · £1,000–£2,000<br/>£2,000–£5,000 · £5,000+ · Not sure yet"]

  val --> capital["Capital"]
  inc --> capital
  mixInc --> capital
  capital --> more["Contributions"]
  more --> finance["Finance"]
```

### Owns 1–2 or 3+ investment properties

```mermaid
flowchart TD
  out["What matters most at that point?"]
  out --> valueOpt["A lump-sum asset value"]
  out --> ownOpt["Owning a long-term property asset"]
  out --> incOpt["Ongoing monthly income"]
  out --> mix["A mix of income and value"]
  out --> unsure["Not sure yet"]

  valueOpt --> val["Value target<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · Not sure yet"]
  ownOpt --> val
  val --> curVal["Approximate value of your current portfolio?<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · Not sure yet"]

  incOpt --> inc["Monthly income target<br/>Up to £500 · £500–£1,000 · £1,000–£2,000<br/>£2,000–£5,000 · £5,000+ · Not sure yet"]
  inc --> curInc["Do you already receive income from investment property?<br/>No · Up to £500/month · £500–£1,000/month<br/>£1,000–£2,000/month · £2,000+/month"]

  mix --> mixVal["Value target<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · Not sure yet"]
  unsure --> mixVal
  mixVal --> mixInc["Monthly income target<br/>Up to £500 · £500–£1,000 · £1,000–£2,000<br/>£2,000–£5,000 · £5,000+ · Not sure yet"]
  mixInc --> curInc2["Do you already receive income from investment property?<br/>No · Up to £500/month · £500–£1,000/month<br/>£1,000–£2,000/month · £2,000+/month"]
  curInc2 --> curVal2["Approximate value of your current portfolio?<br/>Under £250k · £250k–£500k · £500k–£1m<br/>£1m–£2m · £2m+ · Not sure yet"]

  curVal --> capital["Capital"]
  curInc --> capital
  curVal2 --> capital
  capital --> more["Contributions"]
  more --> finance["Finance"]
```

---

## Not sure yet

```mermaid
flowchart TD
  pri["What matters most to you right now?<br/>Creating regular income · Growing money over time<br/>Building a property portfolio · Planning for the future<br/>Keeping my options open · I am still not sure"]
  pri --> exp["What is your property investment experience?<br/>This is my first investment<br/>I own my home but no investment property<br/>I own 1–2 investment properties<br/>I own 3+ investment properties"]
  exp --> capital["Capital"]
  capital --> finance["Finance"]
```

Contributions is path par nahi aata.

---

## Capital, Contributions, Finance

Yeh har goal ke end par aata hai, Not sure yet ke ilawa. Not sure yet par Contributions skip hota hai.

```mermaid
flowchart TD
  capital["How much capital do you have available for your next investment?<br/>Less than £10k · £10k–£25k · £25k–£50k<br/>£50k–£100k · £100k–£250k · £250k+"]
  capital --> contrib["Could you add more capital over time?<br/>No · Up to £500/month · £500–£1,000/month<br/>£1,000–£2,500/month · £2,500+/month · At specific stages only"]
  contrib --> finance["How would you prefer to purchase?"]

  finance --> mortgage["Mortgage"]
  finance --> both["Show me both"]
  finance --> cash["Cash"]
  finance --> recommend["Recommend for me"]

  mortgage --> residency["Where are you currently resident?<br/>GCC · UK · APAC · Mainland Europe · Africa"]
  both --> residency
```

Cash aur Recommend for me ke baad residency ka sawal nahi aata.
