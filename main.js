// Inicjalizacja stanu gry
let state = JSON.parse(localStorage.getItem('qurlaCoinState')) || {
  points: 0,
  gems: 0,
  energy: 10,
  maxEnergy: 10,
  dmg: 1,
  exp: 0,
  level: 1,
  regenRate: 1,
  dropRate: 0.1,
  autoHit: 0,
  prestigeLevel: 0,
  inventory: [],
  missions: [],
  clicks: 0,
  coinHP: 10,
  maxCoinHP: 10,
  coinCount: 0,
  coinSkin: 'img/qurlacoin-clicker-gold-coin.png',
  lastOnline: Date.now()
};

// Elementy DOM
const elements = {
  points: document.getElementById('points'),
  gems: document.getElementById('gems'),
  energy: document.getElementById('energy'),
  dmg: document.getElementById('dmg'),
  level: document.getElementById('level'),
  rank: document.getElementById('rank'),
  energyFill: document.getElementById('energy-fill'),
  coinHPFill: document.getElementById('coin-hp-fill'),
  coin: document.getElementById('coin'),
  shop: document.getElementById('shop'),
  inventory: document.getElementById('inventory'),
  inventoryGrid: document.getElementById('inventoryGrid'),
  missions: document.getElementById('missions'),
  missionList: document.getElementById('missionList'),
  minigame: document.getElementById('minigame'),
  minigameArea: document.getElementById('minigameArea'),
  story: document.getElementById('story'),
  adBtn: document.getElementById('adBtn'),
  buyDmg: document.getElementById('buyDmg'),
  buyEnergy: document.getElementById('buyEnergy'),
  buyRegen: document.getElementById('buyRegen'),
  buyAutoHit: document.getElementById('buyAutoHit'),
  buyDropRate: document.getElementById('buyDropRate'),
  buyCoinSkin: document.getElementById('buyCoinSkin'),
  prestigeBtn: document.getElementById('prestigeBtn'),
  clickSound: document.getElementById('clickSound'),
  levelUpSound: document.getElementById('levelUpSound'),
  buySound: document.getElementById('buySound'),
  coinDefeatSound: document.getElementById('coinDefeatSound')
};

// Zapis stanu gry
function saveGame() {
  state.lastOnline = Date.now();
  localStorage.setItem('qurlaCoinState', JSON.stringify(state));
}

// Aktualizacja UI
function updateUI() {
  elements.points.textContent = `QurłaPoints: ${Math.floor(state.points)}`;
  elements.gems.textContent = `QurlaGems: ${state.gems}`;
  elements.energy.textContent = `Energy: ${Math.floor(state.energy)}/${state.maxEnergy}`;
  elements.dmg.textContent = `DMG: ${state.dmg}`;
  elements.level.textContent = `EXP: ${state.exp} | LVL: ${state.level}`;
  elements.rank.textContent = `Rank: ${calculateRank()}`;
  elements.energyFill.style.width = `${(state.energy / state.maxEnergy) * 100}%`;
  elements.coinHPFill.style.width = `${(state.coinHP / state.maxCoinHP) * 100}%`;
  elements.coin.src = state.coinSkin;
  elements.prestigeBtn.disabled = state.level < 10;
  elements.prestigeBtn.style.opacity = state.level < 10 ? 0.5 : 1;
  elements.buyDmg.disabled = state.points < 100 * (state.dmg + 1);
  elements.buyEnergy.disabled = state.points < 50 * (state.maxEnergy / 5);
  elements.buyRegen.disabled = state.points < 30 * (state.regenRate + 1);
  elements.buyAutoHit.disabled = state.points < 200 * (state.autoHit + 1);
  elements.buyDropRate.disabled = state.points < 100 * (state.dropRate * 10 + 1);
  elements.buyCoinSkin.disabled = state.points < 500;
  elements.buyDmg.style.opacity = state.points < 100 * (state.dmg + 1) ? 0.5 : 1;
  elements.buyEnergy.style.opacity = state.points < 50 * (state.maxEnergy / 5) ? 0.5 : 1;
  elements.buyRegen.style.opacity = state.points < 30 * (state.regenRate + 1) ? 0.5 : 1;
  elements.buyAutoHit.style.opacity = state.points < 200 * (state.autoHit + 1) ? 0.5 : 1;
  elements.buyDropRate.style.opacity = state.points < 100 * (state.dropRate * 10 + 1) ? 0.5 : 1;
  elements.buyCoinSkin.style.opacity = state.points < 500 ? 0.5 : 1;
  elements.buyDmg.textContent = `+1 DMG (Cost: ${100 * (state.dmg + 1)})`;
  elements.buyEnergy.textContent = `+5 Max Energy (Cost: ${50 * (state.maxEnergy / 5)})`;
  elements.buyRegen.textContent = `+1 Energy Regen (Cost: ${30 * (state.regenRate + 1)})`;
  elements.buyAutoHit.textContent = `+1 Auto-Hit (Cost: ${200 * (state.autoHit + 1)})`;
  elements.buyDropRate.textContent = `+1% Drop Rate (Cost: ${100 * (state.dropRate * 10 + 1)})`;
  updateStory();
  saveGame();
}

