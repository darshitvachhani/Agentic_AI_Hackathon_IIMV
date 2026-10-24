/**
 * Academic Business Strategy Simulation Platform
 * Student View B: Conversational Simulation Chat Workspace
 * 
 * Features:
 * - 100% Full-Screen width utilization (no cramping right drawer)
 * - Startup Formation & Ideation Phase (Phase 0 / Genesis) precedes Quarter 1
 * - Indian Financial Year (Apr 2024 – Mar 2026 across 8 quarters)
 * - Prominent dynamic Ongoing Quarter indicators
 * - Market Intelligence Briefing before each quarter's first decision prompt
 * - Inline Horizontal Evaluation Dossier (Scores, Strengths/Weaknesses, 6-Metric Financials, 7-Criteria Rubric, 5-Team Cohort Standings)
 * - Single-color readable typography with bold emphasis and clean emojis
 */

import { store } from '../state.js';
import { scoringService } from '../scoring.js';

export function renderStudentChat() {
  const state = store.getState();
  const team = store.getCurrentTeam();
  const industry = store.getIndustry(team.industryId);
  const currentQNum = team.currentQuarter;
  const currentQ = store.getQuarter(currentQNum);

  const qData = team.quarterlyData.find((q) => q.quarter === currentQNum);
  const isIdeation = currentQNum === 0;
  const isSubmitted = team.status === 'submitted' || qData?.status === 'submitted';
  const isEvaluated = Boolean(qData?.status === 'evaluated' && qData?.resultsAvailable);

  // Status Badge Text
  let statusBadgeHtml = '<span class="status-badge in-progress">● Decisions Open</span>';
  if (isIdeation) {
    statusBadgeHtml = '<span class="status-badge in-progress" style="font-weight: 700;">💡 Startup Formation &amp; Ideation</span>';
  } else if (isEvaluated) {
    statusBadgeHtml = `<span class="status-badge evaluated" style="font-weight: 700;">✓ ${currentQ.name} Evaluated (${qData.score}/100)</span>`;
  } else if (isSubmitted) {
    statusBadgeHtml = '<span class="status-badge submitted" style="font-weight: 700;">⏳ Evaluating Cohort Simulation...</span>';
  }

  return `
    <div class="chat-workspace-container">
      <!-- Full-Width Header Bar -->
      <div class="chat-header-bar">
        <div class="chat-header-left">
          <div class="chat-title-group">
            <h2>${team.name} &bull; ${industry.name}</h2>
            <div class="sub">
              <strong>${currentQ.name}</strong> (${currentQ.dates}) &bull; Academic Strategy Simulation
              ${team.cumulativeScore > 0 ? ` &bull; <strong>Cumulative Score:</strong> ${team.cumulativeScore}/100` : ''}
            </div>
          </div>
        </div>

        <div class="chat-header-right">
          <!-- Status Badge -->
          ${statusBadgeHtml}

          <!-- Advance to Next Quarter Header Action Button (If evaluated) -->
          ${isEvaluated && currentQNum < 8 ? `
            <button 
              type="button" 
              class="btn btn-primary btn-sm btn-advance-quarter" 
              id="btn-header-next-quarter"
              title="Advance to Quarter ${currentQNum + 1}"
            >
              Proceed to Quarter ${currentQNum + 1} (${store.getQuarter(currentQNum + 1).dates}) →
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Quarter Navigation Ribbon (Quick-Jump Progress Bar) -->
      <div class="quarter-nav-ribbon" id="quarter-nav-ribbon">
        <div class="ribbon-label">SIMULATION PHASES:</div>
        <div class="ribbon-pills">
          <!-- Ideation Phase Pill -->
          <button 
            type="button" 
            class="quarter-nav-pill ${currentQNum === 0 ? 'active' : 'completed'}" 
            data-jump-quarter="0"
            title="Startup Formation & Ideation Phase"
          >
            <span>💡 Ideation</span>
            ${currentQNum > 0 ? '<span class="check">✓</span>' : '<span class="pulse-dot"></span>'}
          </button>

          <!-- Quarters 1 to 8 Pills (Indian Financial Year) -->
          ${[1, 2, 3, 4, 5, 6, 7, 8].map((qNum) => {
            const qMeta = store.getQuarter(qNum);
            const teamQData = team.quarterlyData.find((q) => q.quarter === qNum);
            const isDone = teamQData && teamQData.status === 'evaluated' && teamQData.resultsAvailable;
            const isCurrent = currentQNum === qNum;
            const isLocked = currentQNum < qNum;

            let pillClass = 'locked';
            let pillIcon = '🔒';
            if (isDone) {
              pillClass = 'completed';
              pillIcon = '✓';
            } else if (isCurrent) {
              pillClass = 'active';
              pillIcon = '●';
            }

            return `
              <button 
                type="button" 
                class="quarter-nav-pill ${pillClass}" 
                data-jump-quarter="${qNum}"
                ${isLocked ? 'disabled' : ''}
                title="${qMeta.name}: ${qMeta.dates} (${isLocked ? 'Locked' : isDone ? 'Evaluated' : 'Ongoing'})"
              >
                <span>${qMeta.code}: ${qMeta.dates.split(' ')[0]}–${qMeta.dates.split(' ')[3]}</span>
                <span class="pill-status">${pillIcon}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Full-Width Workspace Body -->
      <div class="chat-workspace-body full-width">
        <div class="chat-conversation-area full-width">
          
          <!-- Continuous Messages Scrollable Feed -->
          <div class="messages-scrollable full-width" id="chat-messages-scrollable">
            ${renderAllQuarterSections(team, currentQNum, state)}

            ${state.isAITyping || state.isEvaluating ? `
              <div class="chat-message ai" id="ai-typing-indicator" style="animation: fadeIn 0.2s ease;">
                <div class="message-meta">
                  <span>Simulation Facilitator AI (Gemini)</span>
                  <span>&bull;</span>
                  <span>${state.isEvaluating ? 'Evaluating cohort market outcomes...' : 'Analyzing strategic turn...'}</span>
                </div>
                <div class="message-bubble typing-bubble">
                  <span class="typing-dot">●</span>
                  <span class="typing-dot">●</span>
                  <span class="typing-dot">●</span>
                  <span class="typing-text">
                    ${state.isEvaluating 
                      ? 'Computing 7 academic criteria scores, financial reconciliation, and market shares for all 5 cohort teams...' 
                      : 'Formulating facilitator response and economic feedback...'}
                  </span>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Bottom Input Bar (Fixed at bottom of chat window) -->
          <div class="chat-input-bar">
            <div class="input-row">
              <textarea 
                id="chat-textarea-input" 
                class="chat-textarea" 
                placeholder="${
                  isEvaluated
                    ? `Quarter ${currentQNum} evaluation complete. Click "Proceed to Quarter ${currentQNum + 1}" to begin next quarter.`
                    : state.isAITyping || state.isEvaluating
                    ? 'Processing response...'
                    : isIdeation
                    ? 'Describe your startup idea, core customer need, and how you plan to scale... (Enter to send, Shift+Enter for newline)'
                    : 'Type your strategic turn, reasoning, or response here... (Enter to send, Shift+Enter for newline)'
                }"
                rows="1"
                ${isEvaluated || state.isAITyping || state.isEvaluating ? 'disabled' : ''}
              ></textarea>
              <button 
                type="button" 
                class="btn btn-primary" 
                id="btn-chat-send" 
                title="Send Message"
                style="padding: 8px 18px; align-self: flex-end; font-weight: 700;"
                ${isEvaluated || state.isAITyping || state.isEvaluating ? 'disabled' : ''}
              >
                ${state.isAITyping || state.isEvaluating ? 'Processing...' : 'Send ↵'}
              </button>
            </div>
            <div class="input-hint">
              ${
                isEvaluated
                  ? `Quarter ${currentQNum} decisions are locked and evaluated. Review your report card above and proceed to Quarter ${currentQNum + 1}.`
                  : isIdeation
                  ? 'Press <strong>Enter</strong> to register your startup foundation &bull; <strong>Shift + Enter</strong> for line break. Strategy and operational logic matter more than market size.'
                  : 'Press <strong>Enter</strong> to send &bull; <strong>Shift + Enter</strong> for line break. Strategy, justification, financing, and confirmation are managed directly through the chat.'
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

/**
 * Renders all quarter conversation sections sequentially from Quarter 0 up to currentQuarter.
 */
function renderAllQuarterSections(team, currentQNum, state) {
  const sections = [];

  // Determine starting quarter to render (render Phase 0 if present, plus all quarters up to currentQuarter)
  const quartersToRender = [];
  if (team.businessDescription?.idea || currentQNum === 0 || state.conversations[team.id]?.[0]) {
    quartersToRender.push(0);
  }
  for (let q = 1; q <= currentQNum; q++) {
    quartersToRender.push(q);
  }

  // If currently at 0, only 0 is rendered
  const uniqueQuarters = [...new Set(quartersToRender)].sort((a, b) => a - b);

  for (const qNum of uniqueQuarters) {
    const qMeta = store.getQuarter(qNum);
    const messages = store.getConversation(team.id, qNum);
    const qData = team.quarterlyData.find((q) => q.quarter === qNum);
    const isEvaluated = Boolean(qData && qData.status === 'evaluated' && qData.resultsAvailable);

    const dividerText = qNum === 0 
      ? '💡 Startup Formation &amp; Ideation Phase (Genesis)' 
      : `📅 ${qMeta.name} (${qMeta.dates}) &bull; ${qMeta.academicYear || 'Indian FY'}`;

    sections.push(`
      <section class="quarter-chat-section" id="quarter-section-${qNum}" data-quarter="${qNum}">
        <!-- Quarter Section Divider -->
        <div class="quarter-chat-divider">
          <span class="divider-line"></span>
          <span class="divider-badge">${dividerText}</span>
          <span class="divider-line"></span>
        </div>

        <!-- Messages for this quarter -->
        <div class="quarter-messages-group">
          ${messages.map((msg) => {
            const isStudent = msg.sender === 'student';
            const isSystem = msg.sender === 'system';
            const senderLabel = isStudent ? team.name : isSystem ? 'Simulation Facilitator' : 'Simulation Facilitator AI (Gemini)';

            return `
              <div class="chat-message ${msg.sender}" id="${msg.id}">
                <div class="message-meta">
                  <span>${senderLabel}</span>
                  <span>&bull;</span>
                  <span>${msg.timestamp}</span>
                </div>
                <div class="message-bubble">${formatChatMessage(msg.text)}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Inline Horizontal Evaluation Dossier (Rendered directly in chat when quarter is evaluated) -->
        ${isEvaluated ? renderHorizontalEvaluationDossier(qData, team, state) : ''}
      </section>
    `);
  }

  return sections.join('');
}

/**
 * Renders the Comprehensive Inline Horizontal Evaluation Dossier.
 * Appears horizontally across the chat feed after every evaluated quarter.
 */
function renderHorizontalEvaluationDossier(qData, team, state) {
  const qMeta = store.getQuarter(qData.quarter);
  const nextQMeta = store.getQuarter(qData.quarter + 1);
  const industry = store.getIndustry(team.industryId);
  const reportCard = scoringService.getPersonalizedReportCard(team, qData.quarter);

  // Cohort teams in this industry sorted by quarter score descending
  const cohortTeams = state.teams
    .filter((t) => t.industryId === team.industryId)
    .map((t) => {
      const qd = t.quarterlyData.find((q) => q.quarter === qData.quarter);
      return {
        id: t.id,
        name: t.name,
        isCurrent: t.id === team.id,
        quarterScore: qd?.score !== null && qd?.score !== undefined ? qd.score : '—',
        cumulativeScore: t.cumulativeScore || 0,
        marketShare: qd?.marketShare || '—',
        revenue: qd?.financialIndicators?.revenue || '—'
      };
    })
    .sort((a, b) => (typeof b.quarterScore === 'number' ? b.quarterScore : 0) - (typeof a.quarterScore === 'number' ? a.quarterScore : 0));

  const userRank = cohortTeams.findIndex((t) => t.id === team.id) + 1;
  const isOperatingLoss = (qData.financialIndicators?.operatingProfitOrLoss || '').includes('-');

  return `
    <div class="chat-evaluation-dossier" id="evaluation-dossier-q${qData.quarter}">
      
      <!-- 1. Dossier Header Bar -->
      <div class="dossier-header-bar">
        <div class="dossier-header-title">
          <span class="dossier-header-icon">📊</span>
          <div>
            <h3>${qMeta.name} Performance Evaluation &amp; Cohort Results</h3>
            <div class="dossier-header-sub">
              ${qMeta.dates} &bull; ${industry.name} &bull; Deterministic 7-Criterion Academic Evaluation
            </div>
          </div>
        </div>

        <div class="dossier-score-pills">
          <div class="score-pill-card">
            <span class="score-pill-label">Quarter Score</span>
            <span class="score-pill-val">${qData.score} <small>/ 100</small></span>
          </div>
          <div class="score-pill-card">
            <span class="score-pill-label">Cumulative Score</span>
            <span class="score-pill-val">${team.cumulativeScore} <small>/ 100</small></span>
          </div>
          <div class="score-pill-card depth">
            <span class="score-pill-label">Strategic Depth</span>
            <span class="score-pill-val">${reportCard.strategicDepthScore} <small>/ 100</small></span>
          </div>
          <div class="score-pill-card rank">
            <span class="score-pill-label">Cohort Rank</span>
            <span class="score-pill-val">#${userRank > 0 ? userRank : 1} <small>of 5</small></span>
          </div>
        </div>
      </div>

      <!-- 2. Strategic Formulation Depth & Personalized Report Card -->
      <div class="dossier-body">

        <!-- Dedicated Strategic Depth Evaluation & Actionable Improvement Card -->
        <div class="dossier-depth-card">
          <div class="depth-card-header">
            <div class="depth-card-title-group">
              <span class="depth-card-icon">🎯</span>
              <div>
                <div class="depth-card-title">Strategic Formulation Depth: <strong>${reportCard.strategicDepthScore} / 100</strong></div>
                <div class="depth-card-sub">Measures how deeply and thoroughly the strategy and operational levers were articulated</div>
              </div>
            </div>
            <span class="depth-level-pill ${reportCard.strategicDepthScore < 60 ? 'low' : reportCard.strategicDepthScore < 80 ? 'medium' : 'high'}">
              ${reportCard.strategicDepthLevel}
            </span>
          </div>

          <div class="depth-card-body">
            <div class="depth-impact-banner ${reportCard.strategicDepthScore < 60 ? 'penalty' : reportCard.strategicDepthScore < 80 ? 'neutral' : 'bonus'}">
              ${reportCard.strategicDepthScore < 60
                ? '⚠️ <strong>Strategic Depth Penalty Applied:</strong> Brief or single-line strategy description significantly reduced your quarter grade and cohort standing. Superficial strategies are vulnerable to competitors in live markets.'
                : reportCard.strategicDepthScore < 80
                ? 'ℹ️ <strong>Moderate Analytical Rigor:</strong> Core strategy is logical, but deeper operational mechanics and unit economics will improve competitive defensibility.'
                : '✓ <strong>High Strategic Rigor:</strong> Thorough, multi-dimensional strategy formulation significantly bolstered your academic performance.'}
            </div>

            <div class="depth-analysis-row">
              <div class="depth-analysis-box">
                <div class="depth-box-title">Facilitator Depth Assessment</div>
                <div class="depth-box-content">${formatChatMessage(reportCard.strategicDepthFeedback)}</div>
              </div>
              <div class="depth-analysis-box improvement">
                <div class="depth-box-title">💡 How Strategic Depth Can Be Improved in Future Quarters</div>
                <div class="depth-box-content">${formatChatMessage(reportCard.howToImproveDepth)}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="dossier-report-grid">
          <!-- Strengths -->
          <div class="dossier-report-card strengths">
            <div class="dossier-card-title strengths">
              <span>✓</span> What Went Right (Key Strengths)
            </div>
            <div class="dossier-card-content">
              ${formatChatMessage(reportCard.whatWentRight)}
            </div>
          </div>

          <!-- Weaknesses -->
          <div class="dossier-report-card weaknesses">
            <div class="dossier-card-title weaknesses">
              <span>⚠</span> What Went Wrong (Mistakes &amp; Friction Points)
            </div>
            <div class="dossier-card-content">
              ${formatChatMessage(reportCard.whatWentWrong)}
            </div>
          </div>

          <!-- Recommendations -->
          <div class="dossier-report-card recommendations">
            <div class="dossier-card-title recommendations">
              <span>💡</span> Strategic Guidance for Next Quarter
            </div>
            <div class="dossier-card-content">
              ${formatChatMessage(reportCard.recommendedImprovements)}
            </div>
          </div>
        </div>

        <!-- 3. Horizontal 6-Metric Financial & Market Indicators Strip -->
        <div class="dossier-section-block">
          <div class="dossier-section-header">
            <span>Financial Consistency &amp; Balance Sheet Position</span>
            <span class="section-tag">Audited Quarterly Outcomes</span>
          </div>
          
          <div class="dossier-financials-strip">
            <div class="fin-stat-tile">
              <div class="fin-label">Quarter Revenue</div>
              <div class="fin-value">${qData.financialIndicators?.revenue || '—'}</div>
              <div class="fin-caption">Gross Realized Sales</div>
            </div>
            <div class="fin-stat-tile">
              <div class="fin-label">Gross Margin</div>
              <div class="fin-value">${qData.financialIndicators?.grossMargin || '—'}</div>
              <div class="fin-caption">Unit Contribution</div>
            </div>
            <div class="fin-stat-tile">
              <div class="fin-label">Operating P&amp;L</div>
              <div class="fin-value ${isOperatingLoss ? 'negative' : 'positive'}">
                ${qData.financialIndicators?.operatingProfitOrLoss || qData.financialIndicators?.profitLoss || '—'}
              </div>
              <div class="fin-caption">EBITDA Level</div>
            </div>
            <div class="fin-stat-tile">
              <div class="fin-label">Cash Balance</div>
              <div class="fin-value">${qData.financialIndicators?.cashBalance || '—'}</div>
              <div class="fin-caption">Liquid Treasury</div>
            </div>
            <div class="fin-stat-tile">
              <div class="fin-label">Debt Balance</div>
              <div class="fin-value">${qData.financialIndicators?.debtBalance || 'None'}</div>
              <div class="fin-caption">Outstanding Credit</div>
            </div>
            <div class="fin-stat-tile highlight">
              <div class="fin-label">Market Share</div>
              <div class="fin-value">${qData.marketShare || '—'}</div>
              <div class="fin-caption">Cohort Sector Share</div>
            </div>
          </div>
        </div>

        <!-- 4. Two Side-by-Side Comprehensive Academic Tables:
             A) 7-Criterion Academic Evaluation Rubric
             B) Cohort Standings for all 5 Teams in the Industry -->
        <div class="dossier-tables-grid">
          
          <!-- 7 Academic Criteria Breakdown Table -->
          <div class="dossier-table-box">
            <div class="dossier-table-header">
              <div>
                <strong>7-Criterion Academic Evaluation Framework</strong>
                <div style="font-size: 0.72rem; color: var(--color-text-muted);">Deterministic formula based on professor-configured weights</div>
              </div>
              <span class="academic-badge">100-Point Model</span>
            </div>
            <div class="table-responsive">
              <table class="academic-table dossier-table">
                <thead>
                  <tr>
                    <th>Academic Criterion</th>
                    <th style="text-align: center; width: 14%;">Weight</th>
                    <th style="text-align: center; width: 16%;">Score</th>
                    <th style="text-align: right; width: 16%;">Points</th>
                  </tr>
                </thead>
                <tbody>
                  ${(reportCard.breakdown || []).map((item) => `
                    <tr>
                      <td>
                        <div class="criterion-name">${item.label}</div>
                        <div class="criterion-desc">${item.explanation}</div>
                      </td>
                      <td style="text-align: center; font-weight: 600;">${item.weight}%</td>
                      <td style="text-align: center; font-weight: 700; color: var(--color-primary-navy);">${item.score}/100</td>
                      <td style="text-align: right; font-weight: 800; color: var(--color-primary-navy);">${item.contribution}</td>
                    </tr>
                  `).join('')}
                </tbody>
                <tfoot>
                  <tr class="table-total-row">
                    <td><strong>Quarter Academic Total</strong></td>
                    <td style="text-align: center;"><strong>100%</strong></td>
                    <td style="text-align: center; color: var(--color-primary-navy);"><strong>${qData.score}</strong></td>
                    <td style="text-align: right; color: var(--color-primary-navy); font-size: 1rem;"><strong>${qData.score} / 100</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Cohort Standings Table -->
          <div class="dossier-table-box">
            <div class="dossier-table-header">
              <div>
                <strong>Cohort Standings &bull; ${industry.name}</strong>
                <div style="font-size: 0.72rem; color: var(--color-text-muted);">5 Teams competing in the same industry</div>
              </div>
              <span class="academic-badge">Quarter ${qData.quarter} Benchmarks</span>
            </div>
            <div class="table-responsive">
              <table class="academic-table dossier-table">
                <thead>
                  <tr>
                    <th style="width: 8%;">#</th>
                    <th>Team Name</th>
                    <th style="text-align: center; width: 20%;">Q${qData.quarter} Score</th>
                    <th style="text-align: center; width: 22%;">Cumulative</th>
                    <th style="text-align: right; width: 20%;">Market Share</th>
                  </tr>
                </thead>
                <tbody>
                  ${cohortTeams.map((ct, idx) => `
                    <tr class="${ct.isCurrent ? 'current-team-row' : ''}">
                      <td style="font-weight: 700;">${idx + 1}</td>
                      <td>
                        <strong style="color: var(--color-primary-navy);">${ct.name}</strong>
                        ${ct.isCurrent ? ' <span class="you-badge">(You)</span>' : ''}
                      </td>
                      <td style="text-align: center; font-weight: 700; color: var(--color-primary-navy);">${ct.quarterScore}</td>
                      <td style="text-align: center; font-weight: 800; color: var(--color-primary-navy);">${ct.cumulativeScore > 0 ? ct.cumulativeScore : '—'}</td>
                      <td style="text-align: right; font-weight: 600;">${ct.marketShare}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- 5. Bottom Call-to-Action Bar inside Dossier -->
        ${qData.quarter === team.currentQuarter && team.currentQuarter < 8 ? `
          <div class="dossier-action-bar">
            <div class="dossier-action-info">
              <strong>Ready for ${nextQMeta.name}?</strong>
              <span>Proceeding will advance your cohort to ${nextQMeta.name} (${nextQMeta.dates}) and deliver a fresh Market Intelligence Briefing.</span>
            </div>
            <button 
              type="button" 
              class="btn btn-primary btn-lg btn-advance-quarter" 
              id="btn-dossier-next-quarter-${qData.quarter}"
            >
              Proceed to ${nextQMeta.name} (${nextQMeta.dates}) →
            </button>
          </div>
        ` : qData.quarter === 8 ? `
          <div class="dossier-action-bar" style="background: #f8fafc; border: 1px solid var(--color-primary-navy);">
            <div class="dossier-action-info">
              <strong style="color: var(--color-primary-navy); font-size: 1.05rem;">🎉 Simulation Complete! All 8 Quarters Finished.</strong>
              <span>You have completed the full 2-year simulation cycle (Apr 2024 – Mar 2026). Switch to Professor Mode in the header to view final cohort rankings and analytics.</span>
            </div>
          </div>
        ` : ''}

      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatChatMessage(rawText) {
  if (!rawText) return '';

  // 1. Sanitize raw HTML tags to prevent XSS
  const sanitized = escapeHtml(rawText);

  // 2. Parse lines
  const rawLines = sanitized.split('\n');
  const blocks = [];
  let currentList = [];

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push(`<ul class="chat-bubble-list">${currentList.map((li) => `<li>${li}</li>`).join('')}</ul>`);
      currentList = [];
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i].trim();

    // Check for bullet point (•, -, *)
    if (line.startsWith('•') || line.startsWith('- ') || line.startsWith('* ')) {
      let content = line.replace(/^[•\-\*]\s*/, '');
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
      currentList.push(content);
      continue;
    }

    // Numbered list item (e.g., "1. ")
    if (/^\d+\.\s+/.test(line)) {
      let content = line.replace(/^\d+\.\s+/, '');
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
      currentList.push(content);
      continue;
    }

    // Not a list item: flush any pending list
    flushList();

    if (line === '') {
      blocks.push('<div class="chat-spacer"></div>');
      continue;
    }

    // Horizontal divider rules (***, ---, ___)
    if (line === '***' || line === '---' || line === '___') {
      blocks.push('<div class="chat-divider-rule"></div>');
      continue;
    }

    // Markdown heading syntax (#, ##, ###, ####)
    if (/^#{1,4}\s+/.test(line)) {
      line = line.replace(/^#{1,4}\s+/, '');
      let formattedHeading = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formattedHeading = formattedHeading.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
      blocks.push(`<div class="chat-section-label">${formattedHeading}</div>`);
      continue;
    }

    // Format bold and italics inside regular lines
    let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedLine = formattedLine.replace(/\*([^\*]+)\*/g, '<em>$1</em>');

    // Hero Header detection (Welcome banners & Market Briefing headers)
    if (line.startsWith('🚀 **Welcome') || line.startsWith('🚀 **Startup Venture Registered') || line.startsWith('📊 **Market Intelligence Briefing')) {
      blocks.push(`<div class="chat-heading-hero">${formattedLine}</div>`);
      continue;
    }

    // Parameter box detection (Industry & Geographic Scope parameters)
    if (line.startsWith('🏢 **Assigned Industry:') || line.startsWith('📍 **Geographic Scope:')) {
      blocks.push(`<div class="chat-param-row">${formattedLine}</div>`);
      continue;
    }

    // Section prompt callout headers
    if (
      line.startsWith('💡 **') ||
      line.startsWith('📌 **') ||
      line.startsWith('🔍 **') ||
      line.startsWith('🎯 **') ||
      line.startsWith('🏢 **Industry') ||
      line.startsWith('⚔️ **') ||
      line.startsWith('👥 **') ||
      line.startsWith('💰 **') ||
      line.startsWith('📋 **')
    ) {
      blocks.push(`<div class="chat-section-label">${formattedLine}</div>`);
      continue;
    }

    blocks.push(`<p class="chat-p">${formattedLine}</p>`);
  }

  flushList();

  return blocks.join('');
}

export function initStudentChatEvents() {
  const scrollContainer = document.getElementById('chat-messages-scrollable');

  // Auto scroll to bottom
  if (scrollContainer) {
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }

  // Back to overview
  const backOverview = document.getElementById('btn-chat-back-overview');
  if (backOverview) {
    backOverview.addEventListener('click', () => {
      store.setView('student-landing');
    });
  }

  // Advance to next quarter buttons (Header and Dossier buttons)
  const advanceButtons = document.querySelectorAll('.btn-advance-quarter');
  advanceButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      store.advanceToNextQuarter();
    });
  });

  // Quarter Navigation Ribbon Quick-Jump Pills
  const ribbonPills = document.querySelectorAll('.quarter-nav-pill[data-jump-quarter]');
  ribbonPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const q = pill.getAttribute('data-jump-quarter');
      const targetSection = document.getElementById(`quarter-section-${q}`);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Chat message send handler with Gemini backend integration
  const textarea = document.getElementById('chat-textarea-input');
  const sendBtn = document.getElementById('btn-chat-send');

  const handleSend = async () => {
    if (!textarea) return;
    const text = textarea.value.trim();
    if (!text) return;

    textarea.value = '';
    textarea.style.height = 'auto';

    // Auto scroll immediately
    if (scrollContainer) {
      setTimeout(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }, 30);
    }

    // Call store async Gemini handler
    await store.sendStudentChatMessage(text);

    // Auto scroll after AI reply
    if (scrollContainer) {
      setTimeout(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }, 50);
    }
  };

  sendBtn?.addEventListener('click', handleSend);

  // Multiline Enter & Shift+Enter handler
  if (textarea) {
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    // Auto-grow textarea height
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
    });
  }
}
