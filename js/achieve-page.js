// achieve-page.js - Achievements page for VegiRise

import { Gamification } from './gamification.js';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from './achievements.js';
import { formatGrams } from './utils.js';
import { showModal, hideModal } from './ui.js';
import { iconImg } from './icon-map.js';

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
        ${iconImg(cat.icon, 'icon-cat-btn', '14')} ${cat.name}
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
        <div class="badge-icon">${iconImg(isUnlocked ? a.icon : '🔒', 'icon-badge')}</div>
        <div class="badge-label">${isUnlocked ? a.name : '???'}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="page-header">
      <h1>${iconImg('🏆', 'icon-section-title')} 実績</h1>
    </div>

    <!-- Level & XP -->
    <div class="card card-compact">
      <div class="xp-info">
        <span class="xp-level">Lv.${levelInfo.level}</span>
        <span class="xp-text">${levelInfo.currentXP} / ${levelInfo.nextLevelXP} XP</span>
      </div>
      <div class="xp-bar">
        <div class="xp-bar-fill" style="width:${Math.round(levelInfo.progress * 100)}%"></div>
      </div>
    </div>

    <!-- Stats -->
    <div class="card card-compact">
      <div class="stats-overview">
        <div>
          <div class="stats-item-value" style="color:var(--accent-orange);">${iconImg('🔥', 'icon-section', '20')} ${gs.currentStreak || 0}日</div>
          <div class="stats-item-label">ストリーク</div>
        </div>
        <div>
          <div class="stats-item-value" style="color:var(--accent-blue);">${iconImg('📊', 'icon-section', '20')} ${gs.totalRecordDays || 0}日</div>
          <div class="stats-item-label">総記録日数</div>
        </div>
        <div>
          <div class="stats-item-value" style="color:var(--accent-green);">${iconImg('🥦', 'icon-section', '20')} ${formatGrams(gs.totalVegetableGrams || 0)}</div>
          <div class="stats-item-label">野菜累計</div>
        </div>
      </div>
    </div>

    <!-- Category Filter -->
    <div class="card" style="padding:8px;">
      <div id="cat-filter" class="cat-filter">
        ${categoryBtns}
      </div>
    </div>

    <!-- Badge Grid -->
    <div class="card">
      <div class="badge-grid" id="badge-grid">
        ${badges}
      </div>
      <div class="divider"></div>
      <div class="achievement-count">
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
            <div class="badge-icon">${iconImg(isUnlocked ? a.icon : '🔒', 'icon-badge')}</div>
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
      <div class="modal-center">
        <div class="badge-detail-icon">${iconImg(achievement.icon, 'icon-badge-detail')}</div>
        <h2 style="margin-bottom:8px;">${achievement.name}</h2>
        <div class="badge-detail-desc">
          ${achievement.description}
        </div>
        <div class="badge-detail-cat">
          ${category.icon ? iconImg(category.icon, 'icon-cat-btn', '16') : ''} ${category.name || ''}
        </div>
        <div class="status-badge is-unlocked">
          獲得済み
        </div>
        <div class="modal-action">
          <button class="btn-secondary btn-full" id="modal-close-achieve">閉じる</button>
        </div>
      </div>
    `;
  } else {
    html = `
      <div class="modal-center">
        <div class="badge-detail-icon is-locked">${iconImg('🔒', 'icon-badge-detail')}</div>
        <h2 style="margin-bottom:8px;">???</h2>
        <div class="badge-detail-desc">
          ${achievement.description}
        </div>
        <div class="badge-detail-cat">
          ${category.icon ? iconImg(category.icon, 'icon-cat-btn', '16') : ''} ${category.name || ''}
        </div>
        <div class="status-badge is-locked">
          未獲得
        </div>
        <div class="modal-action">
          <button class="btn-secondary btn-full" id="modal-close-achieve">閉じる</button>
        </div>
      </div>
    `;
  }

  showModal(html);
  document.getElementById('modal-close-achieve').addEventListener('click', hideModal);
}
