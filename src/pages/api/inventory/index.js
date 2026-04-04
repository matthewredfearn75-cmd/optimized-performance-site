import { getAllInventory } from '../../../lib/inventory';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const inventory = await getAllInventory();
    res.status(200).json(inventory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
}
