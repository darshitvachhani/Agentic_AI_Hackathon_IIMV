/**
 * Netlify Serverless Function: POST /api/chat
 * Handles conversational simulation turns using Google Gemini API
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
    throw new Error("GEMINI_API_KEY environment variable is not configured in Netlify Site Settings.");
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
        lastError = `HTTP ${resp.status} on ${model}: ${errText.substring(0, 200)}`;
        if (resp.status === 429 || resp.status === 503) {
          continue;
        } else {
          break;
        }
      }
    } catch (err) {
      console.warn(`[GEMINI] Fetch exception on ${model}: ${err.message}`);
      lastError = err.message;
      continue;
    }
  }

  throw new Error(`Gemini API call failed across all models: ${lastError}`);
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
    const teamName = data.teamName || "Team";
    const industryName = data.industryName || "Quick Commerce & Hyperlocal Delivery";
    const geographicScope = data.geographicScope || "High-density urban clusters across Tier 1 & 2 Indian metropolises";
    const currentQuarter = data.currentQuarter || 1;
    const quarterDates = data.quarterDates || "Apr 2024 – Jun 2024";
    const financialPosition = data.financialPosition || {};
    const userMessage = (data.userMessage || "").trim();
    const conversationHistory = data.conversationHistory || [];

    const isIdeation = data.isIdeation || currentQuarter === 0;
    const studentMsgs = conversationHistory.filter((m) => m.sender === "student");
    const studentTurnCount = studentMsgs.length;

    let stepInstructions = "";

    if (isIdeation) {
      stepInstructions = `IDEATION PHASE: The student has just pitched their startup idea for this industry.
1. Formally evaluate and validate their startup concept concisely:
   - Reinforce that targeting a niche or small audience is completely acceptable, and that strategy, unit economics, and operational execution matter far more than initial market size.
   - Summarize the venture's core value proposition and competitive differentiation.
2. Confirm the startup registration:
   "🚀 **Startup Venture Registered — ${teamName}**
   Your startup concept is now officially registered in the **${industryName}** cohort. The simulation now officially commences with **Quarter 1 (Apr 2024 – Jun 2024)**."
3. At the very end, MUST output:
\`\`\`meta {"stage": "ideation_approved", "quarter_completed": false, "startup_idea": ${JSON.stringify(userMessage)}} \`\`\``;
    } else if (studentTurnCount === 0) {
      stepInstructions = `STEP 1: The student has just submitted their initial quarterly strategy.
1. DO NOT acknowledge, validate, praise, echo, or summarize their strategy in any way. Do NOT say "Welcome to Quarter ${currentQuarter}", do NOT say "We have logged your strategy", and do NOT repeat or paraphrase what they submitted.
2. Directly and immediately ask for their strategy justification and economic reasoning:
"💡 **Strategy Justification:**
Please share the business and economic reasoning behind this strategy. What specific cost, margin, unit economics, or customer behavior assumptions justify this approach?"
3. At the very end, output:
\`\`\`meta {"stage": "justification", "quarter_completed": false, "detected_strategy": ${JSON.stringify(userMessage)}} \`\`\``;
    } else if (studentTurnCount === 1) {
      stepInstructions = `STEP 2: The student has just provided their strategy justification and reasoning.
1. Acknowledge their reasoning and economic logic concisely.
2. DO NOT provide any rigid template.
3. Prompt them clearly for the next step:
"💰 **Next Step — Financing Requirements:**
Please state any financing, loan, or capital requirements you have for this quarter (or confirm if you will self-fund operations from your existing cash reserves of ${financialPosition.cash || "₹3.50 Cr"})."
4. At the very end, output:
\`\`\`meta {"stage": "financing", "quarter_completed": false, "detected_reasoning": ${JSON.stringify(userMessage)}} \`\`\``;
    } else if (studentTurnCount === 2) {
      stepInstructions = `STEP 3: The student has just provided their financing/capital request.
1. Evaluate their financing request realistically:
   - If they requested a loan or equity: give an explicit approval or counteroffer with clear terms (e.g., approved amount, interest rate such as 10.5% or equity percentage, working capital terms).
   - If they requested no external funding: confirm that operations will be self-funded from existing cash reserves of ${financialPosition.cash || "₹3.50 Cr"}.
2. Present a clean 3-bullet recap of their Quarter ${currentQuarter} proposal:
   • **Strategy:** [concise summary]
   • **Justification:** [concise summary]
   • **Financing Terms:** [approved terms or self-funding confirmation]
3. Ask the final confirmation question:
"📋 **Final Confirmation:**
Would you like to make any changes to this strategy, or are you ready to lock and submit for evaluation?"
4. At the very end, output:
\`\`\`meta {"stage": "confirmation", "quarter_completed": false, "financing_status": "reviewed"} \`\`\``;
    } else {
      stepInstructions = `STEP 4: The student has responded to the confirmation question. That quarter's chatting is now OVER!
1. Acknowledge their final response and confirm that their decisions for Quarter ${currentQuarter} (${quarterDates}) are now locked and submitted for evaluation.
2. State: "🏁 **Decisions Locked:** The simulation engine is now processing market outcomes and generating your personalized report card across all cohort teams."
3. At the very end, MUST output:
\`\`\`meta {"stage": "completed", "quarter_completed": true, "final_adjustment": ${JSON.stringify(userMessage)}} \`\`\``;
    }

    const systemInstruction = `You are the academic simulation facilitator for an MBA business strategy simulation.
Active Team: ${teamName}
Assigned Industry: ${industryName}
Geographic Scope: ${geographicScope}
Current Quarter: Quarter ${currentQuarter} (${quarterDates})
Financial Position: Cash: ${financialPosition.cash || "₹3.50 Cr"}, Debt: ${financialPosition.debt || "None"}

CONVERSATIONAL STEP:
${stepInstructions}

GUIDELINES:
- Speak directly to ${teamName}.
- Keep your tone academic, encouraging, and clear.
- Make your response easily readable with generous line spacing, bold headings (**...**), and clean bullet points.
- Do NOT use multiple colors or colorful badges; rely on bold font weights and clean typography.
- Emojis (💡, 💰, 📋, 🏁) may be used as visual anchors.
- Always append the \`\`\`meta ... \`\`\` block at the very end of your response.`;

    const transcriptText = conversationHistory
      .slice(-8)
      .map((m) => `${(m.sender || "user").toUpperCase()}: ${m.text || ""}`)
      .join("\n");

    const userPrompt = `Conversation transcript:
${transcriptText}

STUDENT (${teamName}): ${userMessage}

Respond following the specific step instruction:`;

    const geminiRes = await callGemini(userPrompt, systemInstruction, false);
    let replyText = geminiRes.text;

    let meta = {};
    if (replyText.includes("```meta")) {
      const parts = replyText.split("```meta");
      replyText = parts[0].trim();
      const metaRaw = parts[1].split("```")[0].trim();
      try {
        meta = JSON.parse(metaRaw);
      } catch (e) {
        // Ignore json parse error on meta block
      }
    }

    if (
      studentTurnCount >= 3 ||
      (studentTurnCount >= 2 &&
        ["submit", "ready", "proceed", "no change", "confirm"].some((w) =>
          userMessage.toLowerCase().includes(w)
        ))
    ) {
      meta.quarter_completed = true;
      meta.stage = "completed";
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        reply: replyText,
        meta: meta,
        model: geminiRes.modelUsed
      })
    };
  } catch (error) {
    console.error("[NETLIFY CHAT ERROR]", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message || "Internal server error" })
    };
  }
};
