// gamification.js - XP, Level, Streak, Score calculations for VegiRise

import { Constants } from './constants.js';

export class Gamification {
  // XP rewards for different actions
  static XP = Constants.Gamification.XP;

  static getXPForLevel(level) {
    // Cumulative XP needed to reach this level
    // Each level N requires 100*(N-1) XP to advance from level N-1 to N
    // Cumulative: 0, 100, 300, 600, 1000, 1500, 2100, 2800, ...
    // Formula: 50 * level * (level - 1)
    if (level <= 1) return 0;
    return 50 * level * (level - 1);
  }

  static calculateLevel(xp) {
    // Find current level based on total XP
    // Solve: 50 * n * (n-1) <= xp
    // n^2 - n - xp/50 <= 0
    // n = (1 + sqrt(1 + 4*xp/50)) / 2
    let level = Math.floor((1 + Math.sqrt(1 + 4 * xp / 50)) / 2);
    // Safety check
    while (this.getXPForLevel(level + 1) <= xp) level++;
    while (level > 1 && this.getXPForLevel(level) > xp) level--;

    const currentLevelXP = this.getXPForLevel(level);
    const nextLevelXP = this.getXPForLevel(level + 1);
    const xpInLevel = xp - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    const progress = xpNeeded > 0 ? xpInLevel / xpNeeded : 0;

    return {
      level,
      currentXP: xpInLevel,
      nextLevelXP: xpNeeded,
      progress: Math.min(1, Math.max(0, progress))
    };
  }

  static calculateWakeupScore(actualTime, goalTime) {
    // actualTime, goalTime: 'HH:MM' strings
    const [aH, aM] = actualTime.split(':').map(Number);
    const [gH, gM] = goalTime.split(':').map(Number);
    const actualMinutes = aH * 60 + aM;
    const goalMinutes = gH * 60 + gM;
    const diffMinutes = actualMinutes - goalMinutes; // negative = early, positive = late

    const score = Math.max(0, 100 - Math.abs(diffMinutes) * 2);

    return { score, diffMinutes };
  }

  static calculateDayScore(vegTotal, vegGoals, wakeupScore) {
    // Vegetable score (0-100):
    // 0 -> 0, minimum -> 40, standard -> 70, target -> 100
    let vegScore = 0;
    if (vegTotal <= 0) {
      vegScore = 0;
    } else if (vegTotal <= vegGoals.minimum) {
      vegScore = (vegTotal / vegGoals.minimum) * 40;
    } else if (vegTotal <= vegGoals.standard) {
      vegScore = 40 + ((vegTotal - vegGoals.minimum) / (vegGoals.standard - vegGoals.minimum)) * 30;
    } else if (vegTotal <= vegGoals.target) {
      vegScore = 70 + ((vegTotal - vegGoals.standard) / (vegGoals.target - vegGoals.standard)) * 30;
    } else {
      vegScore = 100;
    }

    // Wakeup score: already 0-100, null means 0
    const wakeup = wakeupScore != null ? wakeupScore : 0;

    // Weighted: vegetables 60%, wakeup 40%
    return Math.round(vegScore * 0.6 + wakeup * 0.4);
  }
}
