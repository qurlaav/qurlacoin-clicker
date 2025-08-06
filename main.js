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
  gems: document.getElementById('gems') || null,
  energy: document.getElementById('energy'),
  dmg: document.getElementById('dmg'),
  level: document.getElementById('level'),
  rank: document.getElementById('rank') || null,
  energyFill: document.getElementById('energy-fill'),
  coinHPFill: document.getElementById('coin-hp-fill') || null,
  coin: document.getElementById('coin'),
  shop: document.getElementById('shop'),
  inventory: document.getElementById('inventory'),
  inventoryGrid: document.getElementById('inventoryGrid'),
  missions: document.getElementById('missions') || null,
  missionList: document.getElementById('missionList') || null,
  minigame: document.getElementById('minigame') || null,
  minigameArea: document.getElementById('minigameArea') || null,
  story: document.getElementById('story') || null,
  adBtn: document.getElementById('adBtn'),
  buyDmg: document.getElementById('buyDmg'),
  buyEnergy: document.getElementById('buyEnergy'),
  buyRegen: document.getElementById('buyRegen'),
  buyAutoHit: document.getElementById('buyAutoHit') || null,
  buyDropRate: document.getElementById('buyDropRate') || null,
  buyCoinSkin: document.getElementById('buyCoinSkin') || null,
  prestigeBtn: document.getElementById('prestigeBtn') || null,
  clickSound: document.getElementById('clickSound') || null,
  levelUpSound: document.getElementById('levelUpSound') || null,
  buySound: document.getElementById('buySound') || null,
  coinDefeatSound: document.getElementById('coinDefeatSound') || null
};

// Zapis stanu gry
function saveGame() {
  state.lastOnline = Date.now();
  localStorage.setItem('qurlaCoinState', JSON.stringify(state));
}

// Aktualizacja UI
function updateUI() {
  elements.points.textContent = `QurłaPoints: ${Math.floor(state.points)}`;
  if (elements.gems) elements.gems.textContent = `QurlaGems: ${state.gems}`;
  elements.energy.textContent = `Energy: ${Math.floor(state.energy)}/${state.maxEnergy}`;
  elements.dmg.textContent = `DMG: ${state.dmg}`;
  elements.level.textContent = `EXP: ${state.exp} | LVL: ${state.level}`;
  if (elements.rank) elements.rank.textContent = `Rank: ${calculateRank()}`;
  elements.energyFill.style.width = `${(state.energy / state.maxEnergy) * 100}%`;
  if (elements.coinHPFill) elements.coinHPFill.style.width = `${(state.coinHP / state.maxCoinHP) * 100}%`;
  elements.coin.src = state.coinSkin;
  if (elements.prestigeBtn) {
    elements.prestigeBtn.disabled = state.level < 10;
    elements.prestigeBtn.style.opacity = state.level < 10 ? 0.5 : 1;
  }
  elements.buyDmg.disabled = state.points < 100 * (state.dmg + 1);
  elements.buyEnergy.disabled = state.points < 50 * (state.maxEnergy / 5);
  elements.buyRegen.disabled = state.points < 30 * (state.regenRate + 1);
  elements.buyDmg.style.opacity = state.points < 100 * (state.dmg + 1) ? 0.5 : 1;
  elements.buyEnergy.style.opacity = state.points < 50 * (state.maxEnergy / 5) ? 0.5 : 1;
  elements.buyRegen.style.opacity = state.points < 30 * (state.regenRate + 1) ? 0.5 : 1;
  elements.buyDmg.textContent = `+1 DMG (Cost: ${100 * (state.dmg + 1)})`;
  elements.buyEnergy.textContent = `+5 Max Energy (Cost: ${50 * (state.maxEnergy / 5)})`;
  elements.buyRegen.textContent = `+1 Energy Regen (Cost: ${30 * (state.regenRate + 1)})`;
  if (elements.buyAutoHit) {
    elements.buyAutoHit.disabled = state.points < 200 * (state.autoHit + 1);
    elements.buyAutoHit.style.opacity = state.points < 200 * (state.autoHit + 1) ? 0.5 : 1;
    elements.buyAutoHit.textContent = `+1 Auto-Hit (Cost: ${200 * (state.autoHit + 1)})`;
  }
  if (elements.buyDropRate) {
    elements.buyDropRate.disabled = state.points < 100 * (state.dropRate * 10 + 1);
    elements.buyDropRate.style.opacity = state.points < 100 * (state.dropRate * 10 + 1) ? 0.5 : 1;
    elements.buyDropRate.textContent = `+1% Drop Rate (Cost: ${100 * (state.dropRate * 10 + 1)})`;
  }
  if (elements.buyCoinSkin) {
    elements.buyCoinSkin.disabled = state.points < 500;
    elements.buyCoinSkin.style.opacity = state.points < 500 ? 0.5 : 1;
  }
  if (elements.story) updateStory();
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
  if (elements.story) {
    const currentMine = mines.filter(m => state.level >= m.level).pop();
    elements.story.textContent = currentMine.text;
  }
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
    if (elements.levelUpSound) elements.levelUpSound.play();
    showNotification(`Level Up! DMG increased to ${state.dmg}!`);
    if (elements.missionList) checkMissions();
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
    if (elements.clickSound) elements.clickSound.play();
    elements.coin.style.transform = 'scale(0.9)';
    setTimeout(() => (elements.coin.style.transform = 'scale(1)'), 100);
    if (state.coinHP <= 0) {
      state.points += state.maxCoinHP;
      state.coinCount++;
      if (elements.coinDefeatSound) elements.coinDefeatSound.play();
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
    if (elements.missionList) checkMissions();
    updateUI();
  } else {
    showNotification('No Energy!');
  }
});

