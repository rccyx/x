import { db } from "@rccyx/db";
import { hash } from "@rccyx/security";
import crypto from "crypto";
import { logger } from "@rccyx/logger";

const SESSION_EXPIRY_SECONDS = 60 * 60 * 24 * 14; // 14 days

export async function seedUser() {
  const now = new Date();

  // Admin
  const adminEmail = "a@a.com";
  const adminPlainPassword = "Admin123";

  const adminUser = await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin User",
      email: adminEmail,
      emailVerified: true,
      role: "ADMIN",
    },
  });

  const adminHash = await hash({ plaintext: adminPlainPassword });

  // IMPORTANT: providerId = "credential", accountId = user.id
  await db.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: adminUser.id,
      },
    },
    update: { password: adminHash, updatedAt: now },
    create: {
      userId: adminUser.id,
      providerId: "credential",
      accountId: adminUser.id,
      password: adminHash,
      createdAt: now,
      updatedAt: now,
    },
  });

  // Optional: seed a session for quick testing
  const adminSessionToken = crypto.randomBytes(48).toString("hex");
  const adminSessionExpires = new Date(
    Date.now() + SESSION_EXPIRY_SECONDS * 1000,
  );
  await db.session.create({
    data: {
      token: adminSessionToken,
      expiresAt: adminSessionExpires,
      userId: adminUser.id,
      createdAt: now,
      updatedAt: now,
      ipAddress: "127.0.0.1",
      userAgent: "seed-script",
    },
  });

  const visitorEmail = "visitor@example.com";
  const visitorPassword = "Visitor123";
  const visitorUser = await db.user.upsert({
    where: { email: visitorEmail },
    update: {},
    create: {
      name: "Visitor User",
      email: visitorEmail,
      emailVerified: false,
      role: "VISITOR",
    },
  });

  const visitorHash = await hash({
    plaintext: visitorPassword,
  });

  await db.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: visitorUser.id,
      },
    },
    update: { password: visitorHash, updatedAt: now },
    create: {
      userId: visitorUser.id,
      providerId: "credential",
      accountId: visitorUser.id,
      password: visitorHash,
      createdAt: now,
      updatedAt: now,
    },
  });

  logger.info("Seed complete!");
  logger.info("Admin creds", {
    email: adminEmail,
    password: adminPlainPassword,
  });
  logger.info("Visitor creds", {
    email: visitorEmail,
    password: visitorPassword,
  });
}
