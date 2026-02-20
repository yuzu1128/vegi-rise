// utils.js - Shared utilities for VegiRise

/**
 * getToday() - 今日の日付を'YYYY-MM-DD'形式で返す
 */
export function getToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * formatGrams(g) - グラム数を表示用にフォーマット
 * 1000g以上はkg表示
 */
export function formatGrams(g) {
  if (g >= 1000) {
    return (g / 1000).toFixed(1) + 'kg';
  }
  return g + 'g';
}

/**
 * minutesToTimeStr(minutes) - 分数をHH:MM形式に変換
 */
export function minutesToTimeStr(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

/**
 * debounce(fn, ms) - デバウンス関数
 * ボタン連打防止などに使用
 */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