// Auto-Hit
if (elements.buyAutoHit) {
  setInterval(() => {
    if (state.autoHit > 0 && state.energy >= 1 && state.coinHP > 0) {
      const effectiveDmg = state.dmg * state.autoHit * (1 + state.prestigeLevel * 0.5);
      state.coinHP -= effectiveDmg;
      state.energy--;
      if (state.coinHP <= 0) {
        state.points += state.maxCoinHP;
        state.coinCount++;
        if (elements.coinDefeatSound) elements.coinDefeatSound.play();
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
}

// Reklamy z cooldownem
let adCooldown = false;
elements.adBtn.addEventListener('click', () => {
  if (!adCooldown) {
    state.points += 10;
    adCooldown = true;
    elements.adBtn.disabled = true;
    elements.adBtn.style.opacity = 0.5;
    if (elements.buySound) elements.buySound.play();
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
  [elements.shop, elements.inventory, elements.missions || document.createElement('div'), elements.minigame || document.createElement('div')].forEach(p => {
    if (p === panel) {
      p.classList.toggle('hidden');
    } else {
      p.classList.add('hidden');
    }
  });
}

elements.shopBtn.addEventListener('click', () => togglePanel(elements.shop));
elements.inventoryBtn.addEventListener('click', () => togglePanel(elements.inventory));
if (elements.missionsBtn) elements.missionsBtn.addEventListener('click', () => togglePanel(elements.missions));

// Sklep
elements.buyDmg.addEventListener('click', () => {
  const cost = 100 * (state.dmg + 1);
  if (state.points >= cost) {
    state.points -= cost;
    state.dmg++;
    addItem({ id: 'dmg', icon: 'img/b2.png', name: 'Qurla Sword', effect: 'dmg', value: 1.5 });
    if (elements.buySound) elements.buySound.play();
    showNotification('Bought +1 DMG!');
    if (elements.missionList) checkMissions();
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
    if (elements.buySound) elements.buySound.play();
    showNotification('Bought +5 Max Energy!');
    if (elements.missionList) checkMissions();
    updateUI();
  }
});

elements.buyRegen.addEventListener('click', () => {
  const cost = 30 * (state.regenRate + 1);
  if (state.points >= cost) {
    state.points -= cost;
    state.regenRate++;
    addItem({ id: 'regen', icon: 'img/b4.png', name: 'Regen Potion', effect: 'regen', value: 2 });
    if (elements.buySound) elements.buySound.play();
    showNotification('Bought +1 Energy Regen!');
    if (elements.missionList) checkMissions();
    updateUI();
  }
});

if (elements.buyAutoHit) {
  elements.buyAutoHit.addEventListener('click', () => {
    const cost = 200 * (state.autoHit + 1);
    if (state.points >= cost) {
      state.points -= cost;
      state.autoHit++;
      addItem({ id: 'autohit', icon: 'img/b5.png', name: 'Auto-Hit Core', effect: 'autohit', value: 1 });
      if (elements.buySound) elements.buySound.play();
      showNotification('Bought +1 Auto-Hit!');
      if (elements.missionList) checkMissions();
      updateUI();
    }
  });
}

if (elements.buyDropRate) {
  elements.buyDropRate.addEventListener('click', () => {
    const cost = 100 * (state.dropRate * 10 + 1);
    if (state.points >= cost) {
      state.points -= cost;
      state.dropRate += 0.01;
      addItem({ id: 'droprate', icon: 'img/paragon.png', name: 'Drop Enhancer', effect: 'droprate', value: 0.01 });
      if (elements.buySound) elements.buySound.play();
      showNotification('Bought +1% Drop Rate!');
      if (elements.missionList) checkMissions();
      updateUI();
    }
  });
}

if (elements.buyCoinSkin) {
  elements.buyCoinSkin.addEventListener('click', () => {
    if (state.points >= 500) {
      state.points -= 500;
      const skins = [
        'img/qurlacoin-clicker-gold-coin.png',
        'img/b2.png',
        'img/b3.png',
        'img/b4.png',
        'img/b5.png',
        'img/paragon.png',
        'img/beret.png'
      ];
      state.coinSkin = skins[Math.floor(Math.random() * skins.length)];
      if (elements.buySound) elements.buySound.play();
      showNotification('Bought new coin skin!');
      updateUI();
    }
  });
}

// Prestiż
if (elements.prestigeBtn) {
  elements.prestigeBtn.addEventListener('click', () => {
    if (state.level >= 10) {
      state.gems += Math.floor(state.level / 10);
      state.points = 0;
      state.energy = 10;
      state.maxEnergy = 10;
      state.dmg = 1;
      state.exp = 0;
      state.level = 1;
      state.regenRate = 1;
      state.dropRate = 0.1;
      state.autoHit = 0;
      state.clicks = 0;
      state.coinHP = 10;
      state.maxCoinHP = 10;
      state.coinCount = 0;
      state.inventory = [];
      state.prestigeLevel++;
      elements.inventoryGrid.innerHTML = '';
      if (elements.buySound) elements.buySound.play();
      showNotification(`Prestige! Gained ${Math.floor(state.level / 10)} QurlaGems!`);
      updateUI();
    }
  });
}

// Ekwipunek
function addItem(item) {
  state.inventory.push(item);
  const itemEl = document.createElement('div');
  const img = document.createElement('img');
  img.src = item.icon;
  img.alt = item.name;
  itemEl.appendChild(img);
  itemEl.title = `${item.name}: ${item.effect === 'dmg' ? '+50% DMG for 10s' : item.effect === 'energy' ? 'Restore Energy' : item.effect === 'regen' ? '+50% Energy' : item.effect === 'points' ? `+${item.value} Points` : item.effect === 'gems' ? `+${item.value} Gems` : item.effect === 'autohit' ? '+1 Auto-Hit for 10s' : item.effect === 'droprate' ? '+1% Drop Rate' : ''}`;
  itemEl.addEventListener('click', () => {
    if (item.effect === 'dmg') {
      state.dmg *= item.value;
      setTimeout(() => {
        state.dmg = Math.floor(state.dmg / item.value);
        updateUI();
      }, 10000);
      showNotification(`${item.name} activated: +${Math.round((item.value - 1) * 100)}% DMG for 10s!`);
    } else if (item.effect === 'energy') {
      state.energy = state.maxEnergy;
      showNotification(`${item.name} activated: Energy restored!`);
    } else if (item.effect === 'regen') {
      state.energy += state.maxEnergy * 0.5;
      if (state.energy > state.maxEnergy) state.energy = state.maxEnergy;
      showNotification(`${item.name} activated: +50% Energy!`);
    } else if (item.effect === 'points') {
      state.points += item.value;
      showNotification(`${item.name} activated: +${item.value} Points!`);
    } else if (item.effect === 'gems') {
      state.gems += item.value;
      showNotification(`${item.name} activated: +${item.value} Gems!`);
    } else if (item.effect === 'autohit') {
      state.autoHit += item.value;
      setTimeout(() => {
        state.autoHit -= item.value;
        updateUI();
      }, 10000);
      showNotification(`${item.name} activated: +${item.value} Auto-Hit for 10s!`);
    } else if (item.effect === 'droprate') {
      state.dropRate += item.value;
      showNotification(`${item.name} activated: +${item.value * 100}% Drop Rate!`);
    }
    state.inventory = state.inventory.filter(i => i !== item);
    itemEl.remove();
    updateUI();
  });
  elements.inventoryGrid.appendChild(itemEl);
}

function loadInventory() {
  elements.inventoryGrid.innerHTML = '';
  state.inventory.forEach(addItem);
}

// Misje
const missionTemplates = [
  { id: 'clicks', goal: 100, progress: 0, reward: 50, text: 'Click the coin 100 times', type: 'points' },
  { id: 'buy', goal: 3, progress: 0, reward: 100, text: 'Buy 3 upgrades', type: 'points' },
  { id: 'level', goal: 5, progress: 0, reward: 1, text: 'Reach level 5', type: 'gems' },
  { id: 'coins', goal: 10, progress: 0, reward: 200, text: 'Defeat 10 QurlaCoins', type: 'points' }
];

function generateMissions() {
  if (elements.missionList && state.missions.length < 3) {
    const available = missionTemplates.filter(mt => !state.missions.some(m => m.id === mt.id));
    if (available.length > 0) {
      const newMission = { ...available[Math.floor(Math.random() * available.length)] };
      state.missions.push(newMission);
    }
    updateMissions();
  }
}

function updateMissions() {
  if (elements.missionList) {
    elements.missionList.innerHTML = '';
    state.missions.forEach(mission => {
      const missionEl = document.createElement('div');
      missionEl.textContent = `${mission.text} (${mission.progress}/${mission.goal}) - Reward: ${mission.reward} ${mission.type}`;
      if (mission.progress >= mission.goal) {
        missionEl.style.background = '#28a745';
        missionEl.addEventListener('click', () => {
          state[mission.type] += mission.reward;
          state.missions = state.missions.filter(m => m !== mission);
          if (elements.buySound) elements.buySound.play();
          showNotification(`Mission completed! +${mission.reward} ${mission.type}!`);
          updateUI();
          generateMissions();
        });
      }
      elements.missionList.appendChild(missionEl);
    });
  }
}

function checkMissions() {
  state.missions.forEach(mission => {
    if (mission.id === 'clicks') mission.progress = Math.min(state.clicks, mission.goal);
    if (mission.id === 'buy') {
      const upgradesBought = Math.floor(state.dmg + state.maxEnergy / 5 + state.regenRate + state.autoHit + state.dropRate * 10 - 5.1);
      mission.progress = Math.min(upgradesBought, mission.goal);
    }
    if (mission.id === 'level') mission.progress = Math.min(state.level, mission.goal);
    if (mission.id === 'coins') mission.progress = Math.min(state.coinCount, mission.goal);
  });
  updateMissions();
}

// Minigra
function startMinigame() {
  if (elements.minigame && elements.minigameArea) {
    elements.minigame.classList.remove('hidden');
    elements.shop.classList.add('hidden');
    elements.inventory.classList.add('hidden');
    if (elements.missions) elements.missions.classList.add('hidden');
    let coinsCaught = 0;
    function spawnCoin() {
      const coin = document.createElement('img');
      coin.src = state.coinSkin;
      coin.className = 'minigame-coin';
      coin.style.left = `${Math.random() * (elements.minigameArea.offsetWidth - 40)}px`;
      coin.style.top = `${Math.random() * (elements.minigameArea.offsetHeight - 40)}px`;
      coin.addEventListener('click', () => {
        coinsCaught++;
        state.points += 10;
        if (elements.clickSound) elements.clickSound.play();
        showNotification('+10 QurłaPoints!');
        coin.remove();
        updateUI();
      });
      elements.minigameArea.appendChild(coin);
      setTimeout(() => coin.remove(), 2000);
    }
    const spawnInterval = setInterval(spawnCoin, 1000);
    setTimeout(() => {
      clearInterval(spawnInterval);
      elements.minigameArea.innerHTML = '';
      elements.minigame.classList.add('hidden');
      showNotification(`Minigame ended! Caught ${coinsCaught} coins!`);
    }, 10000);
  }
}

// Regeneracja energii
setInterval(() => {
  if (state.energy < state.maxEnergy) {
    state.energy = Math.min(state.maxEnergy, state.energy + state.regenRate);
    showNotification(`+${state.regenRate} Energy`);
    updateUI();
  }
}, 3000);

// Offline progress
function calculateOfflineProgress() {
  const now = Date.now();
  const timeOffline = (now - state.lastOnline) / 1000;
  const pointsEarned = Math.floor(timeOffline * state.regenRate * 0.1);
  if (pointsEarned > 0) {
    state.points += pointsEarned;
    showNotification(`Earned ${pointsEarned} QurłaPoints while offline!`);
  }
}

// Inicjalizacja
calculateOfflineProgress();
loadInventory();
if (elements.missionList) generateMissions();
setInterval(() => {
  if (Math.random() < 0.1) startMinigame();
}, 300000); // Minigra co ~5 minut
updateUI();
