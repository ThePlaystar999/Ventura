# Ventura - B2B SaaS Startup Valuation Platform

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
| Model | Pre-seed | Seed | Series A | Series B | Series C+ |
|-------|----------|------|----------|----------|-----------|
| SaaS | 5x | 8x | 12x | 15x | 18x |
| AI/ML | 8x | 12x | 18x | 22x | 28x |
| FinTech | 6x | 10x | 15x | 18x | 22x |
| Marketplace | 3x | 5x | 8x | 10x | 12x |
| E-Commerce | 2x | 3x | 5x | 6x | 8x |

#### Adjustments Applied
1. **Growth Rate** - Positive/negative based on stage-specific thresholds
2. **Gross Margin** - Model-specific expectations (SaaS: 80%+, E-Commerce: 35%+)
3. **Net Revenue Retention (NRR)** - 130%+ exceptional, <85% significant discount
4. **Qualitative Scores** - Product maturity (1-5), Market size, Competitive moat

#### Multiple Caps
- Pre-seed: 15x, Seed: 25x, Series A: 35x, Series B: 45x, Series C+: 60x

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
- [x] **New 3D gradient V logo**
- [x] Landing page with wave backgrounds
- [x] Auth callback handling
- [x] Dashboard with project cards
- [x] **4-Step Valuation Wizard** (Company → Financials → Qualitative → Analysis)
- [x] Results page with:
  - Valuation range (Low/Base/High)
  - Adjustments breakdown (expandable)
  - Exit scenarios with rationale
  - AI Commentary with strengths/risks
  - Assumptions transparency
  - Scenario sliders for live adjustments
- [x] Shared valuation view
- [x] PDF download functionality

## Prioritized Backlog

### P0 (Critical) - ✅ DONE
- Deterministic valuation engine
- All adjustments with explanations
- Exit scenarios with rationale
- AI commentary
- Assumptions transparency

### P1 (Important)
- [ ] Email notifications for shared valuations
- [ ] Valuation comparison charts (Recharts)
- [ ] Historical valuation tracking within projects

### P2 (Nice to Have)
- [ ] Team collaboration features
- [ ] Stripe integration for premium tiers
- [ ] Custom branding for PDF reports
- [ ] Webhook integrations

## Next Action Items
1. Add email notifications with SendGrid for shared valuations
2. Implement valuation comparison visualizations
3. Consider adding user onboarding tutorial flow
