export default async function handler(req, res) {
  const { paymentId, paymentData } = req.body;
  
  // TODO: Validate order, check inventory, etc.
  // Call Pi approve API if needed (Pi handles most via SDK callbacks)

  res.status(200).json({ approved: true, paymentId });
}
