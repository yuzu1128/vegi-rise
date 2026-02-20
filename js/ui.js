// ui.js - UI utilities for VegiRise (extracted from app.js to break circular dependencies)

import { ACHIEVEMENT_CATEGORIES } from './achievements.js';

// --- Toast ---
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.style.animation = `slideDown 0.3s ease, fadeOut 0.3s ease ${duration - 300}ms forwards`;
  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, duration);
}

// --- Modal ---
let _modalBackdropHandler = null;

export function showModal(html) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  content.innerHTML = html;
  overlay.classList.remove('hidden');

  if (_modalBackdropHandler) {
    overlay.removeEventListener('click', _modalBackdropHandler);
  }
  _modalBackdropHandler = (e) => {
    if (e.target === overlay) {
      hideModal();
    }
  };
  overlay.addEventListener('click', _modalBackdropHandler);
}

export function hideModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
  if (_modalBackdropHandler) {
    overlay.removeEventListener('click', _modalBackdropHandler);
    _modalBackdropHandler = null;
  }
}

// --- XP Gain Animation ---
export function showXPGain(amount) {
  const el = document.createElement('div');
  el.textContent = `+${amount} XP`;
  el.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 28px;
    font-weight: 700;
    color: var(--accent-yellow);
    text-shadow: 0 0 10px rgba(251,191,36,0.5);
    pointer-events: none;
    z-index: 400;
    animation: xpFloat 1.5s ease forwards;
  `;

  if (!document.getElementById('xp-float-style')) {
    const style = document.createElement('style');
    style.id = 'xp-float-style';
    style.textContent = `
      @keyframes xpFloat {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
        30% { opacity: 1; transform: translate(-50%, -60%) scale(1.2); }
        100% { opacity: 0; transform: translate(-50%, -120%) scale(0.8); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

// --- Achievement Popup Queue ---
const _achievementQueue = [];
let _achievementShowing = false;

export function showAchievementPopup(achievement, soundFn) {
  _achievementQueue.push({ achievement, soundFn });
  if (!_achievementShowing) {
    _processNextAchievement();
  }
}

function _processNextAchievement() {
  if (_achievementQueue.length === 0) {
    _achievementShowing = false;
    return;
  }

  _achievementShowing = true;
  const { achievement, soundFn } = _achievementQueue.shift();

  if (soundFn) soundFn();

  const category = ACHIEVEMENT_CATEGORIES[achievement.category] || {};

  const html = `
    <div style="text-align:center;">
      <div style="font-size:64px;margin-bottom:16px;animation:glow 2s ease-in-out infinite;display:inline-block;">
        ${achievement.icon}
      </div>
      <h2 style="color:var(--accent-yellow);margin-bottom:8px;">実績解除!</h2>
      <div style="font-size:18px;font-weight:700;margin-bottom:8px;">${achievement.name}</div>
      <div style="font-size:14px;color:var(--text-secondary);margin-bottom:20px;">${achievement.description}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:20px;">
        ${category.icon || ''} ${category.name || ''}
      </div>
      <button class="btn-primary btn-full" id="modal-close-btn">OK</button>
    </div>
  `;

  showModal(html);

  document.getElementById('modal-close-btn').addEventListener('click', () => {
    hideModal();
    setTimeout(() => _processNextAchievement(), 300);
  });
}
