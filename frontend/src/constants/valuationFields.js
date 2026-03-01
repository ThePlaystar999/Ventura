/**
 * Valuation Field Definitions
 * Premium M&A-grade microcopy for the Create Valuation onboarding
 * 
 * Structure per field:
 * - label: Display name
 * - helper: Short helper text below input (1 line)
 * - tooltip: { title, definition, example, range }
 * - validation: { min, max, warningThresholds }
 */

export const VALUATION_FIELDS = {
  // ============================================
  // SECTION: REVENUE
  // ============================================
  
  revenueType: {
    label: "Revenue Input",
    helper: "Choose how you track recurring revenue",
    tooltip: {
      title: "ARR vs MRR",
      definition: "ARR (Annual Recurring Revenue) = MRR × 12. Both measure predictable subscription revenue.",
      example: "$100K MRR = $1.2M ARR",
      range: null
    }
  },

  arr: {
    label: "Annual Recurring Revenue (ARR)",
    helper: "Annualized value of active subscriptions",
    tooltip: {
      title: "Annual Recurring Revenue",
      definition: "The yearly value of all active subscription contracts. Excludes one-time fees, services, and usage overages.",
      example: "200 customers × $5K/year average = $1M ARR",
      range: "Typical range: $100K – $50M for SMB SaaS acquisitions"
    },
    validation: {
      min: 0,
      required: true
    }
  },

  mrr: {
    label: "Monthly Recurring Revenue (MRR)",
    helper: "Monthly subscription revenue (we'll calculate ARR)",
    tooltip: {
      title: "Monthly Recurring Revenue",
      definition: "The monthly value of all active subscriptions. Multiply by 12 to get ARR.",
      example: "$83K MRR = ~$1M ARR",
      range: "Typical range: $10K – $5M MRR"
    },
    validation: {
      min: 0,
      required: true
    }
  },

  // ============================================
  // SECTION: GROWTH
  // ============================================

  growth_rate: {
    label: "YoY Revenue Growth",
    helper: "Year-over-year ARR growth rate",
    tooltip: {
      title: "Year-over-Year Growth",
      definition: "How much your ARR increased compared to 12 months ago. The #1 driver of SaaS valuations.",
      example: "Grew from $500K to $1M ARR = 100% YoY growth",
      range: "Good: 50%+ | Great: 100%+ | Elite: 150%+"
    },
    validation: {
      min: -100,
      max: 500,
      warningThresholds: {
        low: { value: 20, message: "Below 20% may limit buyer interest" },
        high: { value: 300, message: "Very high — verify calculation" }
      }
    }
  },

  // ============================================
  // SECTION: MARGINS
  // ============================================

  gross_margin: {
    label: "Gross Margin",
    helper: "Revenue minus cost of goods sold",
    tooltip: {
      title: "Gross Margin",
      definition: "(Revenue - COGS) ÷ Revenue. COGS includes hosting, support, and direct delivery costs.",
      example: "$1M revenue – $250K COGS = 75% gross margin",
      range: "SaaS benchmark: 70–85% | Below 60% raises concerns"
    },
    validation: {
      min: 0,
      max: 100,
      warningThresholds: {
        low: { value: 30, message: "Unusually low for SaaS — verify COGS" },
        belowTarget: { value: 60, message: "Below typical SaaS range" },
        high: { value: 95, message: "Unusually high — verify calculation" }
      }
    }
  },

  ebitda_margin: {
    label: "EBITDA Margin",
    helper: "Operating profit before interest, taxes, depreciation",
    tooltip: {
      title: "EBITDA Margin",
      definition: "Earnings Before Interest, Taxes, Depreciation, and Amortization as a % of revenue. Standard profitability metric for larger companies.",
      example: "$200K EBITDA on $1M revenue = 20% margin",
      range: "Healthy SaaS: 10–30% | Rule of 40: Growth% + EBITDA% ≥ 40"
    },
    validation: {
      min: -100,
      max: 80
    }
  },

  sde_margin: {
    label: "SDE Margin",
    helper: "Seller's discretionary earnings (includes owner salary)",
    tooltip: {
      title: "Seller's Discretionary Earnings",
      definition: "EBITDA plus owner salary and perks. Used for owner-operated businesses where founder compensation is discretionary.",
      example: "$150K EBITDA + $150K owner salary = $300K SDE (30% on $1M)",
      range: "Typical: 20–40% | Common for businesses under $5M revenue"
    },
    validation: {
      min: -50,
      max: 80
    }
  },

  // ============================================
  // SECTION: RETENTION
  // ============================================

  nrr: {
    label: "Net Revenue Retention (NRR)",
    helper: "Revenue kept + expanded from existing customers",
    tooltip: {
      title: "Net Revenue Retention",
      definition: "(Starting MRR + Expansion – Contraction – Churn) ÷ Starting MRR. Measures your ability to grow within your customer base.",
      example: "Started $100K MRR, ended with $115K from same cohort = 115% NRR",
      range: "Good: 100%+ | Great: 110%+ | Elite: 130%+ (negative churn)"
    },
    validation: {
      min: 50,
      max: 200,
      warningThresholds: {
        low: { value: 80, message: "Low NRR indicates retention issues" },
        veryHigh: { value: 200, message: "Very high — double-check data" },
        belowGRR: { message: "NRR cannot be lower than GRR" }
      }
    }
  },

  grr: {
    label: "Gross Revenue Retention (GRR)",
    helper: "Revenue kept from existing customers (no expansion)",
    tooltip: {
      title: "Gross Revenue Retention",
      definition: "(Starting MRR – Contraction – Churn) ÷ Starting MRR. Shows pure retention without expansion revenue. Max is 100%.",
      example: "Started $100K MRR, lost $8K to churn/downgrades = 92% GRR",
      range: "Good: 85%+ | Great: 90%+ | Elite: 95%+"
    },
    validation: {
      min: 50,
      max: 100,
      warningThresholds: {
        low: { value: 70, message: "Significant retention problem" },
        aboveMax: { value: 100, message: "GRR cannot exceed 100%" }
      }
    }
  },

  logo_churn: {
    label: "Logo Churn Rate",
    helper: "Percentage of customers lost per period",
    tooltip: {
      title: "Logo (Customer) Churn",
      definition: "Customers lost ÷ Total customers at start of period. Different from revenue churn — losing small customers vs. large ones matters.",
      example: "Lost 5 of 200 customers this month = 2.5% monthly churn",
      range: {
        monthly: "Good: <3% | Great: <2% | Elite: <1%",
        annual: "Good: <20% | Great: <15% | Elite: <10%"
      }
    },
    validation: {
      min: 0,
      max: 50
    }
  },

  churn_frequency: {
    label: "Churn Frequency",
    helper: "How you measure churn",
    tooltip: {
      title: "Churn Measurement Period",
      definition: "Monthly churn is more common for SMB. Annual churn is typical for enterprise with annual contracts.",
      example: "2% monthly ≈ 22% annual (compounded)",
      range: null
    }
  },

  // ============================================
  // SECTION: CUSTOMER BASE
  // ============================================

  customer_count: {
    label: "Number of Customers",
    helper: "Active paying accounts or logos",
    tooltip: {
      title: "Customer Count",
      definition: "Total active paying customers. Used to calculate ACV (ARR ÷ Customers) and assess concentration risk.",
      example: "$1M ARR ÷ 200 customers = $5K ACV",
      range: "Higher count generally means lower concentration risk"
    },
    validation: {
      min: 1
    }
  },

  customer_concentration: {
    label: "Top Customer Revenue %",
    helper: "Revenue from your largest customer",
    tooltip: {
      title: "Customer Concentration",
      definition: "Percentage of total revenue from your single largest customer. High concentration is a red flag — losing one customer could tank revenue.",
      example: "Largest customer is $150K of $1M ARR = 15% concentration",
      range: "Green: <15% | Yellow: 15–30% | Red: >30%"
    },
    validation: {
      min: 0,
      max: 100,
      warningThresholds: {
        elevated: { value: 20, message: "Moderate concentration — consider diversifying" },
        high: { value: 30, message: "High concentration — multiple likely discounted" },
        critical: { value: 50, message: "Critical concentration — major deal risk" }
      }
    }
  },

  team_size: {
    label: "Team Size",
    helper: "Full-time equivalent employees",
    tooltip: {
      title: "Team Size (FTE)",
      definition: "Total full-time equivalent employees including founders. Part-time and contractors counted proportionally.",
      example: "10 full-time + 4 half-time contractors = 12 FTE",
      range: "Used to calculate revenue per employee efficiency"
    },
    validation: {
      min: 1
    }
  },

  // ============================================
  // SECTION: REVENUE MIX
  // ============================================

  revenue_subscription: {
    label: "Subscription Revenue %",
    helper: "Recurring subscription revenue",
    tooltip: {
      title: "Subscription Revenue",
      definition: "Percentage of revenue from fixed-price recurring subscriptions. The most valuable revenue type for acquirers.",
      example: "$800K subscriptions of $1M total = 80%",
      range: "Target: 80%+ for premium multiple | Below 70% may discount valuation"
    },
    validation: {
      min: 0,
      max: 100
    }
  },

  revenue_usage: {
    label: "Usage-Based Revenue %",
    helper: "Revenue that scales with customer usage",
    tooltip: {
      title: "Usage-Based Revenue",
      definition: "Revenue from consumption pricing — API calls, transactions, storage, seats, etc. Growing trend but less predictable.",
      example: "Overage charges, metered billing, pay-per-use",
      range: "Increasingly common in PLG models"
    },
    validation: {
      min: 0,
      max: 100
    }
  },

  revenue_services: {
    label: "Services Revenue %",
    helper: "One-time or professional services",
    tooltip: {
      title: "Services Revenue",
      definition: "Implementation fees, custom development, consulting, training. Lower margin and not recurring — valued at lower multiples.",
      example: "Onboarding fees, custom integrations, managed services",
      range: "Target: <20% | High services % indicates product gaps"
    },
    validation: {
      min: 0,
      max: 100
    }
  },

  // ============================================
  // SECTION: EFFICIENCY
  // ============================================

  burn_multiple: {
    label: "Burn Multiple",
    helper: "Capital efficiency: burn ÷ new ARR",
    tooltip: {
      title: "Burn Multiple",
      definition: "Net Burn ÷ Net New ARR. How much you spend to generate $1 of new ARR. Lower is better.",
      example: "Burned $500K to add $400K ARR = 1.25x burn multiple",
      range: "Efficient: <1x | Acceptable: 1–2x | Concerning: >2x"
    },
    validation: {
      min: 0,
      max: 10
    }
  },

  runway_months: {
    label: "Cash Runway",
    helper: "Months of cash at current burn rate",
    tooltip: {
      title: "Cash Runway",
      definition: "Current cash balance ÷ Monthly net burn. How long until you run out of money at current spending.",
      example: "$1M cash ÷ $80K/month burn = 12.5 months runway",
      range: "Safe: 18+ months | Acceptable: 12–18 | Urgent: <12"
    },
    validation: {
      min: 0,
      max: 120
    }
  },

  // ============================================
  // SECTION: QUALITATIVE - PRODUCT
  // ============================================

  product_maturity: {
    label: "Product Maturity",
    helper: "Product-market fit and development stage",
    tooltip: {
      title: "Product Maturity",
      definition: "How developed is your product and how strong is product-market fit? Higher maturity = lower risk for acquirers.",
      example: "1=MVP testing, 3=Clear PMF with retention, 5=Category leader",
      range: "Each level adds ~0.3x to multiple"
    },
    options: [
      { value: 1, label: "MVP", description: "Early testing, pre-PMF" },
      { value: 2, label: "Traction", description: "Some customers, iterating" },
      { value: 3, label: "PMF", description: "Clear fit, repeatable sales" },
      { value: 4, label: "Scaling", description: "Growing efficiently" },
      { value: 5, label: "Leader", description: "Market leader, strong brand" }
    ]
  },

  // ============================================
  // SECTION: QUALITATIVE - MARKET
  // ============================================

  market_size: {
    label: "Target Market Size",
    helper: "Total addressable market (TAM)",
    tooltip: {
      title: "Total Addressable Market (TAM)",
      definition: "The total revenue opportunity if you captured 100% of your target market. Larger markets attract strategic acquirers.",
      example: "CRM software: ~$100B (Large) | Niche vertical SaaS: ~$500M (Small)",
      range: "Large TAM: +0.5x multiple | Small TAM: -0.3x discount"
    },
    options: [
      { value: "Small", label: "Small", description: "<$1B TAM", impact: "-0.3x" },
      { value: "Medium", label: "Medium", description: "$1–10B TAM", impact: "Baseline" },
      { value: "Large", label: "Large", description: ">$10B TAM", impact: "+0.5x" }
    ]
  },

  competitive_moat: {
    label: "Competitive Moat",
    helper: "How defensible is your market position?",
    tooltip: {
      title: "Competitive Defensibility",
      definition: "What makes it hard for competitors to replicate your success? Strong moats command premium valuations.",
      example: "Network effects (Slack), proprietary data (Bloomberg), switching costs (Salesforce)",
      range: "Strong moat: +0.5x | Weak moat: -0.3x and higher churn risk"
    },
    options: [
      { value: "Low", label: "Low", description: "Easy to replicate", impact: "-0.3x" },
      { value: "Medium", label: "Medium", description: "Some barriers", impact: "Baseline" },
      { value: "Strong", label: "Strong", description: "Hard to compete", impact: "+0.5x" }
    ]
  },

  // ============================================
  // SECTION: QUALITATIVE - OPERATIONS
  // ============================================

  founder_dependency: {
    label: "Founder Dependency",
    helper: "How critical is the founder to daily operations?",
    tooltip: {
      title: "Founder/Key Person Risk",
      definition: "How dependent is the business on the founder's daily involvement? Acquirers want businesses that run without the founder.",
      example: "Low: Team runs ops, founder is strategic. High: Founder handles sales, product, and key accounts.",
      range: "Low dependency: +0.3x (transferable) | High: -0.5x (key-person risk)"
    },
    options: [
      { value: "Low", label: "Low", description: "Delegated operations, documented processes", impact: "+0.3x" },
      { value: "Medium", label: "Medium", description: "Founder involved but not critical", impact: "Baseline" },
      { value: "High", label: "High", description: "Founder-critical, key-person risk", impact: "-0.5x" }
    ]
  },

  sales_predictability: {
    label: "Sales Predictability",
    helper: "How predictable and scalable is revenue acquisition?",
    tooltip: {
      title: "Revenue Acquisition Model",
      definition: "How do customers buy? Self-serve is most scalable. Enterprise sales have longer cycles and lumpier quarters.",
      example: "Self-serve: Credit card signups, PLG. Enterprise: 6+ month sales cycles, custom contracts.",
      range: "Self-serve: +0.3x (scalable) | Enterprise-lumpy: -0.2x (unpredictable)"
    },
    options: [
      { value: "Self-serve", label: "Self-Serve", description: "PLG, credit card signups", impact: "+0.3x" },
      { value: "Mixed", label: "Mixed", description: "PLG + sales assist", impact: "Baseline" },
      { value: "Enterprise-lumpy", label: "Enterprise", description: "Long sales cycles, lumpy revenue", impact: "-0.2x" }
    ]
  },

  // ============================================
  // SECTION: DEAL READINESS
  // ============================================

  has_audited_financials: {
    label: "Audited Financials",
    helper: "CPA-reviewed or audited financial statements",
    tooltip: {
      title: "Audited Financials",
      definition: "Financial statements reviewed or audited by a CPA. Increases buyer confidence and can speed up due diligence.",
      example: "Annual audit or quarterly CPA review",
      range: "Adds +0.2x multiple and reduces deal friction"
    },
    impact: "+0.2x"
  },

  stripe_connected: {
    label: "Revenue Verified",
    helper: "Revenue verified via payment processor",
    tooltip: {
      title: "Revenue Verification",
      definition: "Revenue data verified through Stripe, payment processor, or bank integration. Provides proof of revenue claims.",
      example: "Stripe Atlas verified, Mercury bank connected",
      range: "Adds +0.1x and builds buyer trust"
    },
    impact: "+0.1x"
  }
};

