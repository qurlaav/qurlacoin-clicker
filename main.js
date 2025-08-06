// Czekaj na załadowanie DOM
document.addEventListener('DOMContentLoaded', () => {
  // Inicjalizacja stanu gry
  let state = JSON.parse(localStorage.getItem('qurlaCoinState')) || {
    points: 0,
    energy: 10,
    maxEnergy: 10,
    dmg: 1,
    exp: 0,
    level: 1,
    regenRate: 1,
    inventory: [],
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
    energy: document.getElementById('energy'),
    dmg: document.getElementById('dmg'),
    level: document.getElementById('level'),
    energyFill: document.getElementById('energy-fill'),
    coinHPFill: document.getElementById('coin-hp-fill'),
    coin: document.getElementById('coin'),
    shop: document.getElementById('shop'),
    inventory: document.getElementById('inventory'),
    inventoryGrid: document.getElementById('inventoryGrid'),
    story: document.getElementById('story'),
    adBtn: document.getElementById('adBtn'),
    shopBtn: document.getElementById('shopBtn'),
    inventoryBtn: document.getElementById('inventoryBtn'),
    buyDmg: document.getElementById('buyDmg'),
    buyEnergy: document.getElementById('buyEnergy'),
    buyRegen: document.getElementById('buyRegen'),
    clickSound: document.getElementById('clickSound'),
    levelUpSound: document.getElementById('levelUpSound'),
    buySound: document.getElementById('buySound'),
    coinDefeatSound: document.getElementById('coinDefeatSound')
  };

  // Sprawdzanie, czy wszystkie elementy istnieją
  for (const [key, value] of Object.entries(elements)) {
    if (!value && key !== 'story' && key !== 'coinHPFill') {
      console.warn(`Element ${key} nie został znaleziony w DOM`);
    }
  }

  // Zapis stanu gry
  function saveGame() {
    state.lastOnline = Date.now();
    localStorage.setItem('qurlaCoinState', JSON.stringify(state));
  }

  // Aktualizacja UI
  function updateUI() {
    if (elements.points) elements.points.textContent = `QurłaPoints: ${Math.floor(state.points)}`;
    if (elements.energy) elements.energy.textContent = `Energy: ${Math.floor(state.energy)}/${state.maxEnergy}`;
    if (elements.dmg) elements.dmg.textContent = `DMG: ${state.dmg}`;
    if (elements.level) elements.level.textContent = `EXP: ${state.exp} | LVL: ${state.level}`;
    if (elements.energyFill) elements.energyFill.style.width = `${(state.energy / state.maxEnergy) * 100}%`;
    if (elements.coinHPFill) elements.coinHPFill.style.width = `${(state.coinHP / state.maxCoinHP) * 100}%`;
    if (elements.coin) elements.coin.src = state.coinSkin;
    if (elements.buyDmg) {
      elements.buyDmg.disabled = state.points < 100 * (state.dmg + 1);
      elements.buyDmg.style.opacity = state.points < 100 * (state.dmg + 1) ? 0.5 : 1;
      elements.buyDmg.textContent = `+1 DMG (Cost: ${100 * (state.dmg + 1)})`;
    }
    if (elements.buyEnergy) {
      elements.buyEnergy.disabled = state.points < 50 * (state.maxEnergy / 5);
      elements.buyEnergy.style.opacity = state.points < 50 * (state.maxEnergy / 5) ? 0.5 : 1;
      elements.buyEnergy.textContent = `+5 Max Energy (Cost: ${50 * (state.maxEnergy / 5)})`;
    }
    if (elements.buyRegen) {
      elements.buyRegen.disabled = state.points < 30 * (state.regenRate + 1);
      elements.buyRegen.style.opacity = state.points < 30 * (state.regenRate + 1) ? 0.5 : 1;
      elements.buyRegen.textContent = `+1 Energy Regen (Cost: ${30 * (state.regenRate + 1)})`;
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

  // Zdobywanie doświadczenia
  function gainExp(amount) {
    state.exp += amount;
    const expNeeded = state.level * 10 * (1 + state.level * 0.2);
    if (state.exp >= expNeeded) {
      state.exp = 0;
      state.level++;
      state.dmg += 1;
      if (elements.levelUpSound) {
        try { elements.levelUpSound.play(); } catch (e) { console.log('Audio error:', e); }
      }
      showNotification(`Level Up! DMG increased to ${state.dmg}!`);
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
    { id: 'beret', icon: 'img/beret.png', name: 'Qurla Beret', effect: 'points', value: 200, rarity: 0.01 }
  ];

  function dropItem() {
    if (Math.random() < 0.1) { // Bazowa szansa na drop: 10%
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
  if (elements.coin) {
    elements.coin.addEventListener('click', () => {
      if (state.energy >= 1) {
        const effectiveDmg = state.dmg;
        state.coinHP -= effectiveDmg;
        state.energy--;
        state.clicks++;
        if (elements.clickSound) {
          try { elements.clickSound.play(); } catch (e) { console.log('Audio error:', e); }
        }
        elements.coin.style.transform = 'scale(0.9)';
        setTimeout(() => (elements.coin.style.transform = 'scale(1)'), 100);
        if (state.coinHP <= 0) {
          state.points += state.maxCoinHP;
          state.coinCount++;
          if (elements.coinDefeatSound) {
            try { elements.coinDefeatSound.play(); } catch (e) { console.log('Audio error:', e); }
          }
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
        updateUI();
      } else {
        showNotification('No Energy!');
      }
    });
  }

  // Reklamy z cooldownem
  if (elements.adBtn) {
    let adCooldown = false;
    elements.adBtn.addEventListener('click', () => {
      if (!adCooldown) {
        state.points += 10;
        adCooldown = true;
        elements.adBtn.disabled = true;
        elements.adBtn.style.opacity = 0.5;
        if (elements.buySound) {
          try { elements.buySound.play(); } catch (e) { console.log('Audio error:', e); }
        }
        showNotification('+10 QurłaPoints!');
        updateUI();
        setTimeout(() => {
          adCooldown = false;
          elements.adBtn.disabled = false;
          elements.adBtn.style.opacity = 1;
        }, 30000);
      }
    });
  }

  // Przełączanie paneli
  function togglePanel(panel) {
    if (!panel) return;
    [elements.shop, elements.inventory].forEach(p => {
      if (p === panel) {
        p.classList.toggle('hidden');
      } else if (p) {
        p.classList.add('hidden');
      }
    });
  }

  if (elements.shopBtn) {
    elements.shopBtn.addEventListener('click', () => togglePanel(elements.shop));
  }
  if (elements.inventoryBtn) {
    elements.inventoryBtn.addEventListener('click', () => togglePanel(elements.inventory));
  }

  // Sklep
  if (elements.buyDmg) {
    elements.buyDmg.addEventListener('click', () => {
      const cost = 100 * (state.dmg + 1);
      if (state.points >= cost) {
        state.points -= cost;
        state.dmg++;
        addItem({ id: 'dmg', icon: 'img/b2.png', name: 'Qurla Sword', effect: 'dmg', value: 1.5 });
        if (elements.buySound) {
          try { elements.buySound.play(); } catch (e) { console.log('Audio error:', e); }
        }
        showNotification('Bought +1 DMG!');
        updateUI();
      }
    });
  }

  if (elements.buyEnergy) {
    elements.buyEnergy.addEventListener('click', () => {
      const cost = 50 * (state.maxEnergy / 5);
      if (state.points >= cost) {
        state.points -= cost;
        state.maxEnergy += 5;
        state.energy = state.maxEnergy;
        addItem({ id: 'energy', icon: 'img/b3.png', name: 'Energy Crystal', effect: 'energy', value: 10 });
        if (elements.buySound) {
          try { elements.buySound.play(); } catch (e) { console.log('Audio error:', e); }
        }
        showNotification('Bought +5 Max Energy!');
        updateUI();
      }
    });
  }

  if (elements.buyRegen) {
    elements.buyRegen.addEventListener('click', () => {
      const cost = 30 * (state.regenRate + 1);
      if (state.points >= cost) {
        state.points -= cost;
        state.regenRate++;
        addItem({ id: 'regen', icon: 'img/b4.png', name: 'Regen Potion', effect: 'regen', value: 2 });
        if (elements.buySound) {
          try { elements.buySound.play(); } catch (e) { console.log('Audio error:', e); }
        }
        showNotification('Bought +1 Energy Regen!');
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
    itemEl.title = `${item.name}: ${item.effect === 'dmg' ? '+50% DMG for 10s' : item.effect === 'energy' ? 'Restore Energy' : item.effect === 'regen' ? '+50% Energy' : item.effect === 'points' ? `+${item.value} Points` : ''}`;
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
      }
      state.inventory = state.inventory.filter(i => i !== item);
      itemEl.remove();
      updateUI();
    });
    if (elements.inventoryGrid) elements.inventoryGrid.appendChild(itemEl);
  }

  function loadInventory() {
    if (elements.inventoryGrid) {
      elements.inventoryGrid.innerHTML = '';
      // Wypełnij siatkę pustymi slotami (9x3 = 27)
      for (let i = 0; i < 27; i++) {
        const slot = document.createElement('div');
        if (state.inventory[i]) {
          const img = document.createElement('img');
          img.src = state.inventory[i].icon;
          img.alt = state.inventory[i].name;
          slot.appendChild(img);
          slot.title = `${state.inventory[i].name}: ${state.inventory[i].effect === 'dmg' ? '+50% DMG for 10s' : state.inventory[i].effect === 'energy' ? 'Restore Energy' : state.inventory[i].effect === 'regen' ? '+50% Energy' : state.inventory[i].effect === 'points' ? `+${state.inventory[i].value} Points` : ''}`;
          slot.addEventListener('click', () => {
            const item = state.inventory[i];
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
            }
            state.inventory = state.inventory.filter((_, index) => index !== i);
            loadInventory();
            updateUI();
          });
        }
        elements.inventoryGrid.appendChild(slot);
      }
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
  state.energy = state.maxEnergy; // Reset energii na start
  calculateOfflineProgress();
  loadInventory();
  updateUI();
});
