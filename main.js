let points = 0;
let energy = 10;
let maxEnergy = 10;
let dmg = 1;
let exp = 0;
let level = 1;
let regenRate = 1;

// Potwór:
let monsterMaxHP = 20;
let monsterHP = monsterMaxHP;

const pointsEl = document.getElementById('points');
const energyEl = document.getElementById('energy');
const dmgEl = document.getElementById('dmg');
const levelEl = document.getElementById('level');
const energyFill = document.getElementById('energy-fill');
const coinEl = document.getElementById('coin');
const shopEl = document.getElementById('shop');
const inventoryEl = document.getElementById('inventory');
const inventoryGrid = document.getElementById('inventoryGrid');

// Tworzymy pasek HP potwora:
const hpBar = document.createElement('div');
hpBar.id = 'hp-bar';
hpBar.style.width = '100%';
hpBar.style.height = '20px';
hpBar.style.background = '#333';
hpBar.style.borderRadius = '10px';
hpBar.style.margin = '10px 0';
hpBar.style.overflow = 'hidden';

const hpFill = document.createElement('div');
hpFill.style.height = '100%';
hpFill.style.background = '#f00';
hpFill.style.width = '100%';
hpFill.style.transition = 'width 0.3s ease';

hpBar.appendChild(hpFill);

// Wstawiamy pasek nad monetą:
coinEl.parentNode.insertBefore(hpBar, coinEl);

function updateUI() {
  pointsEl.textContent = `QurłaPoints: ${points}`;
  energyEl.textContent = `Energy: ${energy}/${maxEnergy}`;
  dmgEl.textContent = `DMG: ${dmg}`;
  levelEl.textContent = `EXP: ${exp} | LVL: ${level}`;
  energyFill.style.width = `${(energy / maxEnergy) * 100}%`;
  hpFill.style.width = `${(monsterHP / monsterMaxHP) * 100}%`;
  hpFill.textContent = `HP: ${monsterHP}/${monsterMaxHP}`;
}

function gainExp(amount) {
  exp += amount;
  if (exp >= level * 10) {
    exp = 0;
    level++;
    dmg++;
  }
}

coinEl.addEventListener('click', () => {
  if (energy > 0) {
    energy--;
    monsterHP -= dmg;
    if (monsterHP <= 0) {
      // Zabiłeś potwora
      points += Math.floor(monsterMaxHP / 2);
      monsterMaxHP = Math.floor(monsterMaxHP * 1.5);
      monsterHP = monsterMaxHP;
    }
    gainExp(1);
    updateUI();
  }
});

document.getElementById('adBtn').addEventListener('click', () => {
  points += 10;
  updateUI();
});

document.getElementById('shopBtn').addEventListener('click', () => {
  shopEl.classList.toggle('hidden');
  inventoryEl.classList.add('hidden');
});

document.getElementById('inventoryBtn').addEventListener('click', () => {
  inventoryEl.classList.toggle('hidden');
  shopEl.classList.add('hidden');
});

document.getElementById('buyDmg').addEventListener('click', () => {
  if (points >= 100) {
    points -= 100;
    dmg++;
    updateUI();
    addItem('🗡️');
  }
});

document.getElementById('buyEnergy').addEventListener('click', () => {
  if (points >= 50) {
    points -= 50;
    maxEnergy += 5;
    energy = maxEnergy;
    updateUI();
    addItem('⚡');
  }
});

document.getElementById('buyRegen').addEventListener('click', () => {
  if (points >= 30) {
    points -= 30;
    regenRate++;
    updateUI();
    addItem('💧');
  }
});

function addItem(icon) {
  const item = document.createElement('div');
  item.textContent = icon;
  inventoryGrid.appendChild(item);
}

setInterval(() => {
  if (energy < maxEnergy) {
    energy = Math.min(maxEnergy, energy + regenRate);
    updateUI();
  }
}, 3000);

updateUI();