// ============================================
// SECTION DEFINITIONS
// ============================================

export const VALUATION_SECTIONS = {
  revenue: {
    title: "Revenue",
    icon: "DollarSign",
    description: "Your recurring revenue metrics"
  },
  growth: {
    title: "Growth",
    icon: "TrendingUp",
    description: "Revenue growth trajectory"
  },
  retention: {
    title: "Retention & Churn",
    icon: "PieChart",
    description: "Customer and revenue retention"
  },
  profitability: {
    title: "Profitability",
    icon: "BarChart3",
    description: "Margins and earnings"
  },
  customers: {
    title: "Customer Base",
    icon: "Users",
    description: "Customer count and concentration"
  },
  revenueMix: {
    title: "Revenue Mix",
    icon: "PieChart",
    description: "Breakdown by revenue type"
  },
  efficiency: {
    title: "Efficiency",
    icon: "Zap",
    description: "Capital efficiency metrics"
  },
  qualitative: {
    title: "Qualitative Assessment",
    icon: "Star",
    description: "Non-financial value drivers"
  },
  dealReadiness: {
    title: "Deal Readiness",
    icon: "Shield",
    description: "Due diligence preparedness"
  }
};

// ============================================
// CONFIDENCE LEVELS
// ============================================

export const CONFIDENCE_LEVELS = {
  High: {
    label: "High",
    color: "emerald",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
    explanation: "Comprehensive data provided. High accuracy estimate.",
    minScore: 8
  },
  Medium: {
    label: "Medium",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    explanation: "Good data coverage. Some metrics missing.",
    minScore: 5
  },
  Low: {
    label: "Low",
    color: "amber",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
    explanation: "Limited data provided. Add more metrics for accuracy.",
    minScore: 0,
    helpText: "Add churn, concentration, and profitability for a more accurate valuation."
  }
};

