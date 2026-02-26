// home.js - Home page for VegiRise

import { DB } from './db.js';
import { getToday, formatTime, formatTimeWithSeconds } from './utils.js';
import { Gamification } from './gamification.js';
import { Sound } from './sound.js';
import { processRecord } from './game-engine.js';
import { showToast } from './ui.js';
import { refreshState, rerender } from './app.js';
import { iconImg } from './icon-map.js';
import { renderGoalRow } from './templates.js';
import { VegetableValidator } from './validators.js';
import { ErrorHandler } from './error-handler.js';
import { Constants, DEFAULT_VEG_GOALS } from './constants.js';

export function renderHome(state) {
  const gs = state.gameState || {};
  const settings = state.settings || {};
  const levelInfo = Gamification.calculateLevel(gs.xp || 0);
  const vegGoals = settings.vegetableGoals || DEFAULT_VEG_GOALS;

  const now = new Date();
  const { time: timeStr, seconds: secStr } = formatTimeWithSeconds(now);

  return `
    <!-- Streak & Level Header -->
    <div class="card card-compact">
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
        ${Constants.Vegetable.PRESETS.map((grams, index) => `<button class="preset-btn${index === 2 ? ' active' : ''}" data-grams="${grams}">${grams}g</button>`).join('')}
      </div>

      <div class="slider-container">
        <label>
          <span>摂取量</span>
          <span class="slider-value" id="veg-slider-label">${Constants.Vegetable.DEFAULT_INPUT}g</span>
        </label>
        <input type="range" id="veg-slider" min="${Constants.Vegetable.MIN_GRAMS}" max="${Constants.Vegetable.MAX_GRAMS}" step="${Constants.Vegetable.STEPS.SLIDER}" value="${Constants.Vegetable.DEFAULT_INPUT}">
      </div>

      <div class="veg-input-row">
        <input type="number" id="veg-input" min="${Constants.Vegetable.MIN_GRAMS}" max="${Constants.Vegetable.MAX_GRAMS}" step="${Constants.Vegetable.STEPS.INPUT}" value="${Constants.Vegetable.DEFAULT_INPUT}" class="veg-input-field">
        <span class="veg-input-unit">g</span>
        <button class="btn-primary veg-record-btn" id="veg-record-btn">${iconImg('🥦', 'icon-section-title')} 記録</button>
      </div>

      <!-- Goal Indicators -->
      <div class="goal-indicator" id="goal-indicators">
        <!-- Filled by initHome -->
      </div>

      <!-- Progress Bar -->
      <div class="veg-progress">
        <div class="xp-bar" style="height:10px;">
          <div class="xp-bar-fill" id="veg-progress-fill" style="width:0%;background:linear-gradient(90deg,var(--accent-orange),var(--accent-green));"></div>
        </div>
        <div class="progress-text" id="veg-progress-text">0 / ${vegGoals.target}g</div>
      </div>

      <!-- Today's Records -->
      <div class="records-section">
        <div class="records-header">今日の記録:</div>
        <div id="veg-records-list">
          <!-- Filled by initHome -->
        </div>
        <div id="veg-total" class="veg-total">
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

      <div class="wakeup-buttons">
        <button class="wakeup-btn secondary" id="wakeup-time-btn">起床した</button>
        <button class="wakeup-btn secondary" id="getup-time-btn" style="display:none;">ベッドから出た</button>
      </div>

      <button class="wakeup-btn primary" id="wakeup-record-btn" style="display:none;">記録完了</button>

      <div class="wakeup-meta">
        目標: ${settings.wakeupGoalTime || Constants.Wakeup.DEFAULT_GOAL}
      </div>

      <div id="wakeup-status" class="wakeup-status-area"></div>
    </div>
  `;
}

