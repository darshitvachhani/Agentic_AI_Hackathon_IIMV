/**
 * Academic Business Strategy Simulation Platform
 * Submission Confirmation & Funding Review Modal Flow with Gemini Simulation
 */

import { store } from '../state.js';

export function renderSubmissionModal() {
  const state = store.getState();
  if (!state.isSubmissionModalOpen) return '';

  const team = store.getCurrentTeam();
  const currentQ = store.getQuarter(team.currentQuarter);
  const qData = team.quarterlyData.find((q) => q.quarter === team.currentQuarter) || {};

  const draft = state.draftSubmission;
  const isConfirmed = state.submissionConfirmed || (team.status === 'submitted' || team.status === 'evaluated');
  const isEvaluating = state.isEvaluating;
  const resultsAvailable = Boolean(qData.resultsAvailable);
  const isLastQuarter = team.currentQuarter === 8;

  return `
    <div class="modal-backdrop" id="submission-modal-backdrop">
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        
        <!-- Modal Header -->
        <div class="modal-header">
          <div>
            <h3 class="modal-title" id="modal-title">
              ${
                isEvaluating
                  ? `Simulating ${currentQ.name} Market Dynamics...`
                  : isConfirmed
                  ? `${currentQ.name} Submission Confirmation`
                  : `Review & Submit: ${currentQ.name}`
              }
            </h3>
            <div style="font-size: 0.8rem; color: var(--color-text-muted);">
              ${team.name} &bull; ${store.getIndustry(team.industryId).name} &bull; ${currentQ.dates}
            </div>
          </div>
          ${!isEvaluating ? '<button type="button" class="btn btn-ghost btn-sm" id="btn-modal-close-x" title="Close" style="font-size: 1.1rem; padding: 2px 8px;">✕</button>' : ''}
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          ${
            isEvaluating
              ? `
            <!-- Loading Indicator while Gemini evaluates strategy -->
            <div style="text-align: center; padding: var(--space-xl) var(--space-md);">
              <div style="width: 48px; height: 48px; border: 4px solid var(--color-primary-light); border-top: 4px solid var(--color-primary-navy); border-radius: 50%; margin: 0 auto 16px; animation: spin 0.8s linear infinite;"></div>
              <h4 style="font-size: 1.3rem; font-weight: 800; color: var(--color-primary-navy); margin-bottom: 6px;">
                Simulating ${currentQ.name} Outcomes with Gemini...
              </h4>
              <p style="font-size: 0.9rem; color: var(--color-text-muted); max-width: 480px; margin: 0 auto 12px;">
                Gemini is analyzing your proposed strategy against competitor moves, evaluating pricing elasticity, and computing quarterly revenues, cash burn, and academic decision quality.
              </p>
              <div style="font-size: 0.78rem; color: var(--color-text-light); font-style: italic;">
                Please wait a moment while the simulation model processes your submission...
              </div>
            </div>
          `
              : !isConfirmed
              ? `
            <!-- Strategy Input Review Form -->
            <div class="form-group">
              <label class="form-label" for="submit-strategy-input">
                Proposed Quarterly Strategy <span style="color: #c2410c;">*</span>
              </label>
              <textarea 
                id="submit-strategy-input" 
                class="form-control" 
                rows="4" 
                placeholder="Describe your market entry, operational focus, pricing, and distribution plans for this quarter..."
              >${draft.strategy || ''}</textarea>
              <div style="font-size: 0.75rem; color: var(--color-text-light); margin-top: 3px;">
                Clearly define key strategic initiatives for ${currentQ.name}.
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="submit-reasoning-input">
                Strategic Reasoning & Economic Rationale <span style="color: #c2410c;">*</span>
              </label>
              <textarea 
                id="submit-reasoning-input" 
                class="form-control" 
                rows="3" 
                placeholder="Explain why this strategy was chosen, taking into account competitor positions, Porter's forces, and market risks..."
              >${draft.reasoning || ''}</textarea>
              <div style="font-size: 0.75rem; color: var(--color-text-light); margin-top: 3px;">
                Ground your reasoning in the industry dossier data.
              </div>
            </div>

            <!-- Optional Funding and Loan UI Section -->
            <div class="funding-config-box">
              <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: var(--color-primary-navy); letter-spacing: 0.04em; margin-bottom: 8px;">
                Capital & Financing Request (Optional)
              </div>
              <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: var(--space-sm);">
                Specify whether your strategy requires an external equity investment or a debt loan facility for this quarter.
              </p>

              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="fundingRequiredRadio" value="no" ${!draft.fundingRequired ? 'checked' : ''} id="funding-radio-no" />
                  <span>No Financing Required (Bootstrapped / Existing Cash)</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="fundingRequiredRadio" value="yes" ${draft.fundingRequired ? 'checked' : ''} id="funding-radio-yes" />
                  <span>Request Funding / Loan</span>
                </label>
              </div>

              <!-- Conditional Funding Fields -->
              <div id="funding-details-fields" style="${draft.fundingRequired ? 'display: block;' : 'display: none;'} margin-top: var(--space-sm); border-top: 1px solid var(--color-border-subtle); padding-top: var(--space-sm);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-sm);">
                  <div>
                    <label class="form-label" for="funding-amount-input">Amount Requested</label>
                    <input 
                      type="text" 
                      id="funding-amount-input" 
                      class="form-control" 
                      placeholder="e.g. ₹75,00,000" 
                      value="${draft.fundingAmount || ''}"
                    />
                  </div>
                  <div>
                    <label class="form-label" for="funding-type-select">Type of Funding</label>
                    <select id="funding-type-select" class="form-select">
                      <option value="Equity Investment" ${draft.fundingType === 'Equity Investment' ? 'selected' : ''}>Equity Investment</option>
                      <option value="Loan" ${draft.fundingType === 'Loan' ? 'selected' : ''}>Loan (Debt Facility)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="form-label" for="funding-purpose-input">Planned Use of Funds</label>
                  <textarea 
                    id="funding-purpose-input" 
                    class="form-control" 
                    rows="2" 
                    placeholder="Explain how the funds will be allocated (e.g. dark store capital expenditure, inventory, tech hiring)..."
                  >${draft.fundingPurpose || ''}</textarea>
                </div>
              </div>
            </div>
          `
              : `
            <!-- Post-Submission Confirmed View -->
            <div style="text-align: center; padding: var(--space-sm) 0;">
              <div style="width: 56px; height: 56px; border-radius: 50%; background-color: var(--color-primary-light); border: 2px solid var(--color-primary-navy); color: var(--color-primary-navy); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto var(--space-md);">
                ✓
              </div>
              <h4 style="font-size: 1.3rem; font-weight: 800; color: var(--color-primary-navy); margin-bottom: 4px;">
                ${currentQ.name} Strategy Evaluated Successfully!
              </h4>
              <p style="font-size: 0.9rem; color: var(--color-text-muted); max-width: 480px; margin: 0 auto var(--space-md);">
                Gemini has evaluated your quarterly strategy and generated simulated market outcomes.
              </p>

              <!-- Scoring Showcase Card -->
              <div style="background: var(--color-primary-light); border: 1px solid var(--color-primary-navy); border-radius: var(--radius-sm); padding: var(--space-md); margin-bottom: var(--space-md); text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--color-primary-navy);">
                    Academic Evaluation Score
                  </span>
                  <span style="font-size: 1.35rem; font-weight: 800; color: var(--color-primary-navy);">
                    ${qData.score !== null ? qData.score + ' / 100' : 'Awaiting evaluation'}
                  </span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px; font-size: 0.85rem;">
                  <div style="background: var(--color-white); padding: 6px; border-radius: 4px; border: 1px solid var(--color-border-subtle);">
                    <div style="color: var(--color-text-light); font-size: 0.72rem;">Market Share</div>
                    <strong>${qData.marketShare || '—'}</strong>
                  </div>
                  <div style="background: var(--color-white); padding: 6px; border-radius: 4px; border: 1px solid var(--color-border-subtle);">
                    <div style="color: var(--color-text-light); font-size: 0.72rem;">Revenue</div>
                    <strong>${qData.financialIndicators?.revenue || '—'}</strong>
                  </div>
                  <div style="background: var(--color-white); padding: 6px; border-radius: 4px; border: 1px solid var(--color-border-subtle);">
                    <div style="color: var(--color-text-light); font-size: 0.72rem;">Cash Position</div>
                    <strong>${qData.financialIndicators?.cashBalance || '—'}</strong>
                  </div>
                </div>

                <div style="font-size: 0.82rem; color: var(--color-text-main); line-height: 1.4;">
                  <strong>Key Feedback:</strong> ${qData.whatWentWell || 'Strategic execution completed.'}
                </div>
              </div>

              ${
                isLastQuarter
                  ? `
                <div style="padding: var(--space-md); background: var(--color-primary-light); border: 2px solid var(--color-primary-navy); border-radius: var(--radius-sm); margin-bottom: var(--space-md);">
                  <h5 style="font-weight: 800; color: var(--color-primary-navy); margin-bottom: 4px; font-size: 1rem;">
                    🎓 8-Quarter Simulation Complete!
                  </h5>
                  <p style="font-size: 0.85rem; color: var(--color-text-muted);">
                    Congratulations! Team ${team.name} has concluded the entire October 2024 to October 2026 business cycle. Final Cumulative Score: <strong>${team.cumulativeScore}/100</strong>.
                  </p>
                </div>
              `
                  : ''
              }
            </div>
          `
          }
        </div>

        <!-- Modal Footer Actions -->
        <div class="modal-footer">
          ${
            isEvaluating
              ? `
            <div style="font-size: 0.82rem; color: var(--color-text-muted);">Simulation in progress... please wait.</div>
            <button type="button" class="btn btn-outline" disabled>Processing...</button>
          `
              : !isConfirmed
              ? `
            <button type="button" class="btn btn-outline" id="btn-modal-back-edit">
              ← Go Back and Edit
            </button>
            <button type="button" class="btn btn-primary" id="btn-modal-confirm-submit">
              Confirm Submission ✓
            </button>
          `
              : `
            <button type="button" class="btn btn-outline" id="btn-modal-view-results">
              View Market Snapshot & Scores
            </button>
            <div style="display: flex; gap: var(--space-xs);">
              ${
                resultsAvailable && !isLastQuarter
                  ? `
                <button type="button" class="btn btn-primary" id="btn-modal-advance-quarter">
                  Proceed to Quarter ${team.currentQuarter + 1} →
                </button>
              `
                  : `
                <button type="button" class="btn btn-primary" id="btn-modal-close-done">
                  Return to Workspace
                </button>
              `
              }
            </div>
          `
          }
        </div>

      </div>
    </div>
  `;
}

