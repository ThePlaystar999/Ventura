# Ventura - AI-Powered Startup Valuation Platform

## Product Requirements Document

**Last Updated:** March 1, 2026

---

## Changelog

### March 1, 2026 - Financial Metrics M&A-Grade Enhancement

**Enhanced Step 2 (Financial Metrics) with M&A-grade inputs:**

**New Toggle Components:**
- ARR/MRR toggle: "I know ARR" / "I know MRR" - only one input visible at a time
- Computed ARR shown in real-time when MRR entered (MRR × 12)
- EBITDA/SDE margin toggle with contextual tooltips
- Logo churn frequency toggle (Monthly/Annual)

**New Fields Added:**
- GRR % (Gross Revenue Retention)
- Logo churn % with frequency selector
- EBITDA margin % OR SDE margin % (toggle-based)
- Top customer concentration %
- # of customers
- Revenue mix: Subscription / Usage / Services (must total 100%)

**Inline Validations (Soft Warnings - Non-blocking):**
- NRR < GRR: "NRR < GRR is unusual. Please verify."
- NRR > 200%: "Very high (>200%). Double-check your data."
- Gross margin < 30%: "Unusually low for SaaS (<30%). Verify data."
- Gross margin > 95%: "Unusually high (>95%). Verify COGS calculation."
- Concentration > 30%: "High concentration (>30%). Multiple likely discounted."
- Revenue mix != 100%: "Total: X% — must equal 100%"

**Enhanced Tooltips:**
- Every field has definition, example, and typical range
- Dark themed tooltips with structured content
- EnhancedTooltip component for consistent styling

**Testing:** All 12 features verified working (100% pass rate)

---

### March 1, 2026 - Create Valuation Premium UX Redesign

**2-Column Layout with Live Preview Panel:**
- Created `/app/frontend/src/components/valuation/ValuationPreviewPanel.jsx` - Live estimate component
- Redesigned `/app/frontend/src/pages/CreateValuation.jsx` with:
  - 2-column layout on desktop (form left, preview panel right)
  - Mobile collapsible accordion for preview
  - ARR/MRR toggle (only one input visible at a time)
  - Real-time valuation estimate calculation
  - Tooltips on all form fields
  - Micro-animations using framer-motion

**Preview Panel Features:**
- Estimated multiple range (e.g., 4.8x - 7.2x ARR)
- Estimated valuation range (e.g., $4.8M - $7.2M)
- Confidence level (Low/Moderate/High with visual dots)
- Top driver identification (e.g., "85% YoY Growth")
- Red flag warnings (e.g., "Low NRR (85%)")
- Visual range bar with base marker

**New Fields Added:**
- Step 1: Founded Year (optional)
- Step 2: Burn Multiple, Runway Months (optional, in "Advanced Metrics" section)
- Step 3: Customer Concentration %, Monthly Churn Rate, Founder Hours/Week
- Step 3: Audited Financials toggle, Revenue Verified (Stripe) toggle

**Testing:** All 12 frontend features verified working (100% pass rate)

---

### March 1, 2026 - Global Sidebar Layout + UX Polish (P0)

**Sidebar Navigation Implementation:**
- Created `/app/frontend/src/components/layout/AppLayout.jsx` - Main layout wrapper
- Created `/app/frontend/src/components/layout/Sidebar.jsx` - Collapsible sidebar navigation
- Integrated AppLayout into `App.js` ProtectedRoute for all authenticated routes
- Sidebar features:
  - Dashboard, New Valuation, Exit OS (with "NEW" badge) navigation items
  - Collapsible with toggle button (state persists in localStorage)
  - User profile section with avatar and logout
  - Pricing and Help secondary links
  - Tooltips on collapsed items

**Dashboard UX Polish:**
- Added skeleton loading states using Shadcn Skeleton component
- Added tooltips to key metrics (Current Valuation, Change, Exit Readiness)
- Enhanced hover states on ProjectCard (delete button appears on hover)
- Wrapped dashboard in TooltipProvider for consistent tooltip behavior

**Hero Section Updates:**
- Changed headline from "Your Startup Exit Command Center" to "Know Your Value. Build Your Exit."
- Made V logo bigger in navbar (64x64, text-2xl) to match Peec.ai style

**Testing:** All 9 frontend features verified working (100% pass rate)

---

### December 28, 2025 - Hero Section Redesign (P0)
- Implemented premium Peec.ai-inspired hero section in `/app/frontend/src/components/landing/HeroSection.jsx`
- Added immersive dashboard mockup with 3D tilt effect and scroll parallax
- AI-Powered Exit Intelligence badge with animation
- Trust indicators: 5 min setup, PDF report, Bank-level security
- Dual CTA with primary button + play button
- Exit scenarios preview (Strategic Acquisition, PE Buyout, IPO Path)
- Full mobile responsiveness

---

### Latest Update: February 28, 2026

- **Exit OS Dashboard Route**: NEW
  - New route: `/projects/:projectId/exit-os`
  - Page: `ExitOSDashboard.jsx` with:
    - Project header with breadcrumb navigation
    - Quick stats grid (Current Valuation, Exit Readiness, Valuations Count, Last Updated)
    - Valuation history list with links to detailed reports
    - "Coming Soon" placeholders for Exit Readiness Tracker and Optimization Insights
    - Responsive design for mobile/desktop

- **Open Exit OS Entry Points**:
  - **Global**: Project selector dropdown + "Open Exit OS" button in dashboard header
    - Button is primary (filled blue) when project has valuations
    - Button is secondary (outline) when no valuations
  - **Per Project Card**: 
    - Entire card header area is clickable → leads to Exit OS
    - Primary CTA: "Open Exit OS" (when has valuations)
    - Secondary CTA: "Update Valuation" icon button
    - "Start Valuation" remains primary when no valuations

- **Backend**: Added `GET /api/projects/{project_id}` endpoint

- **Code Cleanup Pass**: 
  - Removed unused imports across all dashboard components
  - Fixed Python linting issues (unused variable, f-string without placeholders)
  - Added shared formatting utilities: `/app/frontend/src/lib/formatters.js`
  - Added 28 unit tests for deterministic computations: `/app/frontend/src/lib/formatters.test.js`
  - All linting passes (ESLint + Ruff)

- **BenchmarkBanner Component**: NEW - Constructive tension banner
  - Shows below ExitSnapshotCard when valuations exist
  - Compares current valuation against industry benchmark
  - Simulated benchmark: `currentValuation * 1.35` (placeholder logic)
  - Two states:
    - Below benchmark: Amber warning with "See how to close the gap"
    - Above benchmark: Green success with "Keep the momentum"
  - Dismissible (X button)
  - CTA opens Insights modal with:
    - Valuation vs Benchmark summary
    - Actionable tips (3 recommendations)
  - Located: `/app/frontend/src/components/dashboard/BenchmarkBanner.jsx`

- **Exit Command Center Dashboard**: Complete overhaul
  - New hero: "Your Startup Exit Command Center" with strategic subtitle
  - Exit Snapshot card (dark gradient, full-width):
    - Current Valuation, Change % + delta
    - Exit Readiness mini-score (placeholder)
    - Editable Target Valuation (localStorage persisted per project)
    - Gap to Target with progress bar
    - Dynamic CTA: "Start/Update Valuation"
  - Project selector dropdown for multi-project users
  - "Your Projects" section header
- **Exit Readiness Card**: Premium upgrade + circular ring bug fix
- **Global Visual Hierarchy**: 3-tier system
- **Previous**: Dashboard Refactor (February 27, 2026)

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