// Powiadomienia
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2000);
}

// Fabuła
const mines = [
  { level: 1, text: 'Welcome to the Qurla Mines! Defeat QurlaCoins to unearth their magic!' },
  { level: 10, text: 'Crystal Caverns unlocked! QurlaCoins grow stronger here.' },
  { level: 20, text: 'Abyssal Depths reached! Face the toughest QurlaCoins yet!' },
  { level: 30, text: 'Eternal Forge discovered! Craft legendary items from QurlaCoins!' }
];

function updateStory() {
  const currentMine = mines.filter(m => state.level >= m.level).pop();
  elements.story.textContent = currentMine.text;
}

// Ranking
function calculateRank() {
  const score = state.points + state.level * 100 + state.gems * 1000 + state.coinCount * 50;
  if (score > 100000) return 'Legend';
  if (score > 50000) return 'Master';
  if (score > 10000) return 'Pro';
  if (score > 1000) return 'Adventurer';
  return 'Novice';
}

// Zdobywanie doświadczenia
function gainExp(amount) {
  state.exp += amount;
  const expNeeded = state.level * 10 * (1 + state.level * 0.2);
  if (state.exp >= expNeeded) {
    state.exp = 0;
    state.level++;
    state.dmg += 1 + state.prestigeLevel;
    elements.levelUpSound.play();
    showNotification(`Level Up! DMG increased to ${state.dmg}!`);
    checkMissions();
  }
  updateUI();
}

// System dropów
const items = [
  { id: 'b2', icon: 'img/b2.png', name: 'B2 Shard', effect: 'dmg', value: 1.5, rarity: 0.3 },
  { id: 'b3', icon: 'img/b3.png', name: 'B3 Crystal', effect: 'energy', value: 10, rarity: 0.2 },
  { id: 'b4', icon: 'img/b4.png', name: 'B4 Gem', effect: 'regen', value: 2, rarity: 0.15 },
  { id: 'b5', icon: 'img/b5.png', name: 'B5 Orb', effect: 'dmg', value: 2, rarity: 0.1 },
  { id: 'paragon', icon: 'img/paragon.png', name: 'Paragon Star', effect: 'points', value: 100, rarity: 0.05 },
  { id: 'beret', icon: 'img/beret.png', name: 'Qurla Beret', effect: 'gems', value: 1, rarity: 0.01 }
];

function dropItem() {
  if (Math.random() < state.dropRate) {
    const roll = Math.random();
    let cumulative = 0;
    for (const item of items) {
      cumulative += item.rarity;
      if (roll < cumulative) {
        addItem(item);
        showNotification(`Dropped ${item.name}!`);
        return;
      }
    }
  }
}

// Kliknięcie monety
elements.coin.addEventListener('click', () => {
  if (state.energy >= 1) {
    const effectiveDmg = state.dmg * (1 + state.prestigeLevel * 0.5);
    state.coinHP -= effectiveDmg;
    state.energy--;
    state.clicks++;
    elements.clickSound.play();
    elements.coin.style.transform = 'scale(0.9)';
    setTimeout(() => (elements.coin.style.transform = 'scale(1)'), 100);
    if (state.coinHP <= 0) {
      state.points += state.maxCoinHP;
      state.coinCount++;
      elements.coinDefeatSound.play();
      elements.coin.classList.add('defeated');
      showNotification(`QurlaCoin defeated! +${state.maxCoinHP} QurłaPoints`);
      dropItem();
      gainExp(5);
      setTimeout(() => {
        state.maxCoinHP = Math.floor(state.maxCoinHP * 1.2 + state.level * 5);
        state.coinHP = state.maxCoinHP;
        elements.coin.classList.remove('defeated');
        updateUI();
      }, 500);
    } else {
      showNotification(`-${effectiveDmg} HP`);
    }
    checkMissions();
    updateUI();
  } else {
    showNotification('No Energy!');
  }
});

