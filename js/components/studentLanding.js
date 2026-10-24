/**
 * Academic Business Strategy Simulation Platform
 * Student View A: Student Landing View
 */

import { store } from '../state.js';

let activeTabId = 'tab-overview';

export function renderStudentLanding() {
  const state = store.getState();
  const team = store.getCurrentTeam();
  const industry = store.getIndustry(team.industryId);
  const currentQ = store.getQuarter(team.currentQuarter);

  const hasStarted = (store.getConversation(team.id, team.currentQuarter).length > 1) || Boolean(team.quarterlyData[team.currentQuarter - 1]?.strategy);
  const startBtnLabel = hasStarted ? `Continue Simulation (${currentQ.code}) →` : `Start Simulation (${currentQ.code}) →`;

  return `
    <div class="student-landing-view">
      <!-- Hero / Assignment Card -->
      <div class="student-hero">
        <div class="hero-info">
          <div class="team-subhead">Team Workspace: ${team.name}</div>
          <h1 class="industry-head">${industry.name}</h1>
          <div class="quarter-callout">
            <strong>Active Simulation Period:</strong> ${currentQ.name} (${currentQ.dates}) &bull; Status: 
            <span class="status-badge ${team.status}" style="margin-left: 4px;">
              ${team.status === 'submitted' ? 'Submitted' : team.status === 'evaluated' ? 'Evaluated' : 'In Progress'}
            </span>
          </div>
        </div>

        <div>
          <button type="button" class="btn btn-primary btn-lg" id="btn-enter-simulation" style="font-size: 1.05rem;">
            ${startBtnLabel}
          </button>
        </div>
      </div>

      <!-- Concise Industry Overview Section with Structured Frameworks -->
      <div class="card" style="padding: var(--space-lg);">
        <div style="margin-bottom: var(--space-md); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h2 class="section-title" style="margin-bottom: 2px;">Academic Industry Dossier & Strategic Frameworks</h2>
            <p style="font-size: 0.82rem; color: var(--color-text-light);">
              Essential market intelligence for ${industry.name} prior to quarterly decision submission.
            </p>
          </div>
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--color-primary-navy); background: var(--color-primary-light); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--color-primary-border);">
            ${industry.competitors.length} Key Competitors Tracked
          </span>
        </div>

        <!-- Framework Tabs -->
        <div class="overview-tabs">
          <button type="button" class="overview-tab-btn ${activeTabId === 'tab-overview' ? 'active' : ''}" data-target-tab="tab-overview">
            1. Industry Overview
          </button>
          <button type="button" class="overview-tab-btn ${activeTabId === 'tab-competitors' ? 'active' : ''}" data-target-tab="tab-competitors">
            2. Competitors & Market Share
          </button>
          <button type="button" class="overview-tab-btn ${activeTabId === 'tab-products' ? 'active' : ''}" data-target-tab="tab-products">
            3. Products & Services
          </button>
          <button type="button" class="overview-tab-btn ${activeTabId === 'tab-customers' ? 'active' : ''}" data-target-tab="tab-customers">
            4. Customer Perceptions
          </button>
          <button type="button" class="overview-tab-btn ${activeTabId === 'tab-porter' ? 'active' : ''}" data-target-tab="tab-porter">
            5. Porter's Five Forces
          </button>
          <button type="button" class="overview-tab-btn ${activeTabId === 'tab-pestle' ? 'active' : ''}" data-target-tab="tab-pestle">
            6. PESTLE Analysis
          </button>
        </div>

        <!-- Tab 1: Industry Overview -->
        <div class="tab-pane ${activeTabId === 'tab-overview' ? 'active' : ''}" id="tab-overview">
          <div style="background: var(--color-primary-light); border: 1px solid var(--color-primary-border); border-radius: var(--radius-sm); padding: var(--space-md); margin-bottom: var(--space-md);">
            <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-light); margin-bottom: 4px;">Industry Charter</div>
            <p style="font-size: 0.95rem; color: var(--color-primary-dark); font-weight: 600; margin-bottom: 8px;">${industry.tagline}</p>
            ${industry.geographicScope ? `
            <div style="font-size: 0.85rem; color: var(--color-text-main); border-top: 1px dashed var(--color-primary-border); padding-top: 8px;">
              <strong style="color: var(--color-primary-navy);">Geographic Scope:</strong> ${industry.geographicScope}
            </div>` : ''}
          </div>
          <div style="font-size: 0.92rem; line-height: 1.6; color: var(--color-text-main);">
            <p>${industry.summary}</p>
          </div>
        </div>

        <!-- Tab 2: Top Five Competitors and Market Shares -->
        <div class="tab-pane ${activeTabId === 'tab-competitors' ? 'active' : ''}" id="tab-competitors">
          <div class="table-responsive">
            <table class="academic-table">
              <thead>
                <tr>
                  <th style="width: 28%;">Competitor Name</th>
                  <th style="width: 18%;">Market Share</th>
                  <th style="width: 34%;">Strategic Focus & Positioning</th>
                  <th style="width: 20%;">Pricing / Value Tier</th>
                </tr>
              </thead>
              <tbody>
                ${industry.competitors
                  .map(
                    (comp) => `
                  <tr>
                    <td style="font-weight: 700; color: var(--color-primary-navy);">${comp.name}</td>
                    <td>
                      <span style="font-weight: 700; background: var(--color-primary-light); padding: 3px 8px; border-radius: 4px; border: 1px solid var(--color-primary-border);">
                        ${comp.marketShare}
                      </span>
                    </td>
                    <td style="color: var(--color-text-main); font-size: 0.88rem;">${comp.focus}</td>
                    <td><span style="font-size: 0.82rem; color: var(--color-text-muted); font-weight: 600;">${comp.tier}</span></td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 3: Popular Products and Services -->
        <div class="tab-pane ${activeTabId === 'tab-products' ? 'active' : ''}" id="tab-products">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-md);">
            ${industry.popularProducts
              .map(
                (prod) => `
              <div class="q-box">
                <div class="q-box-title" style="color: var(--color-primary-navy);">${prod.category}</div>
                <div class="q-box-content">${prod.items}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Tab 4: Customer Perceptions and Preferences -->
        <div class="tab-pane ${activeTabId === 'tab-customers' ? 'active' : ''}" id="tab-customers">
          <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
            ${industry.customerPerceptions
              .map(
                (item) => `
              <div style="padding: var(--space-md); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); background: #fbfcfe;">
                <div style="font-weight: 700; color: var(--color-primary-navy); font-size: 0.92rem; margin-bottom: 4px;">
                  ${item.factor}
                </div>
                <div style="font-size: 0.88rem; color: var(--color-text-muted); line-height: 1.5;">
                  ${item.insight}
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Tab 5: Porter's Five Forces -->
        <div class="tab-pane ${activeTabId === 'tab-porter' ? 'active' : ''}" id="tab-porter">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-md);">
            ${industry.portersFiveForces
              .map(
                (f) => `
              <div class="q-box">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span class="q-box-title" style="margin-bottom: 0;">${f.force}</span>
                  <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-primary-navy); background: var(--color-primary-light); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--color-primary-border);">
                    ${f.level}
                  </span>
                </div>
                <div class="q-box-content" style="font-size: 0.85rem;">${f.detail}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Tab 6: PESTLE Analysis -->
        <div class="tab-pane ${activeTabId === 'tab-pestle' ? 'active' : ''}" id="tab-pestle">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-md);">
            ${industry.pestleAnalysis
              .map(
                (p) => `
              <div class="q-box">
                <div class="q-box-title" style="color: var(--color-primary-navy);">${p.dimension}</div>
                <div class="q-box-content" style="font-size: 0.85rem;">${p.insight}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initStudentLandingEvents() {
  const enterBtn = document.getElementById('btn-enter-simulation');
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      store.setView('student-chat');
    });
  }

  // Framework Tabs
  document.querySelectorAll('[data-target-tab]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('data-target-tab');
      activeTabId = targetId;

      document.querySelectorAll('.overview-tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add('active');
    });
  });
}
