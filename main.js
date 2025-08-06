const items = [
  {
    name: "JinLing",
    cost: 50,
    income: 1,
    image: "img/jinling.png"
  },
  {
    name: "Skarpety",
    cost: 200,
    income: 5,
    image: "img/skarpety.png"
  },
  {
    name: "Paragon",
    cost: 1000,
    income: 20,
    image: "img/paragon.png"
  },
  {
    name: "Beret",
    cost: 5000,
    income: 100,
    image: "img/beret.png"
  },
  {
    name: "Passat B2",
    cost: 20000,
    income: 500,
    image: "img/b2.png"
  },
  {
    name: "Passat B3",
    cost: 100000,
    income: 2500,
    image: "img/b3.png"
  },
  {
    name: "Passat B4",
    cost: 500000,
    income: 10000,
    image: "img/b4.png"
  },
  {
    name: "Passat B5",
    cost: 2500000,
    income: 50000,
    image: "img/b5.png"
  },
  {
    name: "Energy",
    cost: 10000000,
    income: 250000,
    image: "img/energy.png"
  }
];

let qurlacoins = 0;
let income = 0;

const qurlacoinCount = document.getElementById("qurlacoin-count");
const incomeCount = document.getElementById("income-count");
const shopItems = document.getElementById("shop-items");

function updateDisplay() {
  qurlacoinCount.textContent = qurlacoins.toFixed(0);
  incomeCount.textContent = income.toFixed(0);
}

function buyItem(item) {
  if (qurlacoins >= item.cost) {
    qurlacoins -= item.cost;
    income += item.income;
    item.cost = Math.floor(item.cost * 1.15);
    renderShop();
    updateDisplay();
  }
}

function renderShop() {
  shopItems.innerHTML = "";
  items.forEach((item, index) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "shop-item";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;

    const name = document.createElement("div");
    name.textContent = item.name;

    const cost = document.createElement("div");
    cost.textContent = `Cost: ${item.cost}`;

    const inc = document.createElement("div");
    inc.textContent = `Income: ${item.income}/s`;

    const btn = document.createElement("button");
    btn.textContent = "Buy";
    btn.onclick = () => buyItem(item);

    itemDiv.appendChild(img);
    itemDiv.appendChild(name);
    itemDiv.appendChild(cost);
    itemDiv.appendChild(inc);
    itemDiv.appendChild(btn);

    shopItems.appendChild(itemDiv);
  });
}

document.getElementById("clicker").addEventListener("click", () => {
  qurlacoins++;
  updateDisplay();
});

setInterval(() => {
  qurlacoins += income / 10;
  updateDisplay();
}, 100);

renderShop();
updateDisplay();
