// db.js - IndexedDB wrapper for VegiRise

import { getToday as _getToday } from './utils.js';
import { DEFAULT_VEG_GOALS, Constants } from './constants.js';

// Re-export getToday for backward compatibility
export const getToday = _getToday;

const DB_NAME = 'vegi-rise-db';
const DB_VERSION = 3;

const DEFAULT_SETTINGS = {
  vegetableGoals: { ...DEFAULT_VEG_GOALS },
  wakeupGoalTime: Constants.Wakeup.DEFAULT_GOAL,
  soundEnabled: true,
  getUpTimeEnabled: true
};

const DEFAULT_GAME_STATE = {
  xp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  totalRecordDays: 0,
  totalVegetableGrams: 0,
  totalVegetableRecords: 0,
  totalWakeupRecords: 0,
  perfectWakeupCount: 0,
  perfectWakeupStreak: 0,
  longestPerfectWakeupStreak: 0,
  comboStreak: 0,
  longestComboStreak: 0,
  comboCount: 0,
  daysMinimumGoalMet: 0,
  daysStandardGoalMet: 0,
  daysTargetGoalMet: 0,
  maxDailyVegetable: 0,
  unlockedAchievements: [],
  lastRecordDate: null,
  firstRecordDate: null,
  over1000gDays: 0,
  earlyBirdCount: 0,
  monthlyPerfectMonths: 0,
  max3MealsReached: false,
  lastWakeupDate: null
};

export class DB {
  static db = null;

  static async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const oldVersion = event.oldVersion;

