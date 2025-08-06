let points = 0;
let energy = 10;
let maxEnergy = 10;
let dmg = 1;
let exp = 0;
let level = 1;
let regen = 5;
let hp = 100;
let maxHp = 100;
let dmgCost = 10, energyCost = 10, regenCost = 10;
let inventory = [];
const inventorySize = 20;

const items = [
  { name: "Energy Potion", img: "./img/energy.png", desc: "+10 energy instantly" },
  { name: "Attack Potion", img: "./img/attack.png", desc: "+2 DMG for 30s" },
  { name: "Passat B2 NFT Shard", img: "./img/b2.png", desc: "Collect 5 to mint B2 NFT" },
  { name: "Passat B3 NFT Shard", img: "./img/b3.png", desc: "Collect 5 to mint B3 NFT" },
  { name: "Passat B4 NFT Shard", img: "./img/b4.png", desc: "Collect 5 to mint B4 NFT" },
  { name: "Passat B5 NFT Shard", img: "./img/b5.png", desc: "Collect 5 to mint B5 NFT" },
  { name: "JinLing", img: "./img/jinling.png", desc: "Bazaar's special cigarettes" },
  { name: "Skarpety w sandałach", img: "./img/skarpety.png", desc: "Janusz Style" },
  { name: "Paragon", img: "./img/paragon.png", desc: "Dowód zakupu cebuli" },
  { name: "Beret", img: "./img/beret.png", desc: "Godność Janusza" }
];

document.getElementById("coin").onclick = clickCoin;

function clickCoin() {
  if (energy <= 0) return;
  energy--;
  hp -= dmg;
  document.getElementById("energy").innerText = energy;
  updateHP();
  if (hp <= 0) {
    maxHp += 20;
    hp = maxHp;
    exp += 10;
    points += 5;
    checkLevelUp();
    maybeDropItem();
  }
  document.getElementById("points").innerText = points;
  document.getElementById("exp").innerText = exp;
}

function updateHP() {
  document.getElementById("hp-bar").style.width = `${(hp / maxHp) * 100}%`;
}

function checkLevelUp() {
  const required = level * 50;
  if (exp >= required) {
    level++;
    exp = 0;
    document.getElementById("level").innerText = level;
    showMessage("Level Up!");
  }
}

function toggleShop() {
  const shop = document.getElementById("shop");
  shop.style.display = shop.style.display === "none" ? "block" : "none";
}

function toggleInventory() {
  const inv = document.getElementById("inventory");
  inv.style.display = inv.style.display === "none" ? "grid" : "none";
}

function maybeDropItem() {
  if (Math.random() < 0.4 && inventory.length < inventorySize) {
    const item = items[Math.floor(Math.random() * items.length)];
    inventory.push(item);
    updateInventory();
    showMessage(`You received: ${item.name}`);
  }
}

function updateInventory() {
  const inv = document.getElementById("inventory");
  inv.innerHTML = "";
  for (let i = 0; i < inventorySize; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    if (inventory[i]) {
      const img = document.createElement("img");
      img.src = inventory[i].img;
      const tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      tooltip.innerText = `${inventory[i].name}\n${inventory[i].desc}`;
      slot.appendChild(img);
      slot.appendChild(tooltip);
    }
    inv.appendChild(slot);
  }
}

function buyUpgrade(type) {
  if (type === 'dmg' && points >= dmgCost) {
    points -= dmgCost;
    dmg = Math.round(dmg * 1.5);
    dmgCost *= 2;
    document.getElementById("dmg").innerText = dmg;
    document.getElementById("dmgCost").innerText = dmgCost;
  } else if (type === 'energyLimit' && points >= energyCost) {
    points -= energyCost;
    maxEnergy = Math.round(maxEnergy * 1.5);
    energy = maxEnergy;
    energyCost *= 2;
    document.getElementById("maxEnergy").innerText = maxEnergy;
    document.getElementById("energy").innerText = energy;
    document.getElementById("energyCost").innerText = energyCost;
  } else if (type === 'regen' && points >= regenCost) {
    points -= regenCost;
    regen = Math.max(1, regen - 1);
    regenCost *= 2;
    document.getElementById("regenCost").innerText = regenCost;
  }
  document.getElementById("points").innerText = points;
}

function watchAd() {
  points += 10;
  document.getElementById("points").innerText = points;
  showMessage("+10 QurłaPoints!");
}

function showMessage(msg) {
  const div = document.getElementById("messages");
  const p = document.createElement("p");
  p.innerText = msg;
  div.appendChild(p);
  setTimeout(() => div.removeChild(p), 3000);
}

setInterval(() => {
  if (energy < maxEnergy) {
    energy++;
    document.getElementById("energy").innerText = energy;
  }
}, regen * 1000);
