#!/usr/bin/env python3
"""
Academic Business Strategy Simulation Platform
Minimalist Server-Side API Proxy & Static Host
Handles Gemini-Powered Conversational Simulation & Quarterly Outcome Generation
"""

import http.server
import json
import mimetypes
import os
import sys
import traceback
import requests

# Ensure correct MIME types
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("text/html", ".html")
mimetypes.add_type("application/json", ".json")

# Load environment variables from .env if present
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("\"'")
                        if k and not os.environ.get(k):
                            os.environ[k] = v
        except Exception as e:
            print(f"[ENV] Warning reading .env: {e}", file=sys.stderr)

load_env()

API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
PRIMARY_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()
FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.1-flash-lite"]

def call_gemini(prompt, system_instruction=None, json_mode=False):
    """
    Calls the Gemini API securely using the server's API_KEY.
    Tries PRIMARY_MODEL first, then falls back if 503 or 429 occurs.
    """
    if not API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured on the server. Please set it in .env.")

    models_to_try = [PRIMARY_MODEL] + [m for m in FALLBACK_MODELS if m != PRIMARY_MODEL]
    last_error = None

    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"
        
        contents = [{"role": "user", "parts": [{"text": prompt}]}]
        payload = {"contents": contents}

        generation_config = {
            "temperature": 0.4 if json_mode else 0.7,
            "maxOutputTokens": 8192,
        }
        if json_mode:
            generation_config["responseMimeType"] = "application/json"

        payload["generationConfig"] = generation_config

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        try:
            resp = requests.post(
                url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=50
            )
            if resp.status_code == 200:
                resp_data = resp.json()
                candidates = resp_data.get("candidates", [])
                if not candidates:
                    raise ValueError("No candidate responses returned by Gemini.")
                parts = candidates[0].get("content", {}).get("parts", [])
                if not parts:
                    raise ValueError("Empty response part returned by Gemini.")
                text = parts[0].get("text", "")
                return {"text": text, "model_used": model}
            else:
                err_text = resp.text[:200]
                print(f"[GEMINI] Model {model} HTTP {resp.status_code}: {err_text}", file=sys.stderr)
                last_error = f"HTTP {resp.status_code} on {model}: {err_text}"
                if resp.status_code in (429, 503):
                    continue
                else:
                    break
        except Exception as e:
            print(f"[GEMINI] Model {model} request error: {e}", file=sys.stderr)
            last_error = str(e)
            continue

    raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")


class SimulationRequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    Serves static frontend files and proxies Gemini API requests securely.
    """

    def end_headers(self):
        # Enable CORS for local development
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            resp = {
                "status": "ok",
                "has_api_key": bool(API_KEY),
                "model": PRIMARY_MODEL,
                "fallback_models": FALLBACK_MODELS
            }
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return
        
        # Serve static files from current directory
        return super().do_GET()

    def do_POST(self):
        content_len = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_len) if content_len > 0 else b"{}"

        try:
            req_json = json.loads(post_body.decode("utf-8"))
        except Exception:
            req_json = {}

        if self.path == "/api/chat":
            self.handle_chat_request(req_json)
        elif self.path == "/api/simulate-quarter":
            self.handle_simulate_quarter(req_json)
        else:
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

    def handle_chat_request(self, data):
        """
        Processes conversational student turns using Gemini with strict 4-step quarterly progression:
        Step 1: Student enters quarterly strategy freely (no format). AI acknowledges and asks for strategy justification.
        Step 2: Student enters justification freely. AI acknowledges and asks for financing requirements.
        Step 3: Student enters financing requirements. AI provides approval/counteroffer, summarizes proposal, and asks if any changes.
        Step 4: Student confirms (one message). Quarter chatting is over; locked for evaluation.
        """
        try:
            team_name = data.get("teamName", "Team")
            industry_name = data.get("industryName", "Quick Commerce & Hyperlocal Delivery")
            geographic_scope = data.get("geographicScope", "High-density urban clusters across Tier 1 & 2 Indian metropolises")
            industry_summary = data.get("industrySummary", "")
            current_quarter = data.get("currentQuarter", 1)
            quarter_dates = data.get("quarterDates", "Apr 2024 – Jun 2024")
            business_description = data.get("businessDescription", {})
            financial_position = data.get("financialPosition", {})
            previous_strategies = data.get("previousStrategies", [])
            previous_results = data.get("previousResults", [])
            user_message = data.get("userMessage", "").strip()
            conversation_history = data.get("conversationHistory", [])

            is_ideation = data.get("isIdeation", False) or current_quarter == 0

            # Count student messages in this quarter to identify the current conversational step
            student_msgs = [m for m in conversation_history if m.get("sender") == "student"]
            student_turn_count = len(student_msgs) # 0 = userMessage is 1st (strategy), 1 = 2nd (justification), 2 = 3rd (financing), >=3 = 4th (confirm)

            if is_ideation:
                current_step_name = "ideation_submitted"
                step_instructions = f"""IDEATION PHASE: The student has just pitched their startup idea for this industry.
