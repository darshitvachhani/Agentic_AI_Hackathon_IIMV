/**
 * Academic Business Strategy Simulation Platform
 * Constants & Static Reference Data
 */

export const FOUNDATION_PHASE = {
  id: 0,
  name: 'Startup Formation & Ideation',
  code: 'Foundation',
  dates: 'Pre-Simulation Planning',
  academicYear: 'Genesis'
};

export const SIMULATION_QUARTERS = [
  { id: 1, name: 'Quarter 1', code: 'Q1', dates: 'Apr 2024 – Jun 2024', academicYear: 'FY 2024–25' },
  { id: 2, name: 'Quarter 2', code: 'Q2', dates: 'Jul 2024 – Sep 2024', academicYear: 'FY 2024–25' },
  { id: 3, name: 'Quarter 3', code: 'Q3', dates: 'Oct 2024 – Dec 2024', academicYear: 'FY 2024–25' },
  { id: 4, name: 'Quarter 4', code: 'Q4', dates: 'Jan 2025 – Mar 2025', academicYear: 'FY 2024–25' },
  { id: 5, name: 'Quarter 5', code: 'Q5', dates: 'Apr 2025 – Jun 2025', academicYear: 'FY 2025–26' },
  { id: 6, name: 'Quarter 6', code: 'Q6', dates: 'Jul 2025 – Sep 2025', academicYear: 'FY 2025–26' },
  { id: 7, name: 'Quarter 7', code: 'Q7', dates: 'Oct 2025 – Dec 2025', academicYear: 'FY 2025–26' },
  { id: 8, name: 'Quarter 8', code: 'Q8', dates: 'Jan 2026 – Mar 2026', academicYear: 'FY 2025–26' }
];

