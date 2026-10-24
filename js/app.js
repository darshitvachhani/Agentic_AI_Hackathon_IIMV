/**
 * Academic Business Strategy Simulation Platform
 * Main Application Orchestrator & Screen Router
 */

import { store } from './state.js';
import { renderHeader, initHeaderEvents } from './components/header.js';
import { renderStudentLanding, initStudentLandingEvents } from './components/studentLanding.js';
import { renderStudentChat, initStudentChatEvents } from './components/studentChat.js';
import { renderProfessorDashboard, initProfessorDashboardEvents } from './components/professorDashboard.js';
import { renderProfessorReport, initProfessorReportEvents } from './components/professorReport.js';

class SimulationApp {
  constructor() {
    this.root = document.getElementById('app-root');
    this.init();
  }

  init() {
    // Initial render
    this.render();

    // Subscribe to central state changes
    store.subscribe(() => {
      this.render();
    });
  }

  render() {
    const state = store.getState();

    let viewHtml = '';
    let initEvents = () => {};

    switch (state.activeView) {
      case 'student-landing':
        viewHtml = renderStudentLanding();
        initEvents = initStudentLandingEvents;
        break;
      case 'student-chat':
        viewHtml = renderStudentChat();
        initEvents = initStudentChatEvents;
        break;
      case 'professor-dashboard':
        viewHtml = renderProfessorDashboard();
        initEvents = initProfessorDashboardEvents;
        break;
      case 'professor-report':
        viewHtml = renderProfessorReport();
        initEvents = initProfessorReportEvents;
        break;
      default:
        viewHtml = renderStudentLanding();
        initEvents = initStudentLandingEvents;
    }

    const toastHtml = state.notification
      ? `
      <div class="app-toast" role="status" aria-live="polite">
        <span style="font-size: 1.1rem;">ℹ️</span>
        <span>${state.notification}</span>
      </div>
    `
      : '';

    this.root.innerHTML = `
      ${renderHeader()}
      <main class="main-container">
        ${viewHtml}
      </main>
      ${toastHtml}
    `;

    // Attach event listeners for header and active view
    initHeaderEvents();
    initEvents();
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.simApp = new SimulationApp();
});
