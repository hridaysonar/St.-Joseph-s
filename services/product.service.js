import { connectToDatabase, readLocalStore } from "../lib/db.js";
import { PRODUCT_COLLECTION } from "../models/Product.js";

// Reserved for future products; Student Life currently has no commerce workflow.
export async function listProducts() {
  const { db } = await connectToDatabase();
  return db
    ? db.collection(PRODUCT_COLLECTION).find({}).toArray()
    : readLocalStore().products || [];
}
