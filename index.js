require("dotenv").config();

const express = require("express");
const app = express();

const admin = require("firebase-admin");

const serviceAccount = require("./insurance-system-6427e-firebase-adminsdk-fbsvc-7ebfbd27b5.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.use(express.json());
app.use(express.static(__dirname));


// حساب السعر
function calculatePrice(carYear, carPrice, companies) {
  return companies.map(company => {

function getPriceForPlan(planName) {
  const plan = company.plans?.[planName];

  if (!Array.isArray(plan) || plan.length === 0) {
    return null;
  }




  const yearGroup = plan.find(p =>
    Number(carYear) >= Number(p.yearFrom) &&
    Number(carYear) <= Number(p.yearTo)
  );

  if (!yearGroup) return null;

  if (!Array.isArray(yearGroup.prices) || yearGroup.prices.length === 0) {
    return null;
  }

  const priceRange = yearGroup.prices.find(r =>
    Number(carPrice) >= Number(r.min) &&
    Number(carPrice) <= Number(r.max)
  );

  if (!priceRange) return null;

  const calculated = Math.round(
    Number(carPrice) * (Number(priceRange.percent) / 100)
  );

  let minPremium = Number(company.minPremium?.[planName]);

  if (isNaN(minPremium)) minPremium = 0;

  return Math.max(calculated, minPremium);
}

    return {
      company: company.name,
      basic: getPriceForPlan("basic"),
      advanced: getPriceForPlan("advanced")
    };
  });
}


// API calculate
app.post("/calculate", async (req, res) => {
  try {

    const { year, price } = req.body;

    const snapshot = await db.collection("companies").get();

    const companies = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const result = calculatePrice(
      parseInt(year),
      parseInt(price),
      companies
    );

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// get companies
app.get("/api/companies", async (req, res) => {

  const snapshot = await db.collection("companies").get();

  const companies = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  res.json(companies);
});

// add company
app.post("/api/companies", async (req, res) => {
  try {

    const { name } = req.body;

    const newCompany = {
      name,
      plans: {
        basic: [],
        advanced: []
      },
      minPremium: {
        basic: 0,
        advanced: 0
      }
    };

    const docRef = await db.collection("companies").add(newCompany);

    res.json({
      id: docRef.id,
      ...newCompany
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// update company
app.put("/api/companies/:id", async (req, res) => {
  try {

    const id = req.params.id;

    await db.collection("companies").doc(id).set(req.body);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// delete company
app.delete("/api/companies/:id", async (req, res) => {
  try {

    const id = req.params.id;

    await db.collection("companies").doc(id).delete();

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});