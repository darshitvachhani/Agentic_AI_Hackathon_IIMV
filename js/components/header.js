/**
 * Academic Business Strategy Simulation Platform
 * Header Component with Role Switcher & Period Indicator
 */

import { store } from '../state.js';

export function renderHeader() {
  const state = store.getState();
  const currentTeam = store.getCurrentTeam();
  const currentQuarter = store.getQuarter(currentTeam.currentQuarter);

  const isStudent = state.currentRole === 'student';
  const roleLabel = isStudent ? 'Student Mode' : 'Professor Mode';
  const avatarLetter = isStudent ? 'S' : 'P';
  const isIdeation = currentTeam.currentQuarter === 0;
  const ongoingPeriodText = isIdeation
    ? '💡 Ongoing: Startup Formation & Ideation'
    : `📅 Ongoing: ${currentQuarter.name} (${currentQuarter.dates})`;

  return `
    <header class="app-header">
      <div class="header-left">
        <a href="javascript:void(0)" class="brand-title" id="nav-brand-home">
          <span>StrategySim</span>
          <span class="brand-badge">Academic Platform</span>
        </a>
      </div>

      <div class="header-center">
        <div class="period-pill" title="Ongoing Academic Simulation Period">
          <span class="dot" style="${isIdeation ? 'background: #eab308;' : ''}"></span>
          <span style="font-weight: 700;">${ongoingPeriodText}</span>
        </div>
      </div>

      <div class="header-right">
        <span class="current-role-badge">${roleLabel}</span>

        <!-- Circular Profile Icon -->
        <button 
          type="button" 
          class="profile-avatar-btn" 
          id="profile-dropdown-btn" 
          aria-label="User Profile and Role Switch" 
          aria-haspopup="true" 
          aria-expanded="false"
          title="Switch User Role"
        >
          ${avatarLetter}
        </button>

        <!-- Dropdown Menu -->
        <div class="profile-dropdown" id="profile-dropdown-menu">
          <div class="dropdown-header">Switch User Role</div>
          <button 
            type="button" 
            class="dropdown-item ${isStudent ? 'active' : ''}" 
            id="btn-switch-student"
          >
            <span>Switch to Student</span>
            ${isStudent ? '<span class="check">✓</span>' : ''}
          </button>
          <button 
            type="button" 
            class="dropdown-item ${!isStudent ? 'active' : ''}" 
            id="btn-switch-professor"
          >
            <span>Switch to Professor</span>
            ${!isStudent ? '<span class="check">✓</span>' : ''}
          </button>

          ${
            isStudent
              ? `
            <div class="dropdown-header" style="margin-top: 8px;">Active Student Team</div>
            ${state.teams
              .map(
                (t) => `
              <button 
                type="button" 
                class="dropdown-item ${t.id === state.activeTeamId ? 'active' : ''}" 
                data-switch-team="${t.id}"
                style="font-size: 0.82rem;"
              >
                <span>${t.name}</span>
                ${t.id === state.activeTeamId ? '<span class="check">✓</span>' : ''}
              </button>
            `
              )
              .join('')}
          `
              : ''
          }
        </div>
      </div>
    </header>
  `;
}

export function initHeaderEvents() {
  const profileBtn = document.getElementById('profile-dropdown-btn');
  const dropdownMenu = document.getElementById('profile-dropdown-menu');
  const brandHome = document.getElementById('nav-brand-home');

  if (profileBtn && dropdownMenu) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdownMenu.classList.contains('open');
      dropdownMenu.classList.toggle('open', !isOpen);
      profileBtn.setAttribute('aria-expanded', !isOpen);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('open');
        profileBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const btnStudent = document.getElementById('btn-switch-student');
  if (btnStudent) {
    btnStudent.addEventListener('click', () => {
      dropdownMenu?.classList.remove('open');
      store.setRole('student');
    });
  }

  const btnProf = document.getElementById('btn-switch-professor');
  if (btnProf) {
    btnProf.addEventListener('click', () => {
      dropdownMenu?.classList.remove('open');
      store.setRole('professor');
    });
  }

  if (brandHome) {
    brandHome.addEventListener('click', () => {
      const state = store.getState();
      if (state.currentRole === 'professor') {
        store.setView('professor-dashboard', { teamId: null });
      } else {
        store.setView('student-chat');
      }
    });
  }

  // Active student team switcher
  document.querySelectorAll('[data-switch-team]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const teamId = e.currentTarget.getAttribute('data-switch-team');
      dropdownMenu?.classList.remove('open');
      store.setActiveTeam(teamId);
    });
  });
}
