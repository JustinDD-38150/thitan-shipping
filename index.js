import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- CONFIGURATION FIXE ---
const CHRONOPOST_IDENTIFIER = "417f95b572e16809ae32458bfd6f83fc";
const SERVICE_NAME = "Chronopost - Livraison express à domicile avant 13h";
const SERVICE_CODE = "chronopost_13h";

// --- ROUTE PRINCIPALE ---
app.post("/carrier_service", (req, res) => {
  try {
    const { rate } = req.body;

    // Si Shopify envoie mal la donnée
    if (!rate || !rate.items) {
      return res.status(400).json({ error: "Invalid rate request" });
    }

    // --- CALCUL DU TOTAL COMMANDE ---
    let subtotal = 0;
    for (const item of rate.items) {
      subtotal += (item.price || 0) * (item.quantity || 1);
    }

    // --- CALCUL DES FRAIS SELON LES PALIERS ---
    let shippingRatePercent = 0;

    if (subtotal < 400) {
      // Cas spécial : montant fixe ? tu peux décider ici
      shippingRatePercent = 0; // 0% → car "du total" ? (sinon préciser)
    } else if (subtotal >= 400 && subtotal < 1000) {
      shippingRatePercent = 2;
    } else if (subtotal >= 1000 && subtotal < 3000) {
      shippingRatePercent = 1.8;
    } else {
      shippingRatePercent = 1.5;
    }

    // --- CALCUL DU MONTANT FINAL ---
    let shippingPrice = (subtotal * shippingRatePercent) / 100;

    // Shopify attend le prix en CENTIMES
    const total_price_cents = Math.round(shippingPrice * 100);

    // --- RÉPONSE À SHOPIFY ---
    const response = {
      rates: [
        {
          service_name: SERVICE_NAME,
          service_code: SERVICE_CODE,
          carrier_identifier: CHRONOPOST_IDENTIFIER,
          total_price: total_price_cents.toString(),
          currency: "EUR",
        },
      ],
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Shopify Chronopost Rate API is running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