1. Formally evaluate and validate their startup concept concisely:
   - Reinforce that targeting a niche or small audience is completely acceptable, and that strategy, unit economics, and operational execution matter far more than initial market size.
   - Summarize the venture's core value proposition and competitive differentiation.
2. Confirm the startup registration:
   "🚀 **Startup Venture Registered — {team_name}**
   Your startup concept is now officially registered in the **{industry_name}** cohort. The simulation now officially commences with **Quarter 1 (Apr 2024 – Jun 2024)**."
3. At the very end, MUST output:
```meta {{"stage": "ideation_approved", "quarter_completed": false, "startup_idea": {json.dumps(user_message)}}} ```"""

            elif student_turn_count == 0:
                current_step_name = "strategy_submitted"
                step_instructions = f"""STEP 1: The student has just submitted their initial quarterly strategy.
1. DO NOT acknowledge, validate, praise, echo, or summarize their strategy in any way. Do NOT say "Welcome to Quarter {current_quarter}", do NOT say "We have logged your strategy", and do NOT repeat or paraphrase what they submitted.
2. Directly and immediately ask for their strategy justification and economic reasoning:
"💡 **Strategy Justification:**
Please share the business and economic reasoning behind this strategy. What specific cost, margin, unit economics, or customer behavior assumptions justify this approach?"
3. At the very end, output:
```meta {{"stage": "justification", "quarter_completed": false, "detected_strategy": {json.dumps(user_message)}}} ```"""

            elif student_turn_count == 1:
                current_step_name = "justification_submitted"
                step_instructions = f"""STEP 2: The student has just provided their strategy justification and reasoning.
1. Acknowledge their reasoning and economic logic concisely.
2. DO NOT provide any rigid template.
3. Prompt them clearly for the next step:
"💰 **Next Step — Financing Requirements:**
Please state any financing, loan, or capital requirements you have for this quarter (or confirm if you will self-fund operations from your existing cash reserves of {financial_position.get('cash', '₹3.50 Cr')})."
4. At the very end, output:
```meta {{"stage": "financing", "quarter_completed": false, "detected_reasoning": {json.dumps(user_message)}}} ```"""

            elif student_turn_count == 2:
                current_step_name = "financing_submitted"
                step_instructions = f"""STEP 3: The student has just provided their financing/capital request.
1. Evaluate their financing request realistically:
   - If they requested a loan or equity: give an explicit approval or counteroffer with clear terms (e.g., approved amount, interest rate such as 10.5% or equity percentage, working capital terms).
   - If they requested no external funding: confirm that operations will be self-funded from existing cash reserves of {financial_position.get('cash', '₹3.50 Cr')}.
2. Present a clean 3-bullet recap of their Quarter {current_quarter} proposal:
   • **Strategy:** [concise summary]
   • **Justification:** [concise summary]
   • **Financing Terms:** [approved terms or self-funding confirmation]
3. Ask the final confirmation question:
"📋 **Final Confirmation:**
Would you like to make any changes to this strategy, or are you ready to lock and submit for evaluation?"
4. At the very end, output:
```meta {{"stage": "confirm", "quarter_completed": false, "funding_decision": {{"required": true, "terms": "..."}}}} ```"""

            else:
                current_step_name = "final_confirmation"
                step_instructions = f"""STEP 4: The student has responded to the confirmation question. That quarter's chatting is now OVER!
