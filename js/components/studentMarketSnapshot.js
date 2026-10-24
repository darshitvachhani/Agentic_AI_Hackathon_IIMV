/**
 * Academic Business Strategy Simulation Platform
 * Student View C: Market Snapshot & Personalized Report Card Drawer
 * 
 * Implements Prompt 3:
 * - Deterministic application-side score out of 100
 * - Complete 7-criterion scoring breakdown table
 * - Personalized Report Card ("What went right" & "What went wrong")
 * - Consistent financial transactions and balance sheet
 * - Cohort Standings for all 5 teams in the assigned industry
 */

import { store } from '../state.js';
import { scoringService } from '../scoring.js';

export function renderMarketSnapshot() {
  const state = store.getState();
  const team = store.getCurrentTeam();
  const industry = store.getIndustry(team.industryId);
  const currentQNum = team.currentQuarter;
  const currentQ = store.getQuarter(currentQNum);
  const isCollapsed = !state.isSnapshotOpen;

  // Evaluated data for current quarter or most recent quarter with results
  const currentQData = team.quarterlyData.find((q) => q.quarter === currentQNum);
  const previousQData = team.quarterlyData.slice().reverse().find((q) => q.resultsAvailable);

  const displayData = currentQData?.resultsAvailable ? currentQData : (previousQData || currentQData);
  const hasResults = Boolean(displayData && displayData.resultsAvailable);
  const reportCard = scoringService.getPersonalizedReportCard(team, displayData?.quarter || currentQNum);

  // Get all cohort teams in the same industry sorted by cumulative score
  const cohortTeams = state.teams
    .filter((t) => t.industryId === team.industryId)
    .map((t) => {
      const qd = t.quarterlyData.find((q) => q.quarter === (displayData?.quarter || currentQNum));
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

  return `
    <aside class="market-snapshot-panel ${isCollapsed ? 'collapsed' : ''}" id="market-snapshot-drawer">
      <div class="snapshot-header">
        <div>
          <div class="snapshot-title">Market Snapshot & Report Card</div>
          <div style="font-size: 0.75rem; color: var(--color-text-light);">
            ${hasResults ? `Quarter ${displayData.quarter} (${displayData.dates}) Evaluated Dossier` : `Quarter ${currentQNum} Simulation Context`}
          </div>
        </div>
        <button 
          type="button" 
          class="btn btn-ghost btn-sm" 
          id="btn-close-snapshot"
          title="Collapse Market Snapshot"
          style="padding: 2px 6px;"
        >
          ✕
        </button>
      </div>

      <div class="snapshot-body">
        
        <!-- Academic Score Summary Card -->
        <div class="snapshot-card" style="border: 1px solid var(--color-primary-navy); background: var(--color-primary-light);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="snapshot-card-title" style="color: var(--color-primary-navy); margin-bottom: 0;">
              Quarter ${displayData?.quarter || currentQNum} Decision Evaluation
            </div>
            <span style="font-size: 0.72rem; font-weight: 700; background: var(--color-primary-navy); color: var(--color-white); padding: 2px 8px; border-radius: 4px;">
              ${reportCard.isEvaluated ? 'Evaluated' : 'Awaiting Submission'}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <div style="background: var(--color-white); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--color-border-subtle);">
              <div style="font-size: 0.7rem; color: var(--color-text-light); text-transform: uppercase; font-weight: 700;">Quarter Score</div>
              <div style="font-size: 1.35rem; font-weight: 800; color: var(--color-primary-navy);">
                ${reportCard.currentQuarterScore !== null ? `${reportCard.currentQuarterScore} / 100` : '—'}
              </div>
            </div>
            <div style="background: var(--color-white); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--color-border-subtle);">
              <div style="font-size: 0.7rem; color: var(--color-text-light); text-transform: uppercase; font-weight: 700;">Cumulative Score</div>
              <div style="font-size: 1.35rem; font-weight: 800; color: var(--color-primary-navy);">
                ${reportCard.cumulativeScore > 0 ? `${reportCard.cumulativeScore} / 100` : '—'}
              </div>
            </div>
          </div>

          <div style="font-size: 0.76rem; color: var(--color-text-muted); padding-top: 2px;">
            <strong>Previous Quarter Score:</strong> 
            ${reportCard.previousQuarterScore !== null ? `${reportCard.previousQuarterScore} / 100` : 'None (Starting Quarter)'}
          </div>
        </div>

        ${
          !hasResults
            ? `
          <!-- Empty State when Results not yet evaluated -->
          <div class="empty-neutral-state">
            <svg style="width: 32px; height: 32px; margin: 0 auto 8px; color: var(--color-primary-navy); display: block;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <p style="font-weight: 700; color: var(--color-primary-navy); margin-bottom: 4px;">
              Quarter ${currentQ.name} In Progress
            </p>
            <p style="font-size: 0.8rem; color: var(--color-text-light); line-height: 1.4;">
              Engage with Gemini in the chat to formulate your strategy, reasoning, and capital request. Once confirmed, all 5 cohort teams in ${industry.name} will be scored.
            </p>
          </div>

          <!-- Industry Reference Competitor Shares -->
          <div class="snapshot-card">
            <div class="snapshot-card-title">Industry Reference Landscape</div>
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.82rem;">
              ${industry.competitors.map(c => `
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--color-text-main); font-weight: 500;">${c.name}</span>
                  <span style="font-weight: 700; color: var(--color-primary-navy);">${c.marketShare}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `
            : `
          <!-- Personalized Report Card: What Went Right & What Went Wrong -->
          <div class="snapshot-card" style="border-left: 3px solid #059669; background: #f0fdf4;">
            <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #065f46; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <span>✓</span> What Went Right (Strengths)
            </div>
            <div style="font-size: 0.84rem; color: #064e3b; line-height: 1.5; white-space: pre-line;">
              ${reportCard.whatWentRight}
            </div>
          </div>

          <div class="snapshot-card" style="border-left: 3px solid #dc2626; background: #fef2f2;">
            <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #991b1b; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <span>⚠</span> What Went Wrong (Mistakes & Weaknesses)
            </div>
            <div style="font-size: 0.84rem; color: #7f1d1d; line-height: 1.5; white-space: pre-line;">
              ${reportCard.whatWentWrong}
            </div>
          </div>

          <!-- Forward Looking Recommendations -->
          <div class="snapshot-card" style="border-left: 3px solid var(--color-primary-navy);">
            <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--color-primary-navy); margin-bottom: 4px;">
              Strategic Recommendations for Next Quarter
            </div>
            <div style="font-size: 0.84rem; color: var(--color-text-main); line-height: 1.5;">
              ${reportCard.recommendedImprovements}
            </div>
          </div>

          <!-- 7 Evaluation Criteria Breakdown Table -->
          <div class="snapshot-card" style="padding: 10px;">
            <div class="snapshot-card-title" style="margin-bottom: 8px;">
              7-Criterion Academic Evaluation Framework
            </div>
            <div class="table-responsive">
              <table class="academic-table" style="font-size: 0.78rem;">
                <thead>
                  <tr>
                    <th>Criterion</th>
                    <th style="text-align: center; width: 14%;">Weight</th>
                    <th style="text-align: center; width: 14%;">Score</th>
                    <th style="text-align: right; width: 16%;">Points</th>
                  </tr>
                </thead>
                <tbody>
                  ${(reportCard.breakdown || []).map(item => `
                    <tr>
                      <td>
                        <div style="font-weight: 700; color: var(--color-primary-navy);">${item.label}</div>
                        <div style="font-size: 0.72rem; color: var(--color-text-muted);">${item.explanation}</div>
                      </td>
                      <td style="text-align: center; font-weight: 600;">${item.weight}%</td>
                      <td style="text-align: center; font-weight: 700; color: var(--color-primary-navy);">${item.score}/100</td>
                      <td style="text-align: right; font-weight: 800; color: var(--color-primary-navy);">${item.contribution}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Financial Performance & Cash Reconciliation -->
          <div class="snapshot-card">
            <div class="snapshot-card-title">Financial Position & Unit Economics</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.82rem;">
              <div style="background: #f8fafc; padding: 6px 10px; border-radius: 4px; border: 1px solid var(--color-border-subtle);">
                <div style="font-size: 0.7rem; color: var(--color-text-muted);">Quarter Revenue</div>
                <div style="font-weight: 700; color: var(--color-primary-navy);">${displayData.financialIndicators?.revenue || '—'}</div>
              </div>
              <div style="background: #f8fafc; padding: 6px 10px; border-radius: 4px; border: 1px solid var(--color-border-subtle);">
                <div style="font-size: 0.7rem; color: var(--color-text-muted);">Gross Margin</div>
                <div style="font-weight: 700; color: var(--color-primary-navy);">${displayData.financialIndicators?.grossMargin || '—'}</div>
              </div>
              <div style="background: #f8fafc; padding: 6px 10px; border-radius: 4px; border: 1px solid var(--color-border-subtle);">
                <div style="font-size: 0.7rem; color: var(--color-text-muted);">Operating Profit / Loss</div>
                <div style="font-weight: 700; color: ${displayData.financialIndicators?.operatingProfitOrLoss?.includes('-') ? '#dc2626' : '#059669'};">
                  ${displayData.financialIndicators?.operatingProfitOrLoss || displayData.financialIndicators?.profitLoss || '—'}
                </div>
              </div>
              <div style="background: #f8fafc; padding: 6px 10px; border-radius: 4px; border: 1px solid var(--color-border-subtle);">
                <div style="font-size: 0.7rem; color: var(--color-text-muted);">Cash Balance</div>
                <div style="font-weight: 700; color: var(--color-primary-navy);">${displayData.financialIndicators?.cashBalance || '—'}</div>
              </div>
              <div style="background: #f8fafc; padding: 6px 10px; border-radius: 4px; border: 1px solid var(--color-border-subtle);">
                <div style="font-size: 0.7rem; color: var(--color-text-muted);">Debt Balance</div>
                <div style="font-weight: 700; color: var(--color-primary-navy);">${displayData.financialIndicators?.debtBalance || 'None'}</div>
              </div>
              <div style="background: #f8fafc; padding: 6px 10px; border-radius: 4px; border: 1px solid var(--color-border-subtle);">
                <div style="font-size: 0.7rem; color: var(--color-text-muted);">Market Share</div>
                <div style="font-weight: 700; color: var(--color-primary-navy);">${displayData.marketShare || '—'}</div>
              </div>
            </div>
          </div>

          <!-- Cohort Standings: All 5 Teams in This Industry -->
          <div class="snapshot-card">
            <div class="snapshot-card-title">Cohort Standings &bull; ${industry.name} (5 Teams)</div>
            <div class="table-responsive">
              <table class="academic-table" style="font-size: 0.78rem;">
                <thead>
                  <tr>
                    <th style="width: 10%;">#</th>
                    <th>Team Name</th>
                    <th style="text-align: center; width: 18%;">Q${displayData.quarter} Score</th>
                    <th style="text-align: center; width: 18%;">Cumulative</th>
                    <th style="text-align: right; width: 18%;">Share</th>
                  </tr>
                </thead>
                <tbody>
                  ${cohortTeams.map((ct, idx) => `
                    <tr style="${ct.isCurrent ? 'background: var(--color-primary-light); font-weight: 700;' : ''}">
                      <td>${idx + 1}</td>
                      <td>
                        <span style="color: var(--color-primary-dark);">${ct.name}</span>
                        ${ct.isCurrent ? ' <span style="font-size: 0.7rem; color: var(--color-primary-navy);">(You)</span>' : ''}
                      </td>
                      <td style="text-align: center; font-weight: 700; color: var(--color-primary-navy);">${ct.quarterScore}</td>
                      <td style="text-align: center; font-weight: 800; color: var(--color-primary-navy);">${ct.cumulativeScore > 0 ? ct.cumulativeScore : '—'}</td>
                      <td style="text-align: right;">${ct.marketShare}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `
        }

      </div>
    </aside>
  `;
}

export function initMarketSnapshotEvents() {
  const closeBtn = document.getElementById('btn-close-snapshot');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      store.toggleMarketSnapshot(false);
    });
  }
}
