# Ventura - AI-Powered Startup Valuation Platform

## Product Requirements Document

### Latest Update: February 27, 2026
- **Dashboard Refactor Complete**: ValuationResults page restructured with 2-column grid layout
  - Main content left (Hero → Exit Readiness → Deal Killers → Buyer Fit → Roadmap → What-if → Exit Scenarios → Valuation Range → Summary)
  - Sticky sidebar right with: Quick Snapshot, Buyer Filters (colored badges), Company Details, Assumptions, Quick Actions
  - Mobile: Collapsible cards below Hero
- **Previous**: Hero Section Redesign (January 30, 2026)

## Original Problem Statement
Build Ventura, a B2B SaaS web app that estimates startup valuation and exit scenarios using AI. Clean, corporate, premium, tech/finance/consulting-grade design similar to McKinsey/BCG/Goldman Sachs SaaS tools. White-first UI with fluid blue wave gradients.

## User Choices
- **Deterministic Valuation Engine** (no black box, fully explainable logic)
- Emergent-managed Google OAuth for authentication
- Real PDF export using fpdf2
- Contact form stores in database (no email sending)
- Multi-startup projects with history
- Shareable read-only links for investors
- Scenario sliders for live valuation adjustments

## Architecture

### Tech Stack
- **Frontend**: React + TailwindCSS + Shadcn/UI + Framer Motion
- **Backend**: FastAPI + Python
- **Database**: MongoDB
- **Authentication**: Emergent Google OAuth
- **PDF Generation**: fpdf2

### Valuation Engine Logic

#### Base Multiples by Business Model & Stage
| Model | Bootstrapped | Pre-seed | Seed | Series A | Series B | Series C+ |
|-------|--------------|----------|------|----------|----------|-----------|
| Subscription (SaaS) | 3x | 5x | 8x | 12x | 15x | 18x |
| Enterprise | 4x | 6x | 10x | 14x | 18x | 22x |
| Usage-Based | 3x | 5x | 8x | 12x | 15x | 18x |
| Marketplace | 2x | 3x | 5x | 8x | 10x | 12x |
| E-Commerce | 1.5x | 2x | 3x | 5x | 6x | 8x |
| Transactional | 2.5x | 4x | 6x | 10x | 12x | 15x |
| Freemium | 2x | 4x | 7x | 10x | 13x | 16x |
| Advertising | 1.5x | 2.5x | 4x | 6x | 8x | 10x |

#### Industries Supported
SaaS, AI/ML, FinTech, HealthTech, EdTech, CleanTech, Cybersecurity, MarTech, E-Commerce, Other

#### Adjustments Applied
1. **Growth Rate** - Positive/negative based on stage-specific thresholds
2. **Gross Margin** - Model-specific expectations
3. **Net Revenue Retention (NRR)** - 130%+ exceptional, <85% significant discount
4. **Qualitative Scores** - Product maturity (1-5), Market size, Competitive moat

#### Multiple Caps
- Bootstrapped: 10x, Pre-seed: 15x, Seed: 25x, Series A: 35x, Series B: 45x, Series C+: 60x

### Core Features Implemented (January 22, 2026)

#### Backend
- [x] User authentication (Emergent Google OAuth)
- [x] Project CRUD operations
- [x] **Deterministic Valuation Engine** with:
  - Base multiples by business model & stage
  - Growth/Margin/NRR adjustments with explanations
  - Qualitative score adjustments
  - Multiple caps enforcement
- [x] Exit scenarios with detailed rationale
- [x] AI Commentary (strengths, risks, exit readiness)
- [x] Transparent assumptions
- [x] PDF export with fpdf2
- [x] Share token generation
- [x] Contact form storage

#### Frontend
- [x] **Custom V logo** (user-provided design)
- [x] Landing page with wave backgrounds
- [x] **Pricing page** with 3 plans (REPORT 49€, FOUNDER 39€/mo, PRO 99€/mo)
- [x] Auth callback handling
- [x] Dashboard with project cards
- [x] **4-Step Valuation Wizard** (Company → Financials → Qualitative → Analysis)
- [x] **Results page** with 2-column layout:
  - Main content: Hero, Exit Readiness, Deal Killers, Buyer Fit, Optimization Roadmap, What-if Simulator, Exit Scenarios, Valuation Range, Executive Summary
  - Sticky sidebar: Quick Snapshot (ARR, Growth, Gross Margin, NRR, Multiple), Buyer Filters (colored badges), Company Details, Assumptions, Quick Actions
  - Mobile: Collapsible cards below Hero
  - Scenario sliders for live valuation adjustments
- [x] Shared valuation view
- [x] PDF download functionality

#### Pricing Plans
- **REPORT** (49€ one-time): 1 valuation, PDF report
- **FOUNDER** (39€/mo): 3 valuations/month, exit scenarios, history
- **PRO** (99€/mo): Unlimited valuations, white-label, shareable links

## Prioritized Backlog

### P0 (Critical) - ✅ DONE
- Deterministic valuation engine
- All adjustments with explanations
- Exit scenarios with rationale
- AI commentary
- Assumptions transparency
- Pricing page

### P1 (Important)
- [ ] Stripe integration for payments
- [ ] Email notifications for shared valuations
- [ ] Valuation comparison charts (Recharts)
- [ ] Historical valuation tracking within projects

### P2 (Nice to Have)
- [ ] Team collaboration features
- [ ] Custom branding for PDF reports
- [ ] Webhook integrations
- [ ] Real AI integration (GPT/Claude)

## Next Action Items
1. Integrate Stripe for payment processing
2. Add email notifications with SendGrid for shared valuations
3. Implement valuation comparison visualizations