        if (oldVersion < 1) {
          const vegStore = db.createObjectStore('vegetables', { keyPath: 'id', autoIncrement: true });
          vegStore.createIndex('date', 'date', { unique: false });
          db.createObjectStore('wakeups', { keyPath: 'date' });
          db.createObjectStore('settings', { keyPath: 'key' });
          db.createObjectStore('gameState', { keyPath: 'key' });
        }

        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('dailyGoals')) {
            db.createObjectStore('dailyGoals', { keyPath: 'date' });
          }
        }

        if (oldVersion < 3) {
          // 古いwakeupデータのtimeフィールドをwakeupTimeにリネーム
          // onupgradeneeded内では既存のトランザクション（event.target.transaction）を使用する必要がある
          if (event.target.transaction) {
            const store = event.target.transaction.objectStore('wakeups');
            const request = store.openCursor();
            request.onsuccess = (e) => {
              const cursor = e.target.result;
              if (cursor) {
                const data = cursor.value;
                if (data.time && !data.wakeupTime) {
                  data.wakeupTime = data.time;
                  delete data.time;
                  cursor.update(data);
                }
                cursor.continue();
              }
            };
          }
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        try {
          const settings = await this._getRaw('settings', 'main');
          if (!settings) {
            await this._putRaw('settings', { key: 'main', ...DEFAULT_SETTINGS });
          }
          const gameState = await this._getRaw('gameState', 'main');
          if (!gameState) {
            await this._putRaw('gameState', { key: 'main', ...DEFAULT_GAME_STATE });
          }
        } catch (e) {
          console.error('DB init: failed to initialize defaults', e);
        }
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  static close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  static _getRaw(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  static _putRaw(storeName, value) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // --- Vegetable records ---

  static async addVegetable(grams) {
    try {
      const date = getToday();
      const timestamp = Date.now();
      const record = { date, grams, timestamp };

      return new Promise((resolve, reject) => {
        const tx = this.db.transaction('vegetables', 'readwrite');
        const store = tx.objectStore('vegetables');
        const request = store.add(record);
        request.onsuccess = () => {
          resolve({ id: request.result, date, grams, timestamp });
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('DB.addVegetable failed', e);
      throw e;
    }
  }

  static async getVegetables(date) {
    try {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction('vegetables', 'readonly');
        const store = tx.objectStore('vegetables');
        const index = store.index('date');
        const request = index.getAll(date);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('DB.getVegetables failed', e);
      throw e;
    }
  }

  static async getVegetableById(id) {
    try {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction('vegetables', 'readonly');
        const store = tx.objectStore('vegetables');
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('DB.getVegetableById failed', e);
      throw e;
    }
  }

  static async getDayVegetableTotal(date) {
    try {
      const records = await this.getVegetables(date);
      return records.reduce((sum, r) => sum + r.grams, 0);
    } catch (e) {
      console.error('DB.getDayVegetableTotal failed', e);
      throw e;
    }
  }

  static async deleteVegetable(id) {
    try {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction('vegetables', 'readwrite');
        const store = tx.objectStore('vegetables');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('DB.deleteVegetable failed', e);
      throw e;
    }
  }

  // --- Wakeup records ---

  static async setWakeup(date, wakeupTime, getUpTime, goalTime, score, diffMinutes) {
    try {
      const record = { date, wakeupTime, getUpTime, goalTime, diffMinutes, score };
      await this._putRaw('wakeups', record);
      return record;
    } catch (e) {
      console.error('DB.setWakeup failed', e);
      throw e;
    }
  }

  static async setWakeupTime(date, wakeupTime) {
    try {
      const existing = await this.getWakeup(date);
      const record = {
        date,
        wakeupTime,
        getUpTime: existing?.getUpTime || null,
        goalTime: existing?.goalTime || null,
        diffMinutes: existing?.diffMinutes || null,
        score: existing?.score || null
      };
      await this._putRaw('wakeups', record);
      return record;
    } catch (e) {
      console.error('DB.setWakeupTime failed', e);
      throw e;
    }
  }

  static async setGetUpTime(date, getUpTime, goalTime, score, diffMinutes) {
    try {
      const existing = await this.getWakeup(date);
      const record = {
        date,
        wakeupTime: existing?.wakeupTime || getUpTime,
        getUpTime,
        goalTime,
        diffMinutes,
        score
      };
      await this._putRaw('wakeups', record);
      return record;
    } catch (e) {
      console.error('DB.setGetUpTime failed', e);
      throw e;
    }
  }

  static async getWakeup(date) {
    try {
      return this._getRaw('wakeups', date);
    } catch (e) {
      console.error('DB.getWakeup failed', e);
      throw e;
    }
  }

  // --- Settings ---

  static async getSettings() {
    try {
      const raw = await this._getRaw('settings', 'main');
      if (!raw) return { ...DEFAULT_SETTINGS };
      const { key, ...settings } = raw;
      return { ...DEFAULT_SETTINGS, ...settings };
    } catch (e) {
      console.error('DB.getSettings failed', e);
      throw e;
    }
  }

  static async saveSettings(settings) {
    try {
      await this._putRaw('settings', { key: 'main', ...settings });
    } catch (e) {
      console.error('DB.saveSettings failed', e);
      throw e;
    }
  }

  // --- Game State ---

  static async getGameState() {
    try {
      const raw = await this._getRaw('gameState', 'main');
      if (!raw) return { ...DEFAULT_GAME_STATE };
      const { key, ...state } = raw;
      return { ...DEFAULT_GAME_STATE, ...state };
    } catch (e) {
      console.error('DB.getGameState failed', e);
      throw e;
    }
  }

  static async saveGameState(state) {
    try {
      await this._putRaw('gameState', { key: 'main', ...state });
    } catch (e) {
      console.error('DB.saveGameState failed', e);
      throw e;
    }
  }

  // --- Daily Goals ---

  static async getDailyGoals(date) {
    try {
      const result = await this._getRaw('dailyGoals', date);
      return result || { date, minimum: false, standard: false, target: false, combo: false };
    } catch {
      return { date, minimum: false, standard: false, target: false, combo: false };
    }
  }

  static async saveDailyGoals(goals) {
    try {
      await this._putRaw('dailyGoals', goals);
    } catch (e) {
      console.error('DB.saveDailyGoals failed', e);
      throw e;
    }
  }

  // --- Monthly data for calendar (optimized with IDBKeyRange) ---

  static async getMonthData(year, month) {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const daysInMonth = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

      const data = new Map();

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        data.set(dateStr, { vegTotal: 0, wakeup: null });
      }

      // Fetch all vegetables for the month in one transaction
      const vegRecords = await new Promise((resolve, reject) => {
        const tx = this.db.transaction('vegetables', 'readonly');
        const store = tx.objectStore('vegetables');
        const index = store.index('date');
        const range = IDBKeyRange.bound(startDate, endDate);
        const request = index.getAll(range);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });

      for (const record of vegRecords) {
        const dayData = data.get(record.date);
        if (dayData) {
          dayData.vegTotal += record.grams;
        }
      }

      // Fetch all wakeups for the month in one transaction
      const wakeupRecords = await new Promise((resolve, reject) => {
        const tx = this.db.transaction('wakeups', 'readonly');
        const store = tx.objectStore('wakeups');
        const range = IDBKeyRange.bound(startDate, endDate);
        const results = [];
        const cursorReq = store.openCursor(range);
        cursorReq.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        cursorReq.onerror = () => reject(cursorReq.error);
      });

      for (const wakeup of wakeupRecords) {
        const dayData = data.get(wakeup.date);
        if (dayData) {
          dayData.wakeup = {
            time: wakeup.wakeupTime || wakeup.time,  // 旧データ互換
            score: wakeup.score,
            getUpTime: wakeup.getUpTime
          };
        }
      }

      return data;
    } catch (e) {
      console.error('DB.getMonthData failed', e);
      throw e;
    }
  }
}
