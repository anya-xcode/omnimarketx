/* Seed (or re-seed) MongoDB with the canonical dataset: `npm run seed` */
import "dotenv/config";
import mongoose from "mongoose";

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set. Add it to .env.local (see .env.example).");
    process.exit(1);
  }
  const { seedDatabase } = await import("../src/lib/repo");
  await seedDatabase({ reset: true });
  const { MarketModel } = await import("../src/lib/models");
  const count = await MarketModel.countDocuments();
  console.log(`Seeded ${count} markets into ${mongoose.connection.name}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
