// achievements.js - 100 achievement badges for VegiRise

export const ACHIEVEMENT_CATEGORIES = {
  streak: { name: '連続記録', icon: '🔥', color: '#fb923c' },
  vegTotal: { name: '野菜累計', icon: '🥦', color: '#4ade80' },
  vegDaily: { name: '野菜日次目標', icon: '🥗', color: '#22c55e' },
  wakeup: { name: '起床パーフェクト', icon: '⏰', color: '#60a5fa' },
  level: { name: 'レベル到達', icon: '⭐', color: '#fbbf24' },
  records: { name: '記録回数', icon: '📝', color: '#a78bfa' },
  combo: { name: 'コンボ', icon: '💎', color: '#f472b6' },
  special: { name: '特別', icon: '🌟', color: '#fb923c' }
};

export const ACHIEVEMENTS = [
  // ========================================
  // === 連続記録ストリーク (12個) ===
  // ========================================
  { id: 'streak_3', name: '三日坊主卒業', description: '3日連続で記録した', icon: '🔥', category: 'streak', check: (gs) => gs.longestStreak >= 3 },
  { id: 'streak_7', name: '一週間の習慣', description: '7日連続で記録した', icon: '🔥', category: 'streak', check: (gs) => gs.longestStreak >= 7 },
  { id: 'streak_14', name: '二週間継続', description: '14日連続で記録した', icon: '🔥', category: 'streak', check: (gs) => gs.longestStreak >= 14 },
  { id: 'streak_21', name: '習慣形成', description: '21日連続で記録（習慣化の目安！）', icon: '🔥', category: 'streak', check: (gs) => gs.longestStreak >= 21 },
  { id: 'streak_30', name: '一ヶ月達成', description: '30日連続で記録した', icon: '🏅', category: 'streak', check: (gs) => gs.longestStreak >= 30 },
  { id: 'streak_60', name: '二ヶ月の鉄人', description: '60日連続で記録した', icon: '💪', category: 'streak', check: (gs) => gs.longestStreak >= 60 },
  { id: 'streak_90', name: '四半期マスター', description: '90日連続で記録した', icon: '🏆', category: 'streak', check: (gs) => gs.longestStreak >= 90 },
  { id: 'streak_180', name: '半年の誓い', description: '180日連続で記録した', icon: '👑', category: 'streak', check: (gs) => gs.longestStreak >= 180 },
  { id: 'streak_365', name: '一年の大記録', description: '365日連続！1年間毎日記録した', icon: '🎊', category: 'streak', check: (gs) => gs.longestStreak >= 365 },
  { id: 'streak_500', name: '500日の軌跡', description: '500日連続で記録した', icon: '✨', category: 'streak', check: (gs) => gs.longestStreak >= 500 },
  { id: 'streak_730', name: '二年間の継続', description: '730日連続！2年間毎日記録した', icon: '🌟', category: 'streak', check: (gs) => gs.longestStreak >= 730 },
  { id: 'streak_1000', name: '千日修行', description: '1000日連続で記録した伝説の記録', icon: '🐉', category: 'streak', check: (gs) => gs.longestStreak >= 1000 },

  // ========================================
  // === 野菜累計 (12個) ===
  // ========================================
  { id: 'veg_total_1kg', name: '野菜1kg', description: '累計1kgの野菜を食べた', icon: '🌱', category: 'vegTotal', check: (gs) => gs.totalVegetableGrams >= 1000 },
  { id: 'veg_total_5kg', name: '野菜5kg', description: '累計5kgの野菜を食べた', icon: '🥬', category: 'vegTotal', check: (gs) => gs.totalVegetableGrams >= 5000 },
  { id: 'veg_total_10kg', name: '野菜10kg', description: '累計10kgの野菜を食べた', icon: '🥦', category: 'vegTotal', check: (gs) => gs.totalVegetableGrams >= 10000 },
  { id: 'veg_total_25kg', name: '野菜25kg', description: '累計25kgの野菜を食べた', icon: '🥗', category: 'vegTotal', check: (gs) => gs.totalVegetableGrams >= 25000 },
  { id: 'veg_total_50kg', name: '野菜50kg', description: '累計50kgの野菜を食べた', icon: '🌿', category: 'vegTotal', check: (gs) => gs.totalVegetableGrams >= 50000 },
  { id: 'veg_total_100kg', name: '野菜100kg', description: '累計100kg！体重分の野菜を食べた', icon: '🌳', category: 'vegTotal', check: (gs) => gs.totalVegetableGrams >= 100000 },
  { id: 'veg_total_250kg', name: '野菜250kg', description: '累計250kgの野菜を食べた', icon: '🏔️', category: 'vegTotal', check: (gs) => gs.totalVegetableGrams >= 250000 },
  { id: 'veg_total_500kg', name: '野菜500kg', description: '累計500kg！すごい量です', icon: '🗻', category: 'vegTotal', check: (gs) => gs.totalVegetableGrams >= 500000 },
  { id: 'veg_total_1000kg', name: '野菜1トン', description: '累計1トンの野菜を食べた！', icon: '🌍', category: 'vegTotal', check: (gs) => gs.totalVegetableGrams >= 1000000 },
  { id: 'veg_total_1500kg', name: '野菜1.5トン', description: '累計1.5トンの野菜を食べた', icon: '🪐', category: 'vegTotal', check: (gs) => gs.totalVegetableGrams >= 1500000 },
  { id: 'veg_total_2000kg', name: '野菜2トン', description: '累計2トン！車1台分の野菜', icon: '🚀', category: 'vegTotal', check: (gs) => gs.totalVegetableGrams >= 2000000 },
  { id: 'veg_total_3000kg', name: '野菜3トン', description: '累計3トンの野菜を食べた伝説', icon: '⭐', category: 'vegTotal', check: (gs) => gs.totalVegetableGrams >= 3000000 },

  // ========================================
  // === 野菜日次目標達成 (15個) ===
  // ========================================
  // 最低目標 (5)
  { id: 'veg_min_first', name: '最低目標初達成', description: '初めて最低目標を達成した', icon: '🎯', category: 'vegDaily', check: (gs) => gs.daysMinimumGoalMet >= 1 },
  { id: 'veg_min_10', name: '最低目標10日', description: '最低目標を10日達成した', icon: '🎯', category: 'vegDaily', check: (gs) => gs.daysMinimumGoalMet >= 10 },
  { id: 'veg_min_30', name: '最低目標30日', description: '最低目標を30日達成した', icon: '🎯', category: 'vegDaily', check: (gs) => gs.daysMinimumGoalMet >= 30 },
  { id: 'veg_min_100', name: '最低目標100日', description: '最低目標を100日達成した', icon: '🎯', category: 'vegDaily', check: (gs) => gs.daysMinimumGoalMet >= 100 },
  { id: 'veg_min_365', name: '最低目標365日', description: '最低目標を1年分達成した', icon: '🎯', category: 'vegDaily', check: (gs) => gs.daysMinimumGoalMet >= 365 },
  // 標準目標 (5)
  { id: 'veg_std_first', name: '標準目標初達成', description: '初めて標準目標を達成した', icon: '💚', category: 'vegDaily', check: (gs) => gs.daysStandardGoalMet >= 1 },
  { id: 'veg_std_10', name: '標準目標10日', description: '標準目標を10日達成した', icon: '💚', category: 'vegDaily', check: (gs) => gs.daysStandardGoalMet >= 10 },
  { id: 'veg_std_30', name: '標準目標30日', description: '標準目標を30日達成した', icon: '💚', category: 'vegDaily', check: (gs) => gs.daysStandardGoalMet >= 30 },
  { id: 'veg_std_100', name: '標準目標100日', description: '標準目標を100日達成した', icon: '💚', category: 'vegDaily', check: (gs) => gs.daysStandardGoalMet >= 100 },
  { id: 'veg_std_365', name: '標準目標365日', description: '標準目標を1年分達成した', icon: '💚', category: 'vegDaily', check: (gs) => gs.daysStandardGoalMet >= 365 },
  // 目標 (5)
  { id: 'veg_target_first', name: '目標初達成', description: '初めて目標を達成した！', icon: '🏆', category: 'vegDaily', check: (gs) => gs.daysTargetGoalMet >= 1 },
  { id: 'veg_target_10', name: '目標10日', description: '目標を10日達成した', icon: '🏆', category: 'vegDaily', check: (gs) => gs.daysTargetGoalMet >= 10 },
  { id: 'veg_target_30', name: '目標30日', description: '目標を30日達成した', icon: '🏆', category: 'vegDaily', check: (gs) => gs.daysTargetGoalMet >= 30 },
  { id: 'veg_target_100', name: '目標100日', description: '目標を100日達成した', icon: '🏆', category: 'vegDaily', check: (gs) => gs.daysTargetGoalMet >= 100 },
  { id: 'veg_target_365', name: '目標365日', description: '目標を1年分達成した！すごい！', icon: '🏆', category: 'vegDaily', check: (gs) => gs.daysTargetGoalMet >= 365 },

  // ========================================
  // === 起床パーフェクト (12個) ===
  // ========================================
  { id: 'wake_first', name: '早起き初日', description: '初めてパーフェクト起床した', icon: '🌅', category: 'wakeup', check: (gs) => gs.perfectWakeupCount >= 1 },
  { id: 'wake_3', name: '3日連続パーフェクト', description: '3日連続でパーフェクト起床', icon: '🌅', category: 'wakeup', check: (gs) => gs.longestPerfectWakeupStreak >= 3 },
  { id: 'wake_7', name: '1週間パーフェクト', description: '7日連続でパーフェクト起床', icon: '☀️', category: 'wakeup', check: (gs) => gs.longestPerfectWakeupStreak >= 7 },
  { id: 'wake_14', name: '2週間パーフェクト', description: '14日連続でパーフェクト起床', icon: '☀️', category: 'wakeup', check: (gs) => gs.longestPerfectWakeupStreak >= 14 },
  { id: 'wake_21', name: '3週間パーフェクト', description: '21日連続でパーフェクト起床', icon: '🌞', category: 'wakeup', check: (gs) => gs.longestPerfectWakeupStreak >= 21 },
  { id: 'wake_30', name: '1ヶ月パーフェクト', description: '30日連続でパーフェクト起床', icon: '🌞', category: 'wakeup', check: (gs) => gs.longestPerfectWakeupStreak >= 30 },
  { id: 'wake_60', name: '2ヶ月パーフェクト', description: '60日連続でパーフェクト起床', icon: '🏅', category: 'wakeup', check: (gs) => gs.longestPerfectWakeupStreak >= 60 },
  { id: 'wake_90', name: '3ヶ月パーフェクト', description: '90日連続でパーフェクト起床', icon: '🏆', category: 'wakeup', check: (gs) => gs.longestPerfectWakeupStreak >= 90 },
  { id: 'wake_180', name: '半年パーフェクト', description: '180日連続でパーフェクト起床！', icon: '👑', category: 'wakeup', check: (gs) => gs.longestPerfectWakeupStreak >= 180 },
  { id: 'wake_365', name: '1年パーフェクト', description: '365日連続でパーフェクト起床！', icon: '🎊', category: 'wakeup', check: (gs) => gs.longestPerfectWakeupStreak >= 365 },
  { id: 'wake_500', name: '500日パーフェクト', description: '500日連続パーフェクト起床', icon: '✨', category: 'wakeup', check: (gs) => gs.longestPerfectWakeupStreak >= 500 },
  { id: 'wake_730', name: '2年パーフェクト', description: '730日連続パーフェクト起床！伝説', icon: '🐉', category: 'wakeup', check: (gs) => gs.longestPerfectWakeupStreak >= 730 },

  // ========================================
  // === レベル到達 (10個) ===
  // ========================================
  { id: 'level_5', name: 'レベル5', description: 'レベル5に到達した', icon: '⭐', category: 'level', check: (gs) => gs.level >= 5 },
  { id: 'level_10', name: 'レベル10', description: 'レベル10に到達！二桁突入', icon: '⭐', category: 'level', check: (gs) => gs.level >= 10 },
  { id: 'level_15', name: 'レベル15', description: 'レベル15に到達した', icon: '🌟', category: 'level', check: (gs) => gs.level >= 15 },
  { id: 'level_20', name: 'レベル20', description: 'レベル20！着実に成長中', icon: '🌟', category: 'level', check: (gs) => gs.level >= 20 },
  { id: 'level_25', name: 'レベル25', description: 'レベル25に到達した', icon: '💫', category: 'level', check: (gs) => gs.level >= 25 },
  { id: 'level_30', name: 'レベル30', description: 'レベル30！ベテランの域に', icon: '💫', category: 'level', check: (gs) => gs.level >= 30 },
  { id: 'level_40', name: 'レベル40', description: 'レベル40に到達した', icon: '🏅', category: 'level', check: (gs) => gs.level >= 40 },
  { id: 'level_50', name: 'レベル50', description: 'レベル50！半世紀レベル達成', icon: '🏆', category: 'level', check: (gs) => gs.level >= 50 },
  { id: 'level_75', name: 'レベル75', description: 'レベル75！達人の境地', icon: '👑', category: 'level', check: (gs) => gs.level >= 75 },
  { id: 'level_100', name: 'レベル100', description: 'レベル100到達！カンスト目前', icon: '🐉', category: 'level', check: (gs) => gs.level >= 100 },

  // ========================================
  // === 記録回数 (10個) ===
  // ========================================
  { id: 'records_1', name: '初めての記録', description: '初めて記録した！', icon: '📝', category: 'records', check: (gs) => (gs.totalVegetableRecords + gs.totalWakeupRecords) >= 1 },
  { id: 'records_10', name: '10回記録', description: '合計10回の記録を達成', icon: '📝', category: 'records', check: (gs) => (gs.totalVegetableRecords + gs.totalWakeupRecords) >= 10 },
  { id: 'records_50', name: '50回記録', description: '合計50回の記録！慣れてきた', icon: '📋', category: 'records', check: (gs) => (gs.totalVegetableRecords + gs.totalWakeupRecords) >= 50 },
  { id: 'records_100', name: '100回記録', description: '合計100回記録！三桁突入', icon: '📋', category: 'records', check: (gs) => (gs.totalVegetableRecords + gs.totalWakeupRecords) >= 100 },
  { id: 'records_250', name: '250回記録', description: '合計250回の記録を達成', icon: '📖', category: 'records', check: (gs) => (gs.totalVegetableRecords + gs.totalWakeupRecords) >= 250 },
  { id: 'records_500', name: '500回記録', description: '合計500回！記録の達人', icon: '📖', category: 'records', check: (gs) => (gs.totalVegetableRecords + gs.totalWakeupRecords) >= 500 },
  { id: 'records_1000', name: '1000回記録', description: '合計1000回の大台を突破', icon: '📚', category: 'records', check: (gs) => (gs.totalVegetableRecords + gs.totalWakeupRecords) >= 1000 },
  { id: 'records_2000', name: '2000回記録', description: '合計2000回！記録マニア', icon: '📚', category: 'records', check: (gs) => (gs.totalVegetableRecords + gs.totalWakeupRecords) >= 2000 },
  { id: 'records_3000', name: '3000回記録', description: '合計3000回の記録を達成', icon: '🗃️', category: 'records', check: (gs) => (gs.totalVegetableRecords + gs.totalWakeupRecords) >= 3000 },
  { id: 'records_5000', name: '5000回記録', description: '合計5000回！記録の神様', icon: '🗃️', category: 'records', check: (gs) => (gs.totalVegetableRecords + gs.totalWakeupRecords) >= 5000 },

  // ========================================
  // === コンボ (10個) ===
  // ========================================
  { id: 'combo_first', name: '初コンボ', description: '野菜目標と起床パーフェクトを同日達成', icon: '💎', category: 'combo', check: (gs) => gs.comboCount >= 1 },
  { id: 'combo_3', name: 'コンボ3連続', description: '3日連続でコンボを達成', icon: '💎', category: 'combo', check: (gs) => gs.longestComboStreak >= 3 },
  { id: 'combo_7', name: 'コンボ1週間', description: '7日連続でコンボ達成！絶好調', icon: '💎', category: 'combo', check: (gs) => gs.longestComboStreak >= 7 },
  { id: 'combo_14', name: 'コンボ2週間', description: '14日連続コンボ！完璧な2週間', icon: '🔮', category: 'combo', check: (gs) => gs.longestComboStreak >= 14 },
  { id: 'combo_30', name: 'コンボ1ヶ月', description: '30日連続コンボ！鉄壁の習慣', icon: '🔮', category: 'combo', check: (gs) => gs.longestComboStreak >= 30 },
  { id: 'combo_60', name: 'コンボ2ヶ月', description: '60日連続コンボ達成', icon: '💠', category: 'combo', check: (gs) => gs.longestComboStreak >= 60 },
  { id: 'combo_90', name: 'コンボ3ヶ月', description: '90日連続コンボ！四半期制覇', icon: '💠', category: 'combo', check: (gs) => gs.longestComboStreak >= 90 },
  { id: 'combo_180', name: 'コンボ半年', description: '180日連続コンボ！半年間完璧', icon: '🌈', category: 'combo', check: (gs) => gs.longestComboStreak >= 180 },
  { id: 'combo_365', name: 'コンボ1年', description: '365日連続コンボ！1年間毎日完璧', icon: '🌈', category: 'combo', check: (gs) => gs.longestComboStreak >= 365 },
  { id: 'combo_730', name: 'コンボ2年', description: '730日連続コンボ！人間を超えた', icon: '🐉', category: 'combo', check: (gs) => gs.longestComboStreak >= 730 },

  // ========================================
  // === 特別 (19個) ===
  // ========================================
  { id: 'special_1000g', name: '野菜マスター', description: '1日で1000g以上の野菜を食べた', icon: '🥦', category: 'special', check: (gs) => gs.maxDailyVegetable >= 1000 },
  { id: 'special_early', name: '早起き鳥', description: '5:30より前に起床を記録した', icon: '🐓', category: 'special', check: (gs) => gs.earlyBirdCount >= 1 },
  { id: 'special_100days', name: '100日記念', description: 'アプリ利用開始から100日経過', icon: '🎉', category: 'special', check: (gs) => gs.totalRecordDays >= 100 },
  { id: 'special_halfyear', name: '半年記念', description: 'アプリ利用開始から180日以上記録', icon: '🎊', category: 'special', check: (gs) => gs.totalRecordDays >= 180 },
  { id: 'special_1year', name: '一年記念', description: '365日以上記録した！', icon: '🎂', category: 'special', check: (gs) => gs.totalRecordDays >= 365 },
  { id: 'special_2year', name: '二年記念', description: '730日以上記録した！', icon: '🎆', category: 'special', check: (gs) => gs.totalRecordDays >= 730 },
  { id: 'special_3year', name: '三年記念', description: '1095日以上記録した！', icon: '🌠', category: 'special', check: (gs) => gs.totalRecordDays >= 1095 },
  { id: 'special_monthly', name: '月間パーフェクト', description: '1ヶ月間毎日記録した', icon: '📅', category: 'special', check: (gs) => gs.monthlyPerfectMonths >= 1 },
  { id: 'special_monthly3', name: '三ヶ月パーフェクト', description: '月間パーフェクトを3回達成', icon: '📅', category: 'special', check: (gs) => gs.monthlyPerfectMonths >= 3 },
  { id: 'special_monthly6', name: '半年パーフェクト', description: '月間パーフェクトを6回達成', icon: '📅', category: 'special', check: (gs) => gs.monthlyPerfectMonths >= 6 },
  { id: 'special_monthly12', name: '年間パーフェクト', description: '月間パーフェクトを12回達成', icon: '📅', category: 'special', check: (gs) => gs.monthlyPerfectMonths >= 12 },
  { id: 'special_veteran', name: 'ベテラン', description: 'レベル25以上かつ100日以上記録', icon: '🎖️', category: 'special', check: (gs) => gs.level >= 25 && gs.totalRecordDays >= 100 },
  {
    id: 'special_collector', name: 'コレクター', description: '全カテゴリのバッジを最低1つ獲得', icon: '🗂️', category: 'special',
    check: (gs) => {
      const cats = new Set(
        (gs.unlockedAchievements || [])
          .map(id => { const a = ACHIEVEMENTS.find(a => a.id === id); return a ? a.category : null; })
          .filter(Boolean)
      );
      return cats.size >= 7; // 7 categories excluding 'special' itself
    }
  },
  { id: 'special_3meals', name: '三食野菜', description: '1日に3回以上野菜を記録した', icon: '🍽️', category: 'special', check: (gs) => gs.max3MealsReached === true },
  { id: 'special_1000g_10', name: '野菜キング', description: '1000g以上を10日達成', icon: '👑', category: 'special', check: (gs) => gs.over1000gDays >= 10 },
  { id: 'special_dedicated', name: '野菜の求道者', description: '野菜累計100kg以上かつレベル30以上', icon: '🧘', category: 'special', check: (gs) => gs.totalVegetableGrams >= 100000 && gs.level >= 30 },
  { id: 'special_perfect10', name: '完璧な朝10回', description: '起床スコア100点を10回達成', icon: '💯', category: 'special', check: (gs) => gs.perfectWakeupCount >= 10 },
  { id: 'special_perfect100', name: '完璧な朝100回', description: '起床スコア100点を100回達成', icon: '💯', category: 'special', check: (gs) => gs.perfectWakeupCount >= 100 },
  { id: 'special_legend', name: 'レジェンド', description: '1000日記録+Lv50+野菜1トン', icon: '🐉', category: 'special', check: (gs) => gs.totalRecordDays >= 1000 && gs.level >= 50 && gs.totalVegetableGrams >= 1000000 },
];

export function checkNewAchievements(gameState) {
  const unlocked = gameState.unlockedAchievements || [];
  const newlyUnlocked = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlocked.includes(achievement.id)) {
      try {
        if (achievement.check(gameState)) {
          newlyUnlocked.push(achievement);
        }
      } catch (e) {
        // skip if check fails
      }
    }
  }

  return newlyUnlocked;
}
