// app.js - Main controller + router for VegiRise

import { DB } from './db.js';
import { Sound } from './sound.js';
import { renderHome, initHome } from './home.js';
import { renderHistory, initHistory } from './history.js';
import { renderAchievements, initAchievements } from './achieve-page.js';
import { renderSettings, initSettings } from './settings.js';

// App state (in-memory cache)
const state = {
  currentPage: 'home',
  settings: null,
  gameState: null,
};

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

  state.currentPage = page;

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  const content = document.getElementById('page-content');
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
  return state;
}

// Refresh state from DB
export async function refreshState() {
  state.settings = await DB.getSettings();
  state.gameState = await DB.getGameState();
}

// Re-render current page
export function rerender() {
  navigate(state.currentPage);
}

// Initialize app
async function init() {
  await DB.init();
  Sound.init();

  state.settings = await DB.getSettings();
  state.gameState = await DB.getGameState();

  // Sync sound enabled state from settings
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
