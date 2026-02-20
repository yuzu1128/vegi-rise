// app.js - Main controller + router for VegiRise

import { DB } from './db.js';
import { Sound } from './sound.js';
import { Store } from './store.js';
import { renderHome, initHome } from './home.js';
import { renderHistory, initHistory } from './history.js';
import { renderAchievements, initAchievements } from './achieve-page.js';
import { renderSettings, initSettings } from './settings.js';

// Page renderers map
const pages = {
  home: { render: renderHome, init: initHome },
  history: { render: renderHistory, init: initHistory },
  achievements: { render: renderAchievements, init: initAchievements },
  settings: { render: renderSettings, init: initSettings },
};

// Cleanup functions for current page (intervals, etc.)
let currentCleanup = null;

// Navigation
function navigate(page) {
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  Store.setState({ currentPage: page });

  document.querySelectorAll('.nav-btn').forEach(btn => {
    const isActive = btn.dataset.page === page;
    btn.classList.toggle('active', isActive);
    if (isActive) {
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.removeAttribute('aria-current');
    }
  });

  const content = document.getElementById('page-content');
  const state = Store.getState();
  const pageHandler = pages[page];
  if (pageHandler) {
    content.innerHTML = pageHandler.render(state);
    const cleanup = pageHandler.init(state);
    if (typeof cleanup === 'function') {
      currentCleanup = cleanup;
    }
  }
}

// Global state getter
export function getState() {
  return Store.getState();
}

// Refresh state from DB
export async function refreshState() {
  await Store.refresh();
}

// Re-render current page
export function rerender() {
  const state = Store.getState();
  navigate(state.currentPage);
}

// Initialize app
async function init() {
  await DB.init();
  Sound.init();

  await Store.refresh();

  // Sync sound enabled state from settings
  const state = Store.getState();
  if (state.settings.soundEnabled === false) {
    Sound.enabled = false;
  }

  // Set up navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      Sound.click();
      navigate(btn.dataset.page);
    });
  });

  // Initial render
  navigate('home');
}

document.addEventListener('DOMContentLoaded', init);
