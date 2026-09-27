import { connectToDatabase, readLocalStore } from "../lib/db.js";
import { ORDER_COLLECTION } from "../models/Order.js";

// Reserved for future orders; Student Life currently has no commerce workflow.
export async function listOrders() {
  const { db } = await connectToDatabase();
  return db
    ? db.collection(ORDER_COLLECTION).find({}).toArray()
    : readLocalStore().orders || [];
}