export function initSubmissionModalEvents() {
  const backdrop = document.getElementById('submission-modal-backdrop');
  if (!backdrop) return;

  const closeX = document.getElementById('btn-modal-close-x');
  const backEdit = document.getElementById('btn-modal-back-edit');
  const closeDone = document.getElementById('btn-modal-close-done');
  const confirmSubmit = document.getElementById('btn-modal-confirm-submit');
  const viewResults = document.getElementById('btn-modal-view-results');
  const advanceQuarter = document.getElementById('btn-modal-advance-quarter');

  // Funding Radio toggles
  const radioYes = document.getElementById('funding-radio-yes');
  const radioNo = document.getElementById('funding-radio-no');
  const fundingDetails = document.getElementById('funding-details-fields');

  const updateFundingDisplay = () => {
    if (radioYes && fundingDetails) {
      fundingDetails.style.display = radioYes.checked ? 'block' : 'none';
      store.setDraftSubmission({ fundingRequired: radioYes.checked }, true);
    }
  };

  radioYes?.addEventListener('change', updateFundingDisplay);
  radioNo?.addEventListener('change', updateFundingDisplay);

  // Sync text inputs to draft state silently as user types
  document.getElementById('submit-strategy-input')?.addEventListener('input', (e) => {
    store.setDraftSubmission({ strategy: e.target.value }, true);
  });

  document.getElementById('submit-reasoning-input')?.addEventListener('input', (e) => {
    store.setDraftSubmission({ reasoning: e.target.value }, true);
  });

  document.getElementById('funding-amount-input')?.addEventListener('input', (e) => {
    store.setDraftSubmission({ fundingAmount: e.target.value }, true);
  });

  document.getElementById('funding-type-select')?.addEventListener('change', (e) => {
    store.setDraftSubmission({ fundingType: e.target.value }, true);
  });

  document.getElementById('funding-purpose-input')?.addEventListener('input', (e) => {
    store.setDraftSubmission({ fundingPurpose: e.target.value }, true);
  });

  // Action: Go Back and Edit
  const handleClose = () => {
    const state = store.getState();
    if (state.isEvaluating) return;
    store.closeSubmissionModal();
  };

  closeX?.addEventListener('click', handleClose);
  backEdit?.addEventListener('click', handleClose);
  closeDone?.addEventListener('click', handleClose);
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      handleClose();
    }
  });

  // Action: Confirm Submission (triggers Gemini outcome simulation)
  confirmSubmit?.addEventListener('click', async () => {
    const state = store.getState();
    if (state.isEvaluating) return;

    const team = store.getCurrentTeam();
    const draft = state.draftSubmission;

    if (!draft.strategy || !draft.strategy.trim()) {
      alert('Please enter your proposed strategy before confirming submission.');
      return;
    }

    if (!draft.reasoning || !draft.reasoning.trim()) {
      alert('Please provide your strategic reasoning and economic rationale.');
      return;
    }

    await store.submitQuarterStrategy(team.id, team.currentQuarter, draft);
  });

  // Action: View Quarter Results
  viewResults?.addEventListener('click', () => {
    store.closeSubmissionModal();
    store.toggleMarketSnapshot(true);
  });

  // Action: Proceed to Next Quarter
  advanceQuarter?.addEventListener('click', () => {
    const team = store.getCurrentTeam();
    store.closeSubmissionModal();
    store.advanceToNextQuarter(team.id);
  });
}
