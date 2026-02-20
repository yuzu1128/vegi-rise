// templates.js - Shared template functions for VegiRise

import { iconImg } from './icon-map.js';

export function renderBadgeHTML(achievements, unlockedIds) {
  return achievements.map(a => {
    const isUnlocked = unlockedIds.includes(a.id);
    const cls = isUnlocked ? 'unlocked' : 'locked';
    return `
      <div class="badge ${cls}" data-id="${a.id}">
        <div class="badge-icon">${iconImg(isUnlocked ? a.icon : '🔒', 'icon-badge')}</div>
        <div class="badge-label">${isUnlocked ? a.name : '???'}</div>
      </div>
    `;
  }).join('');
}

export function renderGoalRow({ label, total, goalValue, cssClass, colorVar }) {
  const met = total >= goalValue;
  return `
    <div class="goal-row">
      <span class="goal-label" style="color:${met ? colorVar : 'var(--text-muted)'};">
        ${met ? '✓' : '○'} ${label}
      </span>
      <div class="goal-bar"><div class="goal-bar-fill ${cssClass}" style="width:${Math.min(100, (total / goalValue) * 100)}%"></div></div>
      <span class="goal-value">${goalValue}g</span>
    </div>
  `;
}
