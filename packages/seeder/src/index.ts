import { logger } from "@rccyx/logger";
import { seedPosts } from "./seeds/posts";
import { seedUser } from "./seeds/user";
import { db } from "@rccyx/db";

async function seed() {
  await seedPosts();
  await seedUser();
  await db.$disconnect();
}

seed().catch((error) => logger.error("Error happned while seeding", error));
