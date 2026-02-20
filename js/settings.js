// settings.js - Settings page for VegiRise

import { DB } from './db.js';
import { Sound } from './sound.js';
import { formatGrams } from './utils.js';
import { showToast } from './ui.js';
import { refreshState } from './app.js';

export function renderSettings(state) {
  const settings = state.settings || {};
  const gs = state.gameState || {};
  const vegGoals = settings.vegetableGoals || { minimum: 350, standard: 500, target: 800 };

  return `
    <div class="page-header">
      <h1>⚙️ 設定</h1>
    </div>

    <!-- Vegetable Goals -->
    <div class="card">
      <div class="card-title">🥦 野菜目標</div>
      <div class="form-group">
        <label>最低目標 (g)</label>
        <input type="number" id="set-veg-min" min="1" max="9999" value="${vegGoals.minimum}">
      </div>
      <div class="form-group">
        <label>標準目標 (g)</label>
        <input type="number" id="set-veg-std" min="1" max="9999" value="${vegGoals.standard}">
      </div>
      <div class="form-group">
        <label>目標 (g)</label>
        <input type="number" id="set-veg-target" min="1" max="9999" value="${vegGoals.target}">
      </div>
    </div>

    <!-- Wakeup Goal -->
    <div class="card">
      <div class="card-title">⏰ 起床目標</div>
      <div class="form-group">
        <label>目標起床時間</label>
        <input type="time" id="set-wakeup-time" value="${settings.wakeupGoalTime || '06:00'}">
      </div>
    </div>

    <!-- Sound -->
    <div class="card">
      <div class="card-title">🔊 サウンド</div>
      <div class="toggle-row">
        <div>
          <div class="toggle-label">効果音</div>
          <div class="toggle-sub">ボタン・記録・達成時のサウンド</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="set-sound-toggle" ${Sound.isEnabled() ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <!-- Stats -->
    <div class="card">
      <div class="card-title">📊 統計</div>
      <div style="font-size:14px;">
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color);">
          <span style="color:var(--text-secondary);">総記録日数</span>
          <span style="font-weight:600;">${gs.totalRecordDays || 0}日</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color);">
          <span style="color:var(--text-secondary);">野菜累計</span>
          <span style="font-weight:600;">${formatGrams(gs.totalVegetableGrams || 0)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color);">
          <span style="color:var(--text-secondary);">最高連続</span>
          <span style="font-weight:600;">${gs.longestStreak || 0}日</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color);">
          <span style="color:var(--text-secondary);">レベル</span>
          <span style="font-weight:600;">Lv.${gs.level || 1}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;">
          <span style="color:var(--text-secondary);">総XP</span>
          <span style="font-weight:600;">${(gs.xp || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>

    <!-- Data Reset -->
    <div class="card">
      <div class="card-title">⚠️ データ</div>
      <button class="btn-danger btn-full" id="set-reset-btn">データをリセット</button>
    </div>
  `;
}

export function initSettings(state) {
  const minInput = document.getElementById('set-veg-min');
  const stdInput = document.getElementById('set-veg-std');
  const targetInput = document.getElementById('set-veg-target');
  const wakeupInput = document.getElementById('set-wakeup-time');
  const soundToggle = document.getElementById('set-sound-toggle');
  const resetBtn = document.getElementById('set-reset-btn');

  // Save settings on change with validation
  async function saveVegGoals() {
    const min = parseInt(minInput.value) || 0;
    const std = parseInt(stdInput.value) || 0;
    const target = parseInt(targetInput.value) || 0;

    if (min <= 0 || std <= 0 || target <= 0) {
      showToast('0より大きい数値を入力してください', 'warning');
      return;
    }
    if (min >= std) {
      showToast('最低目標は標準目標より小さくしてください', 'warning');
      return;
    }
    if (std >= target) {
      showToast('標準目標は目標より小さくしてください', 'warning');
      return;
    }

    const settings = await DB.getSettings();
    settings.vegetableGoals = { minimum: min, standard: std, target };
    await DB.saveSettings(settings);
    await refreshState();
    showToast('野菜目標を保存しました', 'success');
  }

  minInput.addEventListener('change', saveVegGoals);
  stdInput.addEventListener('change', saveVegGoals);
  targetInput.addEventListener('change', saveVegGoals);

  wakeupInput.addEventListener('change', async () => {
    const time = wakeupInput.value;
    if (!time) return;
    const settings = await DB.getSettings();
    settings.wakeupGoalTime = time;
    await DB.saveSettings(settings);
    await refreshState();
    showToast('起床目標を保存しました', 'success');
  });

  soundToggle.addEventListener('change', async () => {
    const enabled = Sound.toggle();
    const settings = await DB.getSettings();
    settings.soundEnabled = enabled;
    await DB.saveSettings(settings);
    showToast(enabled ? 'サウンドON' : 'サウンドOFF', 'info');
  });

  resetBtn.addEventListener('click', () => {
    if (confirm('全てのデータをリセットしますか?\nこの操作は取り消せません。')) {
      if (confirm('本当にリセットしますか? すべての記録・実績が失われます。')) {
        // Close DB connection before deleting
        DB.close();
        indexedDB.deleteDatabase('vegi-rise-db');
        showToast('データをリセットしました。リロードします...', 'info');
        setTimeout(() => {
          location.reload();
        }, 1000);
      }
    }
  });
}

