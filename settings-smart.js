import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtpr1JSAiN8X3LQWhXKtUi-09bZFpEGNY",
  authDomain: "insurance-system-6427e.firebaseapp.com",
  projectId: "insurance-system-6427e",
  storageBucket: "insurance-system-6427e.firebasestorage.app",
  messagingSenderId: "1015316665701",
  appId: "1:1015316665701:web:57210f8bba5c98be8cbd8c",
  measurementId: "G-9FKK9EFLSV"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


document.addEventListener("DOMContentLoaded", () => {

  const companiesDiv = document.getElementById('companies');
  const addCompanyBtn = document.getElementById('addCompanyBtn');

  // --- Fetch companies from server ---
  async function loadCompanies() {
    try {
      const snapshot = await getDocs(collection(db, "companies"));

const companiesData = snapshot.docs.map(d => ({
  id: d.id,
  ...d.data()
}));
      renderCompanies(companiesData);
    } catch (err) {
      console.error("Error loading companies:", err);
    }
  }
  async function updateMin(id, planName, value) {
  const ref = doc(db, "companies", id);

  const snap = await getDoc(ref);
  const company = snap.data();

  if (!company.minPremium) company.minPremium = {};

  company.minPremium[planName] = parseInt(value);

  await updateDoc(ref, {
    minPremium: company.minPremium
  });

  loadCompanies();
}

  // --- Render companies ---
  function renderCompanies(companiesData) {
    companiesDiv.innerHTML = '';
    companiesData.forEach((company, ci) => {
      const compDiv = document.createElement('div');
      compDiv.className = 'company';
      compDiv.innerHTML = `
        <strong>${company.name}</strong>
        <button onclick="deleteCompany('${company.id}')">Delete Company</button><br>
<div>
  Basic Min:
  <input type="number" value="${company.minPremium?.basic || 0}"
    onchange="updateMin('${company.id}', 'basic', this.value)">
</div>

<div>
  Advanced Min:
  <input type="number" value="${company.minPremium?.advanced || 0}"
    onchange="updateMin('${company.id}', 'advanced', this.value)">
</div>
        <div class="plan">
          <strong>Basic</strong> <button onclick="addYearRange('${company.id}', 'basic')">+ Year Range</button>
          <div id="basic-${company.id}"></div>
        </div>
        

        <div class="plan">
          <strong>Advanced</strong> <button onclick="addYearRange('${company.id}', 'advanced')">+ Year Range</button>
          <div id="advanced-${company.id}"></div>
        </div>

        <button onclick="saveCompany('${company.id}')">Save Company</button>
      `;
      companiesDiv.appendChild(compDiv);

      renderPlan(company, 'basic');
      renderPlan(company, 'advanced');
    });
  }

  function renderPlan(company, planName) {
    const planDiv = document.getElementById(`${planName}-${company.id}`);
    planDiv.innerHTML = '';

    (company.plans[planName] || []).forEach((yr, yi) => {
      const yrDiv = document.createElement('div');
      yrDiv.className = 'year-range';

      let pricesHTML = '';
      (yr.prices || []).forEach((p, pi) => {
        pricesHTML += `
          <div class="price-range">
            Min: <input type="number" value="${p.min}" onchange="updatePrice('${company.id}', '${planName}', ${yi}, ${pi}, 'min', this.value)">
            Max: <input type="number" value="${p.max}" onchange="updatePrice('${company.id}', '${planName}', ${yi}, ${pi}, 'max', this.value)">
            Percent: <input type="number" value="${p.percent}" step="0.1" onchange="updatePrice('${company.id}', '${planName}', ${yi}, ${pi}, 'percent', this.value)">
            <button onclick="deletePrice('${company.id}', '${planName}', ${yi}, ${pi})">Delete Price</button>
          </div>
        `;
      });

      yrDiv.innerHTML = `
        Year From: <input type="number" value="${yr.yearFrom}" onchange="updateYear('${company.id}', '${planName}', ${yi}, 'from', this.value)">
        To: <input type="number" value="${yr.yearTo}" onchange="updateYear('${company.id}', '${planName}', ${yi}, 'to', this.value)">
        <button onclick="addPrice('${company.id}', '${planName}', ${yi})">+ Price Range</button>
        <button onclick="deleteYear('${company.id}', '${planName}', ${yi})">Delete Year Range</button>
        ${pricesHTML}
      `;
      planDiv.appendChild(yrDiv);
    });
  }
  function applyMin(company, planName, value) {
  const min = company.minPremium?.[planName] ?? 0;
  return value < min ? min : value;
}

  // --- Event handlers ---
  async function addCompany() {
    const name = prompt("Company name?");
    if (!name) return;
    await addDoc(collection(db, "companies"), {
  name,
  minPremium: {
  basic: 0,
  advanced: 0
},
  plans: {
    basic: [],
    advanced: []
  }
});
    loadCompanies();
  }

  async function deleteCompany(id) {
    await deleteDoc(doc(db, "companies", id));
    loadCompanies();
  }


async function addYearRange(id, planName) {
  const ref = doc(db, "companies", id);

  const snap = await getDoc(ref);
  const company = snap.data();

  if (!company.plans) company.plans = {};
if (!company.plans[planName]) company.plans[planName] = [];

  company.plans[planName].push({
    yearFrom: 2020,
    yearTo: 2021,
    prices: []
  });

  await updateDoc(ref, {
    plans: company.plans
  });

  loadCompanies();
}

  async function deleteYear(id, planName, yi) {
  const ref = doc(db, "companies", id);

  const snap = await getDoc(ref);
  const company = snap.data();

  company.plans[planName].splice(yi, 1);

  await updateDoc(ref, {
    plans: company.plans
  });

  loadCompanies();
}

 async function addPrice(id, planName, yi) {
  const ref = doc(db, "companies", id);

  const snap = await getDoc(ref);
  const company = snap.data();

  company.plans[planName][yi].prices.push({
    min: 0,
    max: 10000,
    percent: 1
  });

  await updateDoc(ref, {
    plans: company.plans
  });

  loadCompanies();
}

async function deletePrice(id, planName, yi, pi) {
  const ref = doc(db, "companies", id);

  const snap = await getDoc(ref);
  const company = snap.data();

  company.plans[planName][yi].prices.splice(pi, 1);

  await updateDoc(ref, {
    plans: company.plans
  });

  loadCompanies();
}

async function updateYear(id, planName, yi, field, value) {
  const ref = doc(db, "companies", id);

  const snap = await getDoc(ref);
  const company = snap.data();

  if (field === "from") {
    company.plans[planName][yi].yearFrom = parseInt(value);
  } else {
    company.plans[planName][yi].yearTo = parseInt(value);
  }

  await updateDoc(ref, {
    plans: company.plans
  });
}

async function updatePrice(id, planName, yi, pi, field, value) {
  const ref = doc(db, "companies", id);

  const snap = await getDoc(ref);
  const company = snap.data();

  if (field === "min") {
    company.plans[planName][yi].prices[pi].min = parseInt(value);
  } else if (field === "max") {
    company.plans[planName][yi].prices[pi].max = parseInt(value);
  } else {
    company.plans[planName][yi].prices[pi].percent = parseFloat(value);
  }

  await updateDoc(ref, {
    plans: company.plans
  });

}

  async function saveCompany(id) {
    // مجرد إعادة تحميل، لأن كل التعديلات صارت مباشرة في DB
    loadCompanies();
  }

  // --- Init ---
if (addCompanyBtn) {
  addCompanyBtn.addEventListener('click', addCompany);
}  loadCompanies();

window.deleteCompany = deleteCompany;
window.addYearRange = addYearRange;
window.deleteYear = deleteYear;
window.addPrice = addPrice;
window.deletePrice = deletePrice;
window.updateYear = updateYear;
window.updatePrice = updatePrice;
window.updateMin = updateMin;
window.saveCompany = saveCompany;
});
