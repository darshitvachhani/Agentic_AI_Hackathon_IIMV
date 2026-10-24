/**
 * Academic Business Strategy Simulation Platform
 * Central Reactive State Management with Gemini API Integration
 */

import { FOUNDATION_PHASE, SIMULATION_QUARTERS, INDUSTRIES, INITIAL_DEMO_TEAMS, QUARTERLY_MARKET_INTELLIGENCE } from './constants.js';
import { scoringService } from './scoring.js';

class SimulationStore {
  constructor() {
    this.state = {
      currentRole: 'student', // 'student' | 'professor'
      activeTeamId: 'team-1',
      activeView: 'student-chat', // 'student-landing' | 'student-chat' | 'professor-dashboard' | 'professor-report'
      selectedReportTeamId: null,
      isSnapshotOpen: false,
      isSubmissionModalOpen: false,
      submissionConfirmed: false,
      isAITyping: false,
      isEvaluating: false,
      lastError: null,
      teams: JSON.parse(JSON.stringify(INITIAL_DEMO_TEAMS)).map((t) => ({
        ...t,
        businessDescription: t.businessDescription || null,
        financialPosition: t.financialPosition || {
          cash: '₹3.50 Cr',
          debt: 'None',
          totalFunding: '₹0'
        }
      })),
      conversations: {
        'team-1': {
          0: [
            {
              id: 'init-msg-1',
              sender: 'ai',
              text: `🚀 **Welcome Team Alpha Vanguard — Startup Formation & Ideation**

🏢 **Assigned Industry:** Quick Commerce & Hyperlocal Delivery
📍 **Geographic Scope:** High-density urban clusters across Tier 1 & 2 Indian metropolises (starting in select key urban hubs such as Bengaluru, Delhi NCR, or Mumbai, with scope for regional and pan-India scaling)

💡 **Your Startup Pitch:**
What idea do you have for a startup in this industry in a way that you can scale it further?

📌 **Keep in mind:**
In this simulation, it **does not matter** if your idea targets a small or niche audience. What truly matters here is your **strategy and operational execution**, not the size of the market that you are choosing to serve.

🔍 **Core Strategic Dimensions to Address:**
• **Target Customer & Friction Point:** Which specific user segment do you solve for (e.g., late-night instant delivery, specialized organic/fresh produce, localized pharmacy & wellness, or business supplies)?
• **Unit Economics & Margin Defensibility:** What gives your model economic sustainability (e.g., dark store density, micro-warehouse automation, high-margin private label lines, dynamic delivery routing)?
• **Scalability & Expansion Pathway:** How will you expand beyond your initial test cluster to pan-India hubs without unsustainable capital burn?

🎯 **Tell me about your startup concept:**
What specific customer need do you address, what is your core product/service offering, and how do you envision building and scaling your venture? *(Enter freely below to register your startup foundation).*`,
              timestamp: 'Genesis, 09:00 AM',
              quarter: 0
            }
          ]
        },
        'team-2': {
          0: [
            {
              id: 'init-msg-2',
              sender: 'ai',
              text: `🚀 **Welcome Team Zephyr Express — Startup Formation & Ideation**

🏢 **Assigned Industry:** Quick Commerce & Hyperlocal Delivery
📍 **Geographic Scope:** High-density urban clusters across Tier 1 & 2 Indian metropolises

💡 **Your Startup Pitch:**
What idea do you have for a startup in this industry in a way that you can scale it further?

📌 **Keep in mind:**
In this simulation, it **does not matter** if your idea targets a small or niche audience. What truly matters here is your **strategy and operational execution**, not the size of the market that you are choosing to serve.

🔍 **Core Strategic Dimensions to Address:**
• **Target Customer & Friction Point:** Which specific user segment do you solve for (e.g., late-night instant delivery, specialized organic/fresh produce, localized pharmacy & wellness, or business supplies)?
• **Unit Economics & Margin Defensibility:** What gives your model economic sustainability (e.g., dark store density, micro-warehouse automation, high-margin private label lines, dynamic delivery routing)?
• **Scalability & Expansion Pathway:** How will you expand beyond your initial test cluster to pan-India hubs without unsustainable capital burn?

🎯 **Tell me about your startup concept:**
What specific customer need do you address, what is your core product/service offering, and how do you envision building and scaling your venture? *(Enter freely below to register your startup foundation).*`,
              timestamp: 'Genesis, 09:00 AM',
              quarter: 0
            }
          ]
        }
      },
      draftSubmission: {
        strategy: '',
        reasoning: '',
        fundingRequired: false,
        fundingAmount: '',
        fundingType: 'Equity Investment',
        fundingPurpose: ''
      },
      notification: null
    };

    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (err) {
        console.error('State listener error:', err);
      }
    });
  }

  // --- Navigation & Role Actions ---

  setRole(newRole) {
    if (newRole !== 'student' && newRole !== 'professor') return;
    this.state.currentRole = newRole;

    if (newRole === 'professor') {
      if (this.state.selectedReportTeamId) {
        this.state.activeView = 'professor-report';
      } else {
        this.state.activeView = 'professor-dashboard';
      }
    } else {
      if (this.state.activeView === 'professor-dashboard' || this.state.activeView === 'professor-report') {
        this.state.activeView = 'student-chat';
      }
    }
    this.notify();
  }

  setView(viewName, params = {}) {
    this.state.activeView = viewName;
    if (params.teamId !== undefined) {
      this.state.selectedReportTeamId = params.teamId;
    }
    if (params.activeTeamId !== undefined) {
      this.state.activeTeamId = params.activeTeamId;
    }
    this.notify();
  }

  setActiveTeam(teamId) {
    const team = this.state.teams.find((t) => t.id === teamId);
    if (!team) return;
    this.state.activeTeamId = teamId;
    this.syncDraftForCurrentTeam();
    this.notify();
  }

  syncDraftForCurrentTeam() {
    const team = this.getCurrentTeam();
    if (!team) return;
    const qData = team.quarterlyData.find((q) => q.quarter === team.currentQuarter);
    if (qData) {
      this.state.draftSubmission = {
        strategy: qData.strategy || '',
        reasoning: qData.reasoning || '',
        fundingRequired: qData.fundingRequest?.required || false,
        fundingAmount: qData.fundingRequest?.amount || '',
        fundingType: qData.fundingRequest?.type || 'Equity Investment',
        fundingPurpose: qData.fundingRequest?.purpose || ''
      };
      this.state.submissionConfirmed = (qData.status === 'submitted' || qData.status === 'evaluated');
    }
  }

  assignTeamIndustry(teamId, newIndustryId) {
    const team = this.state.teams.find((t) => t.id === teamId);
    if (!team) return;
    team.industryId = newIndustryId;
    this.showNotification(`Assigned ${team.name} to ${this.getIndustry(newIndustryId)?.name || newIndustryId}`);
    this.notify();
  }

  getCurrentTeam() {
    return this.state.teams.find((t) => t.id === this.state.activeTeamId) || this.state.teams[0];
  }

  getIndustry(industryId) {
    return INDUSTRIES.find((i) => i.id === industryId) || INDUSTRIES[0];
  }

  getQuarter(quarterNum) {
    const qn = Number(quarterNum);
    if (qn === 0) {
      return FOUNDATION_PHASE;
    }
    return SIMULATION_QUARTERS.find((q) => q.id === qn) || SIMULATION_QUARTERS[0];
  }

  getQuarterlyMarketSnapshot(industryId, quarterNum) {
    const qn = Number(quarterNum);
    const indSnaps = QUARTERLY_MARKET_INTELLIGENCE[industryId] || QUARTERLY_MARKET_INTELLIGENCE['quick-commerce'];
    if (indSnaps && indSnaps[qn]) {
      return indSnaps[qn];
    }
    const qMeta = this.getQuarter(qn);
    return {
      quarter: `${qMeta.name} (${qMeta.dates})`,
      industrySnapshot: `Market consolidation continues with regulatory scrutiny on unit economics and sustainable operational margins.`,
      competitorMoves: `Cohort competitors are calibrating pricing and expanding cluster fulfillment to defend market share.`,
      consumerInsights: `Consumer price sensitivity remains balanced; reliable delivery speed and product freshness dictate platform retention.`,
      strategicChallenge: `What strategic adjustments, operational controls, or capital allocations will you deploy this quarter?`
    };
  }

  formatMarketBriefingText(industryId, quarterNum) {
    const snap = this.getQuarterlyMarketSnapshot(industryId, quarterNum);
    const qMeta = this.getQuarter(quarterNum);
    return `📊 **Market Intelligence Briefing — ${qMeta.name} (${qMeta.dates})**

🏢 **Industry Snapshot:**
${snap.industrySnapshot}

⚔️ **Competitor Landscape:**
${snap.competitorMoves}

👥 **Consumer Insights:**
${snap.consumerInsights}

💡 **${qMeta.name} Strategic Challenge:**
${snap.strategicChallenge}`;
  }

  getConversation(teamId, quarterNum) {
    const qn = Number(quarterNum);
    if (!this.state.conversations[teamId]) {
      this.state.conversations[teamId] = {};
    }
    if (!this.state.conversations[teamId][qn]) {
      const quarter = this.getQuarter(qn);
      const team = this.state.teams.find((t) => t.id === teamId);
      const ind = this.getIndustry(team?.industryId);

      let initText = '';
      if (qn === 0) {
        initText = `🚀 **Welcome ${team ? team.name : 'Team'} — Startup Formation & Ideation**

🏢 **Assigned Industry:** ${ind.name}
📍 **Geographic Scope:** ${ind.geographicScope || 'High-density urban clusters across Tier 1 & 2 Indian metropolises (starting in select key urban hubs such as Bengaluru, Delhi NCR, or Mumbai, with scope for regional and pan-India scaling)'}

💡 **Your Startup Pitch:**
What idea do you have for a startup in this industry in a way that you can scale it further?

📌 **Keep in mind:**
In this simulation, it **does not matter** if your idea targets a small or niche audience. What truly matters here is your **strategy and operational execution**, not the size of the market that you are choosing to serve.

🔍 **Core Strategic Dimensions to Address:**
• **Target Customer & Friction Point:** Which specific user segment do you solve for (e.g., late-night instant delivery, specialized organic/fresh produce, localized pharmacy & wellness, or business supplies)?
• **Unit Economics & Margin Defensibility:** What gives your model economic sustainability (e.g., dark store density, micro-warehouse automation, high-margin private label lines, dynamic delivery routing)?
• **Scalability & Expansion Pathway:** How will you expand beyond your initial test cluster to pan-India hubs without unsustainable capital burn?

🎯 **Tell me about your startup concept:**
What specific customer need do you address, what is your core product/service offering, and how do you envision building and scaling your venture? *(Enter freely below to register your startup foundation).*`;
      } else {
        const briefing = this.formatMarketBriefingText(team?.industryId || 'quick-commerce', qn);
        initText = `${briefing}\n\n🚀 **${quarter.name} (${quarter.dates}) Decisions Open**\n\nWhat is your strategy for ${quarter.name}? *(Enter freely in the chat below—no fixed format required).*`;
      }

      this.state.conversations[teamId][qn] = [
        {
          id: `init-${teamId}-q${qn}`,
          sender: 'ai',
          text: initText,
          timestamp: `${quarter.dates.split('–')[0].trim()}, 09:00 AM`,
          quarter: qn
        }
      ];
    }
    return this.state.conversations[teamId][qn];
  }

  addChatMessage(teamId, quarterNum, text, sender = 'student') {
    if (!text || !text.trim()) return;
    const conv = this.getConversation(teamId, quarterNum);
    const dateStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sender,
      text: text.trim(),
      timestamp: dateStr,
      quarter: quarterNum
    };
    conv.push(msg);

    // Auto-populate draft strategy if empty
    if (sender === 'student' && !this.state.draftSubmission.strategy) {
      this.state.draftSubmission.strategy = text.trim();
    }

    this.notify();
  }

  // --- Gemini-Powered Chat Action ---

  async sendStudentChatMessage(userText) {
    if (!userText || !userText.trim()) return;
    const team = this.getCurrentTeam();
    const qNum = team.currentQuarter;
    const qMeta = this.getQuarter(qNum);
    const industry = this.getIndustry(team.industryId);

    const qIndex = team.quarterlyData.findIndex((q) => q.quarter === qNum);
    if (qIndex !== -1 && team.quarterlyData[qIndex].status === 'evaluated') {
      this.showNotification(`Quarter ${qNum} has already been evaluated. Proceed to the next quarter.`);
      return;
    }

    // 0. Handle Startup Formation & Ideation Phase (Pre-Quarter 1)
    if (qNum === 0) {
      this.addChatMessage(team.id, 0, userText, 'student');
      this.state.isAITyping = true;
      this.state.lastError = null;
      this.notify();

      try {
        const payload = {
          teamName: team.name,
          industryName: industry.name,
          geographicScope: industry.geographicScope,
          isIdeation: true,
          currentQuarter: 0,
          userMessage: userText
        };

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        const data = await res.json();

        if (data.reply) {
          this.addChatMessage(team.id, 0, data.reply, 'ai');
        }

        team.businessDescription = {
          idea: userText,
          summary: data.reply
        };

        // Transition from Ideation into Quarter 1 (Indian FY: Apr 2024 – Jun 2024)!
        team.currentQuarter = 1;
        team.status = 'in-progress';
        const q1Index = team.quarterlyData.findIndex((q) => q.quarter === 1);
        if (q1Index !== -1) {
          team.quarterlyData[q1Index].status = 'in-progress';
        }

        for (const t of this.state.teams) {
          if (t.id !== team.id && t.currentQuarter === 0) {
            t.currentQuarter = 1;
            t.status = 'in-progress';
            const cQ1Idx = t.quarterlyData.findIndex((q) => q.quarter === 1);
            if (cQ1Idx !== -1) {
              t.quarterlyData[cQ1Idx].status = 'in-progress';
            }
          }
        }

        // Initialize Quarter 1 conversation (generates Market Intelligence Briefing before first message)
        this.getConversation(team.id, 1);

        this.showNotification(`Startup foundation registered! Quarter 1 (Apr 2024 – Jun 2024) is now live.`);
      } catch (err) {
        console.error('[IDEATION ERROR]', err);
        this.state.lastError = err.message || 'Failed to register startup idea.';
        this.addChatMessage(team.id, 0, `⚠️ Error: ${this.state.lastError}. Please try again.`, 'system');
      } finally {
        this.state.isAITyping = false;
        this.notify();
      }
      return;
    }

    // 1. Add student message immediately for quarterly turn
    this.addChatMessage(team.id, qNum, userText, 'student');

    // 2. Set typing state
    this.state.isAITyping = true;
    this.state.lastError = null;
    this.notify();

    try {
      const previousStrategies = team.quarterlyData
        .filter((q) => q.quarter < qNum && q.strategy)
        .map((q) => ({ quarter: q.quarter, strategy: q.strategy, reasoning: q.reasoning }));

      const previousResults = team.quarterlyData
        .filter((q) => q.quarter < qNum && q.resultsAvailable)
        .map((q) => ({
          quarter: q.quarter,
          marketShare: q.marketShare,
          financials: q.financialIndicators,
          score: q.score
        }));

      const payload = {
        teamName: team.name,
        industryName: industry.name,
        geographicScope: industry.geographicScope,
        industrySummary: industry.summary,
        currentQuarter: qNum,
        quarterDates: qMeta.dates,
        businessDescription: team.businessDescription || {},
        financialPosition: team.financialPosition || { cash: '₹3.50 Cr', debt: 'None' },
        previousStrategies,
        previousResults,
        conversationHistory: this.getConversation(team.id, qNum),
        userMessage: userText
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      // 3. Add AI message
      if (data.reply) {
        this.addChatMessage(team.id, qNum, data.reply, 'ai');
      }

      // 4. Handle metadata extractions
      if (data.meta) {
        if (data.meta.detected_strategy) {
          this.state.draftSubmission.strategy = data.meta.detected_strategy;
        }
        if (data.meta.detected_reasoning) {
          this.state.draftSubmission.reasoning = data.meta.detected_reasoning;
        }
        if (data.meta.funding_decision) {
          const fd = data.meta.funding_decision;
          if (fd.required || fd.terms) {
            this.state.draftSubmission.fundingRequired = true;
            if (fd.amount) this.state.draftSubmission.fundingAmount = fd.amount;
            if (fd.terms) this.state.draftSubmission.fundingPurpose = fd.terms;
          }
        }

        // 5. When quarter chatting is completed, automatically lock & evaluate all 5 teams!
        if (data.meta.quarter_completed) {
          const studentMsgs = this.getConversation(team.id, qNum).filter((m) => m.sender === 'student');
          const finalStrat = this.state.draftSubmission.strategy || (studentMsgs[0] ? studentMsgs[0].text : 'Differentiated positioning and operational expansion');
          const finalReason = this.state.draftSubmission.reasoning || (studentMsgs[1] ? studentMsgs[1].text : 'Maximizing gross margin and defensible unit economics');
          const finalFund = {
            required: Boolean(this.state.draftSubmission.fundingRequired),
            amount: this.state.draftSubmission.fundingAmount || '',
            type: this.state.draftSubmission.fundingType || 'Equity Investment',
            purpose: this.state.draftSubmission.fundingPurpose || 'Operational working capital'
          };

          if (qIndex !== -1) {
            team.quarterlyData[qIndex].strategy = finalStrat;
            team.quarterlyData[qIndex].reasoning = finalReason;
            team.quarterlyData[qIndex].fundingRequest = finalFund;
            team.quarterlyData[qIndex].status = 'submitted';
          }
          team.status = 'submitted';

          this.addChatMessage(
            team.id,
            qNum,
            `🏁 Quarter ${qNum} chatting is now complete! Evaluating performance for all 5 teams in ${industry.name}...`,
            'system'
          );

          // Automatically trigger the simulation & deterministic scoring for all 5 teams
          await this.executeQuarterSimulation(team.id, qNum);
        }
      }
    } catch (err) {
      console.error('[CHAT ERROR]', err);
      this.state.lastError = err.message || 'Failed to reach Gemini simulation backend.';
      this.addChatMessage(
        team.id,
        qNum,
        `⚠️ Simulation backend error: ${this.state.lastError}. Please check your connection or try again.`,
        'system'
      );
    } finally {
      this.state.isAITyping = false;
      this.notify();
    }
  }

  setDraftSubmission(patch, silent = false) {
    this.state.draftSubmission = {
      ...this.state.draftSubmission,
      ...patch
    };
    if (!silent) {
      this.notify();
    }
  }

  openSubmissionModal() {
    this.syncDraftForCurrentTeam();
    this.state.isSubmissionModalOpen = true;
    this.notify();
  }

  closeSubmissionModal() {
    this.state.isSubmissionModalOpen = false;
    this.notify();
  }

  toggleMarketSnapshot(forcedState = null) {
    if (forcedState !== null) {
      this.state.isSnapshotOpen = Boolean(forcedState);
    } else {
      this.state.isSnapshotOpen = !this.state.isSnapshotOpen;
    }
    this.notify();
  }

  // --- Submission & Outcome Execution ---

  async submitQuarterStrategy(teamId, quarterNum, data) {
    const team = this.state.teams.find((t) => t.id === teamId);
    if (!team) return;

    const qIndex = team.quarterlyData.findIndex((q) => q.quarter === quarterNum);
    if (qIndex === -1) return;

    team.quarterlyData[qIndex] = {
      ...team.quarterlyData[qIndex],
      status: 'submitted',
      strategy: data.strategy,
      reasoning: data.reasoning,
      fundingRequest: {
        required: Boolean(data.fundingRequired),
        amount: data.fundingRequired ? data.fundingAmount : '',
        type: data.fundingRequired ? data.fundingType : 'None',
        purpose: data.fundingRequired ? data.fundingPurpose : ''
      }
    };

    team.status = 'submitted';
    this.state.submissionConfirmed = true;

    // Record submission notice in chat
    const conv = this.getConversation(teamId, quarterNum);
    conv.push({
      id: `sys-sub-${Date.now()}`,
      sender: 'system',
      text: `Quarter ${quarterNum} strategy submission committed. Running Gemini market outcome simulation for all 5 teams...`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quarter: quarterNum
    });

    this.showNotification(`Quarter ${quarterNum} strategy submitted! Evaluating all 5 cohort teams...`);
    this.notify();

    // Trigger simulation outcome generation
    await this.executeQuarterSimulation(teamId, quarterNum);
  }

  async executeQuarterSimulation(teamId, quarterNum) {
    const team = this.state.teams.find((t) => t.id === teamId);
    if (!team) return;

    const qIndex = team.quarterlyData.findIndex((q) => q.quarter === quarterNum);
    if (qIndex === -1) return;

    const qData = team.quarterlyData[qIndex];
    const prevQData = team.quarterlyData.find((q) => q.quarter === quarterNum - 1) || {};
    const industry = this.getIndustry(team.industryId);
    const qMeta = this.getQuarter(quarterNum);

    this.state.isEvaluating = true;
    this.state.lastError = null;
    this.notify();

    try {
      const cohortTeams = this.state.teams
        .filter((t) => t.id !== teamId)
        .map((t) => ({ id: t.id, name: t.name }));

      const payload = {
        teamName: team.name,
        industryName: industry.name,
        industrySummary: industry.summary,
        competitors: industry.competitors,
        quarter: quarterNum,
        quarterDates: qMeta.dates,
        strategy: qData.strategy || 'Customer-centric delivery network and curated merchandise',
        reasoning: qData.reasoning || 'Focusing on high-margin customer retention rather than mass discount subsidies',
        fundingRequest: qData.fundingRequest,
        financialPosition: team.financialPosition,
        cohortTeams,
        previousQuarterData: {
          marketShare: prevQData.marketShare || '0%',
          revenue: prevQData.financialIndicators?.revenue || '₹0',
          cash: team.financialPosition?.cash || '₹3.50 Cr'
        }
      };

      const res = await fetch('/api/simulate-quarter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Simulation server returned HTTP ${res.status}`);
      }

      const jsonResp = await res.json();
      const outcome = jsonResp.outcome;
      const activeEval = outcome.active_team || outcome;

      // 1. Calculate deterministic application-side score for active team
      const rawScores = {};
      const explanations = {};
      for (const [k, v] of Object.entries(activeEval.criterion_evaluations || {})) {
        rawScores[k] = v.score;
        explanations[k] = v;
      }
      const scoreResult = scoringService.calculateQuarterScore(rawScores, explanations);

      qData.status = 'evaluated';
      qData.score = scoreResult.totalScore;
      qData.criterionBreakdown = scoreResult.breakdown;
      qData.scoringWeightsUsed = scoreResult.weightsUsed;
      qData.scoreExplanation = activeEval.score_explanation || 'Comprehensive evaluation across 7 academic criteria.';
      qData.whatWentWell = activeEval.what_went_right || activeEval.strengths || 'Strong product differentiation in target customer segment.';
      qData.mistakesWeaknesses = activeEval.what_went_wrong || activeEval.mistakes || 'Operational delivery bottlenecks during morning peak demand.';
      qData.nextQuarterImplications = activeEval.recommended_improvements || 'Optimize supplier terms and expand repeat customer retention.';
      qData.strategicDepthScore = activeEval.strategic_depth_score !== undefined ? activeEval.strategic_depth_score : (activeEval.strategicDepthScore || 75);
      qData.strategicDepthLevel = activeEval.strategic_depth_level || activeEval.strategicDepthLevel || 'Moderate (Basic Detail)';
      qData.strategicDepthFeedback = activeEval.strategic_depth_feedback || activeEval.strategicDepthFeedback || 'Assessed against operational clarity and unit economics.';
      qData.howToImproveDepth = activeEval.how_to_improve_depth || activeEval.howToImproveDepth || 'Elaborate on unit margins, partner SLAs, and cluster delivery economics.';
      qData.marketShare = activeEval.market_share || '14.2%';
      qData.financialIndicators = {
        revenue: activeEval.revenue || '₹2.40 Cr',
        grossMargin: activeEval.gross_margin || '28.5%',
        operatingProfitOrLoss: activeEval.operating_profit_or_loss || '-₹15.2 L',
        cashBalance: activeEval.cash_balance || '₹2.85 Cr',
        debtBalance: activeEval.debt_balance || 'None',
        unitsSold: activeEval.units_sold || '165,000 orders'
      };
      qData.resultsAvailable = true;

      // Update cash and debt balances deterministically
      if (activeEval.cash_balance) {
        team.financialPosition.cash = activeEval.cash_balance;
      }
      if (activeEval.debt_balance) {
        team.financialPosition.debt = activeEval.debt_balance;
      }

      team.cumulativeScore = scoringService.computeCumulativeScore(team.quarterlyData);
      team.status = 'evaluated';

      // 2. Evaluate and score the other 4 cohort teams in this industry
      if (Array.isArray(outcome.cohort_evaluations)) {
        for (const cEval of outcome.cohort_evaluations) {
          const cTeam = this.state.teams.find((t) => t.id === cEval.team_id);
          if (cTeam) {
            const cQData = cTeam.quarterlyData.find((q) => q.quarter === quarterNum);
            if (cQData) {
              const cRawScores = {};
              const cExplanations = {};
              for (const [k, v] of Object.entries(cEval.criterion_evaluations || {})) {
                cRawScores[k] = v.score;
                cExplanations[k] = v;
              }
              const cScoreResult = scoringService.calculateQuarterScore(cRawScores, cExplanations);

              cQData.status = 'evaluated';
              cQData.strategy = cEval.strategy_summary || 'Alternative competitive deployment.';
              cQData.score = cScoreResult.totalScore;
              cQData.criterionBreakdown = cScoreResult.breakdown;
              cQData.scoringWeightsUsed = cScoreResult.weightsUsed;
              cQData.whatWentWell = cEval.what_went_right || 'Strong brand reach in target market.';
              cQData.mistakesWeaknesses = cEval.what_went_wrong || 'Subsidies impacted unit contribution.';
              cQData.nextQuarterImplications = cEval.recommended_improvements || 'Curtail discounts and improve retention.';
              cQData.marketShare = cEval.market_share || '20.0%';
              cQData.financialIndicators = {
                revenue: cEval.revenue || '₹2.80 Cr',
                grossMargin: cEval.gross_margin || '20.0%',
                operatingProfitOrLoss: cEval.operating_profit_or_loss || '-₹20.0 L',
                cashBalance: cEval.cash_balance || '₹2.50 Cr',
                debtBalance: cEval.debt_balance || 'None',
                unitsSold: cEval.units_sold || '200,000 orders'
              };
              cQData.resultsAvailable = true;
              cTeam.cumulativeScore = scoringService.computeCumulativeScore(cTeam.quarterlyData);
              cTeam.status = 'evaluated';
            }
          }
        }
      }

      // Automatically open market snapshot drawer to show results
      this.state.isSnapshotOpen = true;

      // Add completion announcement in chat
      const conv = this.getConversation(teamId, quarterNum);
      conv.push({
        id: `sys-eval-${Date.now()}`,
        sender: 'system',
        text: `📊 **Quarter ${quarterNum} Evaluation Complete!** Score: **${qData.score} / 100**. All 5 cohort teams have been evaluated. Review your personalized report card, 6-metric financial strip, 7-criterion rubric, and cohort standings below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quarter: quarterNum
      });

      this.showNotification(`Quarter ${quarterNum} evaluated (${qData.score}/100)!`);
    } catch (err) {
      console.error('[SIMULATION EVALUATION ERROR]', err);
      this.state.lastError = err.message;
      this.showNotification(`Simulation error: ${err.message}`);
    } finally {
      this.state.isEvaluating = false;
      this.notify();
    }
  }

  updateScoringWeights(newWeightsMap) {
    try {
      scoringService.setWeights(newWeightsMap);
      this.showNotification('Scoring configuration updated successfully! Future evaluations will use new weights.');
      this.notify();
      return { success: true };
    } catch (err) {
      this.showNotification(`Scoring weight error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  recordQuarterEvaluation(teamId, quarterNum, evaluation) {
    const team = this.state.teams.find((t) => t.id === teamId);
    if (!team) return;

    const qIndex = team.quarterlyData.findIndex((q) => q.quarter === quarterNum);
    if (qIndex === -1) return;

    const qData = team.quarterlyData[qIndex];
    qData.status = 'evaluated';
    qData.score = evaluation.score || 82;
    qData.marketShare = evaluation.marketShare || '14.8%';
    qData.financialIndicators = evaluation.financialIndicators || {
      revenue: '₹1.85 Cr',
      profitLoss: '-₹32.4 L',
      cashBalance: '₹2.90 Cr'
    };
    qData.whatWentWell = evaluation.whatWentWell || 'Strong market selection in Tier-1 tech corridors.';
    qData.mistakesWeaknesses = evaluation.mistakesWeaknesses || 'Excessive introductory promo discounting compressed margins.';
    qData.marketResponseEvaluation = evaluation.marketResponseEvaluation || 'Competitors responded with targeted hyper-local promotions.';
    qData.resultsAvailable = true;

    team.cumulativeScore = scoringService.computeCumulativeScore(team.quarterlyData) || qData.score;
    team.status = 'evaluated';

    this.showNotification(`Quarter ${quarterNum} evaluation recorded for ${team.name}`);
    this.notify();
  }

  advanceToNextQuarter(teamId = null) {
    const tid = teamId || this.state.activeTeamId;
    const team = this.state.teams.find((t) => t.id === tid);
    if (!team) return;

    if (team.currentQuarter < 8) {
      const nextQ = team.currentQuarter + 1;
      team.currentQuarter = nextQ;
      const nextQIndex = team.quarterlyData.findIndex((q) => q.quarter === nextQ);
      if (nextQIndex !== -1) {
        team.quarterlyData[nextQIndex].status = 'in-progress';
      }
      team.status = 'in-progress';

      // Also advance the other 4 cohort teams so cohort quarters stay aligned
      for (const t of this.state.teams) {
        if (t.id !== team.id && t.currentQuarter < nextQ) {
          t.currentQuarter = nextQ;
          const cNextIdx = t.quarterlyData.findIndex((q) => q.quarter === nextQ);
          if (cNextIdx !== -1) {
            t.quarterlyData[cNextIdx].status = 'in-progress';
          }
          t.status = 'in-progress';
        }
      }

      this.state.submissionConfirmed = false;
      this.state.isSnapshotOpen = false;
      this.state.draftSubmission = {
        strategy: '',
        reasoning: '',
        fundingRequired: false,
        fundingAmount: '',
        fundingType: 'Equity Investment',
        fundingPurpose: ''
      };

      // Ensure conversation greeting exists for next quarter
      this.getConversation(team.id, nextQ);

      this.showNotification(`Advanced to Quarter ${nextQ} (${this.getQuarter(nextQ).dates})`);
      this.notify();
    } else {
      this.showNotification(`Simulation complete! All 8 quarters finished. View final rankings in Professor mode.`);
    }
  }

  showNotification(text) {
    this.state.notification = text;
    this.notify();
    if (this._notifTimeout) clearTimeout(this._notifTimeout);
    this._notifTimeout = setTimeout(() => {
      this.state.notification = null;
      this.notify();
    }, 3500);
  }
}

export const store = new SimulationStore();