export const INDUSTRIES = [
  {
    id: 'quick-commerce',
    name: 'Quick Commerce & Hyperlocal Delivery',
    geographicScope: 'High-density urban clusters across Tier 1 & 2 Indian metropolises (starting in select key urban hubs such as Bengaluru, Delhi NCR, or Mumbai, with scope for regional and pan-India scaling)',
    tagline: '10-minute grocery and essential retail delivery across Tier 1 & 2 Indian metropolises',
    summary: 'The Indian quick-commerce sector represents an ultra-fast grocery and essentials distribution model powered by dense dark-store networks, micro-fulfillment centers, and real-time algorithmic dispatch. Rapid consumer adoption in top metros has accelerated gross merchandise value (GMV), though dark-store economics, high delivery partner churn, and wafer-thin grocery margins demand ruthless unit-economic discipline and high average order values (AOV).',
    competitors: [
      { name: 'Blinkit (Eternal)', marketShare: '42%', focus: 'High dark store density, FMCG & general merchandise', tier: 'High Volume / Standard' },
      { name: 'Zepto', marketShare: '28%', focus: 'Cafe vertical, 10-minute delivery, aggressive urban dark-stores', tier: 'Premium Fast' },
      { name: 'Instamart (Swiggy)', marketShare: '22%', focus: 'Bundled food delivery ecosystem, private label staples', tier: 'Ecosystem Hybrid' },
      { name: 'BB Now (Tata BigBasket)', marketShare: '5%', focus: 'Deep farm-to-fork sourcing, fresh produce supply chain', tier: 'Value Fresh' },
      { name: 'Dunzo Daily', marketShare: '3%', focus: 'B2B logistics pivots, select city hubs', tier: 'Niche Local' }
    ],
    popularProducts: [
      { category: 'Fresh Essentials', items: 'Dairy, bread, farm vegetables, eggs, seasonal fruits' },
      { category: 'Impulse & Munchies', items: 'Beverages, chips, gourmet chocolates, ice creams, late-night snacks' },
      { category: 'Quick Cafe & Ready-to-Eat', items: 'Brewed coffee, croissants, sandwiches, breakfast platters' },
      { category: 'Emergency Electronics & Home', items: 'Phone chargers, batteries, party supplies, OTC wellness' }
    ],
    customerPerceptions: [
      { factor: 'Delivery Speed vs Consistency', insight: 'Customers view 10-15 minute delivery as a non-negotiable benchmark; delays beyond 25 minutes trigger order cancellations and platform switching.' },
      { factor: 'Price Sensitivity & Delivery Fees', insight: 'Tier 1 urban professionals tolerate modest surge and handling fees, but price increases on milk and staples prompt immediate cross-checking across rival apps.' },
      { factor: 'Product Quality & SKU Completeness', insight: 'Missing inventory (stock-outs) during evening peak hours is the primary driver of customer churn to neighborhood mom-and-pop Kirana stores.' }
    ],
    portersFiveForces: [
      { force: 'Threat of New Entrants', level: 'Moderate', detail: 'High capital requirements for establishing dark-store networks, supply chain contracts, and last-mile density create a barrier against unfunded newcomers.' },
      { force: 'Bargaining Power of Buyers', level: 'High', detail: 'Zero customer switching costs between Blinkit, Zepto, and Instamart. Consumers maintain multiple apps and choose based on inventory and instant delivery speed.' },
      { force: 'Threat of Substitutes', level: 'High', detail: 'Traditional local Kirana stores offering informal credit, WhatsApp ordering, and scheduled e-commerce delivery (Amazon Fresh, Flipkart Minutes).' },
      { force: 'Bargaining Power of Suppliers', level: 'Moderate', detail: 'Large FMCG brands (HUL, ITC, Nestlé) command fixed wholesale margins, but dark stores earn significant revenue from brand trade promotions and sponsored shelf visibility.' },
      { force: 'Competitive Rivalry', level: 'Very High', detail: 'Intense price competition, competing dark-store land grabs, aggressive marketing spend, and margin compression across overlapping pin codes.' }
    ],
    pestleAnalysis: [
      { dimension: 'Political / Regulatory', insight: 'Evolving gig-worker social security mandates, dark-store zoning regulations in residential neighborhoods, and municipal traffic compliance.' },
      { dimension: 'Economic', insight: 'High inflation in food commodities affects basket size; rising interest rates increase the cost of working capital for inventory holding.' },
      { dimension: 'Social', insight: 'Dual-income households in urban centers prioritize convenience and time savings over traditional weekend weekly grocery shopping.' },
      { dimension: 'Technological', insight: 'AI-driven demand forecasting, predictive routing for delivery partners, and automated inventory reconciliation reduce spoilage below 2%.' },
      { dimension: 'Legal', insight: 'Consumer protection guidelines on price transparency, dark patterns in checkout tipping, and strict adherence to FSSAI packaging guidelines.' },
      { dimension: 'Environmental', insight: 'Mandatory transition to electric 2-wheelers for last-mile delivery, reduction of single-use plastic bags, and sustainable chilled packaging.' }
    ]
  },
  {
    id: 'ev-battery',
    name: 'Electric Vehicles & Battery Tech',
    geographicScope: 'Key commercial, industrial, and commuter transportation corridors across South & Western India, with scope for national manufacturing and battery swapping deployment',
    tagline: 'Two-wheeler and commercial EV manufacturing and smart battery swapping networks',
    summary: 'India’s electric mobility revolution is driven by the rapid electrification of two-wheelers and three-wheelers, supported by government PLI schemes and state subsidies. Core strategic levers include domestic battery pack assembly, localized supply chains, fast-charging infrastructure, and battery swapping ecosystems aimed at solving range anxiety and lowering initial acquisition costs.',
    competitors: [
      { name: 'Ola Electric', marketShare: '34%', focus: 'Vertically integrated mega-factory, software-driven EV scooters', tier: 'Mass Premium' },
      { name: 'TVS Motor (iQube)', marketShare: '21%', focus: 'Legacy trust, extensive dealership network, reliability', tier: 'Mainstream Reliable' },
      { name: 'Bajaj Auto (Chetak)', marketShare: '18%', focus: 'Metal body build, legacy brand loyalty, urban showroom expansion', tier: 'Heritage Urban' },
      { name: 'Ather Energy', marketShare: '14%', focus: 'High-performance engineering, fast-charging Ather Grid, tech-first UI', tier: 'Performance Tech' },
      { name: 'Hero Vida & Greaves', marketShare: '13%', focus: 'Removable battery packs, commuter fleet applications', tier: 'Commuter Fleet' }
    ],
    popularProducts: [
      { category: 'Urban Commuter Scooters', items: '2.5kWh to 4kWh battery packs, 90-120 km true range, connected dashboards' },
      { category: 'Commercial Cargo EVs', items: 'Reinforced 3-wheelers and heavy-duty 2-wheelers for B2B logistics fleets' },
      { category: 'Battery Swapping Subscriptions', items: 'Pay-per-swap automated kiosks for delivery partners and taxi fleets' },
      { category: 'Home & Fast Chargers', items: '7.4kW smart home wall-boxes and high-voltage DC highway chargers' }
    ],
    customerPerceptions: [
      { factor: 'Range Anxiety & Reliability', insight: 'Buyers demand certified real-world range over lab test numbers, with high sensitivity to thermal management in Indian summer conditions.' },
      { factor: 'Upfront Price vs Total Cost of Ownership', insight: 'High acquisition price remains a hurdle; buyers require clear ROI comparisons against petrol vehicles over a 3-year ownership horizon.' },
      { factor: 'After-Sales Service & Resale Value', insight: 'Concern regarding battery degradation after 4 years and lack of secondary used EV market liquidity.' }
    ],
    portersFiveForces: [
      { force: 'Threat of New Entrants', level: 'Moderate', detail: 'Stringent AIS-156 battery safety norms, homologation testing, and capex-intensive dealer networks limit fly-by-night assemblers.' },
      { force: 'Bargaining Power of Buyers', level: 'High', detail: 'Diverse options in the ₹1.0L to ₹1.5L segment; buyers actively cross-shop test rides and compare financing interest rates.' },
      { force: 'Threat of Substitutes', level: 'Moderate', detail: 'High-mileage 110cc internal combustion engine (ICE) motorcycles with widespread rural mechanics remain viable alternatives.' },
      { force: 'Bargaining Power of Suppliers', level: 'High', detail: 'Dependence on imported lithium cells (China, South Korea) and critical minerals creates raw material supply vulnerabilities.' },
      { force: 'Competitive Rivalry', level: 'Very High', detail: 'Aggressive price wars following subsidy reductions, promotional extended warranties, and zero-down-payment finance schemes.' }
    ],
    pestleAnalysis: [
      { dimension: 'Political / Regulatory', insight: 'FAME-II subsidy transitions to EMPS, mandatory domestic value addition (DVA) thresholds, and strict cell-level safety testing.' },
      { dimension: 'Economic', insight: 'Fluctuations in global lithium carbonate and nickel spot prices directly impact cell import costs and gross product margins.' },
      { dimension: 'Social', insight: 'Youth demographic embrace smart connected features (Bluetooth navigation, OTA updates, reverse mode) as lifestyle statements.' },
      { dimension: 'Technological', insight: 'Shift toward LFP (Lithium Iron Phosphate) chemistries for superior thermal stability, and solid-state battery R&D.' },
      { dimension: 'Legal', insight: 'Stringent ARAI/ICAT certification guidelines, motor vehicle insurance mandates, and product liability standards.' },
      { dimension: 'Environmental', insight: 'Circular battery recycling regulations and clean energy sourcing for grid charging networks.' }
    ]
  },
  {
    id: 'b2b-saas',
    name: 'B2B Enterprise SaaS',
    geographicScope: 'Cross-border enterprise and mid-market SaaS markets across North America, Europe, and India/Southeast Asia, built out of Indian engineering centers',
    tagline: 'Cross-border enterprise software, HR tech, and cloud-native business tools built out of India',
    summary: 'India’s B2B SaaS sector leverages high-caliber engineering talent and cost-efficient remote go-to-market (GTM) engines to serve mid-market and enterprise clients in North America, Europe, and Southeast Asia. Key metrics include Net Revenue Retention (NRR), Annual Recurring Revenue (ARR) growth, Customer Acquisition Cost (CAC) payback periods, and Magic Number efficiency.',
    competitors: [
      { name: 'Zoho Corporation', marketShare: '36%', focus: 'Integrated suite of 55+ business applications, boot-strapped, high margin', tier: 'Unified Suite' },
      { name: 'Freshworks', marketShare: '25%', focus: 'Modern IT service management (ITSM) and customer support (CX)', tier: 'Mid-Market Enterprise' },
      { name: 'Postman', marketShare: '16%', focus: 'Developer-first API collaboration platform and workflow automation', tier: 'Developer Platform' },
      { name: 'Icertis', marketShare: '12%', focus: 'Contract Intelligence and Fortune 500 enterprise governance', tier: 'Tier 1 Enterprise' },
      { name: 'Darwinbox', marketShare: '11%', focus: 'Mobile-first human capital management (HCM) for emerging markets', tier: 'Enterprise HCM' }
    ],
    popularProducts: [
      { category: 'Customer Experience & Helpdesk', items: 'Omnichannel ticketing, automated agent workflows, self-service portals' },
      { category: 'ERP & Financial Workflows', items: 'Subscription billing, revenue recognition, multi-currency accounting' },
      { category: 'HR Tech & Payroll', items: 'Performance management, attendance tracking, compliant statutory filings' },
      { category: 'DevOps & API Management', items: 'API documentation, testing mocks, automated regression pipelines' }
    ],
    customerPerceptions: [
      { factor: 'Enterprise Security & Compliance', insight: 'SOC 2 Type II, ISO 27001, and GDPR compliance are mandatory baseline requirements before any vendor RFP consideration.' },
      { factor: 'Time-to-Value & Implementation', insight: 'Enterprise buyers reject long 9-month onboarding cycles in favor of self-serve or guided 30-day time-to-value.' },
      { factor: 'Platform Integration Density', insight: 'Seamless bidirectional webhooks with Salesforce, Slack, Microsoft Teams, and Snowflake drive purchasing choices.' }
    ],
    portersFiveForces: [
      { force: 'Threat of New Entrants', level: 'High', detail: 'Low cost of modern cloud infrastructure and AI developer tools lowers initial MVP creation barriers.' },
      { force: 'Bargaining Power of Buyers', level: 'High', detail: 'SaaS buyers conduct rigorous software audits, demanding multi-year discounting and SLA guarantees.' },
      { force: 'Threat of Substitutes', level: 'Moderate', detail: 'Internal bespoke software solutions or spreadsheet workarounds, though inefficient, persist in legacy enterprises.' },
      { force: 'Bargaining Power of Suppliers', level: 'High', detail: 'Hyperscalers (AWS, Azure, GCP) command substantial cloud hosting spend with limited leverage for early startups.' },
      { force: 'Competitive Rivalry', level: 'Very High', detail: 'Global software market competition against Silicon Valley and European incumbents with deep marketing budgets.' }
    ],
    pestleAnalysis: [
      { dimension: 'Political / Regulatory', insight: 'Global cross-border data sovereignty requirements (EU Data Act, US Cloud Act, Indian DPDP Act).' },
      { dimension: 'Economic', insight: 'Global enterprise IT budget scrutiny forces SaaS tools to demonstrate clear quantifiable cost reduction or revenue generation.' },
      { dimension: 'Social', insight: 'Distributed remote and hybrid work environments mandate asynchronous, cloud-collaborative team tooling.' },
      { dimension: 'Technological', insight: 'Integration of generative AI copilots directly inside daily enterprise workflows to automate repetitive administrative tasks.' },
      { dimension: 'Legal', insight: 'Stringent intellectual property assignments, patent safeguards, and software warranty indemnity clauses in commercial contracts.' },
      { dimension: 'Environmental', insight: 'Mandatory Scope 3 carbon tracking for enterprise suppliers, favoring green cloud datacenter architectures.' }
    ]
  },
  {
    id: 'agritech',
    name: 'Agritech & Cold Chain Logistics',
    geographicScope: 'Key agricultural production belts and farm-to-mandi trade corridors across Maharashtra, Punjab, Karnataka, and Uttar Pradesh, with phased regional and national expansion',
    tagline: 'Farm-to-fork supply chains, IoT grain grading, and temperature-controlled logistics networks',
    summary: 'India’s agriculture ecosystem is undergoing transformation from fragmented mandi intermediation to direct farmer-to-business sourcing, digital warehousing, and automated post-harvest grading. Startups tackle high post-harvest losses (estimated at 20-30% in perishables) by orchestrating IoT-monitored cold storage and transparent spot price discovery.',
    competitors: [
      { name: 'DeHaat', marketShare: '32%', focus: 'Full-stack farmer marketplace, input advisory, and institutional procurement', tier: 'End-to-End Agri' },
      { name: 'Ninjacart', marketShare: '29%', focus: 'Tech-driven B2B fresh produce supply chain from farm gate to retailers', tier: 'B2B Perishables' },
      { name: 'WayCool Foods', marketShare: '18%', focus: 'Soil-to-sale supply chain, automated distribution hubs, private staples', tier: 'Cold-Chain Value' },
      { name: 'AgroStar', marketShare: '12%', focus: 'Agronomy advisory, direct-to-farmer agri-inputs and diagnostics app', tier: 'Input Commerce' },
      { name: 'Arya.ag', marketShare: '9%', focus: 'Post-harvest grain storage, warehouse receipt financing, digital mandi', tier: 'Grain Fintech' }
    ],
    popularProducts: [
      { category: 'Post-Harvest Fresh Produce Sourcing', items: 'Automated sorting, AI computer-vision grading, direct farm collection centers' },
      { category: 'Farm Input Commerce', items: 'High-yield hybrid seeds, bio-fertilizers, micro-nutrients, drip irrigation kits' },
      { category: 'Warehouse Receipt Financing', items: 'Collateralized loans against stored agricultural commodities in accredited warehouses' },
      { category: 'Cold Storage Reefer Logistics', items: 'IoT temperature/humidity monitored fleet dispatch for horticulture and dairy' }
    ],
    customerPerceptions: [
      { factor: 'Price Realization for Farmers', insight: 'Farmers adopt agritech platforms only when net realization exceeds traditional APMC mandi returns by at least 8-12% after transport costs.' },
      { factor: 'Freshness & Wastage for Retailers', insight: 'Local Kiranas and supermarkets prioritize produce that maintains shelf life for at least 48 hours without visible wilting.' },
      { factor: 'Reliability of Payment Cycles', insight: 'Instant digital bank settlement (T+0 or T+1) builds unbreakable trust compared to traditional delayed commission agent credit.' }
    ],
    portersFiveForces: [
      { force: 'Threat of New Entrants', level: 'Low', detail: 'Significant ground-level operational complexity, village-level trust building, and working capital intensity deter asset-light startups.' },
      { force: 'Bargaining Power of Buyers', level: 'Moderate', detail: 'B2B buyers (supermarkets, institutional caterers) demand consistent grading standards but have multiple vendor choices.' },
      { force: 'Threat of Substitutes', level: 'High', detail: 'Centuries-old commission agents (Arhtiyas) embedded in APMC mandis providing informal social loans and immediate cash.' },
      { force: 'Bargaining Power of Suppliers', level: 'Low to Moderate', detail: 'Millions of smallholder farmers with average landholdings under 2 hectares have low individual bargaining power, though collective FPOs are rising.' },
      { force: 'Competitive Rivalry', level: 'High', detail: 'Margin pressure across high-volume commodity staples and high logistical transport fuel costs.' }
    ],
    pestleAnalysis: [
      { dimension: 'Political / Regulatory', insight: 'State-specific APMC regulations, agricultural export bans to tame domestic food inflation, and PM Kisan credit schemes.' },
      { dimension: 'Economic', insight: 'Monsoon precipitation variability directly influences crop yield volumes, farm income, and rural consumption indices.' },
      { dimension: 'Social', insight: 'Younger generational farmers utilizing smartphones for weather forecasting, drone spraying, and digital spot price discovery.' },
      { dimension: 'Technological', insight: 'Hyperspectral imaging for non-invasive fruit ripeness detection, satellite crop health NDVI monitoring, and solar cold rooms.' },
      { dimension: 'Legal', insight: 'Land leasing contractual norms, warehouse licensing compliance, and Food Safety and Standards Authority (FSSAI) audits.' },
      { dimension: 'Environmental', insight: 'Urgent need to curb groundwater depletion, promote regenerative agriculture, and eliminate post-harvest food waste emissions.' }
    ]
  },
  {
    id: 'fintech-lending',
    name: 'FinTech & Digital Lending',
    geographicScope: 'High-growth MSME clusters and consumer credit markets across Tier 1, Tier 2, and Tier 3 Indian cities, enabled by the nationwide India Stack (UPI, Account Aggregator, Aadhaar)',
    tagline: 'Credit enablement, cash-flow MSME underwriting, and API-first embedded financial infrastructure',
    summary: 'The Indian fintech sector has matured from payment facilitation into cash-flow-based digital lending, credit line enablement, and co-lending partnerships with regulated NBFCs and banks. The unified India Stack (Aadhaar, UPI, Account Aggregator framework, OCEN) powers frictionless paperless loan disbursals, while regulatory compliance and credit underwriting through business cycles remain the primary determinants of survival.',
    competitors: [
      { name: 'KreditBee', marketShare: '28%', focus: 'Young professional personal loans, digital credit lines, NBFC balance sheet', tier: 'Consumer Credit' },
      { name: 'Lendingkart', marketShare: '24%', focus: 'Unsecured working capital loans for small MSMEs, machine learning scoring', tier: 'MSME Working Capital' },
      { name: 'Navi Technologies', marketShare: '20%', focus: 'Low-cost direct digital home and cash loans, in-house banking stack', tier: 'Direct Digital' },
      { name: 'InCred Finance', marketShare: '16%', focus: 'Diversified retail, education, and merchant financing platform', tier: 'Diversified NBFC' },
      { name: 'Aye Finance', marketShare: '12%', focus: 'Cluster-based micro-enterprise lending for unorganized manufacturing', tier: 'Micro Enterprise' }
    ],
    popularProducts: [
      { category: 'Unsecured MSME Credit Lines', items: '₹1L to ₹25L cash flow loans backed by GST and banking Account Aggregator data' },
      { category: 'Merchant Soundbox & QR Loans', items: 'Daily auto-repayment micro-loans deducted from merchant UPI collections' },
      { category: 'Digital Personal Loans', items: 'Instant 3-minute disbursal loans with Aadhaar e-KYC and automated NACH mandates' },
      { category: 'Supply Chain Invoice Financing', items: 'TReDS and anchor-led vendor invoice discounting for corporate suppliers' }
    ],
    customerPerceptions: [
      { factor: 'Speed of Disbursal & Paperwork', insight: 'Borrowers strongly prefer digital zero-paperwork workflows that disburse funds within hours rather than weeks.' },
      { factor: 'Interest Rates & Hidden Processing Fees', insight: 'Borrowers scrutinize Key Fact Statements (KFS); unexpected processing fees trigger negative reviews and loan abandonment.' },
      { factor: 'Collection Practices & Harassment', insight: 'Reputational trust is critical; borrowers reject platforms using aggressive debt recovery agents in favor of polite digital nudges.' }
    ],
    portersFiveForces: [
      { force: 'Threat of New Entrants', level: 'Low', detail: 'Strict Reserve Bank of India (RBI) digital lending guidelines, NBFC licensing requirements, and First Loss Default Guarantee (FLDG) caps.' },
      { force: 'Bargaining Power of Buyers', level: 'Moderate', detail: 'Prime credit borrowers have abundant credit options; subprime and new-to-credit borrowers face restricted access and accept higher APRs.' },
      { force: 'Threat of Substitutes', level: 'High', detail: 'Traditional public and private sector banks offering lower interest rate secured loans, and informal local moneylenders.' },
      { force: 'Bargaining Power of Suppliers', level: 'High', detail: 'Institutional debt providers and wholesale banks dictate cost of capital (CoF) to fintech NBFC balance sheets.' },
      { force: 'Competitive Rivalry', level: 'Very High', detail: 'Intense competition among fintechs to acquire prime risk-rated borrowers without compromising portfolio NPA ratios.' }
    ],
    pestleAnalysis: [
      { dimension: 'Political / Regulatory', insight: 'Strict RBI oversight on digital lending apps, fair recovery code of conduct, and limits on synthetic securitization.' },
      { dimension: 'Economic', insight: 'Macro interest rate cycles affect net interest margins (NIMs); inflation pressure impacts lower-income borrower repayment capacity.' },
      { dimension: 'Social', insight: 'Rising digital financial literacy across Tier 2 and Tier 3 cities driven by widespread UPI adoption.' },
      { dimension: 'Technological', insight: 'Adoption of RBI Account Aggregator (AA) framework for consent-based real-time bank statement analytics, replacing PDF uploads.' },
      { dimension: 'Legal', insight: 'Rigorous enforcement of Digital Personal Data Protection (DPDP) Act rules regarding borrower contact list and biometric access.' },
      { dimension: 'Environmental', insight: 'Paperless digital loan origination and ESG-linked credit incentives for MSMEs adopting renewable solar rooftop power.' }
    ]
  }
];

