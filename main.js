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
  prestigeLevel: 0,
  inventory: [],
  missions: [],
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
  energyFill: document.getElementById('energy-fill'),
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
  buyCoinSkin: document.getElementById('buyCoinSkin'),
  prestigeBtn: document.getElementById('prestigeBtn'),
  clickSound: document.getElementById('clickSound'),
  levelUpSound: document.getElementById('levelUpSound'),
  buySound: document.getElementById('buySound')
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
  elements.energyFill.style.width = `${(state.energy / state.maxEnergy) * 100}%`;
  elements.coin.src = state.coinSkin;
  elements.prestigeBtn.disabled = state.level < 10;
  elements.prestigeBtn.style.opacity = state.level < 10 ? 0.5 : 1;
  elements.buyDmg.disabled = state.points < 100;
  elements.buyEnergy.disabled = state.points < 50;
  elements.buyRegen.disabled = state.points < 30;
  elements.buyCoinSkin.disabled = state.points < 500;
  elements.buyDmg.style.opacity = state.points < 100 ? 0.5 : 1;
  elements.buyEnergy.style.opacity = state.points < 50 ? 0.5 : 1;
  elements.buyRegen.style.opacity = state.points < 30 ? 0.5 : 1;
  elements.buyCoinSkin.style.opacity = state.points < 500 ? 0.5 : 1;
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
  { level: 1, text: 'Welcome to the Qurla Mines! Click the coin to unearth magical QurlaCoins.' },
  { level: 10, text: 'You discovered the Crystal Caverns! QurlaCoins shine brighter here.' },
  { level: 20, text: 'The Abyssal Depths await! Dark forces guard the richest QurlaCoins.' },
  { level: 30, text: 'The Eternal Forge is yours! Craft legendary artifacts with QurlaCoins.' }
];

function updateStory() {
  const currentMine = mines.filter(m => state.level >= m.level).pop();
  elements.story.textContent = currentMine.text;
}

// Zdobywanie doświadczenia
function gainExp(amount) {
  state.exp += amount;
  const expNeeded = state.level * 10 * (1 + state.level * 0.1);
  if (state.exp >= expNeeded) {
    state.exp = 0;
    state.level++;
    state.dmg += 1 + state.prestigeLevel;
    elements.levelUpSound.play();
    showNotification(`Level Up! DMG increased to ${state.dmg}!`);
  }
  updateUI();
}

// Kliknięcie monety
elements.coin.addEventListener('click', () => {
  if (state.energy >= 1) {
    const effectiveDmg = state.dmg * (1 + state.prestigeLevel * 0.5);
    state.points += effectiveDmg;
    state.energy--;
    gainExp(1);
    elements.clickSound.play();
    elements.coin.style.transform = 'scale(0.9)';
    setTimeout(() => (elements.coin.style.transform = 'scale(1)'), 100);
    showNotification(`+${effectiveDmg} QurłaPoints`);
    checkMissions();
    updateUI();
  } else {
    showNotification('No Energy!');
  }
});

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
elements.shopBtn.addEventListener('click', () => {
  elements.shop.classList.toggle('hidden');
  elements.inventory.classList.add('hidden');
  elements.missions.classList.add('hidden');
  elements.minigame.classList.add('hidden');
});

elements.inventoryBtn.addEventListener('click', () => {
  elements.inventory.classList.toggle('hidden');
  elements.shop.classList.add('hidden');
  elements.missions.classList.add('hidden');
  elements.minigame.classList.add('hidden');
});

elements.missionsBtn.addEventListener('click', () => {
  elements.missions.classList.toggle('hidden');
  elements.shop.classList.add('hidden');
  elements.inventory.classList.add('hidden');
  elements.minigame.classList.add('hidden');
});

// Sklep
elements.buyDmg.addEventListener('click', () => {
  if (state.points >= 100) {
    state.points -= 100;
    state.dmg++;
    addItem({ icon: '🗡️', name: 'Qurla Sword', effect: 'dmg', value: 1 });
    elements.buySound.play();
    showNotification('Bought +1 DMG!');
    checkMissions();
    updateUI();
  }
});

elements.buyEnergy.addEventListener('click', () => {
  if (state.points >= 50) {
    state.points -= 50;
    state.maxEnergy += 5;
    state.energy = state.maxEnergy;
    addItem({ icon: '⚡', name: 'Energy Crystal', effect: 'energy', value: 5 });
    elements.buySound.play();
    showNotification('Bought +5 Max Energy!');
    checkMissions();
    updateUI();
  }
});

