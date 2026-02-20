// history.js - History page (calendar) for VegiRise

import { DB } from './db.js';
import { getToday, formatGrams, minutesToTimeStr } from './utils.js';
import { Gamification } from './gamification.js';
import { showModal, hideModal } from './ui.js';
import { iconImg } from './icon-map.js';

let currentYear;
let currentMonth;

export function renderHistory(state) {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth() + 1;

  return `
    <div class="page-header">
      <h1>${iconImg('📅', 'icon-section-title')} 履歴</h1>
    </div>

    <div class="card">
      <div class="calendar-header">
        <button id="cal-prev">◀</button>
        <span class="month-label" id="cal-month-label">${currentYear}年${currentMonth}月</span>
        <button id="cal-next">▶</button>
      </div>
      <div class="calendar-weekdays">
        <span>日</span><span>月</span><span>火</span><span>水</span><span>木</span><span>金</span><span>土</span>
      </div>
      <div class="calendar-grid" id="cal-grid">
        <!-- Filled by loadCalendar -->
      </div>
    </div>

    <div class="card" id="month-summary">
      <!-- Filled by loadCalendar -->
    </div>
  `;
}

export function initHistory(state) {
  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');

  prevBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
    loadCalendar(state);
  });

  nextBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
    loadCalendar(state);
  });

  loadCalendar(state);
}

async function loadCalendar(state) {
  const label = document.getElementById('cal-month-label');
  const grid = document.getElementById('cal-grid');
  const summaryEl = document.getElementById('month-summary');

  label.textContent = `${currentYear}年${currentMonth}月`;

  const data = await DB.getMonthData(currentYear, currentMonth);
  const settings = await DB.getSettings();
  const vegGoals = settings.vegetableGoals;
  const today = getToday();

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  let html = '';

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += '<button class="cal-cell empty"></button>';
  }

  // Summary accumulators
  let totalGrams = 0;
  let recordDays = 0;
  let wakeupTimes = [];
  let perfectCount = 0;
  let wakeupCount = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = data.get(dateStr) || { vegTotal: 0, wakeup: null };

    // Calculate score for coloring (0-4)
    const wakeupScore = dayData.wakeup ? dayData.wakeup.score : null;
    const dayScore = Gamification.calculateDayScore(dayData.vegTotal, vegGoals, wakeupScore);

    let scoreLevel;
    if (dayData.vegTotal === 0 && !dayData.wakeup) {
      scoreLevel = '';
    } else if (dayScore < 25) {
      scoreLevel = '1';
    } else if (dayScore < 50) {
      scoreLevel = '2';
    } else if (dayScore < 75) {
      scoreLevel = '3';
    } else {
      scoreLevel = '4';
    }

    const isToday = dateStr === today;
    const todayClass = isToday ? ' today' : '';
    const scoreAttr = scoreLevel ? ` data-score="${scoreLevel}"` : ' data-score="0"';

    // Summary
    if (dayData.vegTotal > 0 || dayData.wakeup) {
      recordDays++;
    }
    totalGrams += dayData.vegTotal;
    if (dayData.wakeup) {
      wakeupCount++;
      // Parse wakeup time to minutes for averaging
      const [h, m] = dayData.wakeup.time.split(':').map(Number);
      wakeupTimes.push(h * 60 + m);
      if (dayData.wakeup.score >= 90) {
        perfectCount++;
      }
    }

    html += `<button class="cal-cell${todayClass}"${scoreAttr} data-date="${dateStr}">${day}</button>`;
  }

  grid.innerHTML = html;

  // Attach click handlers to day cells
  grid.querySelectorAll('.cal-cell:not(.empty)').forEach(cell => {
    cell.addEventListener('click', () => {
      const date = cell.dataset.date;
      if (date) showDayDetail(date, state);
    });
  });

  // Summary
  const avgGrams = recordDays > 0 ? Math.round(totalGrams / recordDays) : 0;
  const avgWakeup = wakeupTimes.length > 0
    ? minutesToTimeStr(Math.round(wakeupTimes.reduce((a, b) => a + b, 0) / wakeupTimes.length))
    : '--:--';
  const perfectRate = wakeupCount > 0 ? Math.round((perfectCount / wakeupCount) * 100) : 0;

  summaryEl.innerHTML = `
    <div class="card-title">${iconImg('📊', 'icon-section-title')} 月間サマリー</div>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-value green">${formatGrams(totalGrams)}</div>
        <div class="stat-label">合計</div>
      </div>
      <div class="stat-card">
        <div class="stat-value blue">${recordDays}</div>
        <div class="stat-label">記録日数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value purple">${avgGrams}g</div>
        <div class="stat-label">平均/日</div>
      </div>
    </div>
    ${wakeupCount > 0 ? `
      <div class="divider"></div>
      <div class="card-title">${iconImg('🌅', 'icon-section-title')} 起床記録</div>
      <div class="wakeup-summary">
        <div>
          <span class="wakeup-summary-label">平均起床:</span>
          <span class="wakeup-summary-value">${avgWakeup}</span>
        </div>
        <div>
          <span class="wakeup-summary-label">パーフェクト率:</span>
          <span class="wakeup-summary-value" style="color:${perfectRate >= 70 ? 'var(--accent-green)' : 'var(--text-primary)'};">${perfectRate}%</span>
        </div>
      </div>
    ` : ''}
  `;
}

