// constants.js - Shared constants for VegiRise

export const PAGES = { HOME: 'home', HISTORY: 'history', ACHIEVEMENTS: 'achievements', SETTINGS: 'settings' };
export const TOAST_TYPES = { SUCCESS: 'success', ERROR: 'error', WARNING: 'warning', INFO: 'info' };
export const SCORE_THRESHOLDS = { PERFECT_WAKEUP: 90, EARLY_BIRD_TIME: '05:30' };
export const DEFAULT_VEG_GOALS = { minimum: 350, standard: 500, target: 800 };

export const Constants = {
  Vegetable: {
    MIN_GRAMS: 0,
    MAX_GRAMS: 1000,
    DEFAULT_INPUT: 200,
    PRESETS: [50, 100, 200, 350, 500, 800],
    STEPS: {
      SLIDER: 10,
      INPUT: 1
    }
  },

  Wakeup: {
    DEFAULT_GOAL: '06:00',
    CLOCK_UPDATE_INTERVAL: 1000
  },

  Gamification: {
    XP: {
      vegetableRecord: 10,
      wakeupRecord: 15,
      goalMinimum: 20,
      goalStandard: 35,
      goalTarget: 50,
      perfectWakeup: 25,
      combo: 30,
      streakBonus3: 50,
      streakBonus7: 100,
      streakBonus30: 300
    }
  }
};
