// store.js - Lightweight state management for VegiRise

import { DB } from './db.js';

const _state = {
  currentPage: 'home',
  settings: null,
  gameState: null,
};

const _listeners = new Set();

export const Store = {
  getState() {
    return _state;
  },

  setState(updates) {
    Object.assign(_state, updates);
    _listeners.forEach(fn => fn(_state));
  },

  subscribe(listener) {
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  },

  async refresh() {
    _state.settings = await DB.getSettings();
    _state.gameState = await DB.getGameState();
    _listeners.forEach(fn => fn(_state));
  },

  async updateGameState(gs) {
    await DB.saveGameState(gs);
    _state.gameState = gs;
    _listeners.forEach(fn => fn(_state));
  },

  async updateSettings(s) {
    await DB.saveSettings(s);
    _state.settings = s;
    _listeners.forEach(fn => fn(_state));
  },
};
