export default async function handler(req, res) {
  // Shopify envoie toujours une requête POST au moment du calcul des frais
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body;

    // Récupération du total de la commande en euros (Shopify l'envoie en centimes)
    const total = parseFloat(data?.rate?.items_subtotal_price || 0) / 100;

    let shippingPrice = 0;

    // 🧮 Calcul du frais de port selon le montant de la commande
    if (total < 400) {
      shippingPrice = 20; // montant fixe
    } else if (total < 1000) {
      shippingPrice = total * 0.02; // 2%
    } else if (total < 3000) {
      shippingPrice = total * 0.018; // 1.8%
    } else {
      shippingPrice = total * 0.015; // 1.5%
    }

    // Conversion en centimes (Shopify attend une string en centimes)
    const priceInCents = Math.round(shippingPrice * 100);

    // Réponse au format Shopify CarrierService API
    const response = {
      rates: [
        {
          service_name: "Chronopost - Livraison express à domicile avant 13h",
          service_code: "CHRONO_AUTO",
          total_price: priceInCents.toString(),
          description: `Frais calculés automatiquement (${shippingPrice.toFixed(2)} €)`,
          currency: "EUR",
        },
      ],
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in rates endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
