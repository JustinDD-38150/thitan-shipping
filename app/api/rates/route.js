export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }

  try {
    const { rate } = req.body;
    const orderAmount = rate.total_price / 100; // Shopify en centimes
    let shippingCost = 0;

    if (orderAmount < 400) shippingCost = 20;
    else if (orderAmount < 1000) shippingCost = orderAmount * 0.02;
    else if (orderAmount < 3000) shippingCost = orderAmount * 0.018;
    else shippingCost = orderAmount * 0.015;

    res.status(200).json({
      rates: [
        {
          service_name: "Chronopost - Livraison express à domicile avant 13h",
          service_code: "417f95b572e16809ae32458bfd6f83fc",
          total_price: Math.round(shippingCost * 100),
          currency: "EUR",
          description: "Livraison Chronopost calculée selon le montant de la commande",
          phone_required: false,
          delivery_range: ["1-2 jours", "2-3 jours"],
        },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur interne", details: err.message });
  }
}