export const QUARTERLY_MARKET_INTELLIGENCE = {
  'quick-commerce': {
    1: {
      quarter: 'Quarter 1 (Apr 2024 – Jun 2024)',
      industrySnapshot: 'Summer temperatures across metropolitan clusters (Bengaluru, Delhi NCR, Mumbai) drive a 35% surge in cold beverages, dairy, and fresh fruit demand. Dark-store refrigeration electricity and cold chain holding costs rise by 12%. Municipal authorities initiate pilot curbs on delivery rider roadside clustering.',
      competitorMoves: 'Incumbents (Blinkit, Zepto) expand dark store density in prime residential corridors. Zephyr Express launches an aggressive customer blitz with ₹100 discount vouchers on ₹299 baskets. QuickKirana onboards 40+ neighborhood stores to defend suburban fringes.',
      consumerInsights: 'Morning peak hours (7:00 AM – 10:30 AM) witness urgent demand for fresh breakfast essentials. Consumers show zero tolerance for bruised produce or warm dairy, cross-checking competitor delivery ETAs within 60 seconds of a delay.',
      strategicChallenge: 'How will you configure your initial product mix, pricing discipline, and dark store operations to capture high-margin demand without succumbing to voucher burn?'
    },
    2: {
      quarter: 'Quarter 2 (Jul 2024 – Sep 2024)',
      industrySnapshot: 'Heavy monsoon rainfall in urban centres leads to severe street waterlogging and delivery bottlenecks. Rider transit times double from 12 mins to 25+ mins. Packaging spoilage and waterproof rain gear costs increase operational overhead by 8%.',
      competitorMoves: 'Platforms test "rain surge fees" (₹15–₹25 per order), resulting in mixed consumer sentiment. HyperPulse Direct pivots to scheduled dry-grocery deliveries to bypass instant last-mile gridlock. Zephyr Express continues subsidizing delivery fees, accelerating cash burn.',
      consumerInsights: 'Spike in hot snacks, ready-to-eat comfort food, tea, and OTC flu medications. Customers tolerate moderate delivery fee surges during heavy storms, but report high dissatisfaction with sudden order cancellations.',
      strategicChallenge: 'What operational safeguards, driver incentive structures, and catalog adjustments will you execute to preserve fulfillment reliability and margin integrity amid weather disruptions?'
    },
    3: {
      quarter: 'Quarter 3 (Oct 2024 – Dec 2024)',
      industrySnapshot: 'Major Indian festive period (Navratri, Diwali, New Year) drives peak GMV across all urban centers. Demand expands into premium gift boxes, gourmet confectionery, dry fruits, and electronics. Extreme competition for gig delivery riders drives temporary rider payouts up 25%.',
      competitorMoves: 'Zepto and Blinkit unleash massive brand media campaigns. MetroBlink launches proprietary high-margin festive sweet boxes and snack hampers, achieving 35%+ gross margins. QuickKirana struggles with partner store inventory stock-outs during Diwali peak.',
      consumerInsights: 'Average Order Value (AOV) surges by 45% as consumers bundle gifting and party items with daily groceries. Shoppers prioritize guaranteed time-slot delivery and premium unboxing over minor discount variations.',
      strategicChallenge: 'How will you balance inventory working capital and festive surge logistics to maximize revenue while safeguarding cash runway against post-festive hangover?'
    },
    4: {
      quarter: 'Quarter 4 (Jan 2025 – Mar 2025)',
      industrySnapshot: 'Post-festive demand cooling and financial year-end. Inflation in core food staples moderates. Institutional venture investors demand visible unit-level contribution margins (EBITDA discipline) rather than raw GMV land-grabs.',
      competitorMoves: 'Promotional discounts and referral credits are sharply curtailed across the sector. Zephyr Express faces urgent liquidity constraints due to unchecked burn, forcing store consolidation. Blinkit accelerates advertising revenues from sponsored brand slots.',
      consumerInsights: 'Shift toward health, fitness, organic produce, and essential household staples. Deal-seeking bargain hunters churn, but high-intent regular households continue daily repeat purchases with steady frequency.',
      strategicChallenge: 'What cost rationalization, supplier credit negotiations, or private-label margin enhancements will you implement to transition toward sustainable operational cash flow?'
    },
    5: {
      quarter: 'Quarter 5 (Apr 2025 – Jun 2025)',
      industrySnapshot: 'Start of FY 2025–26. Quick commerce enters a secondary expansion phase into high-density Tier-2 cities (Jaipur, Lucknow, Kochi, Chandigarh). Dark store commercial lease rentals escalate by 10% in established Tier-1 pin codes.',
      competitorMoves: 'Top players introduce 30-minute electronics and apparel lines to boost basket size. MetroBlink expands owned cloud kitchens to capture prepared office lunches. QuickKirana upgrades partner mom-and-pop stores with barcode scanners.',
      consumerInsights: 'Tier-2 consumers show rapid adoption for emergency essentials, though basket sizes are 20% lower than Tier-1 metros. High expectations for vernacular app support and local regional brands.',
      strategicChallenge: 'Will you defend and deepen high-density urban micro-hubs with specialized offerings, or allocate capital toward expanding into emerging secondary clusters?'
    },
    6: {
      quarter: 'Quarter 6 (Jul 2025 – Sep 2025)',
      industrySnapshot: 'State gig-worker welfare boards implement mandatory social security welfare cess (1.5% per delivery). Fuel price fluctuations add pressure to vehicle fleet economics; transition toward electric 2-wheelers accelerates.',
      competitorMoves: 'Fleet electrification mandates prompt leading players to sign long-term battery swapping agreements. Rival platforms raise minimum order thresholds to ₹199 to eliminate loss-making small ticket orders.',
      consumerInsights: 'Consumers accept bundled delivery subscriptions (e.g. monthly pass for zero delivery fees) in exchange for loyal platform usage, reducing overall churn rate.',
      strategicChallenge: 'How will you absorb or pass on statutory labor welfare levies and EV transition capex without compromising customer retention?'
    },
    7: {
      quarter: 'Quarter 7 (Oct 2025 – Dec 2025)',
      industrySnapshot: 'Second annual festive cycle. Quick commerce consolidates into three distinct tiers: mass ultra-fast convenience, specialized gourmet/perishables, and asset-light community aggregation. Private-label share exceeds 22% of total category sales.',
      competitorMoves: 'Heavy private-label discounting by well-funded incumbents squeezes standard FMCG margins. High M&A speculation as struggling cash-strapped players explore asset sales.',
      consumerInsights: 'Extreme reliance on quick commerce for last-minute party hosting and corporate gifting. Strong preference for curated organic, artisanal, and authentic regional brands.',
      strategicChallenge: 'How will you exploit your accumulated operational strengths to defend your target market niche against predatory incumbent private labels?'
    },
    8: {
      quarter: 'Quarter 8 (Jan 2026 – Mar 2026)',
      industrySnapshot: 'Simulation finale and market maturity. Urban customer penetration peaks. The market shifts from expansionary acquisition to ruthless margin optimization, long-term asset productivity, and equity return on capital.',
      competitorMoves: 'Final competitive positioning: unprofitable dark stores are shuttered; surviving contenders cement defensible geographic clusters and high repeat customer lifetime value (LTV).',
      consumerInsights: 'Habitual, deeply ingrained daily usage. Customer brand loyalty is anchored in stock reliability, fresh item consistency, and customer service responsiveness.',
      strategicChallenge: 'What final strategic decisions, balance sheet consolidation, and operating efficiency measures will ensure your venture ranks highest in cumulative performance and sustainable return?'
    }
  }
};

