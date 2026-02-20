// game-engine.js - Game logic engine for VegiRise
// Extracted from app.js processRecord (170 lines) into modular functions
// Bug fixes: goal persistence (DB), perfectWakeupStreak date gap, comboStreak reset

import { DB } from './db.js';
import { getToday } from './utils.js';
import { Gamification } from './gamification.js';
import { checkNewAchievements } from './achievements.js';
import { Sound } from './sound.js';
import { showToast, showXPGain, showAchievementPopup } from './ui.js';

// --- Helper ---

function getYesterday(todayStr) {
  const [y, m, d] = todayStr.split('-').map(Number);
  const yesterday = new Date(y, m - 1, d - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
}

// --- Sub-processors (not exported) ---

async function processVegetableRecord(gameState, settings, today) {
  let xp = 0;
  const dayTotal = await DB.getDayVegetableTotal(today);
  const dailyGoals = await DB.getDailyGoals(today);

  if (dayTotal > gameState.maxDailyVegetable) {
    gameState.maxDailyVegetable = dayTotal;
  }

  const vegGoals = settings.vegetableGoals;

  // Goal tier checks - only award XP on first crossing (persisted in DB)
  if (dayTotal >= vegGoals.minimum && !dailyGoals.minimum) {
    dailyGoals.minimum = true;
    gameState.daysMinimumGoalMet++;
    xp += Gamification.XP.goalMinimum;
    Sound.goalReached('minimum');
    showToast('最低目標達成!', 'success');
  }
  if (dayTotal >= vegGoals.standard && !dailyGoals.standard) {
    dailyGoals.standard = true;
    gameState.daysStandardGoalMet++;
    xp += Gamification.XP.goalStandard;
    Sound.goalReached('standard');
    showToast('標準目標達成!', 'success');
  }
  if (dayTotal >= vegGoals.target && !dailyGoals.target) {
    dailyGoals.target = true;
    gameState.daysTargetGoalMet++;
    xp += Gamification.XP.goalTarget;
    Sound.goalReached('target');
    showToast('目標達成!', 'success');
  }

  // 3+ records today check
  const todayRecords = await DB.getVegetables(today);
  if (todayRecords.length >= 3) {
    gameState.max3MealsReached = true;
  }

  // 1000g+ check
  if (dayTotal >= 1000 && !dailyGoals.over1000g) {
    dailyGoals.over1000g = true;
    gameState.over1000gDays++;
  }

  await DB.saveDailyGoals(dailyGoals);
  return xp;
}

async function processWakeupRecord(gameState, data, today) {
  let xp = 0;
  gameState.totalWakeupRecords++;
  xp += Gamification.XP.wakeupRecord;

  if (data.score >= 90) {
    gameState.perfectWakeupCount++;
    xp += Gamification.XP.perfectWakeup;

    // Date gap check for perfectWakeupStreak
    const yesterday = getYesterday(today);
    if (gameState.lastWakeupDate === yesterday) {
      gameState.perfectWakeupStreak++;
    } else {
      gameState.perfectWakeupStreak = 1;
    }

    if (gameState.perfectWakeupStreak > gameState.longestPerfectWakeupStreak) {
      gameState.longestPerfectWakeupStreak = gameState.perfectWakeupStreak;
    }
  } else {
    gameState.perfectWakeupStreak = 0;
  }

  gameState.lastWakeupDate = today;

  // Early bird (before 05:30)
  if (data.time < '05:30') {
    gameState.earlyBirdCount++;
  }

  return xp;
}

function updateStreaks(gameState, today) {
  let xp = 0;

  gameState.totalRecordDays++;

  const yesterday = getYesterday(today);
  if (gameState.lastRecordDate === yesterday) {
    gameState.currentStreak++;
  } else {
    gameState.currentStreak = 1;
  }

  if (gameState.currentStreak > gameState.longestStreak) {
    gameState.longestStreak = gameState.currentStreak;
  }

  // Streak bonuses
  if (gameState.currentStreak === 3) {
    xp += Gamification.XP.streakBonus3;
    showToast('3日連続記録ボーナス! +50 XP', 'success');
  }
  if (gameState.currentStreak === 7) {
    xp += Gamification.XP.streakBonus7;
    showToast('7日連続記録ボーナス! +100 XP', 'success');
  }
  if (gameState.currentStreak === 30) {
    xp += Gamification.XP.streakBonus30;
    showToast('30日連続記録ボーナス! +300 XP', 'success');
  }

  gameState.lastRecordDate = today;

  return xp;
}

async function checkCombo(gameState, settings, today) {
  let xp = 0;
  const dailyGoals = await DB.getDailyGoals(today);

  if (dailyGoals.combo) return 0; // Already achieved combo today

  const dayVegTotal = await DB.getDayVegetableTotal(today);
  const dayWakeup = await DB.getWakeup(today);

  if (dayVegTotal >= settings.vegetableGoals.minimum && dayWakeup && dayWakeup.score >= 90) {
    dailyGoals.combo = true;
    gameState.comboCount++;

    // Check previous day's combo status from DB
    const yesterday = getYesterday(today);
    const yesterdayGoals = await DB.getDailyGoals(yesterday);

    if (yesterdayGoals.combo) {
      gameState.comboStreak++;
    } else {
      gameState.comboStreak = 1;
    }

    if (gameState.comboStreak > gameState.longestComboStreak) {
      gameState.longestComboStreak = gameState.comboStreak;
    }

    xp += Gamification.XP.combo;
    showToast('コンボ達成! 野菜+起床パーフェクト!', 'success');
    await DB.saveDailyGoals(dailyGoals);
  }

  return xp;
}

// --- Main export ---

export async function processRecord(type, data, state) {
  let gameState = await DB.getGameState();
  const settings = await DB.getSettings();
  let xpGained = 0;
  const today = getToday();

  if (!gameState.firstRecordDate) {
    gameState.firstRecordDate = today;
  }

  if (type === 'vegetable') {
    gameState.totalVegetableRecords++;
    gameState.totalVegetableGrams += data.grams;
    xpGained += Gamification.XP.vegetableRecord;
    Sound.record();
    xpGained += await processVegetableRecord(gameState, settings, today);
  }

  if (type === 'wakeup') {
    Sound.record();
    xpGained += await processWakeupRecord(gameState, data, today);
  }

  // Streak update (only on first record of the day)
  if (gameState.lastRecordDate !== today) {
    xpGained += updateStreaks(gameState, today);
  }

  // Combo check
  xpGained += await checkCombo(gameState, settings, today);

  // Award XP and check level up
  const oldLevel = Gamification.calculateLevel(gameState.xp).level;
  gameState.xp += xpGained;
  const newLevelInfo = Gamification.calculateLevel(gameState.xp);
  gameState.level = newLevelInfo.level;

  if (xpGained > 0) {
    showXPGain(xpGained);
    Sound.xpGain();
  }

  if (newLevelInfo.level > oldLevel) {
    Sound.levelUp();
    showToast(`Level UP! Lv.${newLevelInfo.level}`, 'success', 5000);
  }

  // Check achievements
  const newAchievements = checkNewAchievements(gameState);
  for (const achievement of newAchievements) {
    gameState.unlockedAchievements.push(achievement.id);
    showAchievementPopup(achievement, () => Sound.achievementUnlock());
  }

  await DB.saveGameState(gameState);
  state.gameState = gameState;

  return { xpGained, newAchievements, gameState };
}