// Auto-Hit
setInterval(() => {
  if (state.autoHit > 0 && state.energy >= 1 && state.coinHP > 0) {
    const effectiveDmg = state.dmg * state.autoHit * (1 + state.prestigeLevel * 0.5);
    state.coinHP -= effectiveDmg;
    state.energy--;
    if (state.coinHP <= 0) {
      state.points += state.maxCoinHP;
      state.coinCount++;
      elements.coinDefeatSound.play();
      elements.coin.classList.add('defeated');
      showNotification(`QurlaCoin defeated! +${state.maxCoinHP} QurłaPoints`);
      dropItem();
      gainExp(5);
      setTimeout(() => {
        state.maxCoinHP = Math.floor(state.maxCoinHP * 1.2 + state.level * 5);
        state.coinHP = state.maxCoinHP;
        elements.coin.classList.remove('defeated');
        updateUI();
      }, 500);
    }
    updateUI();
  }
}, 1000);

// Reklamy z cooldownem
let adCooldown = false;
elements.adBtn.addEventListener('click', () => {
  if (!adCooldown) {
    state.points += 10;
    adCooldown = true;
    elements.adBtn.disabled = true;
    elements.adBtn.style.opacity = 0.5;
    elements.buySound.play();
    showNotification('+10 QurłaPoints!');
    updateUI();
    setTimeout(() => {
      adCooldown = false;
      elements.adBtn.disabled = false;
      elements.adBtn.style.opacity = 1;
    }, 30000);
  }
});

// Przełączanie paneli
function togglePanel(panel) {
  [elements.shop, elements.inventory, elements.missions, elements.minigame].forEach(p => {
    if (p === panel) {
      p.classList.toggle('hidden');
    } else {
      p.classList.add('hidden');
    }
  });
}

elements.shopBtn.addEventListener('click', () => togglePanel(elements.shop));
elements.inventoryBtn.addEventListener('click', () => togglePanel(elements.inventory));
elements.missionsBtn.addEventListener('click', () => togglePanel(elements.missions));

// Sklep
elements.buyDmg.addEventListener('click', () => {
  const cost = 100 * (state.dmg + 1);
  if (state.points >= cost) {
    state.points -= cost;
    state.dmg++;
    addItem({ id: 'dmg', icon: 'img/b2.png', name: 'Qurla Sword', effect: 'dmg', value: 1.5 });
    elements.buySound.play();
    showNotification('Bought +1 DMG!');
    checkMissions();
    updateUI();
  }
});

elements.buyEnergy.addEventListener('click', () => {
  const cost = 50 * (state.maxEnergy / 5);
  if (state.points >= cost) {
    state.points -= cost;
    state.maxEnergy += 5;
    state.energy = state.maxEnergy;
    addItem({ id: 'energy', icon: 'img/b3.png', name: 'Energy Crystal', effect: 'energy', value: 10 });
    elements.buySound.play();
    showNotification('Bought +5 Max Energy!');
    checkMissions();
    updateUI();
  }
});