1. Acknowledge their final response and confirm that their decisions for Quarter {current_quarter} ({quarter_dates}) are now locked and submitted for evaluation.
2. State: "🏁 **Decisions Locked:** The simulation engine is now processing market outcomes and generating your personalized report card across all cohort teams."
3. At the very end, MUST output:
```meta {{"stage": "completed", "quarter_completed": true, "final_adjustment": {json.dumps(user_message)}}} ```"""

            system_instruction = f"""You are the academic simulation facilitator for an MBA business strategy simulation.
Active Team: {team_name}
Assigned Industry: {industry_name}
Geographic Scope: {geographic_scope}
Current Quarter: Quarter {current_quarter} ({quarter_dates})
Financial Position: Cash: {financial_position.get('cash', '₹3.50 Cr')}, Debt: {financial_position.get('debt', 'None')}

CONVERSATIONAL STEP:
{step_instructions}

GUIDELINES:
- Speak directly to {team_name}.
- Keep your tone academic, encouraging, and clear.
- Make your response easily readable with generous line spacing, bold headings (**...**), and clean bullet points.
- Do NOT use multiple colors or colorful badges; rely on bold font weights and clean typography.
- Emojis (💡, 💰, 📋, 🏁) may be used as visual anchors.
- Always append the ```meta ... ``` block at the very end of your response.
"""

            transcript_text = "\n".join([
                f"{m.get('sender', 'user').upper()}: {m.get('text', '')}"
                for m in conversation_history[-8:]
            ])

            user_prompt = f"""Conversation transcript:
{transcript_text}

STUDENT ({team_name}): {user_message}

Respond following the specific step instruction:"""

            gemini_res = call_gemini(user_prompt, system_instruction=system_instruction, json_mode=False)
            reply_text = gemini_res["text"]

            # Extract metadata block
            meta = {}
            if "```meta" in reply_text:
                parts = reply_text.split("```meta")
                clean_reply = parts[0].strip()
                meta_raw = parts[1].split("```")[0].strip()
                try:
                    meta = json.loads(meta_raw)
                    reply_text = clean_reply
                except Exception:
                    pass

            # Fallback check if user explicitly requested submission
            if student_turn_count >= 3 or (student_turn_count >= 2 and any(w in user_message.lower() for w in ["submit", "ready", "proceed", "no change", "confirm"])):
                meta["quarter_completed"] = True
                meta["stage"] = "completed"

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "reply": reply_text,
                "meta": meta,
                "model": gemini_res.get("model_used")
            }).encode("utf-8"))

        except Exception as e:
            traceback.print_exc()
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))

    def handle_simulate_quarter(self, data):
        """
        Evaluates the active team across the 7 configurable academic criteria,
        reconciles financials deterministically, and simulates outcomes for all 5 cohort teams in that industry.
        """
        try:
            team_name = data.get("teamName", "Alpha Vanguard")
            industry_name = data.get("industryName", "Quick Commerce & Hyperlocal Delivery")
            quarter_num = data.get("quarter", 1)
            quarter_dates = data.get("quarterDates", "Apr 2024 – Jun 2024")
            strategy = data.get("strategy", "").strip() or "Standard market entry and dark-store deployment."
            reasoning = data.get("reasoning", "").strip() or "Optimizing delivery density and cluster unit economics."
            funding_request = data.get("fundingRequest", {})
            financial_position = data.get("financialPosition", {})
            cohort_teams = data.get("cohortTeams", [
                {"id": "team-2", "name": "Zephyr Express"},
                {"id": "team-3", "name": "HyperPulse Direct"},
                {"id": "team-4", "name": "QuickKirana Network"},
                {"id": "team-5", "name": "MetroBlink Delivery"}
            ])

            system_instruction = """You are the Quantitative Market Simulator and Academic Scoring Evaluator for an MBA Business Strategy Simulation.
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
- For each criterion, provide score (0-100), explanation (1-2 sentences), supporting evidence, and missing assumptions.
- Provide 2-3 specific points for "what_went_right" (strengths) and 2-3 points for "what_went_wrong" (mistakes/weaknesses).
- Reconcile financials realistically based on starting cash.
- Also simulate realistic outcomes and 7-criteria scores for the other 4 cohort teams in this industry.
- Output MUST be valid strict JSON.
"""

            user_prompt = f"""Evaluate Quarter {quarter_num} ({quarter_dates}) for {industry_name}.

