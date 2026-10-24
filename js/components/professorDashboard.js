/**
 * Academic Business Strategy Simulation Platform
 * Professor View A: Cohort Management & Scoring Dashboard
 * 
 * Implements Prompt 3:
 * - Roster of all teams with Latest Score, Cumulative Score, Industry, and Status
 * - Sorting by cumulative score, industry, and team name
 * - Compact Configurable Scoring Settings section to view/modify the 7 criteria weights with live validation
 * - 8-quarter cohort progression matrix
 * - Final rankings when 8 quarters are reached
 */

import { store } from '../state.js';
import { INDUSTRIES, SIMULATION_QUARTERS } from '../constants.js';
import { scoringService } from '../scoring.js';

let currentSortField = 'cumulativeScore'; // 'cumulativeScore' | 'name' | 'industry'
let currentSortDir = 'desc'; // 'asc' | 'desc'
let isSettingsExpanded = false;

export function renderProfessorDashboard() {
  const state = store.getState();
  let teams = [...state.teams];

  // Apply sorting
  teams.sort((a, b) => {
    let comp = 0;
    if (currentSortField === 'cumulativeScore') {
      comp = (b.cumulativeScore || 0) - (a.cumulativeScore || 0);
    } else if (currentSortField === 'name') {
      comp = a.name.localeCompare(b.name);
    } else if (currentSortField === 'industry') {
      const indA = store.getIndustry(a.industryId)?.name || '';
      const indB = store.getIndustry(b.industryId)?.name || '';
      comp = indA.localeCompare(indB);
    }
    return currentSortDir === 'desc' ? comp : -comp;
  });

  const totalTeams = teams.length;
  const pendingSubmissions = teams.filter((t) => t.status === 'submitted').length;
  const evaluatedTeams = teams.filter((t) => t.status === 'evaluated').length;

  const criteria = scoringService.getCriteria();
  const currentWeightsSum = criteria.reduce((sum, c) => sum + Number(c.weight), 0);
  const isWeightValid = Math.round(currentWeightsSum) === 100;

  // Check if simulation completed Q8
  const isSimulationComplete = teams.some(t => t.currentQuarter >= 8 && t.quarterlyData[7]?.status === 'evaluated');

  return `
    <div class="professor-dashboard-view">
      <div class="dashboard-header-block" style="margin-bottom: var(--space-lg);">
        <h1 class="page-title">Simulation Management & Scoring Cohort</h1>
        <p class="page-subtitle">Academic cohort management, configurable scoring formula, and cross-quarter performance evaluations.</p>
      </div>

      <!-- Stat Strip -->
      <div class="stat-strip">
        <div class="stat-card">
          <div class="stat-label">Total Student Teams</div>
          <div class="stat-value">${totalTeams}</div>
          <div class="stat-caption">Active simulation cohort</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Decisions Evaluated</div>
          <div class="stat-value" style="color: var(--color-primary-navy);">${evaluatedTeams}</div>
          <div class="stat-caption">Decisions scored & published</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Evaluation Criteria</div>
          <div class="stat-value">7 Criteria</div>
          <div class="stat-caption">Configurable weights formula</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Simulation Horizon</div>
          <div class="stat-value" style="font-size: 1.2rem; font-weight: 700;">8 Quarters</div>
          <div class="stat-caption">Oct 2024 – Oct 2026</div>
        </div>
      </div>

      <!-- Compact Configurable Scoring Settings Section (Prompt 3 Section 1) -->
      <div class="card" style="padding: var(--space-md) var(--space-lg); margin-bottom: var(--space-lg); border: 1px solid var(--color-primary-navy);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 1.05rem; font-weight: 700; color: var(--color-primary-navy); margin-bottom: 2px;">
              Configurable Academic Scoring Framework
            </h2>
            <p style="font-size: 0.8rem; color: var(--color-text-light); margin-bottom: 0;">
              Adjust evaluation weights across the 7 academic criteria. Total must equal 100%. Historical quarters remain explainable.
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 0.8rem; font-weight: 700; padding: 4px 10px; border-radius: 4px; ${isWeightValid ? 'background: #d1fae5; color: #065f46;' : 'background: #fee2e2; color: #991b1b;'}">
              Weights Total: ${Math.round(currentWeightsSum)}%
            </span>
            <button type="button" class="btn btn-outline btn-sm" id="btn-toggle-scoring-settings">
              ${isSettingsExpanded ? '▲ Hide Settings' : '⚙ Adjust Weights'}
            </button>
          </div>
        </div>

        <div id="scoring-settings-form-container" style="display: ${isSettingsExpanded ? 'block' : 'none'}; margin-top: var(--space-md); border-top: 1px dashed var(--color-border-subtle); padding-top: var(--space-md);">
          <form id="form-scoring-weights" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-bottom: 12px;">
            ${criteria.map(c => `
              <div style="background: #f8fafc; border: 1px solid var(--color-border-subtle); padding: 8px 12px; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <label for="weight-${c.id}" style="font-weight: 700; font-size: 0.8rem; color: var(--color-primary-navy);">${c.label}</label>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <input 
                      type="number" 
                      id="weight-${c.id}" 
                      name="${c.id}" 
                      value="${c.weight}" 
                      min="0" 
                      max="100" 
                      step="1"
                      class="weight-input"
                      style="width: 55px; padding: 3px 6px; font-weight: 700; border: 1px solid #cbd5e1; border-radius: 4px; text-align: right;"
                    />
                    <span style="font-size: 0.8rem; font-weight: 600;">%</span>
                  </div>
                </div>
                <div style="font-size: 0.72rem; color: var(--color-text-muted);">${c.description}</div>
              </div>
            `).join('')}
          </form>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div id="weights-validation-msg" style="font-size: 0.82rem; font-weight: 600; color: ${isWeightValid ? '#059669' : '#dc2626'};">
              ${isWeightValid ? '✓ Valid configuration: Weights sum to exactly 100%.' : `⚠ Weights sum to ${Math.round(currentWeightsSum)}%. Must adjust to 100% to save.`}
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn btn-ghost btn-sm" id="btn-reset-weights">
                Reset to Defaults
              </button>
              <button type="button" class="btn btn-primary btn-sm" id="btn-save-weights">
                Save & Apply to Future Evaluations
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cohort Team Roster Table with Column Sorting -->
      <div class="card" style="padding: 0; overflow: hidden; margin-bottom: var(--space-lg);">
        <div style="padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--color-border-subtle); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h2 style="font-size: 1.1rem; font-weight: 700; color: var(--color-primary-navy);">Cohort Team Roster & Leaderboard</h2>
            <p style="font-size: 0.8rem; color: var(--color-text-light);">
              Sort teams by score or industry, inspect latest quarterly grades, or click any team to open their detailed report card.
            </p>
          </div>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn btn-ghost btn-sm" data-sort-by="cumulativeScore" title="Sort by Cumulative Score">
              Sort Score ${currentSortField === 'cumulativeScore' ? (currentSortDir === 'desc' ? '▼' : '▲') : ''}
            </button>
            <button type="button" class="btn btn-ghost btn-sm" data-sort-by="industry" title="Sort by Industry">
              Sort Industry ${currentSortField === 'industry' ? (currentSortDir === 'desc' ? '▼' : '▲') : ''}
            </button>
            <button type="button" class="btn btn-ghost btn-sm" data-sort-by="name" title="Sort by Team Name">
              Sort Name ${currentSortField === 'name' ? (currentSortDir === 'desc' ? '▼' : '▲') : ''}
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="academic-table">
            <thead>
              <tr>
                <th style="width: 18%;">Team Name</th>
                <th style="width: 26%;">Assigned Industry</th>
                <th style="width: 12%;">Quarter</th>
                <th style="width: 14%;">Status</th>
                <th style="width: 10%; text-align: center;">Latest Score</th>
                <th style="width: 10%; text-align: center; background: var(--color-primary-light);">Cumulative</th>
                <th style="width: 10%; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${teams.map((team, idx) => {
                const q = store.getQuarter(team.currentQuarter);
                const latestEvaluated = team.quarterlyData.slice().reverse().find((item) => item.status === 'evaluated' && item.score !== null);
                const latestScoreText = latestEvaluated ? `${latestEvaluated.score} / 100` : '—';
                const cumulativeScoreText = team.cumulativeScore > 0 ? `${team.cumulativeScore} / 100` : '—';

                return `
                <tr data-team-row="${team.id}" style="cursor: pointer;">
                  <td>
                    <div style="font-weight: 700; color: var(--color-primary-dark);">${team.name}</div>
                    <div style="font-size: 0.72rem; color: var(--color-text-muted);">Rank #${idx + 1} &bull; ID: ${team.id}</div>
                  </td>
                  <td onclick="event.stopPropagation();">
                    <select 
                      class="inline-select" 
                      data-industry-select="${team.id}" 
                      title="Change assigned industry"
                    >
                      ${INDUSTRIES.map(ind => `
                        <option value="${ind.id}" ${ind.id === team.industryId ? 'selected' : ''}>
                          ${ind.name}
                        </option>
                      `).join('')}
                    </select>
                  </td>
                  <td>
                    <span style="font-weight: 700; color: var(--color-primary-navy);">${q.code}</span>
                    <div style="font-size: 0.72rem; color: var(--color-text-muted);">${q.dates}</div>
                  </td>
                  <td>
                    <span class="status-badge ${team.status}">
                      ${team.status === 'evaluated' ? 'Evaluated' : team.status === 'submitted' ? 'Submitted' : 'In Progress'}
                    </span>
                  </td>
                  <td style="text-align: center; font-weight: 700; color: var(--color-primary-navy);">
                    ${latestScoreText}
                  </td>
                  <td style="text-align: center; font-weight: 800; font-size: 1.05rem; color: var(--color-primary-navy); background: #f8fafc;">
                    ${cumulativeScoreText}
                  </td>
                  <td style="text-align: right;" onclick="event.stopPropagation();">
                    <button 
                      type="button" 
                      class="btn btn-outline btn-sm" 
                      data-view-report="${team.id}"
                      title="Open Team Performance Report"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 8-Quarter Cohort Progression Matrix -->
      <div class="card" style="padding: var(--space-lg); margin-bottom: var(--space-lg);">
        <div style="margin-bottom: var(--space-md); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h2 style="font-size: 1.1rem; font-weight: 700; color: var(--color-primary-navy); margin-bottom: 2px;">
              8-Quarter Cohort Score Progression Matrix
            </h2>
            <p style="font-size: 0.8rem; color: var(--color-text-light);">
              Chronological score history across all simulation quarters (Apr 2024 – Mar 2026).
            </p>
          </div>
          <span style="font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted);">
            7-Criteria Deterministic Model
          </span>
        </div>

        <div class="table-responsive">
          <table class="academic-table" style="font-size: 0.82rem;">
            <thead>
              <tr>
                <th style="width: 18%;">Team Name</th>
                <th style="width: 7%; text-align: center;">Q1</th>
                <th style="width: 7%; text-align: center;">Q2</th>
                <th style="width: 7%; text-align: center;">Q3</th>
                <th style="width: 7%; text-align: center;">Q4</th>
                <th style="width: 7%; text-align: center;">Q5</th>
                <th style="width: 7%; text-align: center;">Q6</th>
                <th style="width: 7%; text-align: center;">Q7</th>
                <th style="width: 7%; text-align: center;">Q8</th>
                <th style="width: 12%; text-align: center; background: var(--color-primary-navy); color: var(--color-white);">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              ${teams.map((team) => `
                <tr>
                  <td style="font-weight: 700; color: var(--color-primary-navy);">${team.name}</td>
                  ${team.quarterlyData.map(q => {
                    const hasScore = q.status === 'evaluated' && q.score !== null;
                    return `
                      <td style="text-align: center;">
                        ${hasScore
                          ? `<span style="font-weight: 700; color: var(--color-primary-navy); background: var(--color-primary-light); padding: 2px 6px; border-radius: 3px;">${q.score}</span>`
                          : `<span style="color: #94a3b8; font-size: 0.75rem;">${q.status === 'submitted' ? 'Review' : '—'}</span>`
                        }
                      </td>
                    `;
                  }).join('')}
                  <td style="text-align: center; font-weight: 800; font-size: 0.95rem; color: var(--color-primary-navy); background: #f8fafc;">
                    ${team.cumulativeScore > 0 ? `${team.cumulativeScore} / 100` : '—'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Final Rankings Display (Prompt 3 Section 16) -->
      ${isSimulationComplete ? `
      <div class="card" style="padding: var(--space-lg); border: 2px solid var(--color-primary-navy); background: #f8fafc;">
        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--color-primary-navy); margin-bottom: 4px;">
          🏆 Final Academic Simulation Rankings (8 Completed Quarters)
        </h2>
        <p style="font-size: 0.85rem; color: var(--color-text-light); margin-bottom: var(--space-md);">
          Final standing calculated based on arithmetic mean of completed quarters under configured academic criteria.
        </p>
        <div class="table-responsive">
          <table class="academic-table">
            <thead>
              <tr>
                <th style="width: 10%;">Rank</th>
                <th>Team Name</th>
                <th>Industry</th>
                <th style="text-align: center;">Quarters Completed</th>
                <th style="text-align: right;">Final Cumulative Score</th>
              </tr>
            </thead>
            <tbody>
              ${teams.slice().sort((a,b) => b.cumulativeScore - a.cumulativeScore).map((t, idx) => `
                <tr style="${idx === 0 ? 'background: #fef9c3; font-weight: 700;' : ''}">
                  <td style="font-weight: 800; color: var(--color-primary-navy);">#${idx + 1} ${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}</td>
                  <td>${t.name}</td>
                  <td>${store.getIndustry(t.industryId)?.name}</td>
                  <td style="text-align: center;">${t.quarterlyData.filter(q => q.status === 'evaluated').length} / 8</td>
                  <td style="text-align: right; font-weight: 800; font-size: 1.1rem; color: var(--color-primary-navy);">${t.cumulativeScore} / 100</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ` : ''}

    </div>
  `;
}

export function initProfessorDashboardEvents() {
  // Sort Buttons
  document.querySelectorAll('[data-sort-by]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const field = e.currentTarget.getAttribute('data-sort-by');
      if (currentSortField === field) {
        currentSortDir = currentSortDir === 'desc' ? 'asc' : 'desc';
      } else {
        currentSortField = field;
        currentSortDir = 'desc';
      }
      store.notify();
    });
  });

  // Toggle Settings
  const toggleSettingsBtn = document.getElementById('btn-toggle-scoring-settings');
  if (toggleSettingsBtn) {
    toggleSettingsBtn.addEventListener('click', () => {
      isSettingsExpanded = !isSettingsExpanded;
      store.notify();
    });
  }

  // Weight Inputs Live Validation
  const form = document.getElementById('form-scoring-weights');
  if (form) {
    const inputs = form.querySelectorAll('.weight-input');
    const updateSum = () => {
      let sum = 0;
      inputs.forEach(inp => {
        sum += Number(inp.value) || 0;
      });
      const validMsg = document.getElementById('weights-validation-msg');
      if (validMsg) {
        if (Math.round(sum) === 100) {
          validMsg.style.color = '#059669';
          validMsg.innerText = '✓ Valid configuration: Weights sum to exactly 100%.';
        } else {
          validMsg.style.color = '#dc2626';
          validMsg.innerText = `⚠ Weights sum to ${Math.round(sum)}%. Must adjust to exactly 100% to save.`;
        }
      }
    };
    inputs.forEach(inp => inp.addEventListener('input', updateSum));
  }

  // Save Weights Button
  const saveWeightsBtn = document.getElementById('btn-save-weights');
  if (saveWeightsBtn) {
    saveWeightsBtn.addEventListener('click', () => {
      const form = document.getElementById('form-scoring-weights');
      if (!form) return;
      const formData = new FormData(form);
      const newWeights = {};
      formData.forEach((val, key) => {
        newWeights[key] = Number(val);
      });

      const res = store.updateScoringWeights(newWeights);
      if (res.success) {
        isSettingsExpanded = false;
        store.notify();
      }
    });
  }

  // Reset Weights Button
  const resetWeightsBtn = document.getElementById('btn-reset-weights');
  if (resetWeightsBtn) {
    resetWeightsBtn.addEventListener('click', () => {
      const defaultWeights = {
        strategicDecisionQuality: 20,
        reasoningAndEvidence: 15,
        marketAdaptability: 20,
        financialManagement: 15,
        competitivePerformance: 10,
        riskAssessment: 10,
        learningFromDecisions: 10
      };
      store.updateScoringWeights(defaultWeights);
      store.notify();
    });
  }

  // Industry Select change
  document.querySelectorAll('[data-industry-select]').forEach((select) => {
    select.addEventListener('change', (e) => {
      const teamId = e.target.getAttribute('data-industry-select');
      const newIndustryId = e.target.value;
      store.assignTeamIndustry(teamId, newIndustryId);
    });
  });

  // View Report buttons
  document.querySelectorAll('[data-view-report]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const teamId = e.currentTarget.getAttribute('data-view-report');
      store.setView('professor-report', { teamId });
    });
  });

  // Row clicks open report
  document.querySelectorAll('[data-team-row]').forEach((row) => {
    row.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'select' || e.target.tagName.toLowerCase() === 'button') {
        return;
      }
      const teamId = row.getAttribute('data-team-row');
      store.setView('professor-report', { teamId });
    });
  });
}
