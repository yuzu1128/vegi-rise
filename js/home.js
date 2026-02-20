// home.js - Home page for VegiRise

import { DB } from './db.js';
import { getToday } from './utils.js';
import { Gamification } from './gamification.js';
import { Sound } from './sound.js';
import { processRecord } from './game-engine.js';
import { showToast } from './ui.js';
import { refreshState, rerender } from './app.js';
import { iconImg } from './icon-map.js';

export function renderHome(state) {
  const gs = state.gameState || {};
  const settings = state.settings || {};
  const levelInfo = Gamification.calculateLevel(gs.xp || 0);
  const vegGoals = settings.vegetableGoals || { minimum: 350, standard: 500, target: 800 };

  const now = new Date();
  const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const secStr = String(now.getSeconds()).padStart(2, '0');

  return `
    <!-- Streak & Level Header -->
    <div class="card" style="padding:12px 16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div class="streak">
          <span class="streak-icon">${iconImg('🔥', 'icon-section', '28')}</span>
          <span>連続 ${gs.currentStreak || 0}日目</span>
        </div>
        <div class="xp-level">Lv.${levelInfo.level}</div>
      </div>
      <div style="margin-top:8px;">
        <div class="xp-info">
          <span class="xp-text">XP</span>
          <span class="xp-text">${levelInfo.currentXP} / ${levelInfo.nextLevelXP}</span>
        </div>
        <div class="xp-bar">
          <div class="xp-bar-fill" style="width:${Math.round(levelInfo.progress * 100)}%"></div>
        </div>
      </div>
    </div>

    <!-- Vegetable Section -->
    <div class="card">
      <div class="card-title">${iconImg('🥦', 'icon-section-title')} 今日の野菜</div>

      <!-- Preset Buttons -->
      <div class="preset-grid" id="preset-buttons">
        <button class="preset-btn" data-grams="50">50g</button>
        <button class="preset-btn" data-grams="100">100g</button>
        <button class="preset-btn active" data-grams="200">200g</button>
        <button class="preset-btn" data-grams="350">350g</button>
        <button class="preset-btn" data-grams="500">500g</button>
        <button class="preset-btn" data-grams="800">800g</button>
      </div>

      <div class="slider-container">
        <label>
          <span>摂取量</span>
          <span class="slider-value" id="veg-slider-label">200g</span>
        </label>
        <input type="range" id="veg-slider" min="0" max="${vegGoals.target}" step="10" value="200">
      </div>

      <div class="veg-input-row">
        <input type="number" id="veg-input" min="0" max="9999" step="1" value="200" class="veg-input-field">
        <span class="veg-input-unit">g</span>
        <button class="btn-primary veg-record-btn" id="veg-record-btn">${iconImg('🥦', 'icon-section-title')} 記録</button>
      </div>

      <!-- Goal Indicators -->
      <div class="goal-indicator" style="margin-top:16px;" id="goal-indicators">
        <!-- Filled by initHome -->
      </div>

      <!-- Progress Bar -->
      <div style="margin-top:12px;">
        <div class="xp-bar" style="height:10px;">
          <div class="xp-bar-fill" id="veg-progress-fill" style="width:0%;background:linear-gradient(90deg,var(--accent-orange),var(--accent-green));"></div>
        </div>
        <div style="text-align:center;font-size:12px;color:var(--text-secondary);margin-top:4px;" id="veg-progress-text">0 / ${vegGoals.target}g</div>
      </div>

      <!-- Today's Records -->
      <div style="margin-top:16px;">
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px;">今日の記録:</div>
        <div id="veg-records-list" style="font-size:13px;">
          <!-- Filled by initHome -->
        </div>
        <div id="veg-total" style="font-weight:700;margin-top:8px;font-size:14px;color:var(--accent-green);">
          合計: 0g
        </div>
      </div>
    </div>

    <!-- Wakeup Section -->
    <div class="card">
      <div class="card-title">${iconImg('⏰', 'icon-section-title')} 起床時間</div>

      <div class="wakeup-display">
        <div class="wakeup-time" id="current-time">${timeStr}<span style="font-size:24px;opacity:0.5;">:${secStr}</span></div>
      </div>

      <button class="wakeup-btn" id="wakeup-record-btn">この時間で起床を記録</button>

      <div style="margin-top:12px;text-align:center;font-size:13px;color:var(--text-secondary);">
        目標: ${settings.wakeupGoalTime || '06:00'}
      </div>

      <div id="wakeup-status" style="margin-top:8px;text-align:center;font-size:14px;"></div>
    </div>
  `;
}

