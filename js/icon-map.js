// icon-map.js - Emoji to custom image mapping for VegiRise

export const ICON_MAP = {
  // Navigation
  '🏠': 'images/nav/nav-home.png',
  '📅': 'images/nav/nav-history.png',
  '🏆': 'images/nav/nav-achievements.png',
  '⚙️': 'images/nav/nav-settings.png',
  // Section
  '🔥': 'images/section/sec-fire.png',
  '🥦': 'images/section/sec-broccoli.png',
  '⏰': 'images/section/sec-clock.png',
  '📊': 'images/section/sec-chart.png',
  '🌅': 'images/section/sec-sunrise.png',
  '🔊': 'images/section/sec-sound.png',
  '⚠️': 'images/section/sec-warning.png',
  // Badges
  '🏅': 'images/badge/badge-medal.png',
  '💪': 'images/badge/badge-muscle.png',
  '👑': 'images/badge/badge-crown.png',
  '🎊': 'images/badge/badge-confetti.png',
  '✨': 'images/badge/badge-sparkle.png',
  '🌟': 'images/badge/badge-glowing-star.png',
  '🐉': 'images/badge/badge-dragon.png',
  '🌱': 'images/badge/badge-seedling.png',
  '🥬': 'images/badge/badge-leafy-green.png',
  '🥗': 'images/badge/badge-salad.png',
  '🌿': 'images/badge/badge-herb.png',
  '🌳': 'images/badge/badge-tree.png',
  '🏔️': 'images/badge/badge-mountain.png',
  '🗻': 'images/badge/badge-fuji.png',
  '🌍': 'images/badge/badge-globe.png',
  '🪐': 'images/badge/badge-planet.png',
  '🚀': 'images/badge/badge-rocket.png',
  '⭐': 'images/badge/badge-star.png',
  '🎯': 'images/badge/badge-target.png',
  '💚': 'images/badge/badge-green-heart.png',
  '☀️': 'images/badge/badge-sun.png',
  '🌞': 'images/badge/badge-sun-face.png',
  '💫': 'images/badge/badge-dizzy.png',
  '📝': 'images/badge/badge-memo.png',
  '📋': 'images/badge/badge-clipboard.png',
  '📖': 'images/badge/badge-book.png',
  '📚': 'images/badge/badge-books.png',
  '🗃️': 'images/badge/badge-file-cabinet.png',
  '💎': 'images/badge/badge-gem.png',
  '🔮': 'images/badge/badge-crystal-ball.png',
  '💠': 'images/badge/badge-diamond.png',
  '🌈': 'images/badge/badge-rainbow.png',
  '🐓': 'images/badge/badge-rooster.png',
  '🎉': 'images/badge/badge-party.png',
  '🎂': 'images/badge/badge-cake.png',
  '🎆': 'images/badge/badge-fireworks.png',
  '🌠': 'images/badge/badge-shooting-star.png',
  '🎖️': 'images/badge/badge-military-medal.png',
  '🗂️': 'images/badge/badge-card-index.png',
  '🍽️': 'images/badge/badge-plate.png',
  '🧘': 'images/badge/badge-yoga.png',
  '💯': 'images/badge/badge-hundred.png',
  '🔒': 'images/badge/badge-lock.png',
};

export function iconImg(emoji, cls = '', size = '') {
  const src = ICON_MAP[emoji];
  if (!src) return emoji;
  const sizeAttr = size ? ` width="${size}" height="${size}"` : '';
  const classAttr = cls ? ` class="${cls}"` : '';
  return `<img src="${src}"${classAttr}${sizeAttr} alt="" loading="lazy" draggable="false">`;
}
