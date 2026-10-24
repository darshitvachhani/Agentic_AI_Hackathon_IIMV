/**
 * Netlify Serverless Function: POST /api/simulate-quarter
 * Evaluates decisions across 7 criteria, calculates Strategic Depth, and simulates cohort outcomes
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

const PRIMARY_MODEL = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-3.5-flash-lite"];

async function callGemini(prompt, systemInstruction = null, jsonMode = false) {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS.filter((m) => m !== PRIMARY_MODEL)];
  let lastError = null;

  for (const model of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: jsonMode ? 0.4 : 0.7,
        maxOutputTokens: 8192,
        ...(jsonMode ? { responseMimeType: "application/json" } : {})
      }
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        const data = await resp.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error("Empty candidate response returned by Gemini.");
        }
        return { text, modelUsed: model };
      } else {
        const errText = await resp.text();
        console.warn(`[GEMINI] Model ${model} HTTP ${resp.status}: ${errText.substring(0, 200)}`);
        lastError = `HTTP ${resp.status} on ${model}`;
        if (resp.status === 429 || resp.status === 503) {
          continue;
        } else {
          break;
        }
      }
    } catch (err) {
      lastError = err.message;
      continue;
    }
  }

  throw new Error(`Gemini call failed: ${lastError}`);
}

function buildCalibratedSimulation(teamName, industryName, quarterNum, strategy, reasoning, financialPosition, cohortTeams) {
  const stratClean = (strategy || "").trim();
  const reasonClean = (reasoning || "").trim();
  const stratLen = stratClean.length;
  const totalLen = stratLen + reasonClean.length;
  const wordCount = stratClean.split(/\s+/).filter(Boolean).length;

  let depthScore, depthLevel, depthFeedback, howToImprove, baseScore, shareVal, revVal, pnlVal;

  if (stratLen < 75 || totalLen < 130 || wordCount < 15) {
    depthScore = Math.floor(Math.random() * 15) + 36; // 36-50
    depthLevel = "Low (Superficial / Single-line)";
    depthFeedback = `The strategy was stated in a single brief line (${stratLen} chars) lacking operational levers, unit economics, and competitive defensibility.`;
    howToImprove = "• Quantify target unit economics: specify target gross margin percentages (e.g., 30–35%), average order value (AOV), and customer delivery fee structures.\n• Define micro-cluster locations: name specific tech corridors or high-density pin codes rather than general terms.\n• Detail fulfillment SLAs and partner agreements: outline vendor payment terms, cold-chain handling, and rider fleet allocation.";
    baseScore = Math.floor(Math.random() * 9) + 52; // 52-60
    shareVal = "10.5%";
    revVal = "₹1.65 Cr";
    pnlVal = "-₹22.5 L";
  } else if (stratLen < 180 || totalLen < 260 || wordCount < 35) {
    depthScore = Math.floor(Math.random() * 10) + 66; // 66-75
    depthLevel = "Moderate (Basic Detail)";
    depthFeedback = "Good initial strategic direction, but lacks detailed supply chain terms, fleet unit costs, and defensive competitive moats.";
    howToImprove = "• Include explicit dark-store lease expense projections and inventory turn targets.\n• Detail customer acquisition cost (CAC) payback period and repeat retention incentives.\n• Address competitor counter-moves (e.g., Blinkit or Zepto matching voucher promotions).";
    baseScore = Math.floor(Math.random() * 5) + 72; // 72-76
    shareVal = "15.0%";
    revVal = "₹2.45 Cr";
    pnlVal = "-₹14.5 L";
  } else {
    depthScore = Math.floor(Math.random() * 11) + 84; // 84-94
    depthLevel = "High (Deep & Comprehensive)";
    depthFeedback = "Comprehensive operational and economic depth covering niche targeting, partner terms, and unit margin defensibility.";
    howToImprove = "• Stress-test cash flow against seasonal monsoon delivery disruptions.\n• Establish contingency reserves for rising municipal dark-store zoning compliance costs.";
    baseScore = Math.floor(Math.random() * 7) + 82; // 82-88
    shareVal = "18.5%";
    revVal = "₹2.85 Cr";
    pnlVal = "-₹8.5 L";
  }

  return {
    quarter: quarterNum,
    market_developments: `During Quarter ${quarterNum}, the ${industryName} sector experienced competitive consolidation and shifting unit economics across metropolitan clusters.`,
    active_team: {
      team_name: teamName,
      strategy_summary: stratClean.substring(0, 120) || "Targeted operational expansion",
      strategic_depth_score: depthScore,
      strategic_depth_level: depthLevel,
      strategic_depth_feedback: depthFeedback,
      how_to_improve_depth: howToImprove,
      revenue: revVal,
      gross_margin: depthScore >= 70 ? "29.4%" : "21.5%",
      operating_profit_or_loss: pnlVal,
      cash_balance: depthScore >= 70 ? "₹3.15 Cr" : "₹2.70 Cr",
      debt_balance: "None",
      market_share: shareVal,
      units_sold: depthScore >= 70 ? "182,000 orders" : "120,000 orders",
      what_went_right: depthScore < 70
        ? "1. Controlled initial pilot scope avoided broad retail price wars.\n2. Identified a distinct customer use-case in targeted urban corridors."
        : "1. Disciplined unit economics in core delivery clusters.\n2. Strong customer repeat rates and basket margins.",
      what_went_wrong: depthScore < 70
        ? "1. Superficial strategy formulation left delivery fleet economics and lease overhead under-modeled.\n2. Inadequate competitive moat allowed faster-moving rivals to capture adjacent pin codes."
        : "1. Morning peak fleet shortages caused minor fulfillment delays.\n2. Vendor packaging costs slightly exceeded projections.",
      recommended_improvements: howToImprove,
      criterion_evaluations: {
        strategicDecisionQuality: { score: baseScore + 1, explanation: "Strategic scope assessed against analytical depth.", evidence: "Formulated quarterly strategy.", missing_assumptions: "Execution depth" },
        reasoningAndEvidence: { score: baseScore - 1, explanation: "Business reasoning evaluated for economic coherence.", evidence: "Economic rationale provided.", missing_assumptions: "Sensitivity testing" },
        marketAdaptability: { score: baseScore, explanation: "Responsiveness to competitive pressure.", evidence: "Defensive positioning.", missing_assumptions: "Rival aggressive discounting" },
        financialManagement: { score: baseScore + 2, explanation: "Capital management and runway preservation.", evidence: "Cash balance discipline.", missing_assumptions: "Lease escalation" },
        competitivePerformance: { score: baseScore - 2, explanation: "Relative share capture against cohort rivals.", evidence: "Order volume benchmarks.", missing_assumptions: "Competitor counter-moves" },
        riskAssessment: { score: baseScore - 1, explanation: "Downside buffer and operational contingencies.", evidence: "Inventory buffer.", missing_assumptions: "Fleet breakdown cushion" },
        learningFromDecisions: { score: baseScore, explanation: "Baseline strategic progression.", evidence: "Quarterly execution.", missing_assumptions: "None" }
      }
    },
    cohort_evaluations: [
      {
        team_id: "team-2",
        team_name: "Zephyr Express",
        strategy_summary: "Aggressive urban dark-store land grab and promotional customer discounts.",
        revenue: "₹3.80 Cr",
        gross_margin: "16.5%",
        operating_profit_or_loss: "-₹42.0 L",
        cash_balance: "₹1.90 Cr",
        debt_balance: "None",
        market_share: "28.5%",
        units_sold: "310,000 orders",
        what_went_right: "Rapid market share expansion and top-of-mind brand recognition.",
        what_went_wrong: "Heavy voucher subsidization caused high cash erosion.",
        recommended_improvements: "Curtail customer acquisition subsidies.",
        criterion_evaluations: {
          strategicDecisionQuality: { score: 71, explanation: "Volume-focused but heavily subsidized." },
          reasoningAndEvidence: { score: 69, explanation: "Underestimated competitor price matching." },
          marketAdaptability: { score: 73, explanation: "Fast store rollout across metro hubs." },
          financialManagement: { score: 62, explanation: "Heavy cash burn threatens liquidity." },
          competitivePerformance: { score: 85, explanation: "Captured highest order volume in cohort." },
          riskAssessment: { score: 64, explanation: "Thin cash buffer for supply chain shocks." },
          learningFromDecisions: { score: 70, explanation: "Blitzscaling playbook executed at high cost." }
        }
      },
      {
        team_id: "team-3",
        team_name: "HyperPulse Direct",
        strategy_summary: "Tier-2 suburban expansion focusing on packaged staples and scheduled morning slots.",
        revenue: "₹2.10 Cr",
        gross_margin: "24.0%",
        operating_profit_or_loss: "-₹9.5 L",
        cash_balance: "₹3.10 Cr",
        debt_balance: "None",
        market_share: "16.8%",
        units_sold: "145,000 orders",
        what_went_right: "Disciplined cost structure and healthy order delivery consolidation.",
        what_went_wrong: "Slower initial customer uptake due to scheduled rather than instant delivery.",
        recommended_improvements: "Introduce 30-minute express tier for top 20% high-frequency SKUs.",
        criterion_evaluations: {
          strategicDecisionQuality: { score: 79, explanation: "Prudent unit economics model targeting lower-cost suburban clusters." },
          reasoningAndEvidence: { score: 80, explanation: "Sound trade-off analysis between speed and delivery costs." },
          marketAdaptability: { score: 74, explanation: "Defended against metro price wars by remaining in suburbs." },
          financialManagement: { score: 86, explanation: "Excellent capital conservation and sustainable runway." },
          competitivePerformance: { score: 72, explanation: "Modest market share compared to aggressive metro rivals." },
          riskAssessment: { score: 82, explanation: "High resilience against price inflation and fuel spikes." },
          learningFromDecisions: { score: 76, explanation: "Careful execution of cost-focused startup blueprint." }
        }
      },
      {
        team_id: "team-4",
        team_name: "QuickKirana Network",
        strategy_summary: "Asset-light Kirana partnership model aggregating local mom-and-pop stores via mobile POS.",
        revenue: "₹1.65 Cr",
        gross_margin: "19.2%",
        operating_profit_or_loss: "-₹4.8 L",
        cash_balance: "₹3.35 Cr",
        debt_balance: "None",
        market_share: "12.5%",
        units_sold: "115,000 orders",
        what_went_right: "Minimal dark store capital expenditure and high neighborhood store goodwill.",
        what_went_wrong: "Inventory synchronization friction and occasional stock discrepancies.",
        recommended_improvements: "Deploy barcode scanning handhelds to partner Kirana counters.",
        criterion_evaluations: {
          strategicDecisionQuality: { score: 78, explanation: "Clever asset-light approach bypassing heavy dark-store capex." },
          reasoningAndEvidence: { score: 76, explanation: "Validates community trust as substitute for owned infrastructure." },
          marketAdaptability: { score: 77, explanation: "Nimble footprint scalable across neighborhoods quickly." },
          financialManagement: { score: 89, explanation: "Lowest operating loss in cohort and extensive 24-month runway." },
          competitivePerformance: { score: 68, explanation: "Slower delivery turnaround limits premium metro share." },
          riskAssessment: { score: 73, explanation: "Vulnerable to Kirana partner stockouts during peak demand." },
          learningFromDecisions: { score: 77, explanation: "Solid foundation for community-anchored commerce." }
        }
      },
      {
        team_id: "team-5",
        team_name: "MetroBlink Delivery",
        strategy_summary: "Private label dairy, snacks, and ready-to-eat breakfast items with owned dark kitchens.",
        revenue: "₹2.90 Cr",
        gross_margin: "32.0%",
        operating_profit_or_loss: "-₹22.5 L",
        cash_balance: "₹2.50 Cr",
        debt_balance: "None",
        market_share: "22.0%",
        units_sold: "220,000 orders",
        what_went_right: "Superior gross margins on in-house private label dairy and prepared meals.",
        what_went_wrong: "Food safety compliance delays and initial waste in fresh prepared foods.",
        recommended_improvements: "Implement predictive demand algorithms to curb perishability spoilage below 3%.",
        criterion_evaluations: {
          strategicDecisionQuality: { score: 83, explanation: "Vertical integration into high-margin private label products." },
          reasoningAndEvidence: { score: 81, explanation: "Coherent logic: private labels subsidize fast last-mile logistics." },
          marketAdaptability: { score: 79, explanation: "Capitalized on rising urban demand for fresh ready-to-eat meals." },
          financialManagement: { score: 75, explanation: "Moderate cash burn balanced by healthy gross contribution margins." },
          competitivePerformance: { score: 82, explanation: "Clear customer loyalty for proprietary food brands." },
          riskAssessment: { score: 74, explanation: "High food spoilage exposure during delivery transit delays." },
          learningFromDecisions: { score: 80, explanation: "Strong operational ambition executed with disciplined product focus." }
        }
      }
    ]
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const teamName = data.teamName || "Alpha Vanguard";
    const industryName = data.industryName || "Quick Commerce & Hyperlocal Delivery";
    const quarterNum = data.quarter || 1;
    const quarterDates = data.quarterDates || "Apr 2024 – Jun 2024";
    const strategy = (data.strategy || "").trim() || "Standard market entry and dark-store deployment.";
    const reasoning = (data.reasoning || "").trim() || "Optimizing delivery density and cluster unit economics.";
    const fundingRequest = data.fundingRequest || {};
    const financialPosition = data.financialPosition || {};
    const cohortTeams = data.cohortTeams || [
      { id: "team-2", name: "Zephyr Express" },
      { id: "team-3", name: "HyperPulse Direct" },
      { id: "team-4", name: "QuickKirana Network" },
      { id: "team-5", name: "MetroBlink Delivery" }
    ];

    const systemInstruction = `You are the Quantitative Market Simulator and Academic Scoring Evaluator for an MBA Business Strategy Simulation.
You evaluate the submitted quarterly decisions across 7 defined criteria and simulate realistic market results for all 5 teams in the cohort.

THE 7 EVALUATION CRITERIA (score each 0-100):
1. strategicDecisionQuality: Coherence, customer focus, feasible execution, business model alignment.
2. reasoningAndEvidence: Plausible economic justification, explicit assumptions, trade-offs considered.
3. marketAdaptability: Response to competitor moves, regulatory environment, and sector dynamics.
4. financialManagement: Unit economics, runway preservation, margin discipline, realistic capital use.
5. competitivePerformance: Product differentiation, relative positioning against rivals.
6. riskAssessment: Operational contingency, downside risk buffers, mitigating supply/demand bottlenecks.
7. learningFromDecisions: Compound learning from previous quarters (or baseline strategic prudence for Q1).

RULES:
- Evaluate decision quality independently of random luck. Reward disciplined niche strategy with sound unit economics just as much as or more than reckless mass-market chasing.
- STRATEGIC DEPTH EVALUATION (CRITICAL):
  * You MUST evaluate "strategic_depth_score" (integer 0-100) based strictly on how deeply, rigorously, and operationally the student formulated their strategy and justification.
  * If the student submitted a single-line, brief, or superficial strategy (e.g., fewer than 20-25 words, or lacking operational levers like unit margins, target pin codes, partner SLAs, delivery fleet economics), they MUST receive a LOW strategic depth score (30-55) and their 7 criteria scores MUST be significantly penalized (overall score 50-65)!
  * If they provided a detailed, multi-dimensional strategy (covering target customers, pricing, unit economics, supply agreements, operational levers, and risk mitigations), assign a higher strategic depth score (80-95).
  * "strategic_depth_level": "Low (Superficial / Single-line)" | "Moderate (Basic Detail)" | "High (Deep & Comprehensive)"
  * "strategic_depth_feedback": concise 1-2 sentence critique of the strategy's analytical depth.
  * "how_to_improve_depth": 2-3 specific, actionable bullet points on what operational, economic, or market dimensions were missing and how the student can deepen their strategic articulation in upcoming quarters.
- REALISTIC COHORT RANKINGS (NO FORCED #1 RANK):
  * Do NOT automatically place the active team at the top of the cohort or give them the highest score.
  * Benchmark all 5 cohort teams realistically based on their strategies. Competitors have competitive scores spanning 68 to 86.
  * If the active team's strategic depth is low or their strategy is brief, other cohort teams MUST outscore them, placing the active team in 3rd, 4th, or 5th rank in the cohort standings.
- Output MUST be valid strict JSON.`;

    const userPrompt = `Evaluate Quarter ${quarterNum} (${quarterDates}) for ${industryName}.

ACTIVE TEAM:
- Team Name: ${teamName}
- Strategy: ${strategy}
- Economic Rationale / Justification: ${reasoning}
- Funding Decision: ${JSON.stringify(fundingRequest)}
- Financial Position: Cash: ${financialPosition.cash || "₹3.50 Cr"}, Debt: ${financialPosition.debt || "None"}

OTHER COHORT TEAMS:
${JSON.stringify(cohortTeams)}

Provide quantitative market simulation results and academic evaluation across all 7 criteria in valid JSON matching this schema:
{
  "quarter": ${quarterNum},
  "market_developments": "Sector summary of customer trends, pricing dynamics, and competitor actions in ${quarterDates}",
  "active_team": {
    "team_name": "${teamName}",
    "strategy_summary": "${strategy.substring(0, 120)}",
    "strategic_depth_score": 75,
    "strategic_depth_level": "Moderate (Basic Detail)",
    "strategic_depth_feedback": "Concise critique of strategic depth and operational specificity.",
    "how_to_improve_depth": "• Detail unit margins and pricing thresholds.\\n• Specify dark-store lease terms and partner SLAs.\\n• Account for competitor counter-pricing.",
    "revenue": "₹2.45 Cr",
    "gross_margin": "28.0%",
    "operating_profit_or_loss": "-₹14.5 L",
    "cash_balance": "₹2.90 Cr",
    "debt_balance": "None",
    "market_share": "15.0%",
    "units_sold": "165,000 orders",
    "what_went_right": "1. Strong gross margins in target pin codes.\\n2. Low customer churn rate.",
    "what_went_wrong": "1. Morning delivery capacity bottlenecks.\\n2. Packaging costs higher than projected.",
    "recommended_improvements": "Expand supplier credit terms and automate cluster dispatch.",
    "criterion_evaluations": {
      "strategicDecisionQuality": { "score": 78, "explanation": "Clear customer positioning.", "evidence": "Focus on high-margin breakfast.", "missing_assumptions": "Rider retention" },
      "reasoningAndEvidence": { "score": 76, "explanation": "Logic connects niche to margin.", "evidence": "Explicit margin model.", "missing_assumptions": "CAC stability" },
      "marketAdaptability": { "score": 74, "explanation": "Protected from discount wars.", "evidence": "Avoided voucher burn.", "missing_assumptions": "Rival private labels" },
      "financialManagement": { "score": 78, "explanation": "Runway preserved over 18 months.", "evidence": "Controlled cash burn.", "missing_assumptions": "Lease escalation" },
      "competitivePerformance": { "score": 75, "explanation": "Defensible micro-hub density.", "evidence": "Exclusive bakery ties.", "missing_assumptions": "Aggressive rival rollout" },
      "riskAssessment": { "score": 72, "explanation": "Addressed food perishability.", "evidence": "Daily batch procurement.", "missing_assumptions": "Vehicle breakdown buffer" },
      "learningFromDecisions": { "score": 75, "explanation": "Sound foundational execution.", "evidence": "Controlled initial scope.", "missing_assumptions": "None" }
    }
  },
  "cohort_evaluations": [
    {
      "team_id": "team-2",
      "team_name": "Zephyr Express",
      "strategy_summary": "Aggressive urban dark-store expansion and promotional discounts.",
      "revenue": "₹3.80 Cr",
      "gross_margin": "16.5%",
      "operating_profit_or_loss": "-₹42.0 L",
      "cash_balance": "₹1.90 Cr",
      "debt_balance": "None",
      "market_share": "28.5%",
      "units_sold": "310,000 orders",
      "what_went_right": "Rapid market share expansion and top-of-mind brand recognition.",
      "what_went_wrong": "Heavy voucher subsidization caused high cash erosion.",
      "recommended_improvements": "Curtail customer acquisition subsidies.",
      "criterion_evaluations": {
        "strategicDecisionQuality": { "score": 72, "explanation": "Volume-focused but heavily subsidized." },
        "reasoningAndEvidence": { "score": 70, "explanation": "Underestimated competitor price matching." },
        "marketAdaptability": { "score": 74, "explanation": "Fast store rollout across metro hubs." },
        "financialManagement": { "score": 64, "explanation": "Heavy cash burn threatens liquidity." },
        "competitivePerformance": { "score": 85, "explanation": "Captured highest order volume in cohort." },
        "riskAssessment": { "score": 66, "explanation": "Thin cash buffer for supply chain shocks." },
        "learningFromDecisions": { "score": 72, "explanation": "Blitzscaling playbook executed at high cost." }
      }
    }
  ]
}
Adjust active_team criterion scores realistically based on strategic_depth_score: if strategy is single-line or brief, active team MUST score lower than competitors and rank lower in the cohort standings.`;

    let outcome = null;
    try {
      const geminiRes = await callGemini(userPrompt, systemInstruction, true);
      let text = geminiRes.text.trim();
      if (text.startsWith("```")) {
        text = text.split("\n").slice(1).join("\n");
        if (text.endsWith("```")) {
          text = text.substring(0, text.lastIndexOf("```"));
        }
        text = text.trim();
      }
      outcome = JSON.parse(text);
    } catch (parseErr) {
      console.warn(`[SIMULATION WARNING] Using calibrated simulation: ${parseErr.message}`);
      outcome = buildCalibratedSimulation(
        teamName,
        industryName,
        quarterNum,
        strategy,
        reasoning,
        financialPosition,
        cohortTeams
      );
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        outcome: outcome,
        model: PRIMARY_MODEL
      })
    };
  } catch (error) {
    console.error("[NETLIFY SIMULATION ERROR]", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message || "Internal server error" })
    };
  }
};