ACTIVE TEAM:
- Team Name: {team_name}
- Strategy: {strategy}
- Economic Rationale / Justification: {reasoning}
- Funding Decision: {json.dumps(funding_request)}
- Financial Position: Cash: {financial_position.get('cash', '₹3.50 Cr')}, Debt: {financial_position.get('debt', 'None')}

OTHER COHORT TEAMS:
{json.dumps(cohort_teams)}

Provide quantitative market simulation results and academic evaluation across all 7 criteria in valid JSON matching this schema:
{{
  "quarter": {quarter_num},
  "market_developments": "Sector summary of customer trends, pricing dynamics, and competitor actions in {quarter_dates}",
  "active_team": {{
    "team_name": "{team_name}",
    "strategy_summary": "{strategy[:120]}",
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
    "criterion_evaluations": {{
      "strategicDecisionQuality": {{ "score": 78, "explanation": "Clear customer positioning.", "evidence": "Focus on high-margin breakfast.", "missing_assumptions": "Rider retention" }},
      "reasoningAndEvidence": {{ "score": 76, "explanation": "Logic connects niche to margin.", "evidence": "Explicit margin model.", "missing_assumptions": "CAC stability" }},
      "marketAdaptability": {{ "score": 74, "explanation": "Protected from discount wars.", "evidence": "Avoided voucher burn.", "missing_assumptions": "Rival private labels" }},
      "financialManagement": {{ "score": 78, "explanation": "Runway preserved over 18 months.", "evidence": "Controlled cash burn.", "missing_assumptions": "Lease escalation" }},
      "competitivePerformance": {{ "score": 75, "explanation": "Defensible micro-hub density.", "evidence": "Exclusive bakery ties.", "missing_assumptions": "Aggressive rival rollout" }},
      "riskAssessment": {{ "score": 72, "explanation": "Addressed food perishability.", "evidence": "Daily batch procurement.", "missing_assumptions": "Vehicle breakdown buffer" }},
      "learningFromDecisions": {{ "score": 75, "explanation": "Sound foundational execution.", "evidence": "Controlled initial scope.", "missing_assumptions": "None" }}
    }}
  }},
  "cohort_evaluations": [
    {{
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
      "criterion_evaluations": {{
        "strategicDecisionQuality": {{ "score": 72, "explanation": "Volume-focused but heavily subsidized." }},
        "reasoningAndEvidence": {{ "score": 70, "explanation": "Underestimated competitor price matching." }},
        "marketAdaptability": {{ "score": 74, "explanation": "Fast store rollout across metro hubs." }},
        "financialManagement": {{ "score": 64, "explanation": "Heavy cash burn threatens liquidity." }},
        "competitivePerformance": {{ "score": 85, "explanation": "Captured highest order volume in cohort." }},
        "riskAssessment": {{ "score": 66, "explanation": "Thin cash buffer for supply chain shocks." }},
        "learningFromDecisions": {{ "score": 72, "explanation": "Blitzscaling playbook executed at high cost." }}
      }}
    }}
  ]
}}
Ensure cohort_evaluations contains an entry for all cohort teams: {[t.get('name') for t in cohort_teams]}.
Adjust active_team criterion scores realistically based on strategic_depth_score: if strategy is single-line or brief, active team MUST score lower than competitors and rank lower in the cohort standings.
Keep cohort explanations concise (1 short sentence) so the entire response fits in JSON.
"""

            outcome = None
            try:
                gemini_res = call_gemini(user_prompt, system_instruction=system_instruction, json_mode=True)
                text = gemini_res["text"].strip()
                if text.startswith("```"):
                    text = text.split("\n", 1)[1]
                    if text.endswith("```"):
                        text = text.rsplit("```", 1)[0]
                    text = text.strip()
                outcome = json.loads(text)
            except Exception as parse_err:
                print(f"[SIMULATION WARNING] Gemini output parse issue: {parse_err}. Generating calibrated academic evaluation.", file=sys.stderr)
                outcome = self.build_calibrated_simulation(
                    team_name=team_name,
                    industry_name=industry_name,
                    quarter_num=quarter_num,
                    strategy=strategy,
                    reasoning=reasoning,
                    financial_position=financial_position,
                    cohort_teams=cohort_teams
                )

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "outcome": outcome,
                "model": PRIMARY_MODEL
            }).encode("utf-8"))

        except Exception as e:
            traceback.print_exc()
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))

    def build_calibrated_simulation(self, team_name, industry_name, quarter_num, strategy, reasoning, financial_position, cohort_teams):
        """
        Synthesizes a realistic, academically grounded evaluation across the 7 criteria if LLM output requires backup.
        Calibrates the active team score directly on Strategic Depth: superficial/single-line strategies are heavily penalized.
        """
        import random
        strat_clean = (strategy or "").strip()
        reason_clean = (reasoning or "").strip()
        strat_len = len(strat_clean)
        total_len = strat_len + len(reason_clean)

        # Strategic Depth Assessment
        if strat_len < 75 or total_len < 130 or len(strat_clean.split()) < 15:
            # Single-line or superficial strategy
            depth_score = random.randint(36, 50)
            depth_level = "Low (Superficial / Single-line)"
            depth_feedback = f"The strategy was stated in a single brief line ({strat_len} chars) lacking operational levers, unit economics, and competitive defensibility."
            how_to_improve = "• Quantify target unit economics: specify target gross margin percentages (e.g., 30–35%), average order value (AOV), and customer delivery fee structures.\n• Define micro-cluster locations: name specific tech corridors or high-density pin codes rather than general terms.\n• Detail fulfillment SLAs and partner agreements: outline vendor payment terms, cold-chain handling, and rider fleet allocation."
            base_score = random.randint(52, 60) # Low score reflecting single-line strategy
            share_val = "10.5%"
            rev_val = "₹1.65 Cr"
            pnl_val = "-₹22.5 L"
        elif strat_len < 180 or total_len < 260 or len(strat_clean.split()) < 35:
            # Moderate depth
            depth_score = random.randint(66, 75)
            depth_level = "Moderate (Basic Detail)"
            depth_feedback = "Good initial strategic direction, but lacks detailed supply chain terms, fleet unit costs, and defensive competitive moats."
            how_to_improve = "• Include explicit dark-store lease expense projections and inventory turn targets.\n• Detail customer acquisition cost (CAC) payback period and repeat retention incentives.\n• Address competitor counter-moves (e.g., Blinkit or Zepto matching voucher promotions)."
            base_score = random.randint(72, 76) # Competitive mid-tier score
            share_val = "15.0%"
            rev_val = "₹2.45 Cr"
            pnl_val = "-₹14.5 L"
        else:
            # High depth
            depth_score = random.randint(84, 94)
            depth_level = "High (Deep & Comprehensive)"
            depth_feedback = "Comprehensive operational and economic depth covering niche targeting, partner terms, and unit margin defensibility."
            how_to_improve = "• Stress-test cash flow against seasonal monsoon delivery disruptions.\n• Establish contingency reserves for rising municipal dark-store zoning compliance costs."
            base_score = random.randint(82, 88) # High score for thorough strategy
            share_val = "18.5%"
            rev_val = "₹2.85 Cr"
            pnl_val = "-₹8.5 L"

        return {
            "quarter": quarter_num,
            "market_developments": f"During Quarter {quarter_num}, the {industry_name} sector experienced competitive consolidation and shifting unit economics across metropolitan clusters.",
            "active_team": {
                "team_name": team_name,
                "strategy_summary": strat_clean[:120] if strat_clean else "Targeted operational expansion",
                "strategic_depth_score": depth_score,
                "strategic_depth_level": depth_level,
                "strategic_depth_feedback": depth_feedback,
                "how_to_improve_depth": how_to_improve,
                "revenue": rev_val,
                "gross_margin": "29.4%" if depth_score >= 70 else "21.5%",
                "operating_profit_or_loss": pnl_val,
                "cash_balance": "₹3.15 Cr" if depth_score >= 70 else "₹2.70 Cr",
                "debt_balance": "None",
                "market_share": share_val,
                "units_sold": "182,000 orders" if depth_score >= 70 else "120,000 orders",
                "what_went_right": "1. Controlled initial pilot scope avoided broad retail price wars.\n2. Identified a distinct customer use-case in targeted urban corridors." if depth_score < 70 else "1. Disciplined unit economics in core delivery clusters.\n2. Strong customer repeat rates and basket margins.",
                "what_went_wrong": "1. Superficial strategy formulation left delivery fleet economics and lease overhead under-modeled.\n2. Inadequate competitive moat allowed faster-moving rivals to capture adjacent pin codes." if depth_score < 70 else "1. Morning peak fleet shortages caused minor fulfillment delays.\n2. Vendor packaging costs slightly exceeded projections.",
                "recommended_improvements": how_to_improve,
                "criterion_evaluations": {
                    "strategicDecisionQuality": { "score": base_score + 1, "explanation": "Strategic scope assessed against analytical depth.", "evidence": "Formulated quarterly strategy.", "missing_assumptions": "Execution depth" },
                    "reasoningAndEvidence": { "score": base_score - 1, "explanation": "Business reasoning evaluated for economic coherence.", "evidence": "Economic rationale provided.", "missing_assumptions": "Sensitivity testing" },
                    "marketAdaptability": { "score": base_score, "explanation": "Responsiveness to competitive pressure.", "evidence": "Defensive positioning.", "missing_assumptions": "Rival aggressive discounting" },
                    "financialManagement": { "score": base_score + 2, "explanation": "Capital management and runway preservation.", "evidence": "Cash balance discipline.", "missing_assumptions": "Lease escalation" },
                    "competitivePerformance": { "score": base_score - 2, "explanation": "Relative share capture against cohort rivals.", "evidence": "Order volume benchmarks.", "missing_assumptions": "Competitor counter-moves" },
                    "riskAssessment": { "score": base_score - 1, "explanation": "Downside buffer and operational contingencies.", "evidence": "Inventory buffer.", "missing_assumptions": "Fleet breakdown cushion" },
                    "learningFromDecisions": { "score": base_score, "explanation": "Baseline strategic progression.", "evidence": "Quarterly execution.", "missing_assumptions": "None" }
                }
            },
            "cohort_evaluations": [
                {
                    "team_id": "team-2",
                    "team_name": "Zephyr Express",
                    "strategy_summary": "Aggressive urban dark-store land grab and promotional customer discounts.",
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
                        "strategicDecisionQuality": { "score": 71, "explanation": "Volume-focused but heavily subsidized." },
                        "reasoningAndEvidence": { "score": 69, "explanation": "Underestimated competitor price matching." },
                        "marketAdaptability": { "score": 73, "explanation": "Fast store rollout across metro hubs." },
                        "financialManagement": { "score": 62, "explanation": "Heavy cash burn threatens liquidity." },
                        "competitivePerformance": { "score": 85, "explanation": "Captured highest order volume in cohort." },
                        "riskAssessment": { "score": 64, "explanation": "Thin cash buffer for supply chain shocks." },
                        "learningFromDecisions": { "score": 70, "explanation": "Blitzscaling playbook executed at high cost." }
                    }
                },
                {
                    "team_id": "team-3",
                    "team_name": "HyperPulse Direct",
                    "strategy_summary": "Tier-2 suburban expansion focusing on packaged staples and scheduled morning slots.",
                    "revenue": "₹2.10 Cr",
                    "gross_margin": "24.0%",
                    "operating_profit_or_loss": "-₹9.5 L",
                    "cash_balance": "₹3.10 Cr",
                    "debt_balance": "None",
                    "market_share": "16.8%",
                    "units_sold": "145,000 orders",
                    "what_went_right": "Disciplined cost structure and healthy order delivery consolidation.",
                    "what_went_wrong": "Slower initial customer uptake due to scheduled rather than instant delivery.",
                    "recommended_improvements": "Introduce 30-minute express tier for top 20% high-frequency SKUs.",
                    "criterion_evaluations": {
                        "strategicDecisionQuality": { "score": 79, "explanation": "Prudent unit economics model targeting lower-cost suburban clusters." },
                        "reasoningAndEvidence": { "score": 80, "explanation": "Sound trade-off analysis between speed and delivery costs." },
                        "marketAdaptability": { "score": 74, "explanation": "Defended against metro price wars by remaining in suburbs." },
                        "financialManagement": { "score": 86, "explanation": "Excellent capital conservation and sustainable runway." },
                        "competitivePerformance": { "score": 72, "explanation": "Modest market share compared to aggressive metro rivals." },
                        "riskAssessment": { "score": 82, "explanation": "High resilience against price inflation and fuel spikes." },
                        "learningFromDecisions": { "score": 76, "explanation": "Careful execution of cost-focused startup blueprint." }
                    }
                },
                {
                    "team_id": "team-4",
                    "team_name": "QuickKirana Network",
                    "strategy_summary": "Asset-light Kirana partnership model aggregating local mom-and-pop stores via mobile POS.",
                    "revenue": "₹1.65 Cr",
                    "gross_margin": "19.2%",
                    "operating_profit_or_loss": "-₹4.8 L",
                    "cash_balance": "₹3.35 Cr",
                    "debt_balance": "None",
                    "market_share": "12.5%",
                    "units_sold": "115,000 orders",
                    "what_went_right": "Minimal dark store capital expenditure and high neighborhood store goodwill.",
                    "what_went_wrong": "Inventory synchronization friction and occasional stock discrepancies.",
                    "recommended_improvements": "Deploy barcode scanning handhelds to partner Kirana counters.",
                    "criterion_evaluations": {
                        "strategicDecisionQuality": { "score": 78, "explanation": "Clever asset-light approach bypassing heavy dark-store capex." },
                        "reasoningAndEvidence": { "score": 76, "explanation": "Validates community trust as substitute for owned infrastructure." },
                        "marketAdaptability": { "score": 77, "explanation": "Nimble footprint scalable across neighborhoods quickly." },
                        "financialManagement": { "score": 89, "explanation": "Lowest operating loss in cohort and extensive 24-month runway." },
                        "competitivePerformance": { "score": 68, "explanation": "Slower delivery turnaround limits premium metro share." },
                        "riskAssessment": { "score": 73, "explanation": "Vulnerable to Kirana partner stockouts during peak demand." },
                        "learningFromDecisions": { "score": 77, "explanation": "Solid foundation for community-anchored commerce." }
                    }
                },
                {
                    "team_id": "team-5",
                    "team_name": "MetroBlink Delivery",
                    "strategy_summary": "Private label dairy, snacks, and ready-to-eat breakfast items with owned dark kitchens.",
                    "revenue": "₹2.90 Cr",
                    "gross_margin": "32.0%",
                    "operating_profit_or_loss": "-₹22.5 L",
                    "cash_balance": "₹2.50 Cr",
                    "debt_balance": "None",
                    "market_share": "22.0%",
                    "units_sold": "220,000 orders",
                    "what_went_right": "Superior gross margins on in-house private label dairy and prepared meals.",
                    "what_went_wrong": "Food safety compliance delays and initial waste in fresh prepared foods.",
                    "recommended_improvements": "Implement predictive demand algorithms to curb perishability spoilage below 3%.",
                    "criterion_evaluations": {
                        "strategicDecisionQuality": { "score": 83, "explanation": "Vertical integration into high-margin private label products." },
                        "reasoningAndEvidence": { "score": 81, "explanation": "Coherent logic: private labels subsidize fast last-mile logistics." },
                        "marketAdaptability": { "score": 79, "explanation": "Capitalized on rising urban demand for fresh ready-to-eat meals." },
                        "financialManagement": { "score": 75, "explanation": "Moderate cash burn balanced by healthy gross contribution margins." },
                        "competitivePerformance": { "score": 82, "explanation": "Clear customer loyalty for proprietary food brands." },
                        "riskAssessment": { "score": 74, "explanation": "High food spoilage exposure during delivery transit delays." },
                        "learningFromDecisions": { "score": 80, "explanation": "Strong operational ambition executed with disciplined product focus." }
                    }
                }
            ]
        }



def run_server(port=3000):
    server_address = ("", port)
    httpd = http.server.ThreadingHTTPServer(server_address, SimulationRequestHandler)
    print(f"Academic Business Simulation Platform running at http://localhost:{port}/")
    print(f"Using Gemini Model: {PRIMARY_MODEL} (Fallback: {FALLBACK_MODELS})")
    print(f"API Key configured: {'YES' if API_KEY else 'NO'}")
    httpd.serve_forever()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    run_server(port)
