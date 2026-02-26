export const VegetableValidator = {
  MIN_GRAMS: 0,
  MAX_GRAMS: 1000,
  STEP_GRAMS: 10,

  validate(grams) {
    if (typeof grams !== 'number' || isNaN(grams)) {
      return { valid: false, message: '有効な数値を入力してください' };
    }
    if (grams < this.MIN_GRAMS) {
      return { valid: false, message: `${this.MIN_GRAMS}g以上の数値を入力してください` };
    }
    if (grams > this.MAX_GRAMS) {
      return { valid: false, message: `${this.MAX_GRAMS}g以下の数値を入力してください` };
    }
    return { valid: true };
  },

  clamp(grams) {
    return Math.max(this.MIN_GRAMS, Math.min(this.MAX_GRAMS, grams));
  }
};

export const TimeValidator = {
  validate(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') {
      return { valid: false, message: '有効な時間を入力してください' };
    }
    const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!regex.test(timeStr)) {
      return { valid: false, message: 'HH:MM形式で入力してください' };
    }
    return { valid: true };
  }
};
