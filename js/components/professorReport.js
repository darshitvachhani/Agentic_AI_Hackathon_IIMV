/**
 * Academic Business Strategy Simulation Platform
 * Professor View B: Team Performance Report with 8-Quarter Chronological Scoring Dossier
 */

import { store } from '../state.js';
import { SIMULATION_QUARTERS } from '../constants.js';

export function renderProfessorReport() {
  const state = store.getState();
  const teamId = state.selectedReportTeamId || state.activeTeamId;
  const team = state.teams.find((t) => t.id === teamId) || state.teams[0];
  const industry = store.getIndustry(team.industryId);
  const currentQ = store.getQuarter(team.currentQuarter);

  let statusText = 'In Progress';
  if (team.status === 'submitted') statusText = 'Submitted (Awaiting Evaluation)';
  if (team.status === 'evaluated') statusText = 'Evaluated';

  return `
    <div class="professor-report-view">
      <!-- Back Navigation & Top Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-md);">
        <button type="button" class="btn btn-outline btn-sm" id="btn-back-to-dashboard">
          ← Back to Dashboard
        </button>
        <div style="display: flex; gap: var(--space-xs);">
          <button type="button" class="btn btn-ghost btn-sm" id="btn-expand-all">Expand All</button>
          <button type="button" class="btn btn-ghost btn-sm" id="btn-collapse-all">Collapse All</button>
        </div>
      </div>

      <!-- Top Summary Header Card -->
      <div class="report-header-card">
        <div class="report-header-top">
          <div>
            <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 0.05em;">Team Performance Dossier</span>
            <h1 style="font-size: 1.7rem; font-weight: 800; color: var(--color-primary-dark); margin-top: 2px;">${team.name}</h1>
          </div>
          <div>
            <span class="status-badge ${team.status}" style="font-size: 0.85rem; padding: 6px 14px;">
              ${statusText}
            </span>
          </div>
        </div>

        <div class="report-meta-grid">
          <div class="report-meta-item">
            <div class="label">Assigned Industry</div>
            <div class="val">${industry.name}</div>
          </div>
          <div class="report-meta-item">
            <div class="label">Current Quarter</div>
            <div class="val">${currentQ.name} (${currentQ.code})</div>
          </div>
          <div class="report-meta-item">
            <div class="label">Active Simulation Period</div>
            <div class="val">${currentQ.dates}</div>
          </div>
          <div class="report-meta-item">
            <div class="label">Cumulative Score</div>
            <div class="val">${team.cumulativeScore > 0 ? team.cumulativeScore + ' / 100' : 'Awaiting evaluation'}</div>
          </div>
        </div>

        <!-- 8-Quarter Mini Visual Score Track -->
        <div style="margin-top: var(--space-md); background: var(--color-white); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
          <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-light); margin-bottom: 6px;">
            Quarterly Score Track (Q1 to Q8)
          </div>
          <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; text-align: center;">
            ${team.quarterlyData
              .map((q) => {
                const hasScore = q.status === 'evaluated' && q.score !== null;
                return `
                <div style="background: ${hasScore ? 'var(--color-primary-light)' : '#f8fafc'}; border: 1px solid ${hasScore ? 'var(--color-primary-navy)' : 'var(--color-border-subtle)'}; border-radius: 4px; padding: 6px 2px;">
                  <div style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600;">Q${q.quarter}</div>
                  <div style="font-size: 0.95rem; font-weight: 800; color: var(--color-primary-navy);">
                    ${hasScore ? q.score : '—'}
                  </div>
                </div>
              `;
              })
              .join('')}
          </div>
        </div>
      </div>

      <!-- Chronological List of Quarterly Decisions (Apr 2024 to Mar 2026, 8 Quarters) -->
      <div style="margin-bottom: var(--space-md); display: flex; align-items: center; justify-content: space-between;">
        <h2 class="section-title" style="margin-bottom: 0;">Quarterly Strategy & Evaluation Trajectory (8 Quarters)</h2>
        <span style="font-size: 0.82rem; color: var(--color-text-light);">Click any quarter to expand strategic decisions and academic feedback</span>
      </div>

      <div class="accordion-list">
        ${team.quarterlyData
          .map((qData) => {
            const quarterMeta = SIMULATION_QUARTERS.find((q) => q.id === qData.quarter) || {};
            const isCurrent = qData.quarter === team.currentQuarter;
            const hasSubmission = Boolean(qData.strategy && qData.strategy.trim());
            const isEvaluated = qData.status === 'evaluated';
            const isSubmittedAwaiting = qData.status === 'submitted';

            // Auto-open current quarter or evaluated quarters by default
            const isOpen = isCurrent || isSubmittedAwaiting || isEvaluated;

            return `
            <div class="accordion-item ${isOpen ? 'open' : ''}" data-accordion-quarter="${qData.quarter}">
              <div class="accordion-header" data-toggle-quarter="${qData.quarter}">
                <div class="accordion-title-left">
                  <span class="q-code-pill">${quarterMeta.code || 'Q' + qData.quarter}</span>
                  <div>
                    <span class="q-title-text">${quarterMeta.name || 'Quarter ' + qData.quarter}</span>
                    <span class="q-dates-text">(${qData.dates})</span>
                  </div>
                  ${isCurrent ? '<span style="font-size: 0.72rem; font-weight: 700; background: var(--color-primary-light); color: var(--color-primary-navy); border: 1px solid var(--color-primary-border); padding: 2px 6px; border-radius: 4px;">ACTIVE QUARTER</span>' : ''}
                </div>

                <div class="accordion-title-right">
                  <span class="status-badge ${qData.status}">
                    ${qData.status === 'evaluated' ? 'Evaluated' : qData.status === 'submitted' ? 'Submitted' : qData.status === 'in-progress' ? 'In Progress' : 'Awaiting Submission'}
                  </span>
                  <span class="q-score-badge">
                    Score: ${qData.score !== null ? qData.score + '/100' : 'Awaiting evaluation'}
                  </span>
                  <svg class="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              <div class="accordion-body">
                ${
                  !hasSubmission
                    ? `
                  <div class="empty-neutral-state">
                    <p style="font-weight: 600; margin-bottom: 4px;">Awaiting strategy submission for ${quarterMeta.name || 'Quarter ' + qData.quarter}</p>
                    <p style="font-size: 0.8rem; color: var(--color-text-light);">The team has not submitted their strategy, reasoning, or funding request for this period yet.</p>
                  </div>
                `
                    : `
                  <!-- Submission Details Grid -->
                  <div class="q-detail-grid">
                    <div class="q-box" style="grid-column: 1 / -1;">
                      <div class="q-box-title">Submitted Strategy</div>
                      <div class="q-box-content" style="font-size: 0.95rem; font-weight: 500;">
                        ${qData.strategy || '—'}
                      </div>
                    </div>

                    <div class="q-box">
                      <div class="q-box-title">Strategic Reasoning & Rationale</div>
                      <div class="q-box-content">
                        ${qData.reasoning || '—'}
                      </div>
                    </div>

                    <div class="q-box">
                      <div class="q-box-title">Funding & Capital Request</div>
                      <div class="q-box-content">
                        ${
                          qData.fundingRequest && qData.fundingRequest.required
                            ? `
                            <div style="margin-bottom: 6px;">
                              <strong>Amount:</strong> ${qData.fundingRequest.amount || 'Not specified'}<br/>
                              <strong>Instrument:</strong> ${qData.fundingRequest.type || 'Equity'}
                            </div>
                            <div style="font-size: 0.82rem; color: var(--color-text-muted);">
                              <strong>Planned Utilization:</strong> ${qData.fundingRequest.purpose || 'General working capital'}
                            </div>
                          `
                            : `<span style="color: var(--color-text-muted);">No external funding or loan requested for this quarter.</span>`
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Market Performance & Evaluation Grid -->
                  <div style="margin-top: var(--space-md); border-top: 1px solid var(--color-border-subtle); padding-top: var(--space-md);">
                    <div class="q-box-title" style="margin-bottom: var(--space-sm);">Quarterly Outcomes & Academic Evaluation</div>
                    
                    ${
                      !isEvaluated
                        ? `
                      <div class="empty-neutral-state" style="margin-bottom: var(--space-md);">
                        <p style="font-weight: 600; margin-bottom: 4px;">Awaiting evaluation</p>
                        <p style="font-size: 0.82rem; color: var(--color-text-light);">
                          Market share, financial indicators, and qualitative review have not yet been evaluated for this quarter.
                        </p>
                      </div>

                      <!-- Professor Evaluation Form -->
                      <div style="background: var(--color-primary-light); border: 1px solid var(--color-primary-border); border-radius: var(--radius-sm); padding: var(--space-md);">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-sm);">
                          <strong style="color: var(--color-primary-navy); font-size: 0.88rem;">Professor Evaluation Desk</strong>
                          <span style="font-size: 0.75rem; color: var(--color-text-muted);">Trigger Gemini Simulation Evaluation</span>
                        </div>
                        <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: var(--space-md);">
                          Run the Gemini simulation model to generate simulated market outcomes, compute decision score, and publish results to the student workspace.
                        </p>
                        <div style="display: flex; gap: var(--space-sm); align-items: center;">
                          <button 
                            type="button" 
                            class="btn btn-primary btn-sm" 
                            data-grade-quarter="${qData.quarter}"
                            data-team-id="${team.id}"
                          >
                            Evaluate Quarter ${qData.quarter} with Gemini
                          </button>
                        </div>
                      </div>
                    `
                        : `
                      <div class="q-detail-grid">
                        <div class="q-box">
                          <div class="q-box-title">Market Share & Financial Indicators</div>
                          <div class="q-box-content">
                            <div style="margin-bottom: 6px;"><strong>Market Share:</strong> ${qData.marketShare || 'Awaiting evaluation'}</div>
                            ${
                              qData.financialIndicators
                                ? `
                              <div style="font-size: 0.85rem; color: var(--color-text-main);">
                                <div><strong>Revenue:</strong> ${qData.financialIndicators.revenue}</div>
                                <div><strong>Profit / Loss:</strong> ${qData.financialIndicators.profitLoss}</div>
                                <div><strong>Cash Balance:</strong> ${qData.financialIndicators.cashBalance}</div>
                                ${qData.financialIndicators.debtBalance && qData.financialIndicators.debtBalance !== 'None' ? `<div><strong>Debt Balance:</strong> ${qData.financialIndicators.debtBalance}</div>` : ''}
                              </div>
                            `
                                : '<div style="color: var(--color-text-muted);">Financials: Awaiting evaluation</div>'
                            }
                          </div>
                        </div>

                        <div class="q-box">
                          <div class="q-box-title">Quarterly Score & Cumulative Standing</div>
                          <div class="q-box-content">
                            <span style="font-size: 1.4rem; font-weight: 800; color: var(--color-primary-navy);">
                              ${qData.score} / 100
                            </span>
                            <div style="font-size: 0.78rem; color: var(--color-text-muted); margin-top: 4px;">
                              ${qData.evaluationFeedback?.scoreExplanation || 'Graded on strategic coherence, unit economics, and risk management.'}
                            </div>
                          </div>
                        </div>

                        <div class="q-box">
                          <div class="q-box-title">Key Strengths Identified</div>
                          <div class="q-box-content" style="color: #047857; font-weight: 500;">
                            ${qData.whatWentWell || 'Awaiting evaluation'}
                          </div>
                        </div>

                        <div class="q-box">
                          <div class="q-box-title">Mistakes & Weaknesses</div>
                          <div class="q-box-content" style="color: #b91c1c; font-weight: 500;">
                            ${qData.mistakesWeaknesses || 'Awaiting evaluation'}
                          </div>
                        </div>

                        <!-- 7 Evaluation Criteria Breakdown Table -->
                        ${Array.isArray(qData.criterionBreakdown) && qData.criterionBreakdown.length > 0 ? `
                        <div class="q-box" style="grid-column: 1 / -1; padding: 12px;">
                          <div class="q-box-title" style="margin-bottom: 6px;">7-Criterion Academic Evaluation Dossier</div>
                          <div class="table-responsive">
                            <table class="academic-table" style="font-size: 0.8rem;">
                              <thead>
                                <tr>
                                  <th>Criterion</th>
                                  <th style="text-align: center; width: 14%;">Weight</th>
                                  <th style="text-align: center; width: 14%;">Score</th>
                                  <th style="text-align: right; width: 14%;">Contribution</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${qData.criterionBreakdown.map(item => `
                                  <tr>
                                    <td>
                                      <strong style="color: var(--color-primary-navy);">${item.label}</strong>
                                      <div style="font-size: 0.72rem; color: var(--color-text-muted);">${item.explanation}</div>
                                    </td>
                                    <td style="text-align: center;">${item.weight}%</td>
                                    <td style="text-align: center; font-weight: 700; color: var(--color-primary-navy);">${item.score}/100</td>
                                    <td style="text-align: right; font-weight: 800; color: var(--color-primary-navy);">${item.contribution}</td>
                                  </tr>
                                `).join('')}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        ` : ''}

                        <div class="q-box" style="grid-column: 1 / -1;">
                          <div class="q-box-title">Competitor Moves & Market Changes</div>
                          <div class="q-box-content">
                            ${qData.marketResponseEvaluation || 'Awaiting evaluation'}
                          </div>
                        </div>
                      </div>
                    `
                    }
                  </div>
                `
                }
              </div>
            </div>
          `;
          })
          .join('')}
      </div>
    </div>
  `;
}

export function initProfessorReportEvents() {
  // Back to Dashboard
  const backBtn = document.getElementById('btn-back-to-dashboard');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      store.setView('professor-dashboard', { teamId: null });
    });
  }

  // Accordion Toggles
  document.querySelectorAll('[data-toggle-quarter]').forEach((header) => {
    header.addEventListener('click', () => {
      const parent = header.closest('.accordion-item');
      if (parent) {
        parent.classList.toggle('open');
      }
    });
  });

  // Expand All / Collapse All
  const expandAllBtn = document.getElementById('btn-expand-all');
  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.accordion-item').forEach((item) => item.classList.add('open'));
    });
  }

  const collapseAllBtn = document.getElementById('btn-collapse-all');
  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.accordion-item').forEach((item) => item.classList.remove('open'));
    });
  }

  // Grade Quarter with Gemini
  document.querySelectorAll('[data-grade-quarter]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const quarterNum = parseInt(btn.getAttribute('data-grade-quarter'), 10);
      const teamId = btn.getAttribute('data-team-id');

      btn.disabled = true;
      btn.innerText = 'Evaluating with Gemini...';
      await store.executeQuarterSimulation(teamId, quarterNum);
    });
  });
}
