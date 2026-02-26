import { showToast } from './ui.js';

export class ErrorHandler {
  static handle(error, context = '') {
    console.error(`[Error${context ? ` - ${context}` : ''}]`, error);
    const message = this.getErrorMessage(error);
    showToast(message, 'error', 5000);
  }

  static getErrorMessage(error) {
    if (error.name === 'QuotaExceededError') return '保存容量がいっぱいです';
    if (error.name === 'NetworkError') return 'ネットワークエラーが発生しました';
    return 'エラーが発生しました';
  }

  static async safeExecute(fn, context = '') {
    try {
      return await fn();
    } catch (error) {
      this.handle(error, context);
      return null;
    }
  }
}
