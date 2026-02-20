// achieve-page.js - Achievements page for VegiRise

import { Gamification } from './gamification.js';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from './achievements.js';
import { formatGrams } from './utils.js';
import { showModal, hideModal } from './ui.js';

let activeCategory = 'all';

export function renderAchievements(state) {
  const gs = state.gameState || {};
  const levelInfo = Gamification.calculateLevel(gs.xp || 0);
  const unlocked = gs.unlockedAchievements || [];

  // Category buttons
  const categories = Object.entries(ACHIEVEMENT_CATEGORIES);
  const categoryBtns = `
    <button class="cat-btn${activeCategory === 'all' ? ' active' : ''}" data-cat="all">全部</button>
    ${categories.map(([key, cat]) => `
      <button class="cat-btn${activeCategory === key ? ' active' : ''}" data-cat="${key}">
        ${cat.icon} ${cat.name}
      </button>
    `).join('')}
  `;

  // Filter achievements
  const filtered = activeCategory === 'all'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.category === activeCategory);

  // Build badge grid
  const badges = filtered.map(a => {
    const isUnlocked = unlocked.includes(a.id);
    const cls = isUnlocked ? 'unlocked' : 'locked';
    return `
      <div class="badge ${cls}" data-id="${a.id}">
        <div class="badge-icon">${isUnlocked ? a.icon : '🔒'}</div>
        <div class="badge-label">${isUnlocked ? a.name : '???'}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="page-header">
      <h1>🏆 実績</h1>
    </div>

    <!-- Level & XP -->
    <div class="card" style="padding:12px 16px;">
      <div class="xp-info">
        <span class="xp-level">Lv.${levelInfo.level}</span>
        <span class="xp-text">${levelInfo.currentXP} / ${levelInfo.nextLevelXP} XP</span>
      </div>
      <div class="xp-bar">
        <div class="xp-bar-fill" style="width:${Math.round(levelInfo.progress * 100)}%"></div>
      </div>
    </div>

    <!-- Stats -->
    <div class="card" style="padding:12px 16px;">
      <div style="display:flex;justify-content:space-around;text-align:center;">
        <div>
          <div style="font-size:20px;font-weight:700;color:var(--accent-orange);">🔥 ${gs.currentStreak || 0}日</div>
          <div style="font-size:11px;color:var(--text-secondary);">ストリーク</div>
        </div>
        <div>
          <div style="font-size:20px;font-weight:700;color:var(--accent-blue);">📊 ${gs.totalRecordDays || 0}日</div>
          <div style="font-size:11px;color:var(--text-secondary);">総記録日数</div>
        </div>
        <div>
          <div style="font-size:20px;font-weight:700;color:var(--accent-green);">🥦 ${formatGrams(gs.totalVegetableGrams || 0)}</div>
          <div style="font-size:11px;color:var(--text-secondary);">野菜累計</div>
        </div>
      </div>
    </div>

    <!-- Category Filter -->
    <div class="card" style="padding:8px;">
      <div id="cat-filter" style="display:flex;gap:6px;flex-wrap:wrap;">
        ${categoryBtns}
      </div>
    </div>

    <!-- Badge Grid -->
    <div class="card">
      <div class="badge-grid" id="badge-grid">
        ${badges}
      </div>
      <div class="divider"></div>
      <div style="text-align:center;font-size:13px;color:var(--text-secondary);">
        獲得: ${unlocked.length} / ${ACHIEVEMENTS.length}
      </div>
    </div>
  `;
}

export function initAchievements(state) {
  // Category filter buttons
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;

      // Update active state on category buttons
      document.querySelectorAll('.cat-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.cat === activeCategory);
      });

      // Partial re-render: badge-grid only
      const gs = state.gameState || {};
      const unlocked = gs.unlockedAchievements || [];
      const filtered = activeCategory === 'all'
        ? ACHIEVEMENTS
        : ACHIEVEMENTS.filter(a => a.category === activeCategory);

      const badges = filtered.map(a => {
        const isUnlocked = unlocked.includes(a.id);
        const cls = isUnlocked ? 'unlocked' : 'locked';
        return `
          <div class="badge ${cls}" data-id="${a.id}">
            <div class="badge-icon">${isUnlocked ? a.icon : '🔒'}</div>
            <div class="badge-label">${isUnlocked ? a.name : '???'}</div>
          </div>
        `;
      }).join('');

      const grid = document.getElementById('badge-grid');
      grid.innerHTML = badges;

      // Re-attach click handlers for new badges
      grid.querySelectorAll('.badge').forEach(badge => {
        badge.addEventListener('click', () => {
          showAchievementDetail(badge.dataset.id, state);
        });
      });
    });
  });

  // Badge click handlers (initial render)
  document.querySelectorAll('.badge').forEach(badge => {
    badge.addEventListener('click', () => {
      showAchievementDetail(badge.dataset.id, state);
    });
  });
}

function showAchievementDetail(id, state) {
  const achievement = ACHIEVEMENTS.find(a => a.id === id);
  if (!achievement) return;

  const unlocked = (state.gameState?.unlockedAchievements || []).includes(id);
  const category = ACHIEVEMENT_CATEGORIES[achievement.category] || {};

  let html;
  if (unlocked) {
    html = `
      <div style="text-align:center;">
        <div style="font-size:64px;margin-bottom:12px;">${achievement.icon}</div>
        <h2 style="margin-bottom:8px;">${achievement.name}</h2>
        <div style="font-size:14px;color:var(--text-secondary);margin-bottom:12px;">
          ${achievement.description}
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:20px;">
          ${category.icon || ''} ${category.name || ''}
        </div>
        <div style="display:inline-block;padding:6px 16px;border-radius:20px;background:rgba(74,222,128,0.15);color:var(--accent-green);font-size:13px;font-weight:600;">
          獲得済み
        </div>
        <div style="margin-top:20px;">
          <button class="btn-secondary btn-full" id="modal-close-achieve">閉じる</button>
        </div>
      </div>
    `;
  } else {
    html = `
      <div style="text-align:center;">
        <div style="font-size:64px;margin-bottom:12px;filter:grayscale(1);opacity:0.4;">🔒</div>
        <h2 style="margin-bottom:8px;">???</h2>
        <div style="font-size:14px;color:var(--text-secondary);margin-bottom:12px;">
          ${achievement.description}
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:20px;">
          ${category.icon || ''} ${category.name || ''}
        </div>
        <div style="display:inline-block;padding:6px 16px;border-radius:20px;background:rgba(160,160,176,0.15);color:var(--text-muted);font-size:13px;font-weight:600;">
          未獲得
        </div>
        <div style="margin-top:20px;">
          <button class="btn-secondary btn-full" id="modal-close-achieve">閉じる</button>
        </div>
      </div>
    `;
  }

  showModal(html);
  document.getElementById('modal-close-achieve').addEventListener('click', hideModal);
}