async function showDayDetail(dateStr, state) {
  const records = await DB.getVegetables(dateStr);
  const wakeup = await DB.getWakeup(dateStr);
  const settings = await DB.getSettings();
  const total = records.reduce((s, r) => s + r.grams, 0);
  const wakeupScore = wakeup ? wakeup.score : null;
  const dayScore = Gamification.calculateDayScore(total, settings.vegetableGoals, wakeupScore);

  // Format date for display
  const [y, m, d] = dateStr.split('-');
  const dateLabel = `${parseInt(m)}月${parseInt(d)}日`;

  let html = `
    <h2>${dateLabel}</h2>
    <div class="score-display">
      <span class="score-label">総合スコア: </span>
      <span class="score-value" style="color:${scoreColor(dayScore)};">${dayScore}</span>
    </div>
    <div class="divider"></div>
    <div class="section-subtitle">${iconImg('🥦', 'icon-section-title')} 野菜記録</div>
  `;

  if (records.length === 0) {
    html += '<div class="empty-state">記録なし</div>';
  } else {
    html += records.map(r => {
      const t = new Date(r.timestamp);
      const timeStr = String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0');
      return `<div class="detail-row">
        <span>${timeStr}</span><span>${r.grams}g</span>
      </div>`;
    }).join('');
    html += `<div class="veg-total" style="text-align:right;">合計: ${total}g</div>`;
  }

  html += '<div class="divider"></div>';
  html += `<div class="section-subtitle">${iconImg('⏰', 'icon-section-title')} 起床記録</div>`;

  if (wakeup) {
    html += `
      <div>
        <div class="detail-row">
          <span>起床時間</span><span class="detail-row-value">${wakeup.time}</span>
        </div>
        <div class="detail-row">
          <span>目標</span><span>${wakeup.goalTime}</span>
        </div>
        <div class="detail-row">
          <span>スコア</span><span class="detail-row-value" style="color:${scoreColor(wakeup.score)};">${wakeup.score}</span>
        </div>
      </div>
    `;
  } else {
    html += '<div class="empty-state">記録なし</div>';
  }

  html += `
    <div class="modal-action">
      <button class="btn-secondary btn-full" id="modal-close-detail">閉じる</button>
    </div>
  `;

  showModal(html);

  document.getElementById('modal-close-detail').addEventListener('click', hideModal);
}

function scoreColor(score) {
  if (score >= 80) return 'var(--accent-green)';
  if (score >= 60) return 'var(--accent-blue)';
  if (score >= 40) return 'var(--accent-orange)';
  return 'var(--accent-red)';
}