elements.buyRegen.addEventListener('click', () => {
  if (state.points >= 30) {
    state.points -= 30;
    state.regenRate++;
    addItem({ icon: '💧', name: 'Regen Potion', effect: 'regen', value: 1 });
    elements.buySound.play();
    showNotification('Bought +1 Energy Regen!');
    checkMissions();
    updateUI();
  }
});

elements.buyCoinSkin.addEventListener('click', () => {
  if (state.points >= 500) {
    state.points -= 500;
    state.coinSkin = `img/qurlacoin-clicker-gold-coin${Math.floor(Math.random() * 3) + 1}.png`;
    elements.buySound.play();
    showNotification('Bought new coin skin!');
    updateUI();
  }
});

// Prestiż
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
    state.inventory = [];
    state.prestigeLevel++;
    elements.inventoryGrid.innerHTML = '';
    elements.buySound.play();
    showNotification(`Prestige! Gained ${Math.floor(state.level / 10)} QurlaGems!`);
    updateUI();
  }
});

// Ekwipunek
function addItem(item) {
  state.inventory.push(item);
  const itemEl = document.createElement('div');
  itemEl.textContent = item.icon;
  itemEl.title = `${item.name}: ${item.effect === 'dmg' ? '+1 DMG' : item.effect === 'energy' ? '+5 Max Energy' : '+1 Regen'}`;
  itemEl.addEventListener('click', () => {
    if (item.effect === 'dmg') {
      state.dmg += item.value * 2;
      setTimeout(() => {
        state.dmg -= item.value * 2;
        updateUI();
      }, 10000);
      showNotification(`${item.name} activated: +${item.value * 2} DMG for 10s!`);
    } else if (item.effect === 'energy') {
      state.energy = state.maxEnergy;
      showNotification(`${item.name} activated: Energy restored!`);
    } else if (item.effect === 'regen') {
      state.energy += state.maxEnergy * 0.5;
      if (state.energy > state.maxEnergy) state.energy = state.maxEnergy;
      showNotification(`${item.name} activated: +50% Energy!`);
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
  { id: 'clicks', goal: 50, progress: 0, reward: 50, text: 'Click the coin 50 times', type: 'points' },
  { id: 'buy', goal: 2, progress: 0, reward: 100, text: 'Buy 2 upgrades', type: 'points' },
  { id: 'level', goal: 5, progress: 0, reward: 1, text: 'Reach level 5', type: 'gems' }
];

function generateMissions() {
  if (state.missions.length < 3) {
    const available = missionTemplates.filter(mt => !state.missions.some(m => m.id === mt.id));
    if (available.length > 0) {
      const newMission = { ...available[Math.floor(Math.random() * available.length)] };
      state.missions.push(newMission);
    }
  }
  updateMissions();
}

function updateMissions() {
  elements.missionList.innerHTML = '';
  state.missions.forEach(mission => {
    const missionEl = document.createElement('div');
    missionEl.textContent = `${mission.text} (${mission.progress}/${mission.goal}) - Reward: ${mission.reward} ${mission.type}`;
    if (mission.progress >= mission.goal) {
      missionEl.style.background = '#28a745';
      missionEl.addEventListener('click', () => {
        state[mission.type] += mission.reward;
        state.missions = state.missions.filter(m => m !== mission);
        elements.buySound.play();
        showNotification(`Mission completed! +${mission.reward} ${mission.type}!`);
        updateUI();
        generateMissions();
      });
    }
    elements.missionList.appendChild(missionEl);
  });
}

function checkMissions() {
  state.missions.forEach(mission => {
    if (mission.id === 'clicks') mission.progress = Math.min(mission.progress + 1, mission.goal);
    if (mission.id === 'buy' && (elements.buyDmg.disabled || elements.buyEnergy.disabled || elements.buyRegen.disabled)) {
      mission.progress = Math.min(mission.progress + 1, mission.goal);
    }
    if (mission.id === 'level') mission.progress = Math.min(state.level, mission.goal);
  });
  updateMissions();
}

// Minigra
function startMinigame() {
  elements.minigame.classList.remove('hidden');
  elements.shop.classList.add('hidden');
  elements.inventory.classList.add('hidden');
  elements.missions.classList.add('hidden');
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
      elements.clickSound.play();
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
generateMissions();
setInterval(generateMissions, 60000);
setInterval(() => {
  if (Math.random() < 0.1) startMinigame();
}, 300000); // Minigra co ~5 minut
updateUI();
