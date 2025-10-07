export async function POST(req) {
  try {
    // 1. Lire le corps de la requête (méthode standard de l'App Router)
    const data = await req.json();
    
    // Assurez-vous que l'objet 'rate' existe dans le corps de la requête
    if (!data || !data.rate) {
        return new Response(
            JSON.stringify({ error: "Invalid request format", details: "Missing 'rate' object." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
    
    const orderAmount = data.rate.total_price / 100; // Shopify en centimes
    let shippingCost = 0;

    // 2. Logique de tarification par pourcentage
    if (orderAmount < 400) shippingCost = 20;
    else if (orderAmount < 1000) shippingCost = orderAmount * 0.02;
    else if (orderAmount < 3000) shippingCost = orderAmount * 0.018;
    else shippingCost = orderAmount * 0.015;

    // 3. Retourner la réponse en utilisant l'objet standard Response
    return new Response(
      JSON.stringify({
        rates: [
          {
            service_name: "Chronopost - Livraison express à domicile avant 13h",
            service_code: "417f95b572e16809ae32458bfd6f83fc",
            total_price: Math.round(shippingCost * 100), // Prix en centimes
            currency: "EUR",
            description: "Livraison Chronopost calculée selon le montant de la commande",
            phone_required: false,
            // delivery_range est optionnel, mais peut être conservé
            delivery_range: ["1-2 jours", "2-3 jours"],
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    // 4. Gestion des erreurs
    return new Response(
      JSON.stringify({ error: "Erreur interne", details: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