// ============================================
// MULTIPLE IMPACT REFERENCE
// ============================================

export const MULTIPLE_IMPACTS = {
  // Growth
  growth_100_plus: { min: "+1.5x", max: "+2.0x", description: "Triple-digit growth" },
  growth_75_100: { min: "+1.0x", max: "+1.5x", description: "Strong growth" },
  growth_50_75: { min: "+0.5x", max: "+1.0x", description: "Healthy growth" },
  growth_below_25: { impact: "At risk", description: "May limit buyer interest" },
  
  // Retention
  nrr_130_plus: { impact: "+1.0x", description: "Elite net expansion" },
  nrr_115_130: { impact: "+0.7x", description: "Strong expansion" },
  nrr_below_90: { impact: "-0.5x", description: "Retention concerns" },
  
  grr_95_plus: { impact: "+0.4x", description: "Exceptional retention" },
  grr_below_80: { impact: "-0.4x", description: "High churn" },
  
  // Margins
  gross_margin_85_plus: { impact: "+0.5x", description: "Premium margins" },
  gross_margin_below_60: { impact: "-0.5x", description: "Margin concerns" },
  
  // Concentration
  concentration_above_50: { impact: "-1.0x", description: "Critical risk" },
  concentration_above_30: { impact: "-0.5x", description: "High risk" },
  
  // Qualitative
  product_maturity_per_level: { impact: "+0.3x", description: "Per level above 3" },
  large_market: { impact: "+0.5x", description: "Large TAM" },
  small_market: { impact: "-0.3x", description: "Limited TAM" },
  strong_moat: { impact: "+0.5x", description: "Defensible position" },
  weak_moat: { impact: "-0.3x", description: "Easy to replicate" },
  low_founder_dep: { impact: "+0.3x", description: "Transferable" },
  high_founder_dep: { impact: "-0.5x", description: "Key-person risk" },
  self_serve_sales: { impact: "+0.3x", description: "Scalable GTM" },
  enterprise_lumpy: { impact: "-0.2x", description: "Unpredictable revenue" },
  
  // Deal readiness
  audited_financials: { impact: "+0.2x", description: "Verified books" },
  revenue_verified: { impact: "+0.1x", description: "Proven revenue" }
};

export default VALUATION_FIELDS;
