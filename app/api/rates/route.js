export async function POST(req) {
  try {
    const body = await req.json(); // Shopify envoie le payload
    const orderAmount = body.rate.total_price / 100; // total_price en centimes
    let shippingCost = 0;

    if (orderAmount < 400) shippingCost = 20;
    else if (orderAmount < 1000) shippingCost = orderAmount * 0.02;
    else if (orderAmount < 3000) shippingCost = orderAmount * 0.018;
    else shippingCost = orderAmount * 0.015;

    return new Response(
      JSON.stringify({
        rates: [
          {
            service_name: "Chronopost - Livraison express à domicile avant 13h",
            service_code: "417f95b572e16809ae32458bfd6f83fc",
            total_price: Math.round(shippingCost * 100), // en centimes
            currency: "EUR",
            description: "Livraison Chronopost calculée selon le montant de la commande",
            phone_required: false,
          },
        ],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erreur interne", details: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