export function initHome(state) {
  const slider = document.getElementById('veg-slider');
  const input = document.getElementById('veg-input');
  const sliderLabel = document.getElementById('veg-slider-label');
  const recordBtn = document.getElementById('veg-record-btn');
  const wakeupBtn = document.getElementById('wakeup-record-btn');

  const sliderMax = parseInt(slider.max);

  // Update slider track progress
  function updateSliderTrack() {
    const val = slider.value;
    const pct = (val / sliderMax) * 100;
    slider.style.setProperty('--progress', pct + '%');
  }

  // Sync all inputs (slider, number, presets)
  function setGrams(v) {
    v = Math.max(0, parseInt(v) || 0);
    input.value = v;
    sliderLabel.textContent = v + 'g';
    if (v <= sliderMax) {
      slider.value = v;
    } else {
      slider.value = sliderMax;
    }
    updateSliderTrack();
    // Update active preset
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.grams) === v);
    });
  }

  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      Sound.click();
      setGrams(parseInt(btn.dataset.grams));
    });
  });

  // Slider <-> input sync
  slider.addEventListener('input', () => {
    setGrams(slider.value);
  });

  input.addEventListener('input', () => {
    setGrams(input.value);
  });

  updateSliderTrack();

  // Load today's records and update UI
  async function loadTodayData() {
    const today = getToday();
    const records = await DB.getVegetables(today);
    const total = records.reduce((s, r) => s + r.grams, 0);
    const settings = await DB.getSettings();
    const vegGoals = settings.vegetableGoals;

    // Records list
    const listEl = document.getElementById('veg-records-list');
    if (records.length === 0) {
      listEl.innerHTML = '<div style="color:var(--text-muted);font-style:italic;">まだ記録がありません</div>';
    } else {
      listEl.innerHTML = records.map(r => {
        const d = new Date(r.timestamp);
        const timeStr = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border-color);">
            <span>${timeStr}  ${r.grams}g</span>
            <button class="veg-delete-btn" data-id="${r.id}" style="background:none;border:none;color:var(--accent-red);cursor:pointer;font-size:16px;padding:4px 8px;">×</button>
          </div>
        `;
      }).join('');
    }

    // Total
    document.getElementById('veg-total').textContent = `合計: ${total}g`;

    // Progress bar
    const pct = Math.min(100, (total / vegGoals.target) * 100);
    document.getElementById('veg-progress-fill').style.width = pct + '%';
    document.getElementById('veg-progress-text').textContent = `${total} / ${vegGoals.target}g`;

    // Goal indicators
    const goalsEl = document.getElementById('goal-indicators');
    goalsEl.innerHTML = `
      <div class="goal-row">
        <span class="goal-label" style="color:${total >= vegGoals.minimum ? 'var(--accent-orange)' : 'var(--text-muted)'};">
          ${total >= vegGoals.minimum ? '✓' : '○'} 最低
        </span>
        <div class="goal-bar"><div class="goal-bar-fill minimum" style="width:${Math.min(100, (total / vegGoals.minimum) * 100)}%"></div></div>
        <span class="goal-value">${vegGoals.minimum}g</span>
      </div>
      <div class="goal-row">
        <span class="goal-label" style="color:${total >= vegGoals.standard ? 'var(--accent-blue)' : 'var(--text-muted)'};">
          ${total >= vegGoals.standard ? '✓' : '○'} 標準
        </span>
        <div class="goal-bar"><div class="goal-bar-fill standard" style="width:${Math.min(100, (total / vegGoals.standard) * 100)}%"></div></div>
        <span class="goal-value">${vegGoals.standard}g</span>
      </div>
      <div class="goal-row">
        <span class="goal-label" style="color:${total >= vegGoals.target ? 'var(--accent-green)' : 'var(--text-muted)'};">
          ${total >= vegGoals.target ? '✓' : '○'} 目標
        </span>
        <div class="goal-bar"><div class="goal-bar-fill target" style="width:${Math.min(100, (total / vegGoals.target) * 100)}%"></div></div>
        <span class="goal-value">${vegGoals.target}g</span>
      </div>
    `;

    // Delete buttons
    document.querySelectorAll('.veg-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.id);

        // Get the record's grams before deleting
        const record = await DB.getVegetableById(id);

        await DB.deleteVegetable(id);

        // Subtract deleted amount from gameState
        if (record) {
          const gameState = await DB.getGameState();
          gameState.totalVegetableGrams = Math.max(0, gameState.totalVegetableGrams - record.grams);
          gameState.totalVegetableRecords = Math.max(0, gameState.totalVegetableRecords - 1);
          await DB.saveGameState(gameState);
        }

        showToast('記録を削除しました', 'info');
        await refreshState();
        loadTodayData();
      });
    });

    // Load wakeup status
    const wakeup = await DB.getWakeup(today);
    const statusEl = document.getElementById('wakeup-status');
    if (wakeup) {
      statusEl.innerHTML = `
        <span class="wakeup-time recorded" style="font-size:20px;">${wakeup.time}</span>
        <span style="color:var(--text-secondary);margin-left:8px;">スコア: ${wakeup.score}</span>
      `;
      wakeupBtn.disabled = true;
      wakeupBtn.textContent = '記録済み';
    } else {
      statusEl.innerHTML = '';
      wakeupBtn.disabled = false;
      wakeupBtn.textContent = 'この時間で起床を記録';
    }
  }

  loadTodayData();

  // Record vegetable (with double-click prevention)
  recordBtn.addEventListener('click', async () => {
    if (recordBtn.disabled) return;
    const grams = parseInt(input.value) || 0;
    if (grams <= 0) {
      showToast('0g以上の数値を入力してください', 'warning');
      return;
    }

    recordBtn.disabled = true;
    try {
      await DB.addVegetable(grams);
      await processRecord('vegetable', { grams }, state);
      await refreshState();

      // Reset input
      setGrams(200);

      showToast(`${grams}gを記録しました!`, 'success');
      loadTodayData();
    } finally {
      recordBtn.disabled = false;
    }
  });

  // Record wakeup (with double-click prevention)
  wakeupBtn.addEventListener('click', async () => {
    if (wakeupBtn.disabled) return;

    wakeupBtn.disabled = true;
    try {
      const now = new Date();
      const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      const today = getToday();
      const settings = await DB.getSettings();
      const { score, diffMinutes } = Gamification.calculateWakeupScore(time, settings.wakeupGoalTime);

      const result = await DB.setWakeup(today, time, settings.wakeupGoalTime, score, diffMinutes);
      await processRecord('wakeup', { time, score: result.score }, state);
      await refreshState();

      showToast(`起床記録: ${time} (スコア: ${result.score})`, 'success');
      loadTodayData();
    } catch (e) {
      console.error('Wakeup record failed', e);
      showToast('記録に失敗しました', 'error');
      wakeupBtn.disabled = false;
    }
  });

  // Real-time clock update
  const clockInterval = setInterval(() => {
    const el = document.getElementById('current-time');
    if (!el) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    el.innerHTML = `${h}:${m}<span style="font-size:24px;opacity:0.5;">:${s}</span>`;
  }, 1000);

  // Return cleanup function
  return () => {
    clearInterval(clockInterval);
  };
}
