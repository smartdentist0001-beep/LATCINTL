export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId, paymentData } = req.body;

  try {
    // TODO: Add your logic here
    // - Verify user
    // - Check stock availability
    // - Create order record in database
    // - Validate amount

    console.log(`✅ Payment ${paymentId} approved for ${paymentData?.amount} Pi`);

    // Respond to Pi SDK
    res.status(200).json({
      approved: true,
      paymentId,
      orderId: `ORD-${Date.now()}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ approved: false, error: error.message });
  }
}