function createEmptyQuarters() {
  return SIMULATION_QUARTERS.map((q) => ({
    quarter: q.id,
    dates: q.dates,
    status: 'awaiting-submission',
    strategy: '',
    reasoning: '',
    fundingRequest: {
      required: false,
      amount: '',
      type: 'Equity Investment',
      purpose: '',
      approvedAmount: null,
      terms: null
    },
    marketShare: null,
    financialIndicators: null,
    score: null,
    scoreExplanation: null,
    whatWentWell: null,
    mistakesWeaknesses: null,
    nextQuarterImplications: null,
    marketResponseEvaluation: null,
    resultsAvailable: false,
    criterionBreakdown: null,
    scoringWeightsUsed: null
  }));
}

export const INITIAL_DEMO_TEAMS = [
  {
    id: 'team-1',
    name: 'Alpha Vanguard',
    industryId: 'quick-commerce',
    currentQuarter: 0,
    status: 'ideation', // 'ideation' | 'in-progress' | 'submitted' | 'evaluated'
    cumulativeScore: 0,
    quarterlyData: createEmptyQuarters()
  },
  {
    id: 'team-2',
    name: 'Zephyr Express',
    industryId: 'quick-commerce',
    currentQuarter: 0,
    status: 'ideation',
    cumulativeScore: 0,
    quarterlyData: createEmptyQuarters()
  },
  {
    id: 'team-3',
    name: 'HyperPulse Direct',
    industryId: 'quick-commerce',
    currentQuarter: 0,
    status: 'ideation',
    cumulativeScore: 0,
    quarterlyData: createEmptyQuarters()
  },
  {
    id: 'team-4',
    name: 'QuickKirana Network',
    industryId: 'quick-commerce',
    currentQuarter: 0,
    status: 'ideation',
    cumulativeScore: 0,
    quarterlyData: createEmptyQuarters()
  },
  {
    id: 'team-5',
    name: 'MetroBlink Delivery',
    industryId: 'quick-commerce',
    currentQuarter: 0,
    status: 'ideation',
    cumulativeScore: 0,
    quarterlyData: createEmptyQuarters()
  }
];

