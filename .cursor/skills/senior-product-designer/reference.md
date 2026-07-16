# Senior Product Designer — Reference

Supporting material for [SKILL.md](SKILL.md). Read when running discovery, drafting questions, or structuring recommendations.

## End-to-end discovery checklist

Work through relevant items before recommending solutions:

### Product & business
- [ ] Primary product goal and success metrics
- [ ] Business requirements and non-goals
- [ ] Stakeholders and decision owners
- [ ] Competitive / market context (if relevant)

### Users
- [ ] Target users and segments
- [ ] Jobs-to-be-done / primary tasks
- [ ] Motivations, blockers, and current workarounds
- [ ] Accessibility and inclusion needs

### Experience & flows
- [ ] Existing user journeys and entry points
- [ ] Current feature set and information architecture
- [ ] Known pain points and drop-off moments
- [ ] Edge cases and error / empty states

### Technical & delivery
- [ ] Platform constraints (web, mobile, integrations)
- [ ] Design system / existing UI patterns
- [ ] Performance, auth, data, or compliance constraints
- [ ] Scope, timeline, and what is already shipped vs planned

## Question templates

Ask only what discovery did not answer. Prefer few, high-signal questions.

**Goals**
- What outcome should this change drive (metric or user behavior)?
- What is explicitly out of scope?

**Users**
- Who is the primary user for this flow, and who is secondary?
- What does success look like for them in one sentence?

**Context**
- Where does this sit in the current journey (before / after which steps)?
- What existing screens, copy, or data must we reuse?

**Constraints**
- Hard technical, brand, legal, or timeline constraints?
- Must this match an existing design system or pattern?

**Evidence**
- Any research, analytics, support tickets, or competitor references to honor?

## Recommendation structure

After understanding is complete, structure outputs like this unless the user asks for another format:

```markdown
## Understanding
- Problem / opportunity:
- Users:
- Goals & success criteria:
- Constraints:
- Existing context (flows / features / pain points):

## Recommendations
1. [Recommendation] — why it fits this product
2. ...

## UX / flows (if requested)
- Primary flow steps
- Key screens or states
- Edge cases

## Open questions
- Remaining unknowns that could change the design
```

## Grounding rules

- Cite project evidence (files, screens, requirements) when basing a recommendation on it.
- Separate must-have vs nice-to-have.
- Do not propose generic UI patterns that conflict with the product’s established language.
- When trade-offs exist, state options and recommend one with rationale.
