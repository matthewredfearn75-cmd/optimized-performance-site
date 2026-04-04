import { setProductInventory, getAllInventory } from '../../../lib/inventory';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const adminPassword = process.env.ADMIN_PASSWORD || 'optimized2024';
  const { password, updates } = req.body;

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Invalid updates payload' });
  }

  try {
    await Promise.all(
      Object.entries(updates).map(([id, qty]) => setProductInventory(id, qty))
    );
    const inventory = await getAllInventory();
    res.status(200).json(inventory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update inventory' });
  }
}