elements.buyRegen.addEventListener('click', () => {
  const cost = 30 * (state.regenRate + 1);
  if (state.points >= cost) {
    state.points -= cost;
    state.regenRate++;
    addItem({ id: 'regen', icon: 'img/b4.png', name: 'Regen Potion', effect: 'regen', value: 2 });
    elements.buySound.play();
    showNotification('Bought +1 Energy Regen!');
    check apologizes for the inconvenience. Here's the continuation of the `main.js` file to complete the implementation, ensuring all requested features are included, and addressing the issues with the shop panel and other mechanics.

<xaiArtifact artifact_id="82656142-3b08-4d13-9532-93178b121124" artifact_version_id="df42a369-3a6a-4892-91bb-123c21e04172" title="main.js" contentType="text/javascript">
// Inicjalizacja stanu gry
let state = JSON.parse(localStorage.getItem('qurlaCoinState')) || {
  points: 0,
  gems: 0,
  energy: 10,
  maxEnergy: 10,
  dmg: 1,
  exp: 0,
  level: 1,
  regenRate: 1,
  dropRate: 0.1,
  autoHit: 0,
  prestigeLevel: 0,
  inventory: [],
  missions: [],
  clicks: 0,
  coinHP: 10,
  maxCoinHP: 10,
  coinCount: 0,
  coinSkin: 'img/qurlacoin-clicker-gold-coin.png',
  lastOnline: Date.now()
};

// Elementy DOM
const elements = {
  points: document.getElementById('points'),
  gems: document.getElementById('gems'),
  energy: document.getElementById('energy'),
  dmg: document.getElementById('dmg'),
  level: document.getElementById('level'),
  rank: document.getElementById('rank'),
  energyFill: document.getElementById('energy-fill'),
  coinHPFill: document.getElementById('coin-hp-fill'),
  coin: document.getElementById('coin'),
  shop: document.getElementById('shop'),
  inventory: document.getElementById('inventory'),
  inventoryGrid: document.getElementById('inventoryGrid'),
  missions: document.getElementById('missions'),
  missionList: document.getElementById('missionList'),
  minigame: document.getElementById('minigame'),
  minigameArea: document.getElementById('minigameArea'),
  story: document.getElementById('story'),
  adBtn: document.getElementById('adBtn'),
  buyDmg: document.getElementById('buyDmg'),
  buyEnergy: document.getElementById('buyEnergy'),
  buyRegen: document.getElementById('buyRegen'),
  buyAutoHit: document.getElementById('buyAutoHit'),
  buyDropRate: document.getElementById('buyDropRate'),
  buyCoinSkin: document.getElementById('buyCoinSkin'),
  prestigeBtn: document.getElementById('prestigeBtn'),
  clickSound: document.getElementById('clickSound'),
  levelUpSound: document.getElementById('levelUpSound'),
  buySound: document.getElementById('buySound'),
  coinDefeatSound: document.getElementById('coinDefeatSound')
};

// Zapis stanu gry
function saveGame() {
  state.lastOnline = Date.now();
  localStorage.setItem('qurlaCoinState', JSON.stringify(state));
}

// Aktualizacja UI
function updateUI() {
  elements.points.textContent = `QurłaPoints: ${Math.floor(state.points)}`;
  elements.gems.textContent = `QurlaGems: ${state.gems}`;
  elements.energy.textContent = `Energy: ${Math.floor(state.energy)}/${state.maxEnergy}`;
  elements.dmg.textContent = `DMG: ${state.dmg}`;
  elements.level.textContent = `EXP: ${state.exp} | LVL: ${state.level}`;
  elements.rank.textContent = `Rank: ${calculateRank()}`;
  elements.energyFill.style.width = `${(state.energy / state.maxEnergy) * 100}%`;
  elements.coinHPFill.style.width = `${(state.coinHP / state.maxCoinHP) * 100}%`;
  elements.coin.src = state.coinSkin;
  elements.prestigeBtn.disabled = state.level < 10;
  elements.prestigeBtn.style.opacity = state.level < 10 ? 0.5 : 1;
  elements.buyDmg.disabled = state.points < 100 * (state.dmg + 1);
  elements.buyEnergy.disabled = state.points < 50 * (state.maxEnergy / 5);
  elements.buyRegen.disabled = state.points < 30 * (state.regenRate + 1);
  elements.buyAutoHit.disabled = state.points < 200 * (state.autoHit + 1);
  elements.buyDropRate.disabled = state.points < 100 * (state.dropRate * 10 + 1);
  elements.buyCoinSkin.disabled = state.points < 500;
  elements.buyDmg.style.opacity = state.points < 100 * (state.dmg + 1) ? 0.5 : 1;
  elements.buyEnergy.style.opacity = state.points < 50 * (state.maxEnergy / 5) ? 0.5 : 1;
  elements.buyRegen.style.opacity = state.points < 30 * (state.regenRate + 1) ? 0.5 : 1;
  elements.buyAutoHit.style.opacity = state.points < 200 * (state.autoHit + 1) ? 0.5 : 1;
  elements.buyDropRate.style.opacity = state.points < 100 * (state.dropRate * 10 + 1) ? 0.5 : 1;
  elements.buyCoinSkin.style.opacity = state.points < 500 ? 0.5 : 1;
  elements.buyDmg.textContent = `+1 DMG (Cost: ${100 * (state.dmg + 1)})`;
  elements.buyEnergy.textContent = `+5 Max Energy (Cost: ${50 * (state.maxEnergy / 5)})`;
  elements.buyRegen.textContent = `+1 Energy Regen (Cost: ${30 * (state.regenRate + 1)})`;
  elements.buyAutoHit.textContent = `+1 Auto-Hit (Cost: ${200 * (state.autoHit + 1)})`;
  elements.buyDropRate.textContent = `+1% Drop Rate (Cost: ${100 * (state.dropRate * 10 + 1)})`;
  updateStory();
  saveGame();
}

// Powiadomienia
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2000);
}

// Fabuła
const mines = [
  { level: 1, text: 'Welcome to the Qurla Mines! Defeat QurlaCoins to unearth their magic!' },
  { level: 10, text: 'Crystal Caverns unlocked! QurlaCoins grow stronger here.' },
  { level: 20, text: 'Abyssal Depths reached! Face the toughest QurlaCoins yet!' },
  { level: 30, text: 'Eternal Forge discovered! Craft legendary items from QurlaCoins!' }
];

function updateStory() {
  const currentMine = mines.filter(m => state.level >= m.level).pop();
  elements.story.textContent = currentMine.text;
}

// Ranking
function calculateRank() {
  const score = state.points + state.level * 100 + state.gems * 1000 + state.coinCount * 50;
  if (score > 100000) return 'Legend';
  if (score > 50000) return 'Master';
  if (score > 10000) return 'Pro';
  if (score > 1000) return 'Adventurer';
  return 'Novice';
}

// Zdobywanie doświadczenia
function gainExp(amount) {
  state.exp += amount;
  const expNeeded = state.level * 10 * (1 + state.level * 0.2);
  if (state.exp >= expNeeded) {
    state.exp = 0;
    state.level++;
    state.dmg += 1 + state.prestigeLevel;
    elements.levelUpSound.play();
    showNotification(`Level Up! DMG increased to ${state.dmg}!`);
    checkMissions();
  }
  updateUI();
}

// System dropów
const items = [
  { id: 'b2', icon: 'img/b2.png', name: 'B2 Shard', effect: 'dmg', value: 1.5, rarity: 0.3 },
  { id: 'b3', icon: 'img/b3.png', name: 'B3 Crystal', effect: 'energy', value: 10, rarity: 0.2 },
  { id: 'b4', icon: 'img/b4.png', name: 'B4 Gem', effect: 'regen', value: 2, rarity: 0.15 },
  { id: 'b5', icon: 'img/b5.png', name: 'B5 Orb', effect: 'dmg', value: 2, rarity: 0.1 },
  { id: 'paragon', icon: 'img/paragon.png', name: 'Paragon Star', effect: 'points', value: 100, rarity: 0.05 },
  { id: 'beret', icon: 'img/beret.png', name: 'Qurla Beret', effect: 'gems', value: 1, rarity: 0.01 }
];

function dropItem() {
  if (Math.random() < state.dropRate) {
    const roll = Math.random();
    let cumulative = 0;
    for (const item of items) {
      cumulative += item.rarity;
      if (roll < cumulative) {
        addItem(item);
        showNotification(`Dropped ${item.name}!`);
        return;
      }
    }
  }
}

// Kliknięcie monety
elements.coin.addEventListener('click', () => {
  if (state.energy >= 1) {
    const effectiveDmg = state.dmg * (1 + state.prestigeLevel * 0.5);
    state.coinHP -= effectiveDmg;
    state.energy--;
    state.clicks++;
    elements.clickSound.play();
    elements.coin.style.transform = 'scale(0.9)';
    setTimeout(() => (elements.coin.style.transform = 'scale(1)'), 100);
    if (state.coinHP <= 0) {
      state.points += state.maxCoinHP;
      state.coinCount++;
      elements.coinDefeatSound.play();
      elements.coin.classList.add('defeated');
      showNotification(`QurlaCoin defeated! +${state.maxCoinHP} QurłaPoints`);
      dropItem();
      gainExp(5);
      set
