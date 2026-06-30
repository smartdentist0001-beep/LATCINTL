export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId, txid, metadata } = req.body;

  try {
    // Save successful order to database
    const order = {
      orderId: `ORD-${Date.now()}`,
      paymentId,
      txid,
      amount: metadata?.amount,
      items: metadata?.items,
      user: metadata?.user,
      status: "PAID",
      createdAt: new Date().toISOString()
    };

    console.log("🎉 Order Completed:", order);

    // Here you would:
    // 1. Save to MongoDB / PostgreSQL / Supabase
    // 2. Send confirmation email/SMS
    // 3. Update inventory
    // 4. Trigger shipping workflow

    res.status(200).json({
      success: true,
      orderId: order.orderId,
      message: "Thank you for shopping with LATCINTL!"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}