export function initHome(state) {
  const slider = document.getElementById('veg-slider');
  const input = document.getElementById('veg-input');
  const sliderLabel = document.getElementById('veg-slider-label');
  const recordBtn = document.getElementById('veg-record-btn');
  const wakeupBtn = document.getElementById('wakeup-record-btn');
  const wakeupTimeBtn = document.getElementById('wakeup-time-btn');
  const getupTimeBtn = document.getElementById('getup-time-btn');

  const presetBtns = document.querySelectorAll('.preset-btn');
  const sliderMax = parseInt(slider.max);

  // Temporary storage for wakeup/getup times before recording
  let wakeupTimeRecorded = null;
  let getupTimeRecorded = null;

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
    presetBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.grams) === v);
    });
  }

  // Preset buttons
  presetBtns.forEach(btn => {
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
    let val = parseInt(input.value) || 0;
    val = VegetableValidator.clamp(val);
    if (val !== parseInt(input.value) || 0) {
      input.value = val;
    }
    setGrams(val);
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
      listEl.innerHTML = '<div class="empty-state">まだ記録がありません</div>';
    } else {
      listEl.innerHTML = records.map(r => {
        const d = new Date(r.timestamp);
        const timeStr = formatTime(d);
        return `
          <div class="record-item">
            <span>${timeStr}  ${r.grams}g</span>
            <button class="veg-delete-btn record-delete" data-id="${r.id}">×</button>
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
    goalsEl.innerHTML =
      renderGoalRow({ label: '最低', total, goalValue: vegGoals.minimum, cssClass: 'minimum', colorVar: 'var(--accent-orange)' }) +
      renderGoalRow({ label: '標準', total, goalValue: vegGoals.standard, cssClass: 'standard', colorVar: 'var(--accent-blue)' }) +
      renderGoalRow({ label: '目標', total, goalValue: vegGoals.target, cssClass: 'target', colorVar: 'var(--accent-green)' });

    // Delete buttons
    document.querySelectorAll('.veg-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (btn.disabled) return;
        btn.disabled = true;
        try {
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
        } finally {
          btn.disabled = false;
        }
      });
    });

    // Load wakeup status
    const wakeup = await DB.getWakeup(today);
    const statusEl = document.getElementById('wakeup-status');

    // Reset temp storage
    wakeupTimeRecorded = null;
    getupTimeRecorded = null;

    if (wakeup) {
      const getUpTime = wakeup.getUpTime ? wakeup.getUpTime : '--:--';
      statusEl.innerHTML = `
        <div class="wakeup-recorded-info">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="wakeup-time recorded">${wakeup.wakeupTime}</span>
            <span style="color:var(--text-secondary);">→</span>
            <span class="wakeup-time recorded">${getUpTime}</span>
          </div>
          <span style="color:var(--text-secondary);margin-left:8px;">スコア: ${wakeup.score}</span>
        </div>
      `;
      // Hide all buttons when recorded
      wakeupTimeBtn.style.display = 'none';
      getupTimeBtn.style.display = 'none';
      wakeupBtn.style.display = 'none';
    } else {
      statusEl.innerHTML = '';
      // Show only wakeup button initially
      wakeupTimeBtn.style.display = '';
      wakeupTimeBtn.disabled = false;
      wakeupTimeBtn.textContent = '起床した';
      wakeupTimeBtn.classList.remove('active');
      getupTimeBtn.style.display = 'none';
      wakeupBtn.style.display = 'none';
    }
  }

  loadTodayData();

  // Record vegetable (with double-click prevention)
  recordBtn.addEventListener('click', async () => {
    if (recordBtn.disabled) return;
    const grams = parseInt(input.value) || 0;
    const validation = VegetableValidator.validate(grams);
    if (!validation.valid) {
      showToast(validation.message, 'warning');
      return;
    }

    recordBtn.disabled = true;
    try {
      await DB.addVegetable(grams);
      await processRecord('vegetable', { grams }, state);
      await refreshState();

      // Reset input
      setGrams(Constants.Vegetable.DEFAULT_INPUT);

      showToast(`${grams}gを記録しました!`, 'success');
      loadTodayData();
    } finally {
      recordBtn.disabled = false;
    }
  });

  // Wakeup time button - record current time as wakeup time
  wakeupTimeBtn.addEventListener('click', () => {
    if (wakeupTimeBtn.disabled) return;
    Sound.click();
    wakeupTimeRecorded = formatTime(new Date());
    wakeupTimeBtn.textContent = `${wakeupTimeRecorded} ✓`;
    wakeupTimeBtn.classList.add('active');
    wakeupTimeBtn.disabled = true;
    // Show getup button
    getupTimeBtn.style.display = '';
  });

  // Getup time button - record current time as getup time
  getupTimeBtn.addEventListener('click', () => {
    if (getupTimeBtn.disabled) return;
    Sound.click();
    getupTimeRecorded = formatTime(new Date());
    getupTimeBtn.textContent = `${getupTimeRecorded} ✓`;
    getupTimeBtn.classList.add('active');
    getupTimeBtn.disabled = true;
    // Show record button
    wakeupBtn.style.display = '';
    wakeupBtn.disabled = false;
  });

  // Record both times and save to DB
  wakeupBtn.addEventListener('click', async () => {
    if (wakeupBtn.disabled) return;

    wakeupBtn.disabled = true;
    try {
      const today = getToday();
      const settings = await DB.getSettings();

      // Use recorded times
      const finalWakeupTime = wakeupTimeRecorded || formatTime(new Date());
      const finalGetupTime = getupTimeRecorded || finalWakeupTime;

      const { score, diffMinutes } = Gamification.calculateWakeupScore(finalWakeupTime, settings.wakeupGoalTime);

      const result = await DB.setWakeup(today, finalWakeupTime, finalGetupTime, settings.wakeupGoalTime, score, diffMinutes);
      await processRecord('wakeup', { time: finalWakeupTime, score: result.score }, state);
      await refreshState();

      showToast(`起床記録: ${finalWakeupTime} → ${finalGetupTime} (スコア: ${result.score})`, 'success');
      loadTodayData();
    } catch (e) {
      ErrorHandler.handle(e, '起床記録');
      wakeupBtn.disabled = false;
      // Re-enable buttons for retry
      if (wakeupTimeRecorded) {
        wakeupTimeBtn.disabled = false;
      }
      if (getupTimeRecorded) {
        getupTimeBtn.disabled = false;
      }
    }
  });

  // Real-time clock update
  const clockInterval = setInterval(() => {
    const el = document.getElementById('current-time');
    if (!el) return;
    const now = new Date();
    const { time, seconds } = formatTimeWithSeconds(now);
    el.innerHTML = `${time}<span class="time-seconds">:${seconds}</span>`;
  }, 1000);

  // Return cleanup function
  return () => {
    clearInterval(clockInterval);
  };
}
